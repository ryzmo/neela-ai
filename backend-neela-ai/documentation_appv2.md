# 📘 Dokumentasi Backend API & Engine Keputusan AquaAgent (`appv2.py`)
**File Backend Integrasi**: [`backend-neela-ai/appv2.py`](file:///d:/aquaagent-web/backend-neela-ai/appv2.py)  
**Model Machine Learning**: [`aquaagent_rf_v4_v3.pkl`](file:///d:/aquaagent-web/backend-neela-ai/aquaagent_rf_v4_v3.pkl)  
**Database Persistence**: [`aquaagent.db`](file:///d:/aquaagent-web/backend-neela-ai/aquaagent.db) (SQLite3)  
**Modul Pendukung Integrasi**: [`actuator.py`](file:///d:/aquaagent-web/backend-neela-ai/actuator.py) | [`email_service.py`](file:///d:/aquaagent-web/backend-neela-ai/email_service.py)  

---

## 📌 1. Pendahuluan & Arsitektur Sistem Backend

Modul [`appv2.py`](file:///d:/aquaagent-web/backend-neela-ai/appv2.py) merupakan layanan RESTful API berbasis **FastAPI** yang berfungsi sebagai **sistem inferensi & mesin keputusan hybrid (*Hybrid Decision System*)** pada ekosistem AquaAgent. Sistem ini mengombinasikan **Model Machine Learning Random Forest / ExtraTrees (v4_v3)** dengan **Rule-Based Decision Engine** berbasis nilai ambang batas (*thresholds*) yang dapat dikonfigurasi secara dinamis oleh pengguna.

```
[IoT Sensor / Simulator]
          │
          ▼
   POST /analyze
          │
  ┌───────┴────────────────────────┐
  │ 1. Feature Engineering (15 fit)|
  │ 2. RF Model Inference (v4_v3)  │
  │ 3. Rule-Based Decision Engine  │
  └───────┬────────────────────────┘
          │
   ┌──────┴────────────────────────┬────────────────────────┐
   ▼                               ▼                        ▼
[SQLite aquaagent.db]      [Actuator State Update]   [Email Alert Trigger]
(Simpan Historis)          (Autonomous Control)      (Cooldowm 30-Min)
```

### 🎯 Spesifikasi & Fitur Utama `appv2.py`:
* **Framework Backend**: FastAPI dengan dukungan CORS (*Cross-Origin Resource Sharing*) menyeluruh (`allow_origins=["*"]`) untuk memfasilitasi komunikasi dengan frontend Next.js dan perangkat IoT.
* **Integrasi Model ML v4_v3**: Memuat model binary [`aquaagent_rf_v4_v3.pkl`](file:///d:/aquaagent-web/backend-neela-ai/aquaagent_rf_v4_v3.pkl) via `joblib` untuk mengklasifikasikan status kesehatan air (`Stable` vs `At Risk`).
* **Rekayasa Fitur Dinamis di Server**: Mengonversi 4 parameter dasar telemetri sensor + waktu (`temperature`, `ph`, `turbidity`, `water_level`, `hour`) menjadi 15 fitur input ML secara *real-time*.
* **Perhitungan Estimasibilitas DO**: Jika parameter Oksigen Terlarut (`do`) tidak dikirim oleh sensor, backend menghitung estimasi fisik DO menggunakan formula empiris kelarutan oksigen berbasis suhu air.
* **Decision Engine Dual-Tier**: Menggabungkan hasil prediksi ML dan aturan ambang batas sensor untuk mengontrol aktuator tambak (Aerator, Sirkulasi Air, Penetral pH, Buzzer Alarm).
* **Kontrol Aktuator Otomatis (*Autonomous Mode*)**: Sinkronisasi langsung ke modul [`actuator.py`](file:///d:/aquaagent-web/backend-neela-ai/actuator.py) untuk mengendalikan peralatan tambak ketika sistem berada dalam mode `AUTONOMOUS`.
* **Notifikasi Email Kritis (*Automatic Cooldown*)**: Mengirim peringatan ke penerima terdaftar via [`email_service.py`](file:///d:/aquaagent-web/backend-neela-ai/email_service.py) saat kondisi kritis terdeteksi (`health_status == At Risk` atau `buzzer == ON`), disertai mekanisme *cooldown* 30 menit.
* **Penyimpanan Data Historis (SQLite3)**: Menyimpan rekaman sensor, log status kesehatan, preferensi ambang batas, jadwal pakan, serta daftar email penerima alarm pada database [`aquaagent.db`](file:///d:/aquaagent-web/backend-neela-ai/aquaagent.db).

---

## 🛠️ 2. Pipeline Rekayasa Fitur & Inferensi ML

Backend [`appv2.py`](file:///d:/aquaagent-web/backend-neela-ai/appv2.py) secara otomatis mentransformasi data sensor mentah yang diterima endpoint `/analyze` menjadi 15 fitur turunan sesuai spesifikasi model v4_v3.

### 📐 Formula Estimasi DO (Dissolved Oxygen)
Apabila data DO dari sensor tidak tersedia (`None`), backend menghitung estimasi DO berdasarkan suhu air (`TEMP`):
$$\text{DO}_{\text{est}} = 14.652 - 0.41022 \times \text{TEMP} + 0.007991 \times \text{TEMP}^2 - 0.000077774 \times \text{TEMP}^3$$

### 🧬 Tabel 15 Fitur Input Random Forest (v4_v3) yang Di-generate Dinamis:

| Nama Fitur | Tipe Data | Logika / Formula Perhitungan | Deskripsi & Tujuan |
| :--- | :--- | :--- | :--- |
| `TEMP` | Float | `sensor.temperature` | Suhu air tambak (°C) |
| `DO` | Float | `sensor.do` (atau `calculate_do(TEMP)`) | Oksigen terlarut (mg/L) |
| `PH` | Float | `sensor.ph` | Derajat keasaman air |
| `TURBIDITY` | Float | `sensor.turbidity` | Kekeruhan air (NTU) |
| `hour` | Integer | `sensor.hour` | Jam pengukuran (0-23) |
| `risk_flag` | Float | `0.0` jika optimal, `1.0` jika di luar batas | Flag indikator deviasi fisik gabungan |
| `PH_dev` | Float | `abs(sensor.ph - 7.5)` | Deviasi terhadap pH ideal (7.5) |
| `TEMP_dev` | Float | `max(0, TEMP-32) + max(0, 25-TEMP)` | Deviasi di luar suhu aman (25–32°C) |
| `TURB_dev` | Float | `max(0, TURBIDITY - 25.0)` | Deviasi kekeruhan melampaui 25 NTU |
| `DO_dev` | Float | `max(0, 5.0 - DO)` | Defisit oksigen terlarut di bawah 5.0 mg/L |
| `PH_dist_7` | Float | `abs(sensor.ph - 7.0)` | Jarak pH terhadap batas bawah 7.0 |
| `TEMP_DO_ratio` | Float | `DO / (TEMP + 1.0)` | Rasio interaksi kelarutan O2 vs Suhu |
| `TURB_DO_ratio`| Float | `TURBIDITY / (DO + 0.1)` | Rasio kekeruhan terhadap Oksigen |
| `TEMP_PH_ratio`| Float | `TEMP / (PH + 0.1)` | Rasio interaksi Suhu vs pH |
| `hour_sin` | Float | `sin(2 * pi * hour / 24.0)` | Komponen siklik jam (Sinus) |
| `hour_cos` | Float | `cos(2 * pi * hour / 24.0)` | Komponen siklik jam (Kosinus) |

---

## ⚙️ 3. Engine Keputusan Rule-Based (`decision_engine`)

Fungsi `decision_engine()` mengevaluasi kondisi sensor terhadap ambang batas dinamis yang dibaca dari tabel `settings` database SQLite3 ([`aquaagent.db`](file:///d:/aquaagent-web/backend-neela-ai/aquaagent.db)):

| Komponen Aktuator | Kondisi Aktivasi (`ON`) | Alasan / Trigger Text |
| :--- | :--- | :--- |
| **Aerator** | `estimated_do < doThreshold` (Default < 5.0 mg/L) | `"Low dissolved oxygen detected."` |
| **Water Circulation (Pump)** | `temperature > tempMax` OR `turbidity > turbidityMax` | `"High temperature detected."` / `"High turbidity detected."` |
| **pH Neutralizer** | `ph < phMin` OR `ph > phMax` (Default < 6.5 / > 8.0) | `"Abnormal pH detected."` |
| **Buzzer Alarm** | `water_level > waterLevelMax` OR `health_status == "At Risk"` | `"High water level detected."` / `"Random Forest predicted At Risk condition."` |

---

## 📡 4. Dokumentasi Endpoint API (`appv2.py`)

### 🟢 4.1 Core & Health Check
* **`GET /`**
  * **Deskripsi**: Pengecekan status operasional server API.
  * **Response Sample**:
    ```json
    {
      "message": "AQUAAGENT API v2 Running (RF 99.88% + Rule-Based)"
    }
    ```

---

### 🧠 4.2 Analisis Telemetri & Preskripsi ML
* **`POST /analyze`**
  * **Deskripsi**: Menerima data sensor IoT / Simulator, menghitung 15 fitur ML, melakukan inferensi Random Forest v4_v3, mengompilasi keputusan aktuator, menyimpan log ke SQLite, serta memicu notifikasi email jika darurat.
  * **Payload Request (`SensorInput`)**:
    ```json
    {
      "temperature": 29.5,
      "ph": 7.6,
      "turbidity": 12.0,
      "water_level": 15.0,
      "hour": 14,
      "do": 5.8,
      "source": "iot"
    }
    ```
  * **Response Sample (Success)**:
    ```json
    {
      "mode": "Rule-Based + RF (99.88%)",
      "health_status": "Stable",
      "rf_confidence": 0.985,
      "sensor_data": {
        "temperature": 29.5,
        "do": 5.8,
        "ph": 7.6,
        "turbidity": 12.0,
        "water_level": 15.0,
        "hour": 14
      },
      "aerator": "OFF",
      "water_circulation": "OFF",
      "ph_neutralizer": "OFF",
      "buzzer": "OFF",
      "reason": "All sensor parameters are within normal range."
    }
    ```

---

### 🕹️ 4.3 Kontrol Aktuator & Hardware
* **`GET /actuator`**
  * **Deskripsi**: Mengambil status aktuator saat ini dari modul `actuator.py`.
* **`POST /actuator`**
  * **Deskripsi**: Memperbarui mode (`AUTONOMOUS` / `MANUAL`) dan status aktuator.
  * **Payload Request (`ActuatorInput`)**:
    ```json
    {
      "mode": "MANUAL",
      "aerator": true,
      "feeder": false,
      "pump": false,
      "stabilizer": false,
      "buzzer": false
    }
    ```
* **`POST /beep/ack`**: Mengonfirmasi & mematikan sinyal beeper alarm (`beep = False`).
* **`POST /feeder/ack`**: Mengonfirmasi bahwa proses pemberian pakan telah selesai (`feeder = False`).
* **`POST /actuator/ack`**: Mengonfirmasi dan me-reset status aktuator spesifik.

---

### 🎛️ 4.4 Pengaturan Ambang Batas & Sistem
* **`GET /settings`**
  * **Deskripsi**: Mengambil konfigurasi ambang batas sensor dan preferensi sistem dari SQLite.
* **`POST /settings`**
  * **Deskripsi**: Memperbarui ambang batas (DO, pH Min/Max, Suhu Max, Kekeruhan Max, Ketinggian Air Max, IoT Enable, Interval Refresh).
  * **Payload Request (`SettingsInput`)**:
    ```json
    {
      "doThreshold": 5.0,
      "phMin": 6.5,
      "phMax": 8.0,
      "tempMax": 30.0,
      "turbidityMax": 15.0,
      "waterLevelMax": 20.0,
      "iotEnabled": true,
      "refreshInterval": 5
    }
    ```

---

### 🐟 4.5 Manajemen Jadwal Pakan (*Feeding Schedule*)
* **`GET /feeding-schedule`**: Mengambil jadwal pakan aktif (Waktu pakan & Interval jam).
* **`POST /feeding-schedule`**: Memperbarui jadwal pakan dan menambahkan nilai versi (`version + 1`).
* **`GET /feeding-version`**: Mengembalikan nilai `version` terkini untuk sinkronisasi mikrokontroler/frontend.

---

### 📧 4.6 Manajemen Penerima Alarm Email
* **`GET /emails`**: Menampilkan semua daftar email penerima alarm.
* **`POST /emails`**: Menambahkan email baru ke database.
* **`DELETE /emails/{email}`**: Menghapus email penerima dari database.

---

### 📜 4.7 Data Historis & Hasil Analisis Terakhir
* **`GET /latest`**: Mengembalikan hasil analisis `/analyze` paling baru.
* **`GET /history`**: Mengambil 50 rekaman data sensor & status kesehatan air terbaru dari tabel `history`.

---

## 🗄️ 5. Skema Database SQLite (`aquaagent.db`)

Backend [`appv2.py`](file:///d:/aquaagent-web/backend-neela-ai/appv2.py) menginisialisasi dan mengelola 4 tabel utama pada database SQLite3 [`aquaagent.db`](file:///d:/aquaagent-web/backend-neela-ai/aquaagent.db):

```sql
-- 1. Tabel Historis Pengukuran Sensor & Prediksi ML
CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT,
    temperature REAL,
    do_value REAL,
    ph REAL,
    turbidity REAL,
    water_level REAL,
    health_status TEXT
);

-- 2. Tabel Pengaturan Ambang Batas & Sistem
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
);

-- 3. Tabel Jadwal Pemberian Pakan Otomatis
CREATE TABLE IF NOT EXISTS feeding_schedule (
    id INTEGER PRIMARY KEY,
    feeding_time TEXT,
    interval_hours INTEGER,
    enabled INTEGER DEFAULT 1,
    version INTEGER DEFAULT 0
);

-- 4. Tabel Daftar Email Penerima Notifikasi Alarm
CREATE TABLE IF NOT EXISTS email_recipients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE
);
```

---

## 🔔 6. Mekanisme Notifikasi Email Kritis (`email_service.py`)

Setiap kali endpoint `/analyze` mendeteksi kondisi darurat (ketika `buzzer == "ON"` atau `health_status == "At Risk"`), backend memanggil fungsi `send_email_notification(latest_result)`:

1. **Evaluasi Multilevel Alert**:
   * **Low Dissolved Oxygen** (`CRITICAL`): `do < 5.0 mg/L`
   * **High Temperature** (`WARNING`): `temperature > 30.0 °C`
   * **Unstable pH** (`WARNING`): `ph < 6.5` atau `ph > 8.0`
   * **Fish At Risk** (`CRITICAL`): `health_status == "At Risk"` (Hasil Prediksi RF)
2. **Mekanisme Cooldown (30 Menit)**: Mencegah banjir pesan email (*spam*) dengan memverifikasi selisih waktu minimal 30 menit sejak email peringatan terakhir berhasil dikirim.
3. **Dispatch HTTP Request**: Mengirim payload JSON berisi daftar alert dan telemetri sensor ke endpoint Next.js API `http://localhost:3000/api/send-alert-email`.

---

## 🚀 7. Petunjuk Pengoperasian Server API Backend

### 📦 Dependensi Environment
Pastikan Python 3.9+ telah terinstal beserta paket berikut:
```bash
pip install fastapi uvicorn pydantic pandas numpy joblib requests
```

### ⚡ Perintah Menjalankan Server Backend:
```bash
cd backend-neela-ai
uvicorn appv2:app --reload --host 0.0.0.0 --port 8000
```

### 🌐 Akses Dokumentasi Swagger / OpenAPI:
* **Interactive Swagger UI**: `http://localhost:8000/docs`
* **Redoc UI**: `http://localhost:8000/redoc`

---
