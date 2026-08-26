from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Query
from pydantic import BaseModel
import os

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

from email_service import send_email_notification, last_email_time as _unused
import email_service
import pandas as pd
import numpy as np
import joblib
import sqlite3
from datetime import datetime
from actuator import (
    ActuatorInput,
    get_actuator_state,
    update_actuator_state
)

# ==========================================
# INIT
# ==========================================

app = FastAPI(
    title="AQUAAGENT API",
    description="Hybrid ExtraTrees + LLM Fish Farm Decision System",
    version="2.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Load ExtraTrees model v4_v3 (Data_Model_IoTMLCQ_2024.xlsx + Figure 1)

rf = joblib.load("aquaagent_rf_v4_v3.pkl")
latest_result = None

# ==========================================
# DATABASE INIT
# ==========================================

conn = sqlite3.connect(
    "aquaagent.db",
    check_same_thread=False
)

cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT,
    temperature REAL,
    do_value REAL,
    ph REAL,
    turbidity REAL,
    water_level REAL,
    health_status TEXT
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS email_recipients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY,
    do_threshold REAL,
    ph_min REAL,
    ph_max REAL,
    temp_max REAL,
    turbidity_max REAL,
    water_level_max REAL,
    iot_enabled INTEGER DEFAULT 1,
    refresh_interval INTEGER DEFAULT 5,
    alert_cooldown_minutes INTEGER DEFAULT 30,
    alert_cooldown_seconds INTEGER DEFAULT 0
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS feeding_schedule (
    id INTEGER PRIMARY KEY,
    feeding_time TEXT,
    interval_hours INTEGER,
    enabled INTEGER DEFAULT 1,
    version INTEGER DEFAULT 0
)
""")

cursor.execute("""
INSERT OR IGNORE INTO feeding_schedule(
    id,
    feeding_time,
    interval_hours,
    enabled,
    version
)
VALUES(
    1,
    '08:00',
    6,
    1,
    0
)
""")

conn.commit()

# Migrate existing DB: add cooldown columns if missing
try:
    cursor.execute("ALTER TABLE settings ADD COLUMN alert_cooldown_minutes INTEGER DEFAULT 30")
except Exception:
    pass
try:
    cursor.execute("ALTER TABLE settings ADD COLUMN alert_cooldown_seconds INTEGER DEFAULT 0")
except Exception:
    pass

conn.commit()

# default setting
cursor.execute("""
INSERT OR IGNORE INTO settings(
    id,
    do_threshold,
    ph_min,
    ph_max,
    temp_max,
    turbidity_max,
    water_level_max,
    iot_enabled,
    refresh_interval,
    alert_cooldown_minutes,
    alert_cooldown_seconds
)
VALUES(
    1,
    5,
    6.5,
    8.0,
    30,
    15,
    85,
    1,
    5,
    30,
    0
)
""")

conn.commit()

def get_current_settings():
    cursor.execute("""
    SELECT
        do_threshold,
        ph_min,
        ph_max,
        temp_max,
        turbidity_max,
        water_level_max,
        iot_enabled,
        refresh_interval,
        alert_cooldown_minutes,
        alert_cooldown_seconds
    FROM settings
    WHERE id = 1
    """)

    row = cursor.fetchone()

    return {
        "doThreshold": row[0],
        "phMin": row[1],
        "phMax": row[2],
        "tempMax": row[3],
        "turbidityMax": row[4],
        "waterLevelMax": row[5] if row[5] is not None else 85.0,
        "iotEnabled": bool(row[6]),
        "refreshInterval": row[7],
        "alertCooldownMinutes": row[8] if row[8] is not None else 30,
        "alertCooldownSeconds": row[9] if row[9] is not None else 0
    }

def decision_engine(sensor, health_status, estimated_do):
    settings = get_current_settings()

    aerator = "OFF"
    water_circulation = "OFF"
    ph_neutralizer = "OFF"
    buzzer = "OFF"

    reasons = []

    if estimated_do < settings["doThreshold"]:
        aerator = "ON"
        reasons.append("Low dissolved oxygen detected.")

    if sensor.temperature > settings["tempMax"]:
        water_circulation = "ON"
        reasons.append("High temperature detected.")

    if sensor.turbidity > settings["turbidityMax"]:
        water_circulation = "ON"
        reasons.append("High turbidity detected.")

    if sensor.ph < settings["phMin"] or sensor.ph > settings["phMax"]:
        ph_neutralizer = "ON"
        reasons.append("Abnormal pH detected.")

    if sensor.water_level > settings["waterLevelMax"]:
        buzzer = "ON"
        reasons.append(f"High water level detected ({sensor.water_level}% > {settings['waterLevelMax']}%).")

    if health_status == "At Risk":
        buzzer = "ON"
        reasons.append("ExtraTrees model predicted At Risk condition.")

    if len(reasons) == 0:
        reasons.append("All sensor parameters are within normal range.")

    return {
        "aerator": aerator,
        "water_circulation": water_circulation,
        "ph_neutralizer": ph_neutralizer,
        "buzzer": buzzer,
        "reasons": reasons
    }

def generate_llm_explanation(sensor, health_status, confidence, decision, estimated_do):
    """
    Generates a natural language explanation / biological interpretation (Explainable AI / XAI).
    Tries OpenAI LLM first if USE_OPENAI is enabled and OPENAI_API_KEY is available.
    If OPENAI_API_KEY is missing or fails, uses a rich domain-expert biological explanation engine
    that details tilapia stress factors, parameter deviations, prognosis time horizon, and calming operator guidelines.
    """
    status_str = f"**{health_status}**"
    settings = get_current_settings()

    # 1. Try OpenAI LLM if USE_OPENAI is enabled, API Key is available, and OpenAI package is installed
    use_openai = os.getenv("USE_OPENAI", "true").strip().lower() in ["true", "1", "yes", "on"]
    api_key = os.getenv("OPENAI_API_KEY")
    if use_openai and api_key and OpenAI is not None:
        try:
            client = OpenAI(api_key=api_key)
            prompt = f"""
Anda adalah NEELA AI, sistem Pakar Explainable AI (XAI) dan Konsultan Senior Biologi Akua-Kultur Ikan Nila (Oreochromis niloticus).
Tugas Anda adalah memberikan diagnosa ilmiah yang mendalam, presisi, menenangkan, dan memberikan panduan konkret kepada pengelola tambak berdasarkan prediksi model ExtraTrees ({health_status}, Kepercayaan: {confidence * 100:.1f}%) dan telemetri sensor real-time.

TELEMETRI SENSOR:
- Suhu Air: {sensor.temperature} C (Optimal: 25.0 - 32.0 C)
- Oksigen Terlarut (DO): {estimated_do} mg/L (Optimal: >= 5.0 mg/L)
- pH Air: {sensor.ph} (Optimal: 6.5 - 8.0)
- Kekeruhan (Turbiditas): {sensor.turbidity} NTU (Optimal: <= 25.0 NTU)
- Ketinggian Air (Water Level): {sensor.water_level}% (Optimal: 60% - 80%, Maksimal Aman: {settings['waterLevelMax']}%)
- Jam Pengamatan: {sensor.hour}:00

REAKSI OTOMATIS AKTUATOR:
- Aerator (Difusi O2): {decision['aerator']}
- Pompa Sirkulasi: {decision['water_circulation']}
- Penetral pH: {decision['ph_neutralizer']}
- Sirine Alarm Darurat: {decision['buzzer']}

DIAGNOSA SENSOR:
{", ".join(decision["reasons"])}

PETUNJUK STRUKTUR PENJELASAN WAKTU & BIOLOGI:
Susun penjelasan 3-4 kalimat ringkas dan padat yang WAJIB mencakup 4 poin berikut:
1. DIAGNOSA & EFEK BIOLOGIS: Sebutkan kondisi parameter dan efek fisiologisnya pada ikan nila (misalnya hipoksia pernapasan, lonjakan metabolisme basal, toksisitas pH, atau insang tersumbat).
2. TERTOLONG AKTUATOR: Jelaskan aktuator apa yang sedang aktif otomatis memulihkan kolam.
3. PROGNOSIS & ESTIMASI WAKTU: Jelaskan estimasi waktu pulih (misal 1-2 jam ke depan) berkat intervensi aktuator otomatis.
4. PENENANGAN & PANDUAN PENGELOLA: Berikan kalimat penenang bahwa sistem otomatis NEELA AI secara aktif menangani kolam, serta berikan 1-2 langkah taktis sederhana untuk dicek pengelola (misal: cek filter/aerator dan kurangi pakan).

Gunakan cetak tebal **kata kunci penting** agar tampilan visual rapi. Keluarkan HANYA teks penjelasan polos.
"""
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "Anda adalah NEELA AI, pakar akua-kultur ilmiah yang menenangkan pengelola tambak ikan nila."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=350,
                temperature=0.3
            )
            explanation = response.choices[0].message.content.strip()
            if explanation:
                return explanation
        except Exception as e:
            print(f"[AQUAAGENT XAI] OpenAI call warning: {e}")

    # 2. Rich Biological XAI Engine Fallback (Domain Expert Interpretation)
    diag_effects = []
    actions_taken = []

    if estimated_do < 5.0:
        diag_effects.append(f"Penurunan Oksigen Terlarut (DO: {estimated_do} mg/L < 5.0 mg/L) menekan tekanan parsial O2 darah, memicu hipoksia pernapasan pada ikan nila.")
        actions_taken.append("Aerator aktif melakukan aerasi difusi tinggi.")

    if sensor.temperature > 30.0:
        diag_effects.append(f"Suhu air ({sensor.temperature} C > 30 C) menaikkan laju metabolisme basal sekaligus menurunkan kelarutan oksigen alami.")
        actions_taken.append("Pompa sirkulasi aktif mereduksi panas permukaan.")

    if sensor.turbidity > 15.0:
        diag_effects.append(f"Turbiditas tinggi ({sensor.turbidity} NTU > 15 NTU) berisiko menyumbat filamen insang.")
        if "Pompa sirkulasi" not in " ".join(actions_taken):
            actions_taken.append("Pompa sirkulasi aktif mengalirkan air ke filtrasi fisik.")

    if sensor.ph < 6.5 or sensor.ph > 8.0:
        status_ph = "asam" if sensor.ph < 6.5 else "basa"
        diag_effects.append(f"pH air ({sensor.ph}) cenderung {status_ph}, mengganggu osmoregulasi dan keseimbangan asam-basa jaringan ikan.")
        actions_taken.append("pH neutralizer aktif menginjeksi penyeimbang keasaman.")

    if sensor.water_level > settings["waterLevelMax"]:
        diag_effects.append(f"Ketinggian air ({sensor.water_level}%) melampaui batas aman kapasitas penampungan kolam ({settings['waterLevelMax']}%).")
        actions_taken.append("Sirine alarm aktif memberi sinyal pembuangan limpasan.")

    if health_status == "At Risk":
        prognosis = "Dengan aksi aktuator otomatis yang berjalan, pemulihan parameter diproyeksikan tercapai dalam rentang **1 hingga 2 jam** ke depan."
        reassurance = "Pengelola diimbau tetap tenang; sistem otomatis NEELA AI secara aktif melakukan intervensi darurat. Disarankan untuk memverifikasi kebersihan nozzle aerator/filter dan menunda sementara pemberian pakan guna mencegah pengendapan amonia."
    else:
        prognosis = "Kondisi ekosistem kolam diprediksi tetap stabil dan kondusif untuk laju pertumbuhan optimal ikan nila."
        reassurance = "Pengelola dapat menjalankan rutinitas pemeliharaan dan jadwal pemberian pakan secara normal sesuai standar operasional."

    if diag_effects:
        diag_text = " ".join(diag_effects)
        act_text = " ".join(actions_taken)
        return (
            f"Berdasarkan diagnosa model ExtraTrees ({status_str}, Kepercayaan: {confidence * 100:.1f}%), {diag_text} "
            f"**Tindakan Otomatis:** {act_text} **Prognosis & Waktu:** {prognosis} **Panduan Pengelola:** {reassurance}"
        )
    else:
        return (
            f"Berdasarkan klasifikasi model ExtraTrees ({status_str}, Kepercayaan: {confidence * 100:.1f}%), seluruh parameter fisiologis air (Suhu {sensor.temperature} C, DO {estimated_do} mg/L, pH {sensor.ph}, Turbiditas {sensor.turbidity} NTU, Water Level {sensor.water_level}%) dalam batas ideal. "
            f"**Prognosis:** {prognosis} **Panduan Pengelola:** {reassurance}"
        )

# ==========================================
# INPUT SCHEMA
# ==========================================

class EmailInput(BaseModel):
    email: str

class SensorInput(BaseModel):
    temperature: float
    ph: float
    turbidity: float
    water_level: float
    hour: int
    do: float = None
    source: str = "iot"

class SettingsInput(BaseModel):
    doThreshold: float
    phMin: float
    phMax: float
    tempMax: float
    turbidityMax: float
    waterLevelMax: float = 85.0
    iotEnabled: bool
    refreshInterval: int
    alertCooldownMinutes: int = 30
    alertCooldownSeconds: int = 0

class FeedingScheduleInput(BaseModel):
    feedingTime: str
    interval: int
    enabled: bool = True

# ==========================================
# EMAIL API
# ==========================================

@app.post("/emails")
def add_email(data: EmailInput):
    try:
        cursor.execute("INSERT INTO email_recipients(email) VALUES(?)", (data.email,))
        conn.commit()
        return {"message": "Email added"}
    except:
        return {"message": "Email already exists"}

@app.get("/emails")
def get_emails():
    cursor.execute("SELECT email FROM email_recipients")
    rows = cursor.fetchall()
    return [row[0] for row in rows]

@app.delete("/emails/{email}")
def delete_email(email: str):
    cursor.execute("DELETE FROM email_recipients WHERE email=?", (email,))
    conn.commit()
    return {"message": "Email removed"}

@app.get("/settings")
def get_settings():
    cursor.execute("""
    SELECT
        do_threshold, ph_min, ph_max, temp_max,
        turbidity_max, water_level_max, iot_enabled, refresh_interval,
        alert_cooldown_minutes, alert_cooldown_seconds
    FROM settings
    WHERE id = 1
    """)
    row = cursor.fetchone()
    return {
        "doThreshold": row[0],
        "phMin": row[1],
        "phMax": row[2],
        "tempMax": row[3],
        "turbidityMax": row[4],
        "waterLevelMax": row[5],
        "iotEnabled": bool(row[6]),
        "refreshInterval": row[7],
        "alertCooldownMinutes": row[8] if row[8] is not None else 30,
        "alertCooldownSeconds": row[9] if row[9] is not None else 0
    }

@app.get("/feeding-schedule")
def get_feeding_schedule():
    cursor.execute("""
    SELECT feeding_time, interval_hours, enabled
    FROM feeding_schedule
    WHERE id = 1
    """)
    row = cursor.fetchone()
    return {
        "feedingTime": row[0],
        "interval": row[1],
        "enabled": bool(row[2])
    }

@app.get("/feeding-version")
def get_feeding_version():
    cursor.execute("SELECT version FROM feeding_schedule WHERE id=1")
    version = cursor.fetchone()[0]
    return {"version": version}

@app.post("/feeding-schedule")
def save_feeding_schedule(data: FeedingScheduleInput):
    cursor.execute("""
    UPDATE feeding_schedule
    SET feeding_time=?, interval_hours=?, enabled=?, version=version+1
    WHERE id=1
    """, (data.feedingTime, data.interval, int(data.enabled)))
    conn.commit()
    get_actuator_state()["beep"] = True
    return {"message": "Feeding schedule updated"}

@app.post("/settings")
def save_settings(data: SettingsInput):
    cursor.execute("""
    UPDATE settings
    SET do_threshold=?, ph_min=?, ph_max=?, temp_max=?, turbidity_max=?, water_level_max=?, iot_enabled=?, refresh_interval=?, alert_cooldown_minutes=?, alert_cooldown_seconds=?
    WHERE id=1
    """, (
        data.doThreshold, data.phMin, data.phMax, data.tempMax,
        data.turbidityMax, data.waterLevelMax, int(data.iotEnabled), data.refreshInterval,
        data.alertCooldownMinutes, data.alertCooldownSeconds
    ))
    conn.commit()
    get_actuator_state()["beep"] = True
    return {"message": "Settings updated"}

# ==========================================
# ROOT ROUTE
# ==========================================

@app.get("/")
def root():
    return {"message": "AQUAAGENT API v2 Running (ExtraTrees 99.88% + Rule-Based)"}

# ==========================================
# ANALYZE ROUTE
# ==========================================

def calculate_do(temp):
    return round(
        14.652
        - 0.41022 * temp
        + 0.007991 * (temp ** 2)
        - 0.000077774 * (temp ** 3),
        2
    )

@app.post("/analyze")
def analyze(sensor: SensorInput):
    settings = get_current_settings()

    if sensor.source == "iot" and not settings["iotEnabled"]:
        return {
            "success": False,
            "message": "IoT Receiver is disabled."
        }

    # ----------------------------------
    # BUILD EXTRATREES INPUT
    # ----------------------------------
    estimated_do = getattr(sensor, "do", None)
    if estimated_do is None:
        estimated_do = calculate_do(sensor.temperature)

    expected_cols = list(rf.feature_names_in_) if hasattr(rf, "feature_names_in_") else []
    if "TEMP" in expected_cols:
        is_opt = (25.0 <= sensor.temperature <= 32.0) and (7.0 <= sensor.ph <= 8.0) and (estimated_do >= 5.0) and (sensor.turbidity <= 25.0)
        risk_flag = 0.0 if is_opt else 1.0

        ph_dev = abs(sensor.ph - 7.5)
        temp_dev = max(0.0, sensor.temperature - 32.0) + max(0.0, 25.0 - sensor.temperature)
        turb_dev = max(0.0, sensor.turbidity - 25.0)
        do_dev = max(0.0, 5.0 - estimated_do)

        ph_dist_7 = abs(sensor.ph - 7.0)
        temp_do_ratio = estimated_do / (sensor.temperature + 1.0)
        turb_do_ratio = sensor.turbidity / (estimated_do + 0.1)
        temp_ph_ratio = sensor.temperature / (sensor.ph + 0.1)
        hour_sin = np.sin(2 * np.pi * sensor.hour / 24.0)
        hour_cos = np.cos(2 * np.pi * sensor.hour / 24.0)

        sample = pd.DataFrame([{
            'TEMP': sensor.temperature,
            'DO': estimated_do,
            'PH': sensor.ph,
            'TURBIDITY': sensor.turbidity,
            'hour': sensor.hour,
            'risk_flag': risk_flag,
            'PH_dev': ph_dev,
            'TEMP_dev': temp_dev,
            'TURB_dev': turb_dev,
            'DO_dev': do_dev,
            'PH_dist_7': ph_dist_7,
            'TEMP_DO_ratio': temp_do_ratio,
            'TURB_DO_ratio': turb_do_ratio,
            'TEMP_PH_ratio': temp_ph_ratio,
            'hour_sin': hour_sin,
            'hour_cos': hour_cos
        }])[expected_cols]
    else:
        sample = pd.DataFrame([{
            'Temperature (°C)': sensor.temperature,
            'Dissolved Oxygen (mg/L)': estimated_do,
            'pH': sensor.ph,
            'Turbidity (NTU)': sensor.turbidity,
            'hour': sensor.hour
        }])

    # ----------------------------------
    # EXTRATREES PREDICTION
    # ----------------------------------
    raw_pred = rf.predict(sample)[0]
    if str(raw_pred) in ["0", "0.0"]:
        health_status = "Stable"
    elif str(raw_pred) in ["1", "1.0"]:
        health_status = "At Risk"
    else:
        health_status = str(raw_pred)

    confidence = float(rf.predict_proba(sample).max())

    decision = decision_engine(
        sensor,
        health_status,
        estimated_do
    )

    # Update actuator state jika mode AUTONOMOUS
    current = get_actuator_state()
    if current["mode"] == "AUTONOMOUS":
        update_actuator_state(
            ActuatorInput(
                mode=current["mode"],
                aerator=(decision["aerator"] == "ON"),
                feeder=False,
                pump=(decision["water_circulation"] == "ON"),
                stabilizer=(decision["ph_neutralizer"] == "ON"),
                buzzer=(decision["buzzer"] == "ON")
            )
        )

    # SAVE TO DATABASE
    cursor.execute("""
    INSERT INTO history (
        timestamp, temperature, do_value, ph, turbidity, water_level, health_status
    )
    VALUES (?,?,?,?,?,?,?)
    """, (
        datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        sensor.temperature, estimated_do, sensor.ph, sensor.turbidity,
        sensor.water_level, health_status
    ))
    conn.commit()

    # Generate LLM explanation / biological interpretation
    llm_reason = generate_llm_explanation(
        sensor=sensor,
        health_status=health_status,
        confidence=confidence,
        decision=decision,
        estimated_do=estimated_do
    )

    global latest_result
    latest_result = {
        "mode": "Hybrid ExtraTrees (99.88%) + Rule Engine + LLM Explainable AI",
        "health_status": health_status,
        "rf_confidence": round(confidence, 3),
        "sensor_data": {
            "temperature": sensor.temperature,
            "do": estimated_do,
            "ph": sensor.ph,
            "turbidity": sensor.turbidity,
            "water_level": sensor.water_level,
            "hour": sensor.hour
        },
        "aerator": decision["aerator"],
        "water_circulation": decision["water_circulation"],
        "ph_neutralizer": decision["ph_neutralizer"],
        "buzzer": decision["buzzer"],
        "reason": llm_reason
    }

    critical = (
        latest_result["buzzer"] == "ON"
        or latest_result["health_status"] == "At Risk"
    )

    if critical:
        send_email_notification(
            latest_result,
            cooldown_minutes=settings["alertCooldownMinutes"],
            cooldown_seconds=settings["alertCooldownSeconds"]
        )

    return latest_result

# ==========================================
# LATEST RESULT API
# ==========================================

@app.get("/latest")
def get_latest():
    global latest_result
    if latest_result is None:
        return {"message": "No analysis yet"}
    return latest_result

# ==========================================
# HISTORY API
# ==========================================

@app.get("/history")
def get_history():
    cursor.execute("""
    SELECT * FROM history ORDER BY id DESC LIMIT 50
    """)
    rows = cursor.fetchall()
    result = []
    for row in rows:
        result.append({
            "id": row[0],
            "timestamp": row[1],
            "temperature": row[2],
            "do": row[3],
            "ph": row[4],
            "turbidity": row[5],
            "water_level": row[6],
            "health_status": row[7]
        })
    return result

@app.get("/actuator")
def get_actuator():
    return get_actuator_state()

@app.post("/actuator")
def set_actuator(data: ActuatorInput):
    actuator = update_actuator_state(data)
    actuator["beep"] = True
    return {"message": "Actuator updated", "data": actuator}

@app.post("/beep/ack")
def beep_ack():
    actuator = get_actuator_state()
    actuator["beep"] = False
    return {"message": "Beep acknowledged"}

@app.post("/feeder/ack")
def feeder_ack():
    actuator = get_actuator_state()
    actuator["feeder"] = False
    return {"message": "Feeder acknowledged"}

@app.post("/actuator/ack")
def actuator_ack(data: dict):
    actuator = get_actuator_state()
    name = data["name"]
    if name in actuator:
        actuator[name] = False
    return {"message": f"{name} acknowledged"}

@app.get("/alert-cooldown-status")
def get_alert_cooldown_status():
    settings = get_current_settings()
    cooldown_total = settings["alertCooldownMinutes"] * 60 + settings["alertCooldownSeconds"]
    last_alert = email_service.last_email_time
    if last_alert is None:
        return {
            "lastAlertTime": None,
            "cooldownTotal": cooldown_total,
            "remaining": 0,
            "active": False
        }
    elapsed = (datetime.now() - last_alert).total_seconds()
    remaining = max(0, cooldown_total - elapsed)
    return {
        "lastAlertTime": last_alert.strftime("%Y-%m-%d %H:%M:%S"),
        "cooldownTotal": cooldown_total,
        "remaining": round(remaining),
        "active": remaining > 0
    }

# ==========================================
# EXTRATREES DECISION TREE VISUALIZER API
# ==========================================

def build_extratrees_sample_df(sensor_data):
    """
    Transforms raw sensor telemetry into the exact feature engineering schema
    required by aquaagent_rf_v4_v3.pkl.
    """
    temperature = float(sensor_data.temperature)
    ph = float(sensor_data.ph)
    turbidity = float(sensor_data.turbidity)
    water_level = float(sensor_data.water_level)
    hour = int(sensor_data.hour)
    estimated_do = getattr(sensor_data, "do", None)
    if estimated_do is None:
        estimated_do = calculate_do(temperature)
    else:
        estimated_do = float(estimated_do)

    expected_cols = list(rf.feature_names_in_) if hasattr(rf, "feature_names_in_") else []
    if "TEMP" in expected_cols:
        is_opt = (25.0 <= temperature <= 32.0) and (7.0 <= ph <= 8.0) and (estimated_do >= 5.0) and (turbidity <= 25.0)
        risk_flag = 0.0 if is_opt else 1.0

        ph_dev = abs(ph - 7.5)
        temp_dev = max(0.0, temperature - 32.0) + max(0.0, 25.0 - temperature)
        turb_dev = max(0.0, turbidity - 25.0)
        do_dev = max(0.0, 5.0 - estimated_do)

        ph_dist_7 = abs(ph - 7.0)
        temp_do_ratio = estimated_do / (temperature + 1.0)
        turb_do_ratio = turbidity / (estimated_do + 0.1)
        temp_ph_ratio = temperature / (ph + 0.1)
        hour_sin = np.sin(2 * np.pi * hour / 24.0)
        hour_cos = np.cos(2 * np.pi * hour / 24.0)

        row_dict = {
            'TEMP': float(temperature),
            'DO': float(estimated_do),
            'PH': float(ph),
            'TURBIDITY': float(turbidity),
            'hour': int(hour),
            'risk_flag': float(risk_flag),
            'PH_dev': float(ph_dev),
            'TEMP_dev': float(temp_dev),
            'TURB_dev': float(turb_dev),
            'DO_dev': float(do_dev),
            'PH_dist_7': float(ph_dist_7),
            'TEMP_DO_ratio': float(temp_do_ratio),
            'TURB_DO_ratio': float(turb_do_ratio),
            'TEMP_PH_ratio': float(temp_ph_ratio),
            'hour_sin': float(hour_sin),
            'hour_cos': float(hour_cos)
        }
        sample_df = pd.DataFrame([row_dict])[expected_cols]
    else:
        row_dict = {
            'Temperature (°C)': float(temperature),
            'Dissolved Oxygen (mg/L)': float(estimated_do),
            'pH': float(ph),
            'Turbidity (NTU)': float(turbidity),
            'hour': int(hour)
        }
        sample_df = pd.DataFrame([row_dict])

    return sample_df, expected_cols, estimated_do, row_dict

def serialize_decision_tree(estimator, feature_names, max_depth=4):
    """
    Serializes an individual DecisionTreeClassifier from ExtraTrees into a nested JSON hierarchy.
    """
    tree = estimator.tree_
    children_left = tree.children_left
    children_right = tree.children_right
    feature = tree.feature
    threshold = tree.threshold
    value = tree.value
    impurity = tree.impurity
    n_node_samples = tree.n_node_samples

    def build_node(node_id, current_depth):
        is_leaf = bool((children_left[node_id] == children_right[node_id]) or (current_depth >= max_depth))
        raw_val = value[node_id][0] if len(value[node_id]) > 0 else [0, 0]
        val = [int(v) for v in raw_val]
        # Class 0: Stable, Class 1: At Risk
        pred_class = "At Risk" if len(val) > 1 and val[1] > val[0] else "Stable"
        conf = float(max(val) / sum(val)) if sum(val) > 0 else 1.0

        feat_idx = int(feature[node_id])
        feat_name = feature_names[feat_idx] if (0 <= feat_idx < len(feature_names)) else None
        thresh = float(round(threshold[node_id], 4)) if threshold[node_id] != -2 else 0.0

        node_data = {
            "id": int(node_id),
            "depth": int(current_depth),
            "isLeaf": bool(is_leaf),
            "feature": feat_name,
            "featureIdx": int(feat_idx),
            "threshold": float(thresh),
            "impurity": float(round(impurity[node_id], 4)),
            "samples": int(n_node_samples[node_id]),
            "value": val,
            "prediction": str(pred_class),
            "confidence": float(round(conf, 4))
        }

        if not is_leaf:
            left_id = int(children_left[node_id])
            right_id = int(children_right[node_id])
            node_data["left"] = build_node(left_id, current_depth + 1)
            node_data["right"] = build_node(right_id, current_depth + 1)
        else:
            node_data["left"] = None
            node_data["right"] = None

        return node_data

    return build_node(0, 0)

def trace_tree_decision_path(estimator, sample_df, feature_names):
    """
    Traces the exact path a specific sample takes through one DecisionTreeClassifier.
    """
    tree = estimator.tree_
    children_left = tree.children_left
    children_right = tree.children_right
    feature = tree.feature
    threshold = tree.threshold
    value = tree.value

    sample_dict = sample_df.iloc[0].to_dict()
    node_id = 0
    path_node_ids = []
    steps = []
    step_num = 1

    while True:
        path_node_ids.append(int(node_id))
        is_leaf = bool(children_left[node_id] == children_right[node_id])
        raw_val = value[node_id][0] if len(value[node_id]) > 0 else [0, 0]
        val = [int(v) for v in raw_val]
        pred_class = "At Risk" if len(val) > 1 and val[1] > val[0] else "Stable"

        if is_leaf:
            steps.append({
                "step": int(step_num),
                "nodeId": int(node_id),
                "isLeaf": True,
                "prediction": str(pred_class),
                "value": val,
                "explanation": f"Terminal Leaf Node #{node_id}: Final classification is **{pred_class}** (Samples: {val[0]} Stable / {val[1]} At Risk)."
            })
            break

        feat_idx = int(feature[node_id])
        feat_name = feature_names[feat_idx] if (0 <= feat_idx < len(feature_names)) else f"Feature_{feat_idx}"
        thresh = float(round(threshold[node_id], 4))
        actual_val = float(round(sample_dict.get(feat_name, 0.0), 4))

        cond_met = bool(actual_val <= thresh)
        next_node = int(children_left[node_id] if cond_met else children_right[node_id])
        direction = "LEFT" if cond_met else "RIGHT"

        steps.append({
            "step": int(step_num),
            "nodeId": int(node_id),
            "isLeaf": False,
            "feature": str(feat_name),
            "actualValue": float(actual_val),
            "threshold": float(thresh),
            "conditionMet": bool(cond_met),
            "direction": str(direction),
            "nextNodeId": int(next_node),
            "explanation": f"Evaluated `{feat_name}` = **{actual_val}** ({'<=' if cond_met else '>'} threshold **{thresh}**) → Traversed **{direction}** to Node #{next_node}."
        })

        node_id = next_node
        step_num += 1

    return path_node_ids, steps

@app.get("/tree-structure")
def get_tree_structure(tree_idx: int = Query(0, ge=0), depth: int = Query(4, ge=1, le=8)):
    """
    Returns the serialized decision tree hierarchy, feature importances, and model metadata.
    """
    if not hasattr(rf, "estimators_") or len(rf.estimators_) == 0:
        return {"error": "Model does not contain tree estimators"}

    total_trees = len(rf.estimators_)
    safe_idx = min(max(0, tree_idx), total_trees - 1)
    estimator = rf.estimators_[safe_idx]
    feature_names = list(rf.feature_names_in_) if hasattr(rf, "feature_names_in_") else []

    tree_dict = serialize_decision_tree(estimator, feature_names, max_depth=depth)

    feature_importances = []
    if hasattr(rf, "feature_importances_") and len(feature_names) == len(rf.feature_importances_):
        sorted_fi = sorted(zip(feature_names, rf.feature_importances_), key=lambda x: x[1], reverse=True)
        feature_importances = [
            {"feature": f, "importance": round(float(imp) * 100, 2)}
            for f, imp in sorted_fi
        ]

    return {
        "treeIndex": safe_idx,
        "totalTrees": total_trees,
        "maxDepth": depth,
        "modelName": "ExtraTreesClassifier (v4_v3)",
        "features": feature_names,
        "featureImportances": feature_importances,
        "tree": tree_dict
    }

@app.post("/tree-trace")
def trace_tree_decision(sensor: SensorInput, tree_idx: int = Query(0, ge=0), depth: int = Query(4, ge=1, le=8)):
    """
    Executes full ExtraTrees ensemble prediction + traces the exact step-by-step
    decision path for a selected tree estimator.
    """
    sample_df, feature_names, estimated_do, feature_dict = build_extratrees_sample_df(sensor)

    # 1. Ensemble prediction & confidence
    ensemble_prob = rf.predict_proba(sample_df)[0]
    ensemble_pred_raw = rf.predict(sample_df)[0]
    ensemble_health = "Stable" if str(ensemble_pred_raw) in ["0", "0.0"] else "At Risk"
    ensemble_confidence = float(max(ensemble_prob))

    # 2. Ensemble tree voting breakdown
    tree_votes_raw = [int(est.predict(sample_df.values)[0]) for est in rf.estimators_]
    all_tree_votes = ["Stable" if v == 0 else "At Risk" for v in tree_votes_raw]
    stable_votes = sum(1 for v in tree_votes_raw if v == 0)
    risk_votes = sum(1 for v in tree_votes_raw if v == 1)
    total_trees = len(rf.estimators_)

    target_vote = 1 if ensemble_health == "At Risk" else 0
    consensus_idx = 0
    for idx, v in enumerate(tree_votes_raw):
        if v == target_vote:
            consensus_idx = idx
            break

    # 3. Trace specific tree path
    safe_idx = min(max(0, tree_idx), total_trees - 1)
    selected_estimator = rf.estimators_[safe_idx]
    path_node_ids, steps = trace_tree_decision_path(selected_estimator, sample_df, feature_names)
    tree_dict = serialize_decision_tree(selected_estimator, feature_names, max_depth=depth)

    # 4. Feature importances
    feature_importances = []
    if hasattr(rf, "feature_importances_") and len(feature_names) == len(rf.feature_importances_):
        sorted_fi = sorted(zip(feature_names, rf.feature_importances_), key=lambda x: x[1], reverse=True)
        feature_importances = [
            {"feature": f, "importance": round(float(imp) * 100, 2)}
            for f, imp in sorted_fi
        ]

    return {
        "treeIndex": safe_idx,
        "totalTrees": total_trees,
        "maxDepth": depth,
        "sensorData": {
            "temperature": sensor.temperature,
            "do": estimated_do,
            "ph": sensor.ph,
            "turbidity": sensor.turbidity,
            "water_level": sensor.water_level,
            "hour": sensor.hour
        },
        "engineeredFeatures": feature_dict,
        "ensemble": {
            "prediction": ensemble_health,
            "confidence": round(ensemble_confidence, 4),
            "stableVotes": stable_votes,
            "riskVotes": risk_votes,
            "totalVotes": total_trees,
            "stablePercentage": round((stable_votes / total_trees) * 100, 1),
            "riskPercentage": round((risk_votes / total_trees) * 100, 1),
            "consensusTreeIndex": consensus_idx,
            "allTreeVotes": all_tree_votes
        },
        "selectedTree": {
            "treeIndex": safe_idx,
            "pathNodeIds": path_node_ids,
            "steps": steps,
            "terminalPrediction": steps[-1]["prediction"] if steps else ensemble_health,
            "tree": tree_dict
        },
        "featureImportances": feature_importances
    }

