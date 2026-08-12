# 🏗️ Arsitektur Sistem AQUAAGENT (NEELA AI)

Dokumen ini menjelaskan arsitektur keseluruhan sistem **AQUAAGENT (NEELA AI)**, mencakup alur komunikasi antara **Web Frontend (Next.js)**, **Backend API (`appv2.py` FastAPI)**, **IoT Hardware Node (`iot/main.py` ESP32)**, **Random Forest Machine Learning Classifier**, **Rule-Based Decision Engine**, serta **Sistem Notifikasi & Decision Support System (LLM)**.

---

## 📊 Diagram Arsitektur Sistem

```mermaid
flowchart TD
    %% Nodes & Subgraphs
    subgraph IoT ["🔌 Hardware Layer (ESP32 / MicroPython)"]
        Sensors["Sensor Telemetry<br/>(DS18B20 Temp, pH, Turbidity, Water Level)"]
        ESP32["ESP32 Microcontroller<br/>(iot/main.py)"]
        Actuators["Relay Actuators & Buzzer<br/>(Aerator, Pump, Feeder, Stabilizer, Buzzer)"]
        Sensors --> ESP32
        ESP32 --> Actuators
    end

    subgraph Backend ["⚡ Backend API Layer (FastAPI appv2.py)"]
        AnalyzeEP["POST /analyze<br/>(Sensor Ingestion & Inference)"]
        ActuatorEP["GET / POST /actuator<br/>(State Management)"]
        SettingsEP["GET / POST /settings<br/>(Threshold Configuration)"]
        HistoryEP["GET /history & /latest<br/>(Telemetry Fetching)"]
        
        RFModel["Random Forest Model v4_v3<br/>(aquaagent_rf_v4_v3.pkl - 99.88% Accuracy)"]
        DecisionEngine["Rule-Based Decision Engine<br/>(Actuator Rules & Safety)"]
        DB[("SQLite Database<br/>aquaagent.db")]
        EmailPy["Email Dispatcher<br/>(email_service.py)"]

        AnalyzeEP --> RFModel
        AnalyzeEP --> DecisionEngine
        AnalyzeEP --> DB
        AnalyzeEP --> EmailPy
        SettingsEP <--> DB
        HistoryEP <--> DB
        ActuatorEP <--> DecisionEngine
    end

    subgraph Frontend ["🌐 Web Frontend Layer (Next.js React)"]
        WebDash["Dashboard & Telemetry Charts<br/>(useAquaAgent Hook / polling /latest & /history)"]
        WebSettings["Settings & Feeding Page<br/>(POST /settings, POST /feeding-schedule)"]
        WebActuator["Manual Actuator Control<br/>(POST /actuator)"]
        NextApiEmail["Next.js API Route<br/>(/api/send-alert-email + Nodemailer)"]
        NextApiChat["Next.js API Route<br/>(/api/chat + Gemini / OpenAI LLM)"]
        WebChat["Neela AI Chat Assistant<br/>(Decision Support UI)"]
        
        WebDash <--> HistoryEP
        WebDash <--> AnalyzeEP
        WebSettings <--> SettingsEP
        WebActuator <--> ActuatorEP
        WebChat <--> NextApiChat
    end

    subgraph External ["📩 External Services"]
        EmailServer["SMTP Email Server<br/>(Nodemailer Dispatch)"]
        LLMProvider["LLM Provider<br/>(Gemini / OpenAI API)"]
    end

    %% Communication Flows
    ESP32 -- "1. HTTP POST /analyze (JSON Telemetry)" --> AnalyzeEP
    ESP32 -- "2. HTTP GET /actuator (Poll Actuator Command)" --> ActuatorEP
    EmailPy -- "3. HTTP POST /api/send-alert-email" --> NextApiEmail
    NextApiEmail --> EmailServer
    NextApiChat <--> LLMProvider
```

---

## 🧩 Penjelasan Komponen Arsitektur & Alur Komunikasi

### 1. 🔌 Hardware Layer (`iot/main.py` — ESP32 MicroPython)
* **Peran:** Mengumpulkan data telemetri sensor fisik air kolam secara *real-time* dan mengendalikan saklar relay aktuator fisik.
* **Komponen Sensor:**
  * DS18B20 (Suhu Air °C)
  * Gravity Analog pH Sensor V2 (pH)
  * SEN0189 Optical Sensor (Kekeruhan / Turbidity NTU)
  * Resistive Water Level Sensor (Ketinggian Air cm)
* **Komponen Aktuator (Active LOW Relay):**
  * Aerator Air Pump (Relay 1)
  * Water Circulation Pump (Relay 2)
  * Auto Feeder Motor/Servo (Relay 3)
  * pH Neutralizer Dosing Pump (Relay 4)
  * Active Buzzer Alarm (Pin 27)
* **Alur Kerja Main Loop (`main.py`):**
  1. Membaca telemetri sensor setiap interval `REFRESH_INTERVAL` (default: 5 detik).
  2. Mengirimkan JSON data sensor ke Backend API melalui request `HTTP POST http://<SERVER_IP>:8000/analyze`.
  3. Mengambil status perintah aktuator terbaru dari Backend API melalui request `HTTP GET http://<SERVER_IP>:8000/actuator`.
  4. Menyetel status relay fisik (Active LOW: ON = 0, OFF = 1) dan buzzer sesuai instruksi backend.

---

### 2. ⚡ Backend Core API (`backend-neela-ai/appv2.py` — FastAPI)
Backend adalah pusat kecerdasan sistem yang menggabungkan Machine Learning, Rule-Based Actuation, dan penyimpanan database.

* **A. Data Ingestion & Feature Engineering (`/analyze`):**
  * Menerima payload data dari ESP32 atau Web Simulator.
  * Mengestimasi nilai *Dissolved Oxygen (DO)* berdasarkan suhu air dengan formula empiris jika sensor DO fisik tidak ada.
  * Melakukan *feature engineering* otomatis (`risk_flag`, deviasi pH/Suhu/Turbiditas/DO, rasio antar variabel, dan encoding siklis jam `hour_sin` / `hour_cos`).
* **B. Random Forest Inference Engine (`aquaagent_rf_v4_v3.pkl`):**
  * Memprediksi kondisi kesehatan ikan/kolam secara presisi menjadi **"Stable"** atau **"At Risk"** dengan tingkat akurasi 99.88%.
* **C. Rule-Based Decision Engine:**
  * Mengevaluasi kondisi parameter terhadap ambang batas (*threshold*) dari konfigurasi `settings`:
    * `DO < doThreshold` ➡️ Turn ON Aerator.
    * `Temperature > tempMax` OR `Turbidity > turbidityMax` ➡️ Turn ON Water Circulation Pump.
    * `pH < phMin` OR `pH > phMax` ➡️ Turn ON pH Neutralizer Pump.
    * `Water Level > waterLevelMax` OR `Health Status == "At Risk"` ➡️ Turn ON Emergency Buzzer.
  * Jika aktuator dalam mode `AUTONOMOUS`, *state* aktuator global akan otomatis diperbarui.
* **D. Database Persistence (`aquaagent.db` - SQLite3):**
  * Tabel `history`: Menyimpan riwayat telemetri sensor, timestamp, dan status kesehatan.
  * Tabel `settings`: Menyimpan ambang batas parameter & status IoT receiver.
  * Tabel `feeding_schedule`: Menyimpan jadwal & interval otomatis pemberian pakan.
  * Tabel `email_recipients`: Menyimpan daftar email penerima notifikasi darurat.

---

### 3. 🌐 Frontend Web Application (Next.js React)
Web Frontend memberikan antarmuka pemantauan interaktif, kontrol manual, visualisasi grafik, dan manajemen konfigurasi.

* **A. Real-Time Telemetry Polling (`src/hooks/useAquaAgent.js`):**
  * Custom hook yang secara otomatis melakukan polling periodik ke `GET /latest` dan `GET /history` pada FastAPI backend untuk memperbarui dashboard secara *real-time*.
* **B. Manual & Autonomous Actuator Control (`src/pages/actuator.js`):**
  * Memungkinkan pengguna beralih antara mode `AUTONOMOUS` dan `MANUAL`, serta mengontrol relay aktuator secara manual via `POST /actuator`.
* **C. Konfigurasi Threshold & Pakan (`src/pages/settings.js`):**
  * Memperbarui batas aman sensor dan interval polling melalui `POST /settings` dan `POST /feeding-schedule`.

---

## 📩 Sistem Notifikasi Email Darurat

```mermaid
sequenceDiagram
    autonumber
    participant ESP32 as ESP32 / Telemetry
    participant Backend as FastAPI (appv2.py)
    participant EmailPy as Email Service (email_service.py)
    participant NextApi as Next.js API (/api/send-alert-email)
    participant SMTP as SMTP Mailer (Gmail)
    participant User as Email Recipient

    ESP32->>Backend: POST /analyze (sensor readings)
    Backend->>Backend: Evaluate RF Model & Decision Engine
    alt Condition is CRITICAL or "At Risk"
        Backend->>EmailPy: send_email_notification(latest_result)
        EmailPy->>Backend: Query email_recipients from aquaagent.db
        EmailPy->>NextApi: POST http://localhost:3000/api/send-alert-email
        NextApi->>SMTP: transporter.sendMail(HTML alert template)
        SMTP-->>User: Deliver Emergency Email Notification
    end
```

---

## 🤖 Decision Support System / Neela AI Chat (LLM Integration)

Aplikasi dilengkapi asisten AI interaktif untuk pengelola kolam:
1. User mengajukan pertanyaan di halaman Web Chat (`src/pages/chat.js`).
2. Frontend mengambil *telemetry context* terkini dari hook `useAquaAgent`.
3. Request dikirim ke Next.js API Route (`src/pages/api/chat.js`).
4. API Route menggabungkan *System Prompt* khusus budidaya ikan Nila + data telemetri real-time, lalu mengirimnya ke **Gemini API** / **OpenAI API**.
5. AI memberikan rekomendasi penanganan, mitigasi risiko, dan penjelasan ilmiah berbasis kondisi riil kolam saat itu.

---

## 📝 Kesimpulan Ringkasan Endpoints Backend

| Endpoint | Method | Fungsi Komunikasi |
|----------|--------|-------------------|
| `/` | GET | Health check status server backend |
| `/analyze` | POST | Menerima telemetri ESP32, jalankan RF Model & Decision Engine |
| `/actuator` | GET / POST | Membaca / Memperbarui status relay aktuator |
| `/beep/ack` | POST | Mengonfirmasi & mematikan alarm buzzer |
| `/feeder/ack` | POST | Mengonfirmasi proses pakan selesai |
| `/actuator/ack` | POST | Mengatur ulang aktuator spesifik |
| `/settings` | GET / POST | Membaca & menyimpan konfigurasi threshold sistem |
| `/feeding-schedule` | GET / POST | Membaca & menyimpan jadwal pakan otomatis |
| `/feeding-version` | GET | Sinkronisasi versi jadwal pakan dengan ESP32 |
| `/emails` | GET / POST | Mengelola daftar email notifikasi |
| `/emails/{email}` | DELETE | Menghapus alamat email dari daftar notifikasi |
| `/latest` | GET | Mengambil hasil analisis telemetri terbaru |
| `/history` | GET | Mengambil riwayat telemetri dari database |
