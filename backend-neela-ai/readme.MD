# Neela AI Backend API

Neela AI Backend adalah layanan REST API berbasis Python (FastAPI) yang berfungsi sebagai pusat pemrosesan data kualitas air tambak ikan. Layanan ini menggabungkan model Machine Learning (ExtraTrees Classifier) untuk klasifikasi risiko kualitas air, sistem aturan logika deterministik untuk pengendalian aktuator, integrasi Large Language Model (LLM) untuk penalaran keputusan, penyimpanan basis data SQLite lokal, serta notifikasi email otomatis.

---

## Prasyarat Sistem

Sebelum memulai instalasi, pastikan sistem Anda telah memiliki:
- Python versi 3.10, 3.11, atau 3.12
- pip (package manager Python)
- Akses koneksi internet untuk mengunduh paket dependensi

---

## Panduan Instalasi dan Menjalankan Backend

Ikuti langkah-langkah di bawah ini untuk menyiapkan dan menjalankan backend dari awal:

### 1. Masuk ke Direktori Backend

Buka terminal atau command prompt, lalu arahkan ke folder backend:

```bash
cd aquaagent-web/backend-neela-ai
```

### 2. Membuat Virtual Environment

Sangat disarankan menggunakan virtual environment agar paket dependensi terisolasi:

```bash
python -m venv venv
```

### 3. Mengaktifkan Virtual Environment

- Pada Windows (PowerShell):
  ```powershell
  .\venv\Scripts\Activate.ps1
  ```

- Pada Windows (Command Prompt / CMD):
  ```cmd
  venv\Scripts\activate.bat
  ```

- Pada Linux / macOS:
  ```bash
  source venv/bin/activate
  ```

Setelah aktif, nama `(venv)` akan muncul di awal baris perintah terminal Anda.

### 4. Instalasi Paket Dependensi

Pasang seluruh paket yang dibutuhkan menggunakan pip:

```bash
pip install -r requirements.txt
pip install fastapi uvicorn python-dotenv openai
```

### 5. Konfigurasi Environment Variable

Buat atau sesuaikan berkas `.env` di dalam folder `backend-neela-ai`:

```env
OPENAI_API_KEY=sk-proj-your-api-key-here
USE_OPENAI=false
```

Penjelasan variabel:
- `USE_OPENAI`: Atur ke `false` jika ingin menggunakan mode aturan deterministik penuh (hemat biaya dan bekerja offline tanpa kuota API). Atur ke `true` jika ingin mengaktifkan inferensi reasoning penjelasan menggunakan OpenAI GPT.
- `OPENAI_API_KEY`: Kunci API OpenAI Anda (hanya diperlukan jika `USE_OPENAI=true`).

### 6. Menjalankan Server API

Jalankan server pengembangan menggunakan Uvicorn:

```bash
uvicorn appv2:app --host 0.0.0.0 --port 8000 --reload
```

Parameter:
- `--host 0.0.0.0`: Memungkinkan API diakses dari perangkat lain dalam jaringan lokal (misal perangkat IoT ESP32).
- `--port 8000`: Menetapkan port API pada port 8000.
- `--reload`: Mengaktifkan auto-reload saat ada perubahan kode (cocok untuk tahap pengembangan).

### 7. Verifikasi API

Setelah server berjalan, Anda dapat memverifikasi layanan melalui peramban:
- Status API: `http://localhost:8000/`
- Dokumentasi Interaktif Swagger UI: `http://localhost:8000/docs`
- Dokumentasi Alternatif ReDoc: `http://localhost:8000/redoc`

---

## Daftar Endpoint Utama

### 1. Root & Health Check
- `GET /`
  - Memeriksa status operasional API.
  - Respon: `{"message": "Neela AI API Running"}`

### 2. Analisis Kualitas Air & Pengambilan Keputusan
- `POST /analyze`
  - Menerima data telemetri sensor, memproses prediksi kesehatan tambak, menghitung tingkat risiko, dan menentukan status aktuator.
  - Contoh Request Body (JSON):
    ```json
    {
      "temperature": 28.5,
      "do": 4.2,
      "ph": 7.3,
      "turbidity": 25.0,
      "hour": 6
    }
    ```
  - Contoh Respon (JSON):
    ```json
    {
      "health_status": "At Risk",
      "risk_level": "HIGH",
      "rf_confidence": 0.94,
      "sensor_data": {
        "temperature": 28.5,
        "do": 4.2,
        "ph": 7.3,
        "turbidity": 25.0,
        "hour": 6
      },
      "aerator": "ON",
      "feeder": "OFF",
      "water_circulation": "OFF",
      "ph_neutralizer": "OFF",
      "reason": "DO di bawah ambang batas aman (4.2 mg/L). Aerator diaktifkan untuk meningkatkan oksigen terlarut."
    }
    ```

### 3. Pengambilan & Penyimpanan Data Sensor Realtime
- `GET /data`
  - Mengambil riwayat data pembacaan sensor yang tersimpan di basis data.
  - Parameter query opsional: `?limit=50`
- `POST /data`
  - Menyimpan data pembacaan sensor baru dari modul IoT atau simulator ke basis data SQLite.

### 4. Status dan Kontrol Aktuator
- `GET /actuator`
  - Mengambil status terkini dari keempat aktuator (Aerator, Feeder, Water Circulation, pH Neutralizer) beserta mode operasional (auto / manual).
- `POST /actuator`
  - Memperbarui status aktuator secara manual oleh operator tambak.

### 5. Hasil Prediksi Terakhir
- `GET /latest-prediction`
  - Mengambil hasil evaluasi dan rekomendasi AI terakhir yang telah diproses.

### 6. Metrik dan Log Sistem
- `GET /metrics`
  - Mengambil statistik ringkas performa sistem dan ringkasan data monitoring.
- `GET /logs`
  - Mengambil log aktivitas sistem dan riwayat alert darurat.

---

## Struktur File Proyek

```
backend-neela-ai/
├── appv2.py                 # File aplikasi utama FastAPI dan routing endpoint
├── actuator.py              # Modul manajemen state dan logika kontrol aktuator
├── email_service.py         # Modul pengiriman notifikasi email otomatis
├── aquaagent.db             # Basis data SQLite lokal (dibuat otomatis jika belum ada)
├── aquaagent_rf_v4_v3.pkl   # Berkas model Machine Learning ExtraTrees
├── rf_features_v4_v3.pkl    # Berkas daftar fitur input model
├── requirements.txt         # Daftar pustaka dependensi Python
├── .env                     # Berkas konfigurasi variabel lingkungan
└── train_rf_fix_v4_v3_v2.ipynb # Jupyter notebook proses pelatihan dan evaluasi model
```

---

## Logika Bisnis dan Pengendalian Aktuator

1. **Aerator**: Aktif (ON) apabila Dissolved Oxygen (DO) < 5.0 mg/L atau status kesehatan terprediksi "At Risk".
2. **Water Circulation**: Aktif (ON) apabila Suhu Air > 30.0 °C untuk sirkulasi dan stabilisasi suhu.
3. **pH Neutralizer**: Aktif (ON) apabila pH < 6.5 (kondisi asam) atau pH > 8.5 (kondisi basa ekstrem).
4. **Feeder**: Dinonaktifkan (OFF) apabila terdapat minimal satu anomali kualitas air untuk mencegah stres pada ikan dan pembusukan sisa pakan di dasar kolam. Feeder hanya boleh Aktif (ON) jika semua parameter berada dalam rentang normal optimal.

---

## Pemecahan Masalah (Troubleshooting)

- Error `ModuleNotFoundError: No module named 'fastapi'` atau paket lainnya:
  Pastikan virtual environment telah diaktifkan sebelum menjalankan Uvicorn, atau pasang ulang dependensi dengan `pip install -r requirements.txt`.
- Port 8000 sudah digunakan oleh aplikasi lain:
  Ubah port eksekusi Uvicorn ke port lain, misalnya:
  ```bash
  uvicorn appv2:app --host 0.0.0.0 --port 8080 --reload
  ```
- File model `.pkl` tidak ditemukan:
  Pastikan perintah Uvicorn dijalankan langsung dari dalam direktori `backend-neela-ai` sehingga path relatif file model `aquaagent_rf_v4_v3.pkl` terbaca dengan benar.