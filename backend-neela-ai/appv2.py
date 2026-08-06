from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from pydantic import BaseModel

from email_service import send_email_notification
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
    description="Hybrid Random Forest + LLM Fish Farm Decision System",
    version="2.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Load model v4 (Hasil train_rf_fix_v4.ipynb - Data_Model_IoTMLCQ_2024.xlsx + Figure 1)

rf = joblib.load("aquaagent_rf_v4.pkl")
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
    refresh_interval INTEGER DEFAULT 5
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
    refresh_interval
)
VALUES(
    1,
    5,
    6.5,
    8.0,
    30,
    15,
    20,
    1,
    5
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
        refresh_interval
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
        "refreshInterval": row[7]
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
        reasons.append("High water level detected.")

    if health_status == "At Risk":
        buzzer = "ON"
        reasons.append("Random Forest predicted At Risk condition.")

    if len(reasons) == 0:
        reasons.append("All sensor parameters are within normal range.")

    return {
        "aerator": aerator,
        "water_circulation": water_circulation,
        "ph_neutralizer": ph_neutralizer,
        "buzzer": buzzer,
        "reasons": reasons
    }

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
    waterLevelMax: float
    iotEnabled: bool
    refreshInterval: int

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
        turbidity_max, water_level_max, iot_enabled, refresh_interval
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
        "refreshInterval": row[7]
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
    SET do_threshold=?, ph_min=?, ph_max=?, temp_max=?, turbidity_max=?, water_level_max=?, iot_enabled=?, refresh_interval=?
    WHERE id=1
    """, (
        data.doThreshold, data.phMin, data.phMax, data.tempMax,
        data.turbidityMax, data.waterLevelMax, int(data.iotEnabled), data.refreshInterval
    ))
    conn.commit()
    get_actuator_state()["beep"] = True
    return {"message": "Settings updated"}

# ==========================================
# ROOT ROUTE
# ==========================================

@app.get("/")
def root():
    return {"message": "AQUAAGENT API v2 Running (RF 99.88% + Rule-Based)"}

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
    # BUILD RF INPUT
    # ----------------------------------
    estimated_do = sensor.do if (sensor.do is not None) else calculate_do(sensor.temperature)

    expected_cols = list(rf.feature_names_in_) if hasattr(rf, "feature_names_in_") else []
    if "TEMP" in expected_cols:
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
    # RANDOM FOREST PREDICTION
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

    global latest_result
    latest_result = {
        "mode": "Rule-Based + RF (99.88%)",
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
        "reason": " ".join(decision["reasons"])
    }

    critical = (
        latest_result["buzzer"] == "ON"
        or latest_result["health_status"] == "At Risk"
    )

    if critical:
        send_email_notification(latest_result)

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
