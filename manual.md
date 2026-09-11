# 📘 MANUAL & PANDUAN PENGOPERASIAN LENGKAP SISTEM AQUAAGENT (NEELA AI)

> **AquaAgent (NEELA AI)** — *Smart Aquaculture Monitoring, Autonomous Control, Explainable AI (XAI) Decision Tree, & Machine Learning Decision Engine for Tilapia Fish Farming*  
> **Lokasi File Manual**: [`manual.md`](file:///d:/aquaagent-web/manual.md)  
> **Versi Sistem**: v2.0 (Model ML v4_v3 — ExtraTrees & Random Forest Classifier)  
> **Tanggal Update**: 11 September 2026

---

## 📋 DAFTAR ISI
1. [🌟 1. Panduan Cepat untuk Pengguna Awam / Peternak Ikan (SOP Harian)](#-1-panduan-cepat-untuk-pengguna-awam--peternak-ikan-sop-harian)
   - [1.1 Alur Pengoperasian 5 Menit (Start-to-Finish)](#11-alur-pengoperasian-5-menit-start-to-finish)
   - [1.2 Membaca Status & Indikator Warna di Layar](#12-membaca-status--indikator-warna-di-layar)
   - [1.3 Apa yang Terjadi Saat Air Bermasalah? (Otomatis vs Manual)](#13-apa-yang-terjadi-saat-air-bermasalah-otomatis-vs-manual)
   - [1.4 Cara Memberi Pakan Ikan & Mengatur Jadwal](#14-cara-memberi-pakan-ikan--mengatur-jadwal)
   - [1.5 Cara Bertanya & Konsultasi ke Asisten AI (NEELA AI)](#15-cara-bertanya--konsultasi-ke-asisten-ai-neela-ai)
2. [📌 2. Pendahuluan & Gambaran Umum Sistem](#-2-pendahuluan--gambaran-umum-sistem)
3. [🏗️ 3. Arsitektur Sistem & Alur Kerja End-to-End](#️-3-arsitektur-sistem--alur-kerja-end-to-end)
4. [💻 4. Teknologi & Tech Stack](#-4-teknologi--tech-stack)
5. [📁 5. Struktur Direktori Proyek](#-5-struktur-direktori-proyek)
6. [⚙️ 6. Panduan Instalasi & Setup Environment (Bagi Pengembang/Teknisi)](#️-6-panduan-instalasi--setup-environment-bagi-pengembangteknisi)
   - [6.1 Setup Backend API & Engine ML (`backend-neela-ai`)](#61-setup-backend-api--engine-ml-backend-neela-ai)
   - [6.2 Setup Web Frontend (`aquaagent-web`)](#62-setup-web-frontend-aquaagent-web)
   - [6.3 Setup IoT Firmware MicroPython (`iot/main.py`)](#63-setup-iot-firmware-micropython-iotmainpy)
7. [🕹️ 7. Panduan Fitur Lengkap Aplikasi Web (Menu demi Menu)](#️-7-panduan-fitur-lengkap-aplikasi-web-menu-demi-menu)
   - [7.1 Dashboard Telemetry Real-time (`/dashboard` & `/`)](#71-dashboard-telemetry-real-time-dashboard--)
   - [7.2 Kontrol Aktuator & Relay Dual Pump pH (`/actuator`)](#72-kontrol-aktuator--relay-dual-pump-ph-actuator)
   - [7.3 AI Assistant & Smart Chat Center (`/ai-center` & `/chat`)](#73-ai-assistant--smart-chat-center-ai-center--chat)
   - [7.4 Explainable AI & Interactive Decision Tree Visualizer (`/decision-tree`)](#74-explainable-ai--interactive-decision-tree-visualizer-decision-tree)
   - [7.5 Telemetry Simulator (`/simulator`)](#75-telemetry-simulator-simulator)
   - [7.6 Pengaturan Ambang Batas, Durasi Aktuator & Jadwal Pakan (`/settings`)](#76-pengaturan-ambang-batas-durasi-aktuator--jadwal-pakan-settings)
   - [7.7 Analisis Historis & Riwayat Data (`/analytics`)](#77-analisis-historis--riwayat-data-analytics)
   - [7.8 Riwayat Peringatan Dini (`/alerts`)](#78-riwayat-peringatan-dini-alerts)
8. [🧠 8. Modul Backend API & Machine Learning (`appv2.py` & Model v4_v3)](#-8-modul-backend-api--machine-learning-appv2py--model-v4_v3)
   - [8.1 Mesin Keputusan Dual-Tier (Hybrid ExtraTrees + Rule-Based Engine)](#81-mesin-keputusan-dual-tier-hybrid-extratrees--rule-based-engine)
   - [8.2 Rekayasa Fitur (15 Fitur Input ExtraTrees / Random Forest)](#82-rekayasa-fitur-15-fitur-input-extratrees--random-forest)
   - [8.3 Pelatihan Model Machine Learning (`train_rf_fix_v4_v3_v2.ipynb`)](#83-pelatihan-model-machine-learning-train_rf_fix_v4_v3_v2ipynb)
   - [8.4 Ringkasan Dokumentasi API Endpoint](#84-ringkasan-dokumentasi-api-endpoint)
9. [🔌 9. Modul IoT & Firmware ESP32 MicroPython (`iot/main.py`)](#-9-modul-iot--firmware-esp32-micropython-iotmainpy)
   - [9.1 Arsitektur Hardware & Pin Mapping ESP32 Terkini](#91-arsitektur-hardware--pin-mapping-esp32-terkini)
   - [9.2 Logic & Workflow Firmware MicroPython](#92-logic--workflow-firmware-micropython)
10. [📧 10. Mekanisme Notifikasi Email Kritis](#-10-mekanisme-notifikasi-email-kritis)
11. [🔧 11. Troubleshooting & FAQ](#-11-troubleshooting--faq)

---

## 🌟 1. Panduan Cepat untuk Pengguna Awam / Peternak Ikan (SOP Harian)

Bagian ini dirancang dengan bahasa sederhana untuk mempermudah peternak ikan, pengelola kolam, atau pengguna awam dalam mengoperasikan sistem sehari-hari tanpa perlu memahami koding.

```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│                        ALUR PENGGUNAAN HARIAN (SOP OPERATOR)                          │
│                                                                                       │
│  [1. Nyalakan Alat]   ──►   [2. Buka Web]   ──►   [3. Cek Status]  ──► [4. Selesai]   │
│  ESP32 & Relay Box          Buka Browser          Lihat Warna Kartu    Alat Bekerja   │
│  Colok ke Listrik           di HP / Laptop        🟢 STABLE = Aman     Otomatis       │
│  Bunyi Bip 1x Sukses        Buka Dashboard        🔴 AT RISK = Bahaya  24 Jam         │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 1.1 Alur Pengoperasian 5 Menit (Start-to-Finish)

1. **Langkah 1 — Nyalakan Kotak Alat IoT di Kolam**:
   - Pastikan kabel daya kotak kontrol ESP32 terhubung ke colokan listrik.
   - Sensor-sensor (kabel probe hitam suhu, probe kaca pH, dan probe kekeruhan) sudah tercelup ke dalam air kolam dengan posisi stabil.
   - Dengarkan suara beeper:
     - 🔊 *Bip.. Bip..*: Sedang mencari koneksi WiFi.
     - 🔊 *Bip panjang (1x)*: **Koneksi Berhasil!** Alat sudah mulai memantau kolam.

2. **Langkah 2 — Buka Aplikasi Web**:
   - Buka browser (Google Chrome / Edge / Safari) di HP, Tablet, atau Komputer Anda.
   - Masukkan alamat web dashboard: `http://localhost:3000` (atau alamat IP lokal server kolam).

3. **Langkah 3 — Lihat Kondisi Kolam di Menu Dashboard**:
   - Pada halaman utama (**Dashboard**), Anda akan langsung melihat 4 kotak indikator:
     - **Oksigen (DO)**: Kadar oksigen untuk bernafas ikan.
     - **Suhu Air**: Suhu kehangatan air kolam.
     - **pH Air**: Tingkat keasaman air.
     - **Kekeruhan**: Kejernihan air kolam.

4. **Langkah 4 — Biarkan Bekerja Otomatis**:
   - Secara default, sistem berada pada mode **AUTONOMOUS (Otomatis)**. 
   - Anda **tidak perlu memencet tombol apa pun**. Jika kadar oksigen turun, aerator akan menyala sendiri. Jika air terlalu asam, pompa penetral akan bekerja otomatis.

---

### 1.2 Membaca Status & Indikator Warna di Layar

Di pojok atas dashboard terdapat kartu status kesehatan kolam dengan warna yang mudah dipahami:

| Warna Status | Tulisan Status | Artinya untuk Ikan Nila | Tindakan yang Harus Dilakukan |
| :--- | :--- | :--- | :--- |
| 🟢 **Hijau** | **STABLE (Aman)** | Kualitas air sangat bagus dan ideal untuk pertumbuhan ikan. | Tidak perlu tindakan apa-apa, kolam dalam kondisi prima. |
| 🔴 **Merah** | **AT RISK (Bahaya)** | Terjadi kondisi kritis (misal: oksigen habis, air terlalu asam, atau suhu melonjak panas). | Sistem otomatis menyalakan penanganan darurat + sirene buzzer berbunyi + email peringatan terkirim ke HP Anda. Periksa fisik kolam. |

---

### 1.3 Apa yang Terjadi Saat Air Bermasalah? (Otomatis vs Manual)

Sistem AquaAgent dilengkapi dengan **otak kecerdasan buatan (AI)** yang langsung menggerakkan alat penolong:

```
Masalah yang Terdeteksi                  Reaksi Otomatis Alat
─────────────────────────────────────────────────────────────────────────────
1. Oksigen Rendah (< 5.0 mg/L)      ──►  🌬️ Aerator (Kincir O2) MENYALA
2. Air Terlalu Asam (pH < 6.5)      ──►  ⬆️ Pompa pH UP MENYALA (Tambah Basa)
3. Air Terlalu Basa (pH > 8.0)      ──►  ⬇️ Pompa pH DOWN MENYALA (Tambah Asam)
4. Air Terlalu Keruh / Suhu Panas   ──►  🔄 Pompa Sirkulasi Air MENYALA
5. Kondisi Kritis / Bahaya          ──►  🚨 Sirene Buzzer Bunyi + Email Dikirim
```

> **Ingin Menyalakan Alat Sendiri Secara Manual?**
> 1. Buka menu **Actuator** di bilah navigasi kiri.
> 2. Geser tombol mode dari **AUTONOMOUS** ke **MANUAL**.
> 3. Klik tombol switch pada alat yang ingin Anda nyalakan (misal: menyalakan Aerator atau Pompa).

---

### 1.4 Cara Memberi Pakan Ikan & Mengatur Jadwal

Ada 2 cara memberi pakan:
1. **Pemberian Pakan Seketika (Instant Feed)**:
   - Masuk ke menu **Actuator**.
   - Klik tombol **"Feed Now"** pada kartu **Auto Feeder**. Motor pakan akan berputar mengeluarkan pelet selama durasi yang ditentukan.
2. **Pengaturan Jadwal Pakan Otomatis (Rutin Harian)**:
   - Masuk ke menu **Settings**.
   - Pada bagian **Feeding Schedule**, tentukan jam pakan pertama (misal `08:00`) dan interval pemberiannya (misal setiap `6 jam`).
   - Klik **"Save Settings"**. Alat akan memberi pakan otomatis tepat waktu setiap hari.

---

### 1.5 Cara Bertanya & Konsultasi ke Asisten AI (NEELA AI)

Jika Anda bingung mengapa ikan terlihat pasif atau ingin tahu takaran pakan yang pas:
1. Masuk ke menu **NEELA Chat** (atau **AI Center**).
2. Ketik pertanyaan dalam Bahasa Indonesia seperti mengobrol biasa di WhatsApp, contoh:
   - *"Neela, kenapa air kolam saya pH-nya 5.8? Apa bahayanya buat ikan nila?"*
   - *"Berapa kali sebaiknya kasih makan ikan saat suhu air 31 derajat?"*
   - *"Jelaskan kenapa aerator barusan menyala sendiri?"*
3. NEELA AI akan membaca data sensor kolam Anda saat itu juga dan memberikan saran langkah penanganan yang tepat.

---

## 📌 2. Pendahuluan & Gambaran Umum Sistem

**AquaAgent (NEELA AI)** adalah ekosistem platform *Smart Aquaculture* berbasis IoT, Machine Learning, dan Explainable AI (XAI) yang dirancang khusus untuk otomatisasi pemantauan dan pengelolaan kualitas air pada budidaya ikan gurami / nila (*Oreochromis niloticus*).

Sistem ini mengintegrasikan 3 pilar utama:
1. **Perangkat Hardware IoT (ESP32 DevKit V1)**: Mengukur parameter fisik air (Suhu DS18B20, pH Sensor, Turbidity Sensor, Water Level Sensor) secara berkesinambungan dan mengendalikan aktuator tambak secara presisi (Aerator, Pompa pH UP, Pompa pH DOWN, Motor Servo Auto-Feeder pakan, dan Active Buzzer Audio Feedback).
2. **FastAPI Backend & ML Decision Engine (`appv2.py`)**: Bertindak sebagai otak terpusat yang memproses telemetry sensor, mengeksekusi inferensi Machine Learning Model `v4_v3` (ExtraTrees / Random Forest 93.61% accuracy), menghitung rumus fisika estimasi Oksigen Terlarut (DO), memicu alarm email darurat, menyajikan serialisasi pohon keputusan XAI (`/tree-structure` & `/tree-trace`), serta menyimpan riwayat ke database SQLite (`aquaagent.db`).
3. **Web Application Frontend (`aquaagent-web`)**: Portal UI modern berbasis Next.js 16 yang menyajikan visualisasi data *real-time*, modul pengambil keputusan mandiri, pohon visualisasi XAI interaktif, simulator telemetri, pengaturan ambang batas & durasi aktuator dinamis, hingga Asisten AI (NEELA AI Chatbot) berbasis LLM.

---

## 🏗️ 3. Arsitektur Sistem & Alur Kerja End-to-End

Berikut adalah bagan alur kerja sistem dari pembacaan sensor IoT hingga visualisasi Web Dashboard dan eksekusi aktuator:

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                 PERANGKAT IOT (ESP32)                                   │
│  - Sensor DS18B20 (Suhu - GPIO 4)                                                       │
│  - Sensor pH ADC (GPIO 32)                                                              │
│  - Sensor Turbidity ADC (GPIO 34)                                                       │
│  - Servo Pakan PWM (GPIO 13)                                                            │
│  - Relay Aerator (GPIO 22), Relay pH UP (GPIO 21), Relay pH DOWN (GPIO 19)              │
│  - Active Buzzer (GPIO 25)                                                              │
│                                                                                         │
│  Main Loop: Baca Sensor  ──►  POST /analyze  ───────┐                                   │
│            Set Relay/PWM ◄──  GET /actuator, /feed ─┐ │                                   │
└─────────────────────────────────────────────────────┼─┼─────────────────────────────────┘
                                                      │ │
                                                      ▼ │
┌───────────────────────────────────────────────────────┼─────────────────────────────────┐
│                           FASTAPI BACKEND (appv2.py)   │                                 │
│                                                       │                                 │
│  1. Menghitung Estimasi DO (Formula Kelarutan O2)     │                                 │
│  2. Generate 15 Fitur Turunan ML                      │                                 │
│  3. Inferensi Model ML v4_v3 (aquaagent_rf_v4_v3.pkl) │                                 │
│  4. Evaluasi Rule-Based Engine (Dual Pump pH UP/DOWN) │                                 │
│  5. Serialisasi Pohon Keputusan (Explainable AI Tree) │                                 │
│  6. Simpan Log ke SQLite (aquaagent.db)               │                                 │
│                                                       │                                 │
│  Mode Kontrol:                                        │                                 │
│  - AUTONOMOUS: Aktuator diatur otomatis oleh Engine    │                                 │
│  - MANUAL: Aktuator mengikuti input dari Web          │                                 │
│                                                       │                                 │
│  Notifikasi Kritis ──► Trigger Email Alert (Cooldown Dinamis)                           │
└───────────────────────┬───────────────────────────────┴─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                               WEB FRONTEND (Next.js 16)                                 │
│  - Dashboard Real-time Telemetry (Recharts, Gauge UI, Live Status)                      │
│  - Control Panel Aktuator (Switch Manual / Autonomous, Pulse Test)                      │
│  - Decision Tree Visualizer (/decision-tree: Interactive Tree Node Path & Ensemble)     │
│  - Telemetry Simulator (Skenario Uji Normal / Low DO / pH Unstable / At Risk)           │
│  - AI Center & NEELA Chat Assistant (Powered by OpenAI / Groq LLM API)                  │
│  - Settings Ambang Batas, Durasi Aktuator, Jadwal Pakan, Recipient Email                │
│  - Analytics & Data Historis (Export PDF / CSV)                                         │
│  - Centralized Alert Logs (/alerts)                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 💻 4. Teknologi & Tech Stack

### 🎨 Frontend Web (`aquaagent-web`)
* **Framework**: Next.js 16.2.7 (React 19.2.4)
* **Styling**: Tailwind CSS v4, Vanilla CSS Custom Variables, Modern Dark Glassmorphism Theme
* **Animasi & Interaktivitas**: GSAP 3.15.0, Lenis 1.3.25 (Smooth Scrolling), Lucide React (Icon System)
* **Grafik & Visualisasi**: Recharts 3.8.1, Interactive Tree Node Canvas Renderer
* **Ekspor & Layanan**: Axios (HTTP Client), jsPDF & jsPDF-AutoTable (PDF Reporting), Nodemailer (Email Alert Dispatcher)

### 🧠 Backend API & Engine ML (`backend-neela-ai`)
* **Core Framework**: Python 3.9 - 3.12 (disarankan), FastAPI, Uvicorn (ASGI Web Server)
* **Machine Learning Stack**: Scikit-Learn (ExtraTrees & Random Forest Classifier), Joblib, Imbalanced-Learn (SMOTE Oversampling), Pandas, NumPy
* **Database**: SQLite3 (`aquaagent.db`)
* **Integrasi LLM & XAI**: OpenAI API Client / Fallback Domain-Expert Biological XAI Generator
* **Layanan Pendukung**: `actuator.py` (State Management), `email_service.py` (Mekanisme Cooldown Alert Email)

### 🔌 Perangkat IoT & MicroPython Firmware (`iot/main.py`)
* **Platform Mikrokontroler**: ESP32 WROOM-32 / DevKit V1
* **Bahasa Pemrograman**: MicroPython v1.20+
* **Protokol Komunikasi**: WiFi IEEE 802.11 b/g/n, HTTP REST Client (JSON payload)
* **Sensor**:
  * Sensor Suhu Air: DS18B20 (Digital OneWire - GPIO 4)
  * Sensor Keasaman Air: DFRobot Gravity Analog pH Sensor (GPIO 32 ADC)
  * Sensor Kekeruhan: Optical Turbidity Sensor SEN0189 (GPIO 34 ADC)
  * Sensor Ketinggian Air: Resistive Water Level Sensor
* **Aktuator Hardware**:
  * Relay Aerator (GPIO 22, Active LOW)
  * Relay Pompa pH UP / Menaikkan pH (GPIO 21, Active LOW)
  * Relay Pompa pH DOWN / Menurunkan pH (GPIO 19, Active LOW)
  * Servo Auto-Feeder (GPIO 13 PWM, Freq 50Hz)
  * Active Buzzer Alarm & Audio Feedback (GPIO 25)

---

## 📁 5. Struktur Direktori Proyek

```
aquaagent-web/
├── manual.md                              # 📘 Dokumen Manual Lengkap Sistem (File ini)
├── README.md                              # Dokumentasi ringkas proyek
├── alat.md                                # Panduan Wiring Hardware IoT & Pinout
├── package.json                           # Konfigurasi dependensi Web Next.js
├── next.config.mjs                        # Konfigurasi Next.js
│
├── backend-neela-ai/                      # 🧠 DIRECTORY BACKEND & MACHINE LEARNING
│   ├── appv2.py                           # Aplikasi Utama FastAPI Backend API (Decision Engine & XAI)
│   ├── aquaagent_rf_v4_v3.pkl             # Binary Model Machine Learning v4_v3 (ExtraTrees Classifier)
│   ├── rf_features_v4_v3.pkl              # Metadata List 15 Fitur Model v4_v3
│   ├── train_rf_fix_v4_v3_v2.ipynb        # Notebook Pelatihan Model (80:20 Split, SMOTE, 93.61% Acc)
│   ├── documentation_appv2.md             # Dokumentasi teknis endpoint backend appv2.py
│   ├── actuator.py                        # Modul State Aktuator & Mode Sistem
│   ├── email_service.py                   # Layanan Notifikasi Email Alert (Cooldown Dinamis)
│   ├── aquaagent.db                       # Database SQLite (History, Settings, Schedule, Email)
│   ├── requirements.txt                   # Daftar dependensi Python backend
│   └── Data_Model_IoTMLCQ_2024.xlsx       # Dataset Referensi Pelatihan
│
├── iot/                                   # 🔌 DIRECTORY FIRMWARE IOT
│   └── main.py                            # MicroPython Firmware Script ESP32 (Sensors, Relays, Servo, Buzzer)
│
└── src/                                   # 🎨 DIRECTORY FRONTEND NEXT.JS
    ├── components/                        # Komponen Reusable (Navbar, Sidebar, Cards, Charts, UI)
    ├── hooks/                             # Custom React Hooks (useAquaAgent)
    ├── lib/                               # Helper & Konfigurasi Library (api.js, etc.)
    ├── pages/                             # Next.js Pages / Routes:
    │   ├── index.js                       # Landing Page / Portal Utama
    │   ├── dashboard.js                   # Live Telemetry & Control Center
    │   ├── actuator.js                    # Panel Kontrol Aktuator & Relays (Dual Pump pH)
    │   ├── decision-tree.js               # Visualisasi Pohon Keputusan XAI Interaktif
    │   ├── ai-center.js                   # Dashboard Rekomendasi ML & Diagnostik AI
    │   ├── chat.js                        # NEELA AI Interactive Chat Assistant
    │   ├── simulator.js                   # Telemetry Simulator & Scenario Testing
    │   ├── settings.js                    # Ambang Batas, Durasi Aktuator, & Jadwal Pakan
    │   ├── analytics.js                   # Analytics, Chart Historis, Export PDF/CSV
    │   ├── alerts.js                      # Centralized Alert Logs
    │   └── api/                           # Next.js API Routes:
    │       ├── chat.js                    # API Handler untuk LLM NEELA AI Chat
    │       └── send-alert-email.js        # API Handler untuk Dispatch Email Nodemailer
    └── styles/                            # CSS Stylesheet & Theme Token
```

---

## ⚙️ 6. Panduan Instalasi & Setup Environment (Bagi Pengembang/Teknisi)

### 6.1 Setup Backend API & Engine ML (`backend-neela-ai`)

1. **Buka Terminal & Masuk ke Directory Backend**:
   ```bash
   cd backend-neela-ai
   ```

2. **Buat Virtual Environment (Disarankan Python 3.11/3.12)**:
   ```bash
   python -m venv venv
   # Aktifkan di Windows (PowerShell):
   .\venv\Scripts\Activate.ps1
   # Atau di Git Bash:
   source venv/Scripts/activate
   ```

3. **Install Dependensi Python**:
   ```bash
   pip install -r requirements.txt
   ```
   *Jika `requirements.txt` belum ada, jalankan:*
   ```bash
   pip install fastapi uvicorn pydantic pandas numpy joblib scikit-learn requests python-dotenv openai
   ```

4. **Jalankan FastAPI Backend Server**:
   ```bash
   python -m uvicorn appv2:app --reload --host 0.0.0.0 --port 8000
   ```
   * Server Backend berjalan pada: `http://localhost:8000`.
   * Dokumentasi Swagger UI interaktif dapat diakses pada: `http://localhost:8000/docs`.

---

### 6.2 Setup Web Frontend (`aquaagent-web`)

1. **Buka Terminal di Root Directory Workspace (`aquaagent-web`)**:
   ```bash
   cd d:\aquaagent-web
   ```

2. **Install Dependensi Node.js**:
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variable (`.env.local`)**:
   Buat file `.env.local` pada root project jika belum ada:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   OPENAI_API_KEY=sk-... # (Opsional untuk fitur NEELA AI Chatbot)
   GROQ_API_KEY=gsk_...  # (Opsional jika menggunakan LLM Groq)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   ```

4. **Jalankan Server Development Next.js**:
   ```bash
   npm run dev
   ```
   * Aplikasi Web berjalan pada: `http://localhost:3000`.

---

### 6.3 Setup IoT Firmware MicroPython (`iot/main.py`)

1. **Persiapan Hardware**:
   * ESP32 DevKit V1.
   * Sensor: DS18B20 (GPIO 4), Analog pH Sensor (GPIO 32), Turbidity Sensor (GPIO 34).
   * Aktuator: Relay Aerator (GPIO 22), Relay pH UP (GPIO 21), Relay pH DOWN (GPIO 19), Servo Feeder (GPIO 13 PWM), Active Buzzer (GPIO 25).

2. **Konfigurasi Koneksi & URL Backend pada [`iot/main.py`](file:///d:/aquaagent-web/iot/main.py)**:
   * Buka file `iot/main.py` di Thonny IDE.
   * Sesuaikan `SSID`, `PASSWORD`, dan `BASE_URL`:
     ```python
     SSID = "NAMA_WIFI"
     PASSWORD = "PASSWORD_WIFI"
     BASE_URL = "http://192.168.1.X:8000" # Ganti dengan IP LAN Komputer Backend Anda
     ```

3. **Upload & Eksekusi di ESP32**:
   * Simpan script ke internal flash ESP32 dengan nama `main.py`.
   * Jalankan script (`Ctrl+R` di Thonny). Buzzer akan memberikan respon bunyi status koneksi (Connecting, Connected Success).

---

## 🕹️ 7. Panduan Fitur Lengkap Aplikasi Web (Menu demi Menu)

---

### 7.1 Dashboard Telemetry Real-time (`/dashboard` & `/`)

* **Fungsi Utama**: Menyajikan statistik indikator utama kondisi air tambak secara *live*.
* **Parameter yang Ditampilkan**:
  1. **Dissolved Oxygen (DO)**: Menampilkan tingkat kelarutan oksigen (mg/L). Ambang Batas Default: >= 5.0 mg/L.
  2. **Water Temperature**: Menampilkan suhu air (°C). Rentang Optimal: 25.0°C - 32.0°C.
  3. **pH Level**: Menampilkan derajat keasaman. Rentang Optimal: 6.5 - 8.0.
  4. **Turbidity**: Menampilkan tingkat kekeruhan air (NTU/%). Batas Maksimal: 15.0 - 25.0%.
  5. **Water Level**: Ketinggian air tambak (cm/%). Batas Maksimal Aman: 85%.
* **Indikator Status Kesehatan Biota**:
  * 🟢 **Stable**: Kondisi air stabil dan ideal.
  * 🔴 **At Risk**: Deviasi parameter abnormal atau prediksi model ML menunjukkan kondisi berisiko tinggi.

---

### 7.2 Kontrol Aktuator & Relay Dual Pump pH (`/actuator`)

Portal kontrol peralatan fisik tambak dengan 2 Mode Operasional:

1. **Mode AUTONOMOUS (Otomatis)**:
   * Backend `appv2.py` mengendalikan relay dan pompa secara mandiri berdasarkan evaluasi model ML ExtraTrees v4_v3 dan aturan ambang batas.
2. **Mode MANUAL (Kendali Pengguna)**:
   * Pengguna dapat mengendalikan peranti secara individual:
     * 🌬️ **Aerator (Air Pump)**: Menyuplai oksigen terlarut tambahan.
     * ⬆️ **pH UP Pump (Water Circulation)**: Menambahkan larutan basa untuk menaikkan pH saat air terlalu asam.
     * ⬇️ **pH DOWN Pump (Neutralizer)**: Menambahkan larutan asam untuk menurunkan pH saat air terlalu basa.
     * 🐟 **Auto Feeder (Servo)**: Memberi pakan ikan seketika.
     * 🚨 **Buzzer Alarm**: Mematikan/menguji sirene alarm darurat (`POST /beep/ack`).

---

### 7.3 AI Assistant & Smart Chat Center (`/ai-center` & `/chat`)

* **Analisis Diagnostik Otomatis**: Menyajikan penjelasan natural language (Explainable AI) mengenai kondisi air, faktor stres ikan nila, dan panduan mitigasi.
* **Interactive Chatbot (NEELA AI)**: Pengguna dapat berkonsultasi mengenai budidaya, dosis pakan, dan interpretasi aktuator. Chatbot terhubung langsung dengan konteks telemetri saat ini.

---

### 7.4 Explainable AI & Interactive Decision Tree Visualizer (`/decision-tree`)

Halaman khusus untuk transparansi dan auditability inferensi Machine Learning:
* **Visualisasi Pohon Keputusan Interaktif**: Menampilkan hierarki node Decision Tree dari model ExtraTrees Ensemble.
* **Trace Decision Path**: Memvisualisasikan langkah demi langkah traverse node dari root hingga leaf untuk sampel telemetri saat ini.
* **Ensemble Voting Breakdown**: Menampilkan persentase voting seluruh tree estimators (misal: 85 Trees memprediksi Stable vs 15 Trees memprediksi At Risk).
* **Feature Importance Ranking**: Mengurutkan kontribusi fitur input paling dominan dalam keputusan model.

---

### 7.5 Telemetry Simulator (`/simulator`)

Modul simulasi pengujian tanpa hardware IoT:
* **Preset Skenario Uji**:
  * 🟢 **Normal / Optimal**: Suhu 28°C, pH 7.5, DO 6.2 mg/L, Turbidity 10%.
  * 🔴 **Low DO (Oksigen Rendah)**: Menguji aktivasi otomatis Aerator.
  * 🔴 **Low pH (Asam)**: Menguji aktivasi pompa pH UP.
  * 🔴 **High pH (Basa)**: Menguji aktivasi pompa pH DOWN.
  * 🔴 **At Risk Condition**: Menguji prediksi ExtraTrees dan pengiriman email alert darurat.

---

### 7.6 Pengaturan Ambang Batas, Durasi Aktuator & Jadwal Pakan (`/settings`)

Konfigurasi dinamis yang tersimpan di SQLite:
1. **Ambang Batas Sensor**: `do_threshold`, `ph_min`, `ph_max`, `temp_max`, `turbidity_max`, `water_level_max`.
2. **Durasi Aktuasi Alat (Detik)**:
   * `aeratorDuration` (Default: 5.0 s)
   * `pumpDuration` / pH UP (Default: 0.5 s)
   * `stabilizerDuration` / pH DOWN (Default: 0.5 s)
   * `buzzerDuration` (Default: 5.0 s)
   * `feederDuration` (Default: 0.8 s)
3. **Mekanisme Cooldown Notifikasi Email**:
   * `alertCooldownMinutes` & `alertCooldownSeconds` (Default: 30 menit).
4. **Jadwal Pakan Harian**: Waktu pakan harian & interval jam pemberian pakan otomatis.
5. **Daftar Penerima Email Alert**: Penambahan dan penghapusan email tujuan alarm.

---

### 7.7 Analisis Historis & Riwayat Data (`/analytics`)

* **Tren Visualisasi**: Grafik garis fluktuasi multi-parameter (Suhu, pH, DO, Turbidity).
* **Tabel Riwayat 50 Data Terakhir**: Log lengkap timestamp, parameter, dan status.
* **Ekspor Laporan**: Unduh laporan historis ke format **PDF** atau **CSV**.

---

### 7.8 Riwayat Peringatan Dini (`/alerts`)

* Halaman log riwayat notifikasi bahaya (alarm list) yang mencatat jam kejadian, penyebab parameter kritis, dan status pengiriman notifikasi email.

---

## 🧠 8. Modul Backend API & Machine Learning (`appv2.py` & Model v4_v3)

### 8.1 Mesin Keputusan Dual-Tier (Hybrid ExtraTrees + Rule-Based Engine)

```
                       Input Telemetri Sensor
                                  │
                      ┌───────────┴───────────┐
                      ▼                       ▼
           ExtraTrees Inference (v4_v3)  Rule-Based Engine
           (Ensemble Classification)   (Threshold & Pump Rules)
                      │                       │
                      └───────────┬───────────┘
                                  ▼
                     Keputusan Final Aktuator &
                    Status Health (Stable / At Risk)
```

1. **Tier 1 — ExtraTrees Classifier Model (`aquaagent_rf_v4_v3.pkl`)**:
   * Memprediksi status kesehatan tambak (`Stable` vs `At Risk`) dengan confidence probability.
2. **Tier 2 — Rule-Based Logic Engine**:
   * **Aerator**: `ON` jika `DO < doThreshold` (Default < 5.0 mg/L).
   * **pH UP Pump (`water_circulation`)**: `ON` jika `pH < phMin` (Default < 6.5).
   * **pH DOWN Pump (`ph_neutralizer`)**: `ON` jika `pH > phMax` (Default > 8.0).
   * **Buzzer Alarm**: `ON` jika `Water Level > waterLevelMax` ATAU `health_status == "At Risk"`.

---

### 8.2 Rekayasa Fitur (15 Fitur Input ExtraTrees / Random Forest)

Backend menghitung estimasi Oksigen Terlarut (DO) secara otomatis jika sensor fisik tidak tersedia:

$$\text{DO}_{\text{est}} = 14.652 - 0.41022 \times \text{TEMP} + 0.007991 \times \text{TEMP}^2 - 0.000077774 \times \text{TEMP}^3$$

| Nama Fitur | Tipe | Rumus / Logika | Deskripsi |
| :--- | :--- | :--- | :--- |
| `TEMP` | Float | `sensor.temperature` | Suhu air (°C) |
| `DO` | Float | `sensor.do` (atau formula DO est) | Oksigen Terlarut (mg/L) |
| `PH` | Float | `sensor.ph` | Derajat keasaman |
| `TURBIDITY` | Float | `sensor.turbidity` | Kekeruhan air (% / NTU) |
| `hour` | Integer | `sensor.hour` | Jam pengukuran (0-23) |
| `risk_flag` | Float | `0.0` jika optimal, `1.0` jika deviasi | Indikator kondisi fisik |
| `PH_dev` | Float | `abs(PH - 7.5)` | Deviasi dari pH ideal 7.5 |
| `TEMP_dev` | Float | `max(0, TEMP-32) + max(0, 25-TEMP)` | Deviasi dari rentang 25–32°C |
| `TURB_dev` | Float | `max(0, TURBIDITY - 25.0)` | Deviasi kekeruhan dari 25% |
| `DO_dev` | Float | `max(0, 5.0 - DO)` | Defisit DO di bawah 5.0 mg/L |
| `PH_dist_7` | Float | `abs(PH - 7.0)` | Jarak ke ambang bawah 7.0 |
| `TEMP_DO_ratio` | Float | `DO / (TEMP + 1.0)` | Interaksi kelarutan O2 vs Suhu |
| `TURB_DO_ratio`| Float | `TURBIDITY / (DO + 0.1)` | Rasio kekeruhan vs Oksigen |
| `TEMP_PH_ratio`| Float | `TEMP / (PH + 0.1)` | Rasio Suhu vs keasaman |
| `hour_sin` | Float | `sin(2 * pi * hour / 24.0)` | Komponen sinus jam harian |
| `hour_cos` | Float | `cos(2 * pi * hour / 24.0)` | Komponen kosinus jam harian |

---

### 8.3 Pelatihan Model Machine Learning (`train_rf_fix_v4_v3_v2.ipynb`)

* **Metodologi**: Stratified Train-Test Split (80:20 DAHULU), dilanjutkan SMOTE Oversampling (`sampling_strategy=0.6`) pada training set saja untuk menghindari *Data Leakage*.
* **Hasil Evaluasi Model**:
  * **ExtraTrees Classifier**: **93.61% Accuracy**, AUC-ROC: **0.941**, Precision: **0.840**, Recall: **0.745**.
  * **Random Forest Classifier**: **93.50% Accuracy**, AUC-ROC: **0.940**.

---

### 8.4 Ringkasan Dokumentasi API Endpoint

| Method | Endpoint | Fungsi & Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/` | Health check & info versi API |
| `POST` | `/analyze` | Menerima telemetri, inferensi ML, evaluasi rule engine, simpan history, kirim alert |
| `GET` | `/latest` | Mengambil hasil analisis terakhir |
| `GET` | `/history` | Mengambil 50 data log sensor terbaru |
| `GET` | `/actuator` | Membaca status aktuator & mode sistem (`AUTONOMOUS`/`MANUAL`) |
| `POST` | `/actuator` | Mengubah status aktuator secara manual |
| `POST` | `/actuator/ack` | Konfirmasi eksekusi aktuator selesai |
| `POST` | `/beep/ack` | Konfirmasi dan reset alarm buzzer |
| `POST` | `/feeder/ack` | Konfirmasi proses pemberian pakan selesai |
| `GET` | `/settings` | Membaca setting ambang batas & durasi aktuator |
| `POST` | `/settings` | Memperbarui setting ambang batas & durasi aktuator |
| `GET` | `/feeding-schedule` | Membaca jadwal pemberian pakan |
| `POST` | `/feeding-schedule` | Memperbarui jadwal pakan (menaikkan versi) |
| `GET` | `/feeding-version` | Membaca nomor versi jadwal pakan saat ini |
| `GET` | `/emails` | Membaca daftar email penerima alert |
| `POST` | `/emails` | Menambahkan email penerima alert baru |
| `DELETE`| `/emails/{email}` | Menghapus email penerima alert |
| `GET` | `/alert-cooldown-status` | Membaca status sisa waktu cooldown email alert |
| `GET` | `/tree-structure` | Serialisasi struktur hierarki pohon keputusan XAI |
| `POST` | `/tree-trace` | Trace langkah keputusan pohon untuk data sensor tertentu |

---

## 🔌 9. Modul IoT & Firmware ESP32 MicroPython (`iot/main.py`)

### 9.1 Arsitektur Hardware & Pin Mapping ESP32 Terkini

```
                        ┌─────────────────────────┐
                        │     ESP32 DevKit V1     │
                        └────────────┬────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         ▼                           ▼                           ▼
   SENSOR INPUT                 POWER / GND                AKTUATOR OUTPUT
   - DS18B20 Suhu (GPIO 4)      - 3.3V / 5V / GND          - Relay Aerator (GPIO 22)
   - pH Sensor ADC (GPIO 32)                               - Relay Pompa pH UP (GPIO 21)
   - Turbidity ADC (GPIO 34)                               - Relay Pompa pH DOWN (GPIO 19)
                                                           - Servo Feeder PWM (GPIO 13)
                                                           - Active Buzzer (GPIO 25)
```

| Pin ESP32 | Jenis Pin | Komponen Hardware | Keterangan Operasional |
| :--- | :--- | :--- | :--- |
| `GPIO 4` | Digital Input | Sensor Suhu DS18B20 | OneWire Protocol + Pull-up resistor 4.7kΩ |
| `GPIO 32` | Analog Input (ADC) | DFRobot Analog pH Sensor | ADC 12-Bit, Atten 11dB (0-3.3V) |
| `GPIO 34` | Analog Input (ADC) | Optical Turbidity Sensor | ADC 12-Bit, Atten 11dB (0-3.3V) |
| `GPIO 22` | Digital Output | Relay Aerator | Active LOW (`0` = ON, `1` = OFF) |
| `GPIO 21` | Digital Output | Relay Pompa pH UP (Basa) | Active LOW |
| `GPIO 19` | Digital Output | Relay Pompa pH DOWN (Asam) | Active LOW |
| `GPIO 13` | PWM Output (50Hz) | Continuous Servo Feeder | `duty 65` (Fwd), `duty 88` (Bwd), `duty 77` (Stop) |
| `GPIO 25` | Digital Output | Active Buzzer Alarm | Audio beeping feedback & alarm bahaya |

---

### 9.2 Logic & Workflow Firmware MicroPython

Kode MicroPython pada [`iot/main.py`](file:///d:/aquaagent-web/iot/main.py) menjalankan alur berikut:
1. **Inisialisasi & Koneksi WiFi**: Melakukan koneksi ke Access Point dengan audio feedback buzzer (connecting beep & success beep).
2. **Sinkronisasi Pengaturan & Jadwal**: Mengambil interval refresh, durasi aktuator (`aeratorDuration`, `pumpDuration`, `stabilizerDuration`, `buzzerDuration`, `feederDuration`), dan jadwal pakan.
3. **Pembacaan Sensor**: Membaca sensor suhu DS18B20, tegangan analog pH sensor, dan kekeruhan turbidity sensor.
4. **Pengiriman Telemetri (`POST /analyze`)**: Mengirim payload JSON ke backend.
5. **Eksekusi Aktuator Sesuai Balasan & Mode**:
   * Menyalakan relay Aerator, Pompa pH UP, Pompa pH DOWN, Buzzer, dan Servo Feeder sesuai durasi yang telah dikonfigurasi.
   * Mengirim sinyal acknowledgement (`POST /actuator/ack`, `POST /beep/ack`, `POST /feeder/ack`) ke backend setelah aksi selesai.
6. **Sinkronisasi Jadwal Pakan Lokal**: Mengecek waktu dan versi jadwal (`/feeding-version`) untuk pemberian pakan otomatis berbasis timer internal.

---

## 📧 10. Mekanisme Notifikasi Email Kritis

Backend [`email_service.py`](file:///d:/aquaagent-web/backend-neela-ai/email_service.py) bertugas memberikan peringatan dini (*Early Warning System*):

1. **Kondisi Pemicu Alert**:
   * `DO < 5.0 mg/L` (`CRITICAL: Low Dissolved Oxygen`)
   * `Temperature > 30.0 °C` (`WARNING: High Temperature`)
   * `pH < 6.5` ATAU `pH > 8.0` (`WARNING: Unstable pH`)
   * `health_status == "At Risk"` (`CRITICAL: Fish At Risk Predicted by ExtraTrees Model`)
2. **Mekanisme Cooldown Alert**:
   * Mencegah spam email dengan timer cooldown dinamis (menit & detik) yang tersimpan di tabel `settings` SQLite. Status sisa cooldown dapat dipantau di endpoint `/alert-cooldown-status`.
3. **Pengiriman Email**:
   * Backend memanggil API Next.js `/api/send-alert-email` yang menggunakan **Nodemailer** untuk mengirimkan notifikasi format HTML ke seluruh email pada tabel `email_recipients`.

---

## 🔧 11. Troubleshooting & FAQ

### Q1: Kenapa muncul `ImportError: initialization failed` saat menjalankan uvicorn di Windows?
* **Solusi**: Error ini terjadi jika library `scipy` / `scikit-learn` pada Python 3.13 mengalami kendala binary C++ wheel. Jalankan:
  ```bash
  pip install --upgrade --force-reinstall scipy scikit-learn numpy
  ```
  Dan pastikan menjalankan uvicorn via module: `python -m uvicorn appv2:app --reload --host 0.0.0.0 --port 8000`.

### Q2: ESP32 gagal terhubung ke Backend (`Connection Error`)?
* **Solusi**: Pastikan ESP32 dan komputer Backend berada pada **jaringan WiFi lokal yang sama**. Ubah `BASE_URL` pada [`iot/main.py`](file:///d:/aquaagent-web/iot/main.py) menggunakan IP LAN komputer (contoh: `http://192.168.1.50:8000`), bukan `localhost`.

### Q3: Kenapa relay aktuator tidak bereaksi saat diklik di Web?
* **Solusi**: Cek mode aktuator di halaman `/actuator`. Jika sistem dalam mode `AUTONOMOUS`, aktuator dikendalikan secara otomatis oleh Machine Learning. Ubah mode ke `MANUAL` terlebih dahulu.

### Q4: Mengapa ada 2 pompa pH (pH UP dan pH DOWN)?
* **Solusi**: AquaAgent menggunakan konfigurasi dual dosing pump: Pompa pH UP (Relay GPIO 21 / `water_circulation`) untuk menaikkan pH saat air terlalu asam (< 6.5), dan Pompa pH DOWN (Relay GPIO 19 / `ph_neutralizer`) untuk menetralkan pH saat air terlalu basa (> 8.0).

---

> **Dokumentasi Manual AquaAgent (NEELA AI)** — *Smart Aquaculture Monitoring & Autonomous Decision Engine* 🐟⚡
