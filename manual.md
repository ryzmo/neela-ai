# 📘 MANUAL SISA & DOKUMENTASI SISTEM INTEGRASI AQUAAGENT (NEELA AI)

> **AquaAgent (NEELA AI)** — *Smart Aquaculture Monitoring, Autonomous Control, & Machine Learning Decision Engine for Tilapia Fish Farming*  
> **Lokasi File Manual**: [`manual.md`](file:///d:/aquaagent-web/manual.md)  
> **Versi Sistem**: v2.0 (Model ML v4_v3 — ExtraTrees & Random Forest)  
> **Tanggal Update**: 7 Agustus 2026

---

## 📋 DAFTAR ISI
1. [📌 1. Pendahuluan & Gambaran Umum Sistem](#-1-pendahuluan--gambaran-umum-sistem)
2. [🏗️ 2. Arsitektur Sistem & Alur Kerja End-to-End](#️-2-arsitektur-sistem--alur-kerja-end-to-end)
3. [💻 3. Teknologi & Tech Stack](#-3-teknologi--tech-stack)
4. [📁 4. Struktur Direktori Proyek](#-4-struktur-direktori-proyek)
5. [⚙️ 5. Panduan Instalasi & Setup Environment](#️-5-panduan-instalasi--setup-environment)
   - [5.1 Setup Backend API & Engine ML (`backend-neela-ai`)](#51-setup-backend-api--engine-ml-backend-neela-ai)
   - [5.2 Setup Web Frontend (`aquaagent-web`)](#52-setup-web-frontend-aquaagent-web)
   - [5.3 Setup IoT Firmware MicroPython (`iot/main.py`)](#53-setup-iot-firmware-micropython-iotmainpy)
6. [🕹️ 6. Panduan Penggunaan & Cara Pakai Aplikasi Web](#️-6-panduan-penggunaan--cara-pakai-aplikasi-web)
   - [6.1 Dashboard Telemetry Real-time (`/dashboard` & `/`)](#61-dashboard-telemetry-real-time-dashboard--)
   - [6.2 Kontrol Aktuator & Relay (`/actuator`)](#62-kontrol-aktuator--relay-actuator)
   - [6.3 AI Assistant & Smart Chat Center (`/ai-center` & `/chat`)](#63-ai-assistant--smart-chat-center-ai-center--chat)
   - [6.4 Telemetry Simulator (`/simulator`)](#64-telemetry-simulator-simulator)
   - [6.5 Pengaturan Ambang Batas & Jadwal Pakan (`/settings`)](#65-pengaturan-ambang-batas--jadwal-pakan-settings)
   - [6.6 Analisis Historis & Riwayat Data (`/analytics`)](#66-analisis-historis--riwayat-data-analytics)
7. [🧠 7. Modul Backend API & Machine Learning (`appv2.py` & Model v4_v3)](#-7-modul-backend-api--machine-learning-appv2py--model-v4_v3)
   - [7.1 Mesin Keputusan Dual-Tier (Hybrid ML + Rule-Based)](#71-mesin-keputusan-dual-tier-hybrid-ml--rule-based)
   - [7.2 Rekayasa Fitur (15 Fitur Input Random Forest / ExtraTrees)](#72-rekayasa-fitur-15-fitur-input-random-forest--extratrees)
   - [7.3 Pelatihan Model Machine Learning (`train_rf_fix_v4_v3.ipynb`)](#73-pelatihan-model-machine-learning-train_rf_fix_v4_v3ipynb)
   - [7.4 Ringkasan Dokumentasi API Endpoint](#74-ringkasan-dokumentasi-api-endpoint)
8. [🔌 8. Modul IoT & Firmware ESP32 MicroPython (`iot/main.py`)](#-8-modul-iot--firmware-esp32-micropython-iotmainpy)
   - [8.1 Arsitektur Hardware & Pin Mapping ESP32](#81-arsitektur-hardware--pin-mapping-esp32)
   - [8.2 Logic & Workflow Firmware MicroPython](#82-logic--workflow-firmware-micropython)
9. [📧 9. Mekanisme Notifikasi Email Kritis](#-9-mekanisme-notifikasi-email-kritis)
10. [🔧 10. Troubleshooting & FAQ](#-10-troubleshooting--faq)

---

## 📌 1. Pendahuluan & Gambaran Umum Sistem

**AquaAgent (NEELA AI)** adalah ekosistem platform *Smart Aquaculture* berbasis IoT dan Machine Learning yang dirancang khusus untuk otomatisasi pemantauan dan pengelolaan kualitas air pada budidaya ikan gurami / nila.

Sistem ini mengintegrasikan 3 pilar utama:
1. **Perangkat Hardware IoT (ESP32 DevKit V1)**: Mengukur parameter fisik air (Suhu, pH, Kekeruhan/Turbidity, Ketinggian Air) secara berkesinambungan dan mengendalikan aktuator tambak (Aerator, Pompa Sirkulasi, Dosing Pump Neutralizer pH, Motor Pakan Otomatis, dan Buzzer Alarm).
2. **FastAPI Backend & ML Decision Engine (`appv2.py`)**: Bertindak sebagai otak terpusat yang memproses telemetry sensor, mengeksekusi inferensi Machine Learning Model `v4_v3` (ExtraTrees / Random Forest 93.61% accuracy), menghitung rumus fisika estimasi Oksigen Terlarut (DO), memicu alarm email, serta menyimpan riwayat ke database SQLite (`aquaagent.db`).
3. **Web Application Frontend (`aquaagent-web`)**: Portal UI interaktif berbasis Next.js 16 yang menyajikan visualisasi data *real-time*, modul pengambil keputusan mandiri, fitur simulasi telemetri, pengaturan ambang batas dinamis, hingga Asisten AI (NEELA AI Chatbot) berbasis LLM.

---

## 🏗️ 2. Arsitektur Sistem & Alur Kerja End-to-End

Berikut adalah bagan alur kerja sistem dari pembacaan sensor IoT hingga visualisasi Web Dashboard dan eksekusi aktuator:

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                 PERANGKAT IOT (ESP32)                                   │
│  - Sensor DS18B20 (Suhu)                                                                │
│  - Sensor pH Gravity V2                                                                 │
│  - Sensor Turbidity SEN0189                                                             │
│  - Sensor Water Level                                                                   │
│                                                                                         │
│  Main Loop: Baca Sensor  ──►  POST /analyze  ───────┐                                   │
│            Set Relay    ◄──  GET /actuator  ──────┐ │                                   │
└───────────────────────────────────────────────────┼─┼───────────────────────────────────┘
                                                    │ │
                                                    ▼ │
┌─────────────────────────────────────────────────────┼───────────────────────────────────┐
│                           FASTAPI BACKEND (appv2.py) │                                   │
│                                                     │                                   │
│  1. Menghitung Estimasi DO (Henry's Law)            │                                   │
│  2. Generate 15 Fitur Turunan ML                    │                                   │
│  3. Inferensi Model ML v4_v3 (aquaagent_rf_v4_v3)   │                                   │
│  4. Evaluasi Rule-Based Engine                      │                                   │
│  5. Simpan Log ke SQLite (aquaagent.db)             │                                   │
│                                                     │                                   │
│  Mode Kontrol:                                      │                                   │
│  - AUTONOMOUS: Aktuator diatur otomatis oleh Engine  │                                   │
│  - MANUAL: Aktuator mengikuti input dari Web        │                                   │
│                                                     │                                   │
│  Notifikasi Kritis ──► Trigger Email Alert (Cooldown 30 m)                             │
└──────────────────────┬──────────────────────────────┴───────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                               WEB FRONTEND (Next.js 16)                                 │
│  - Dashboard Real-time Telemetry (Recharts, Gauge UI)                                   │
│  - Control Panel Aktuator (Switch Manual / Autonomous)                                  │
│  - Telemetry Simulator (Skenario Uji Normal / Kritis)                                   │
│  - AI Center & NEELA Chat Assistant (Powered by LLM API)                                │
│  - Settings Ambang Batas, Jadwal Pakan, Recipient Email                                 │
│  - Analytics & Data Historis (Export PDF / CSV)                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 💻 3. Teknologi & Tech Stack

### 🎨 Frontend Web (`aquaagent-web`)
* **Framework**: Next.js 16.2.7 (React 19.2.4)
* **Styling**: Tailwind CSS v4, Vanilla CSS Custom Variables, Modern Dark Glassmorphism Theme
* **Animasi & Interaktivitas**: GSAP 3.15.0, Lenis 1.3.25 (Smooth Scrolling), Lucide React (Icon System)
* **Grafik & Visualisasi**: Recharts 3.8.1
* **Ekspor & Layanan**: Axios (HTTP Client), jsPDF & jsPDF-AutoTable (PDF Reporting), Nodemailer (Email Alert Dispatcher)

### 🧠 Backend API & Engine ML (`backend-neela-ai`)
* **Core Framework**: Python 3.9+, FastAPI, Uvicorn (ASGI Web Server)
* **Machine Learning Stack**: Scikit-Learn (ExtraTrees & Random Forest Classifier), Joblib, Imbalanced-Learn (SMOTE Oversampling), Pandas, NumPy
* **Database**: SQLite3 (`aquaagent.db`)
* **Integrasi LLM**: OpenAI / Groq API Client (Asisten NEELA AI)
* **Layanan Pendukung**: `actuator.py` (State Management), `email_service.py` (Mekanisme Cooldown Alert Email)

### 🔌 Perangkat IoT & MicroPython Firmware (`iot/main.py`)
* **Platform Mikrokontroler**: ESP32 WROOM-32 / DevKit V1
* **Bahasa Pemrograman**: MicroPython v1.20+ (atau Arduino C++ Firmware equivalent)
* **Protokol Komunikasi**: WiFi IEEE 802.11 b/g/n, HTTP REST Client (JSON payload)
* **Sensor**:
  * Sensor Suhu Air: DS18B20 (Digital OneWire)
  * Sensor Keasaman Air: DFRobot Gravity Analog pH Sensor V2
  * Sensor Kekeruhan: Optical Turbidity Sensor SEN0189
  * Sensor Ketinggian Air: Resistive Water Level Sensor
* **Aktuator Hardware**:
  * Relay Module 4-Channel (Relay 1: Aerator, Relay 2: Pompa Air, Relay 3: Feeder Pakan, Relay 4: Neutralizer pH)
  * Active Buzzer 3.3V/5V (Sinyal bahaya lokal)

---

## 📁 4. Struktur Direktori Proyek

```
aquaagent-web/
├── manual.md                              # 📘 Dokumen Manual Lengkap (File ini)
├── README.md                              # Dokumentasi ringkas proyek
├── alat.md                                # Tasklist & Wiring Panduan Hardware IoT
├── package.json                           # Konfigurasi dependensi Web Next.js
├── next.config.mjs                        # Konfigurasi Next.js
│
├── backend-neela-ai/                      # 🧠 DIRECTORY BACKEND & MACHINE LEARNING
│   ├── appv2.py                           # Application Utama FastAPI Backend API
│   ├── aquaagent_rf_v4_v3.pkl             # Binary Model Machine Learning v4_v3 (ExtraTrees/RF)
│   ├── rf_features_v4_v3.pkl              # Metadata List 15 Fitur Model v4_v3
│   ├── train_rf_fix_v4_v3.ipynb           # Notebook Pelatihan Model (80:20 Split, SMOTE, 93.61% Acc)
│   ├── documentation_appv2.md             # Dokumentasi teknis endpoint backend appv2.py
│   ├── documentationtraining_v4_v3.md     # Dokumentasi rincian eksperimen & evaluasi ML
│   ├── actuator.py                        # Modul State Aktuator & Mode Sistem
│   ├── email_service.py                   # Layanan Notifikasi Email Alert (Cooldown 30 m)
│   ├── llm_decision.py                    # Script Pengujian LLM Decision Prompt
│   ├── aquaagent.db                       # Database SQLite (History, Settings, Schedule, Email)
│   └── Data_Model_IoTMLCQ_2024.xlsx       # Dataset Referensi Pelatihan
│
├── iot/                                   # 🔌 DIRECTORY FIRMWARE IOT
│   └── main.py                            # MicroPython Code / Firmware Script ESP32
│
└── src/                                   # 🎨 DIRECTORY FRONTEND NEXT.JS
    ├── components/                        # Komponen Reusable (Navbar, Sidebar, Cards, Charts, UI)
    ├── hooks/                             # Custom React Hooks
    ├── lib/                               # Helper & Konfigurasi Library
    ├── pages/                             # Next.js Pages / Routes:
    │   ├── index.js                       # Landing Page / Portal Utama
    │   ├── dashboard.js                   # Live Telemetry & Control Center
    │   ├── actuator.js                    # Panel Kontrol Aktuator & Relays
    │   ├── ai-center.js                   # Dashboard Rekomendasi ML & Diagnostik AI
    │   ├── chat.js                        # NEELA AI Interactive Chat Assistant
    │   ├── simulator.js                   # Telemetry Simulator & Stress Testing
    │   ├── settings.js                    # Ambang Batas, Thresholds, & Jadwal Pakan
    │   ├── analytics.js                   # Analytics, Chart Historis, Export PDF
    │   ├── alerts.js                      # Centralized Alert Logs
    │   └── api/                           # Next.js API Routes:
    │       ├── chat.js                    # API Handler untuk LLM NEELA AI Chat
    │       └── send-alert-email.js        # API Handler untuk Dispatch Email Nodemailer
    └── styles/                            # CSS Stylesheet & Theme Token
```

---

## ⚙️ 5. Panduan Instalasi & Setup Environment

### 5.1 Setup Backend API & Engine ML (`backend-neela-ai`)

1. **Buka Terminal & Masuk ke Directory Backend**:
   ```bash
   cd backend-neela-ai
   ```

2. **Buat Virtual Environment (Disarankan)**:
   ```bash
   python -m venv venv
   # Aktifkan di Windows:
   venv\Scripts\activate
   # Atau di Linux/macOS:
   source venv/bin/activate
   ```

3. **Install Dependensi Python**:
   ```bash
   pip install fastapi uvicorn pydantic pandas numpy joblib scikit-learn requests
   ```

4. **Jalankan FastAPI Backend Server**:
   ```bash
   uvicorn appv2:app --reload --host 0.0.0.0 --port 8000
   ```
   * Server Backend akan berjalan di `http://localhost:8000`.
   * OpenDokumentasi Swagger UI interaktif dapat diakses pada `http://localhost:8000/docs`.

---

### 5.2 Setup Web Frontend (`aquaagent-web`)

1. **Buka Terminal di Root Directory Workspace (`aquaagent-web`)**:
   ```bash
   cd d:\aquaagent-web
   ```

2. **Install Dependensi Node.js**:
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variable (`.env.local`)**:
   Buat atau pastikan file `.env.local` berisi konfigurasi berikut:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   OPENAI_API_KEY=sk-... # (Opsional untuk fitur NEELA AI Chatbot)
   GROQ_API_KEY=gsk_...  # (Opsional jika menggunakan LLM Groq Provider)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   ```

4. **Jalankan Server Development Next.js**:
   ```bash
   npm run dev
   ```
   * Aplikasi Web akan berjalan di `http://localhost:3000`.

---

### 5.3 Setup IoT Firmware MicroPython (`iot/main.py`)

1. **Persiapan Hardware**:
   * Siapkan ESP32 DevKit V1.
   * Hubungkan sensor DS18B20 ke GPIO 4, pH Sensor ke GPIO 34, Turbidity Sensor ke GPIO 35, Water Level Sensor ke GPIO 36.
   * Hubungkan Relay 4-Channel ke GPIO 25 (Aerator), GPIO 26 (Pump), GPIO 32 (Feeder), GPIO 33 (pH Stabilizer), dan Active Buzzer ke GPIO 27.

2. **Flash MicroPython Firmware ke ESP32**:
   * Gunakan [Thonny IDE](https://thonny.org/) atau `esptool`.
   * Flash firmware MicroPython ESP32 terkini (v1.20+).

3. **Upload Script [`iot/main.py`](file:///d:/aquaagent-web/iot/main.py)**:
   * Buka Thonny IDE, hubungkan ESP32 via kabel USB Serial.
   * Sesuaikan variabel WiFi SSID, Password, dan IP Backend Server pada kode `main.py`:
     ```python
     WIFI_SSID = "NAMA_WIFI_ANDA"
     WIFI_PASS = "PASSWORD_WIFI_ANDA"
     BACKEND_URL = "http://192.168.1.X:8000" # Ganti dengan IP lokal Komputer Backend
     ```
   * Simpan file sebagai `main.py` di dalam memori internal ESP32 MicroPython.
   * Jalankan script (`Run current script`).

---

## 🕹️ 6. Panduan Penggunaan & Cara Pakai Aplikasi Web

---

### 6.1 Dashboard Telemetry Real-time (`/dashboard` & `/`)

* **Fungsi Utama**: Menyajikan statistik indikator utama kondisi air tambak secara *live*.
* **Parameter yang Ditampilkan**:
  1. **Dissolved Oxygen (DO)**: Menampilkan tingkat kelarutan oksigen (mg/L). Status Optimal: > 5.0 mg/L.
  2. **Water Temperature**: Menampilkan suhu air (°C). Rentang Aman: 25.0°C - 30.0°C.
  3. **pH Level**: Menampilkan derajat keasaman. Rentang Optimal: 6.5 - 8.0.
  4. **Turbidity**: Menampilkan tingkat kekeruhan air (NTU). Batas Maksimal: 15 - 25 NTU.
  5. **Water Level**: Ketinggian air tambak (cm). Batas Maksimal: 20 cm.
* **Indikator Status Kesehatan Air**:
  * 🟢 **Stable**: Air berada dalam kondisi aman untuk pertumbuhan biota.
  * 🔴 **At Risk**: Terjadi deviasi ekstrem atau prediksi Model Machine Learning menandakan risiko tinggi. Sistem akan secara otomatis mengaktifkan intervensi aktuator dan alarm.

---

### 6.2 Kontrol Aktuator & Relay (`/actuator`)

Portal kontrol peralatan fisik tambak. Menyediakan 2 Mode Operasional:

1. **Mode AUTONOMOUS (Otomatis)**:
   * Sistem Backend `appv2.py` mengambil alih seluruh kendali aktuator berdasarkan inferensi ML v4_v3 dan aturan ambang batas (*Rule-Based Engine*).
   * Pengguna tidak perlu menyalakan atau mematikan alat secara manual.

2. **Mode MANUAL (Kendali Pengguna)**:
   * Pengguna dapat secara bebas melakukan *toggle ON/OFF* untuk masing-masing peranti:
     * 🌬️ **Aerator (Air Pump)**: Menyuplai oksigen tambahan.
     * 🔄 **Water Circulation (Pompa Air)**: Menjaga sirkulasi dan menurunkan suhu/kekeruhan.
     * 🧪 **pH Neutralizer (Dosing Pump)**: Menetralkan pH air.
     * 🐟 **Auto Feeder**: Pemberian pakan otomatis.
     * 🚨 **Buzzer Alarm**: Mematikan atau menguji sinyal beeper darurat (`POST /beep/ack`).

---

### 6.3 AI Assistant & Smart Chat Center (`/ai-center` & `/chat`)

* **Akses**: Menu Sidebar **AI Center** atau **NEELA Chat**.
* **Fitur Utama**:
  * **Analisis Diagnostik Otomatis**: Menampilkan *preskripsi AI* mengenai kondisi tambak saat ini.
  * **Interactive Chatbot (NEELA AI)**: Pengguna dapat mengajukan pertanyaan seputar budidaya ikan nila, penyebab keasaman air, rekomendasi dosis pakan, hingga penjelasan tindakan aktuator yang sedang aktif.
  * Chatbot memiliki konteks langsung (*live context injection*) ke data telemetri sensor saat ini.

---

### 6.4 Telemetry Simulator (`/simulator`)

Modul pengujian mandiri tanpa memerlukan alat IoT fisik terhubung.

* **Skenario Simulasi yang Tersedia**:
  * 🟢 **Skenario Normal / Optimal**: Mengisi data sensor pada kondisi ideal (Suhu 28°C, pH 7.5, DO 6.2 mg/L, Turbidity 10 NTU).
  * 🔴 **Skenario Oksigen Rendah (Low DO)**: Menguji aktivasi otomatis Aerator.
  * 🔴 **Skenario Suhu & Kekeruhan Tinggi**: Menguji aktivasi Pompa Sirkulasi Air.
  * 🔴 **Skenario Keasaman Ekstrem (pH Unstable)**: Menguji aktivasi pH Neutralizer Dosing Pump.
  * 🔴 **Skenario Kondisi Kritis (At Risk)**: Menguji prediksi ML Random Forest dan pengiriman Notifikasi Email Alert.
* **Penggunaan**: Pilih preset skenario, tekan tombol **"Kirim Data Simulasi"**, lalu amati reaksi pada Dashboard dan Panel Aktuator.

---

### 6.5 Pengaturan Ambang Batas & Jadwal Pakan (`/settings`)

Halaman pengisian konfigurasi sistem yang langsung tersimpan pada database SQLite backend:

1. **Ambang Batas Sensor (*Sensor Thresholds*)**:
   * Min & Max pH (Default: 6.5 - 8.0)
   * Minimum Dissolved Oxygen (Default: 5.0 mg/L)
   * Maximum Temperature (Default: 30.0 °C)
   * Maximum Turbidity (Default: 15.0 NTU)
   * Maximum Water Level (Default: 20.0 cm)
2. **Interval Refresh & IoT Enable**:
   * Mengaktifkan/mematikan penerimaan data IoT (`iotEnabled`).
   * Menentukan frekuensi pembacaan data (detik).
3. **Jadwal Pemberian Pakan (*Feeding Schedule*)**:
   * Jam pakan harian & interval jam pemberian pakan.
   * Setiap kali jadwal diubah, nilai `feeding_version` bertambah sehingga ESP32 otomatis menyinkronkan timer lokalnya.
4. **Daftar Penerima Notifikasi Email**:
   * Menambah dan menghapus alamat email yang berhak menerima email peringatan darurat.

---

### 6.6 Analisis Historis & Riwayat Data (`/analytics`)

* **Visualisasi Tren Telemetri**: Grafik garis interaktif untuk memantau fluktuasi Suhu, pH, DO, dan Kekeruhan selama 24 jam / 7 hari terakhir.
* **Log Riwayat Pengukuran**: Tabel log lengkap 50 transaksi terakhir.
* **Ekspor Laporan**: Fitur ekspor data historis ke format **PDF** (menggunakan library `jspdf` & `jspdf-autotable`) atau **CSV** untuk keperluan dokumentasi dan riset.

---

## 🧠 7. Modul Backend API & Machine Learning (`appv2.py` & Model v4_v3)

Backend [`backend-neela-ai/appv2.py`](file:///d:/aquaagent-web/backend-neela-ai/appv2.py) berfungsi sebagai *Decision Engine* terpusat.

### 7.1 Mesin Keputusan Dual-Tier (Hybrid ML + Rule-Based)

```
                       Input Telemetri Sensor
                                  │
                      ┌───────────┴───────────┐
                      ▼                       ▼
            ML Inference (v4_v3)     Rule-Based Engine
            (Random Forest/ET)     (Threshold Evaluation)
                      │                       │
                      └───────────┬───────────┘
                                  ▼
                     Keputusan Final Aktuator &
                    Status Health (Stable / At Risk)
```

1. **Tier 1 — Inferensi Model ML (`aquaagent_rf_v4_v3.pkl`)**:
   * Mengklasifikasikan status kesehatan air menjadi `Stable` (0) atau `At Risk` (1) dengan tingkat kepastian (*confidence score*).
2. **Tier 2 — Rule-Based Decision Logic**:
   * **Aerator**: Aktif (`ON`) jika `DO < doThreshold` (Default < 5.0 mg/L).
   * **Water Circulation**: Aktif (`ON`) jika `Temperature > tempMax` ATAU `Turbidity > turbidityMax`.
   * **pH Neutralizer**: Aktif (`ON`) jika `pH < phMin` ATAU `pH > phMax`.
   * **Buzzer Alarm**: Aktif (`ON`) jika `Water Level > waterLevelMax` ATAU `health_status == "At Risk"`.

---

### 7.2 Rekayasa Fitur (15 Fitur Input Random Forest / ExtraTrees)

Backend merubah 4 parameter dasar telemetri + jam menjadi 15 fitur input secara *real-time*:

$$\text{DO}_{\text{est}} = 14.652 - 0.41022 \times \text{TEMP} + 0.007991 \times \text{TEMP}^2 - 0.000077774 \times \text{TEMP}^3$$

| Nama Fitur | Tipe | Logika Perhitungan | Fungsi & Deskripsi |
| :--- | :--- | :--- | :--- |
| `TEMP` | Float | `sensor.temperature` | Suhu air (°C) |
| `DO` | Float | `sensor.do` (atau `calculate_do(TEMP)`) | Oksigen Terlarut (mg/L) |
| `PH` | Float | `sensor.ph` | Derajat keasaman air |
| `TURBIDITY` | Float | `sensor.turbidity` | Kekeruhan air (NTU) |
| `hour` | Integer | `sensor.hour` | Jam pengukuran (0-23) |
| `risk_flag` | Float | `1.0` jika abnormal, `0.0` jika normal | Indikator biner deviasi fisik |
| `PH_dev` | Float | `abs(PH - 7.5)` | Penyimpangan dari pH ideal 7.5 |
| `TEMP_dev` | Float | `max(0, TEMP-32) + max(0, 25-TEMP)` | Penyimpangan dari rentang 25–32°C |
| `TURB_dev` | Float | `max(0, TURBIDITY - 25.0)` | Kelebihan kekeruhan dari 25 NTU |
| `DO_dev` | Float | `max(0, 5.0 - DO)` | Defisit oksigen di bawah 5.0 mg/L |
| `PH_dist_7` | Float | `abs(PH - 7.0)` | Jarak ke ambang batas bawah 7.0 |
| `TEMP_DO_ratio` | Float | `DO / (TEMP + 1.0)` | Interaksi kelarutan O2 vs Suhu |
| `TURB_DO_ratio`| Float | `TURBIDITY / (DO + 0.1)` | Rasio kekeruhan vs Oksigen |
| `TEMP_PH_ratio`| Float | `TEMP / (PH + 0.1)` | Rasio Suhu vs keasaman pH |
| `hour_sin` | Float | `sin(2 * pi * hour / 24.0)` | Komponen siklis sinus waktu |
| `hour_cos` | Float | `cos(2 * pi * hour / 24.0)` | Komponen siklis kosinus waktu |

---

### 7.3 Pelatihan Model Machine Learning (`train_rf_fix_v4_v3.ipynb`)

Model v4_v3 dikembangkan melalui Jupyter Notebook [`train_rf_fix_v4_v3.ipynb`](file:///d:/aquaagent-web/backend-neela-ai/train_rf_fix_v4_v3.ipynb) dengan spesifikasi:
* **Stratified Train-Test Split (80:20 DAHULU)**: Mencegah 100% *Data Leakage*.
* **SMOTE Resampling (`sampling_strategy=0.6`)**: Menyeimbangkan rasio sampel latih dari 5:1 menjadi proporsional (62.5% Stable : 37.5% At Risk).
* **Hasil Evaluasi Model Terbaik**:
  * **ExtraTrees Classifier**: **93.61% Accuracy**, AUC-ROC: **0.941**, Precision: **0.840**, Recall: **0.745**.
  * **Random Forest Classifier**: **93.50% Accuracy**, AUC-ROC: **0.940**.

---

### 7.4 Ringkasan Dokumentasi API Endpoint

| Method | Endpoint | Fungsi & Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/` | Core Health Check Status Server API |
| `POST` | `/analyze` | Menerima data telemetri sensor, eksekusi ML v4_v3, simpan log SQLite, pemicu alert email |
| `GET` | `/actuator` | Membaca status mode (`AUTONOMOUS`/`MANUAL`) dan relay aktuator |
| `POST` | `/actuator` | Memperbarui status aktuator & mode operasional |
| `POST` | `/beep/ack` | Konfirmasi & reset sinyal alarm buzzer |
| `POST` | `/feeder/ack` | Konfirmasi proses pemberian pakan selesai |
| `GET` | `/settings` | Membaca daftar ambang batas sensor & konfigurasi |
| `POST` | `/settings` | Menyimpan perubahan ambang batas sensor ke SQLite |
| `GET` | `/feeding-schedule` | Membaca jadwal pakan otomatis |
| `POST` | `/feeding-schedule` | Memperbarui jadwal pakan (meningkatkan `feeding_version`) |
| `GET` | `/emails` | Membaca daftar penerima notifikasi email alarm |
| `POST` | `/emails` | Menambah email penerima alarm baru |
| `DELETE`| `/emails/{email}` | Menghapus email penerima alarm |
| `GET` | `/history` | Membaca 50 rekaman riwayat sensor terbaru |
| `GET` | `/latest` | Membaca hasil analisis `/analyze` paling baru |

---

## 🔌 8. Modul IoT & Firmware ESP32 MicroPython (`iot/main.py`)

Firmware mikrokontroler ditulis dalam MicroPython pada file [`iot/main.py`](file:///d:/aquaagent-web/iot/main.py).

### 8.1 Arsitektur Hardware & Pin Mapping ESP32

```
                       ┌─────────────────────────┐
                       │     ESP32 DevKit V1     │
                       └────────────┬────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
   SENSOR INPUT                POWER / SYSTEM            AKTUATOR OUTPUT
   - DS18B20 (GPIO 4)          - 3.3V / 5V / GND         - Relay 1 Aerator (GPIO 25)
   - pH Sensor (GPIO 34)                                 - Relay 2 Pump (GPIO 26)
   - Turbidity (GPIO 35)                                 - Relay 3 Feeder (GPIO 32)
   - Water Level (GPIO 36)                               - Relay 4 pH Stab (GPIO 33)
                                                         - Active Buzzer (GPIO 27)
```

| Pin ESP32 | Jenis Pin | Komponen Hardware | Keterangan Operasional |
| :--- | :--- | :--- | :--- |
| `GPIO 4` | Digital Input | Sensor Suhu DS18B20 | Protocol OneWire, butuh pull-up resistor 4.7kΩ |
| `GPIO 34` | Analog Input (ADC) | DFRobot pH Sensor V2 | Output tegangan 0-3.3V |
| `GPIO 35` | Analog Input (ADC) | Sensor Turbidity SEN0189 | Output tegangan 0-3.3V |
| `GPIO 36` | Analog Input (ADC) | Water Level Sensor | Output tegangan analog resistif |
| `GPIO 25` | Digital Output | Relay 1 — Aerator | Active LOW |
| `GPIO 26` | Digital Output | Relay 2 — Pompa Air | Active LOW |
| `GPIO 32` | Digital Output | Relay 3 — Auto Feeder | Active LOW (Motor Servo/DC) |
| `GPIO 33` | Digital Output | Relay 4 — pH Stabilizer | Active LOW (Dosing Pump) |
| `GPIO 27` | Digital Output | Active Buzzer Alarm | Driven 3.3V/5V |

---

### 8.2 Logic & Workflow Firmware MicroPython

Kode MicroPython pada [`iot/main.py`](file:///d:/aquaagent-web/iot/main.py) menjalankan *loop* utama tanpa henti:

```python
# Pseudo-code Alur Utama Firmware ESP32 (iot/main.py)
import time
import network
import urequests

def main_loop():
    connect_wifi()
    
    while True:
        # 1. Baca data fisik dari sensor-sensor
        temp = read_ds18b20()
        ph = read_ph_sensor()
        turb = read_turbidity_sensor()
        w_level = read_water_level()
        
        # 2. Kirim telemetri ke Backend FastAPI
        payload = {
            "temperature": temp,
            "ph": ph,
            "turbidity": turb,
            "water_level": w_level,
            "hour": get_current_hour(),
            "source": "iot"
        }
        res = urequests.post(BACKEND_URL + "/analyze", json=payload)
        
        # 3. Poll status aktuator dari Backend
        act_res = urequests.get(BACKEND_URL + "/actuator").json()
        
        # 4. Set state Relay GPIO sesuai balasan backend
        set_relay(PIN_AERATOR, act_res.get("aerator"))
        set_relay(PIN_PUMP, act_res.get("water_circulation"))
        set_relay(PIN_STABILIZER, act_res.get("ph_neutralizer"))
        set_relay(PIN_FEEDER, act_res.get("feeder"))
        set_relay(PIN_BUZZER, act_res.get("buzzer"))
        
        # 5. Cek sinkronisasi jadwal pakan
        check_feeding_schedule_sync()
        
        time.sleep(REFRESH_INTERVAL)
```

---

## 📧 9. Mekanisme Notifikasi Email Kritis

Backend [`email_service.py`](file:///d:/aquaagent-web/backend-neela-ai/email_service.py) bertugas memberikan peringatan dini (*Early Warning System*) kepada pengelola tambak:

1. **Kondisi Pemicu Alert**:
   * `DO < 5.0 mg/L` (`CRITICAL: Low Dissolved Oxygen`)
   * `Temperature > 30.0 °C` (`WARNING: High Water Temperature`)
   * `pH < 6.5` ATAU `pH > 8.0` (`WARNING: Unstable Water pH`)
   * `health_status == "At Risk"` (`CRITICAL: Fish At Risk Predicted by RF Model`)
2. **Mekanisme Cooldown 30 Menit**:
   * Sistem mencatat timestamp pengiriman email terakhir. Jika ancaman berulang terjadi dalam rentang kurung waktu 30 menit, pengiriman email akan ditangguhkan untuk mencegah spam email.
3. **Dispatch Email**:
   * Backend memanggil endpoint API Next.js `/api/send-alert-email` yang menggunakan **Nodemailer** untuk mengirimkan format email HTML yang rapi ke seluruh alamat yang terdaftar pada tabel `email_recipients` SQLite.

---

## 🔧 10. Troubleshooting & FAQ

### Q1: Kenapa ESP32 gagal mengirim data ke Backend (`Connection Error`)?
* **Solusi**: Pastikan ESP32 dan komputer Backend terhubung pada **satu jaringan WiFi lokal yang sama**. Pastikan IP Address pada `BACKEND_URL` di `iot/main.py` menggunakan IP LAN Komputer (misal `192.168.1.50:8000`), bukan `localhost` atau `127.0.0.1`.

### Q2: Mengapa status aktuator di Web tidak merespon saat diklik manual?
* **Solusi**: Periksa mode operasional di halaman `/actuator`. Jika sistem berada pada mode `AUTONOMOUS`, keputusan aktuator dikunci oleh Machine Learning Backend Engine. Ubah mode ke `MANUAL` terlebih dahulu.

### Q3: Model ML v4_v3 tidak dapat dimuat (`FileNotFoundError: aquaagent_rf_v4_v3.pkl`)?
* **Solusi**: Pastikan file model [`aquaagent_rf_v4_v3.pkl`](file:///d:/aquaagent-web/backend-neela-ai/aquaagent_rf_v4_v3.pkl) berada di dalam folder `backend-neela-ai/` dan perintah `uvicorn appv2:app` dijalankan tepat dari dalam directory `backend-neela-ai/`.

### Q4: Nilai Oksigen Terlarut (DO) tidak muncul dari sensor?
* **Solusi**: Nilai DO pada AquaAgent dihitung secara fisik otomatis (*Estimated DO*) menggunakan formula kelarutan oksigen berbasis suhu air jika sensor fisik DO tidak terpasang.

---

> **Dokumentasi Manual AquaAgent (NEELA AI)** — *Smart Aquaculture Monitoring & Control System* 🐟⚡
