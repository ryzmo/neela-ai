# 🛠️ Tech Stack AQUAAGENT (NEELA AI)

Dokumen ini memuat rincian lengkap mengenai seluruh teknologi (*tech stack*) yang digunakan dalam ekosistem **AQUAAGENT (NEELA AI)**, pembagian layernya, fungsi spesifiknya, serta alasan teknis di balik pemilihan teknologi tersebut.

---

## 🏗️ Ringkasan Layar Ekosistem (Ecosystem Layer Summary)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     🌐 WEB FRONTEND LAYER (Next.js)                      │
│ Next.js 16 | React 19 | Tailwind CSS v4 | GSAP | Recharts | Lucide Icons │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ HTTP REST API (Polling & Action)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     ⚡ BACKEND API & ML LAYER (FastAPI)                 │
│ FastAPI | Python 3.10+ | Scikit-Learn (ExtraTrees/RF) | SQLite3 | Pydantic│
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ HTTP POST /analyze & GET /actuator
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    🔌 HARDWARE & IOT LAYER (MicroPython)                │
│ ESP32 DevKit V1 | MicroPython | Sensors (DS18B20, pH, Turbidity, Level) │
│ Modul Relay 4 Channel | Active Buzzer Alarm                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 1. 🌐 Web Frontend Layer (User Interface & Dashboard)

Layer ini bertanggung jawab sebagai antarmuka pengguna (User Interface) untuk pemantauan kualitas air tambak secara *real-time*, visualisasi grafik telemetri, kontrol manual aktuator relay, simulator parameter air, serta interaksi dengan **Neela AI Assistant**.

| Teknologi | Versi | Bagian / Fungsi | Buat Apa | Alasan Pemilihan |
| :--- | :--- | :--- | :--- | :--- |
| **Next.js** | `16.2.7` | Framework Web Utama (`src/pages`, `src/pages/api`) | Membangun UI Dashboard, routing halaman, Server-Side Rendering (SSR), serta API Routes internal (`/api/chat`, `/api/send-alert-email`). | Framework standar industri React dengan dukungan API Routes built-in sehingga tidak memerlukan server Node.js terpisah untuk endpoint middleware email & LLM, perutean fleksibel, dan peforma tinggi. |
| **React** | `19.2.4` | UI Library (`src/components`, `src/pages`) | Menyusun komponen-komponen UI yang reusabel seperti `SensorCard`, `SensorChart`, `AIDecisionSummary`, dan `Sidebar`. | Library UI paling populer dengan arsitektur berbasis komponen, *virtual DOM* yang cepat, dan ekosistem library pendukung yang sangat luas. |
| **Tailwind CSS** | `^4.0.0` | Styling & Design System (`postcss.config.mjs`, `src/styles`) | Memberikan gaya visual modern (Glassmorphism, Dark Mode, Tata Letak Responsif) pada seluruh halaman dashboard dan komponen. | Pendekatan *utility-first* mempercepat proses *styling*, menghasilkan bundle CSS yang ringkas melalui otomatisasi *purging*, serta menjaga konsistensi token warna dan spacing. |
| **GSAP (GreenSock)** | `^3.15.0` | UI Animation Engine (`src/pages/index.js`) | Membuat animasi mikro, transisi elemen UI yang halus (*smooth entrance*), dan interaksi halaman visual kelas atas. | Standard emas animasi web dengan performa tinggi (60 FPS), kontrol linimasa (*timeline*) yang presisi, dan tidak memberatkan *main thread* browser. |
| **Lenis** | `^1.3.25` | Smooth Scroll Controller | Menyediakan pengalaman *smooth scrolling* modern di seluruh antarmuka web. | Sangat ringan, tidak mengganggu *native scroll behavior* browser, dan berintegrasi sempurna dengan animasi GSAP. |
| **Recharts** | `^3.8.1` | Visualisasi Data Telemetri (`SensorChart.js`, `analytics.js`) | Menampilkan grafik garis & area interaktif untuk tren perubahan parameter kualitas air (Suhu, pH, DO, Kekeruhan, Ketinggian Air). | Komponen grafik yang dirancang khusus untuk React, mendukung pembaruan data secara *real-time*, responsif terhadap layar, dan mudah disesuaikan dengan tema gelap. |
| **Lucide React** | `^1.17.0` | Icon System | Menyediakan ikon-ikon vektor modern untuk kartu sensor, menu navigasi, indikator bahaya, dan tombol aksi. | Mendukung *tree-shaking* (hanya mengimpor ikon yang digunakan), ukuran file sangat kecil, serta desain ikon yang konsisten dan bersih. |
| **Axios** | `^1.18.0` | HTTP Client Frontend (`useAquaAgent.js`, `chat.js`) | Melakukan komunikasi HTTP request (polling data telemetri `/latest` & `/history`, pengiriman analisis `/analyze`, kontrol `/actuator`) ke Backend FastAPI. | Sintaks request yang lebih rapi dibanding `fetch` bawaan, penanganan *error response* yang kuat, otomatisasi *JSON parsing*, dan dukungan *interceptors*. |
| **jsPDF & AutoTable** | `^4.2.1` / `^5.0.8` | Document Exporter (`analytics.js`) | Meng-generate dan mengunduh berkas laporan PDF riwayat kualitas air tambak langsung dari browser pengguna. | Proses pembuatan dokumen PDF terjadi sepenuhnya di sisi *client* (browser) tanpa menambah beban komputasi server backend. |
| **Nodemailer** | `^8.0.11` | Email Dispatcher Service (`src/pages/api/send-alert-email.js`) | Mengirimkan surat elektronik (email) peringatan darurat ke pembudidaya saat sensor mendeteksi kondisi air tergolong kritis (*High Risk*). | Library pengirim email terbaik dan paling stabil di ekosistem Node.js dengan dukungan berbagai provider SMTP (Gmail, Mailgun, SendGrid, dll). |

---

## 2. ⚡ Backend & Machine Learning Layer (`backend-neela-ai/`)

Layer ini merupakan pusat pemrosesan kecerdasan sistem (**Brain of AQUAAGENT**). Bertanggung jawab atas penerimaan data telemetri, inferensi model Machine Learning, logika otomatisasi aktuator (*Rule-Based Engine*), penyimpanan database, dan layanan AI Advisor.

| Teknologi | Versi | Bagian / Fungsi | Buat Apa | Alasan Pemilihan |
| :--- | :--- | :--- | :--- | :--- |
| **Python** | `3.10+` | Bahasa Pemrograman Backend & ML | Eksekusi server backend, pemrosesan algoritma Machine Learning, serta otomatisasi analisis data. | Bahasa standar utama (*gold standard*) di dunia Machine Learning, Data Science, dan pengembangan API cepat. |
| **FastAPI** | `0.115+` | Web REST API Framework (`appv2.py`) | Menyediakan endpoint `/analyze` (injest data & klafikasi ML), `/actuator` (baca & ubah status relay), `/settings` (ambang batas bahaya), dan `/history`. | Berbasis Starlette & Pydantic dengan kecepatan eksekusi mendekati Node.js/Go (*asynchronous ASGI*), penanganan *type-checking* otomatis, serta dokumentasi Swagger (`/docs`) yang dibuat secara otomatis. |
| **Pydantic** | `v2` | Data Validation & Schema (`appv2.py`, `actuator.py`) | Memvalidasi tipe dan struktur data payload JSON yang masuk dari alat ESP32 maupun Web Frontend. | Mencegah kesalahan data (*data corruption*) atau format yang salah sebelum masuk ke proses inferensi Machine Learning atau pembacaan database. |
| **Scikit-Learn** | `1.8.0` | Machine Learning Core Engine (`aquaagent_rf_v4_v3.pkl`) | Menjalankan model klasifikasi **ExtraTreesClassifier / Random Forest** untuk mengklasifikasikan kondisi kesehatan air tambak (Akurasi: 99.88%). | Algoritma *Ensemble Tree* sangat handal menangani data tabular multi-fitur non-linear, tidak memerlukan komputasi GPU yang mahal untuk inferensi, dan tahan terhadap *overfitting*. |
| **Imbalanced-Learn (SMOTE)** | - | Preprocessing Data Latih (`build_fullkondisi_smote_notebook.py`) | Mengatasi ketidakseimbangan kelas data (*class imbalance*) dengan merekayasa data sintetis untuk kondisi air ekstrem/kritis yang jarang terjadi. | Mencegah model ML menjadi bias terhadap kondisi normal, sehingga model memiliki tingkat sensitivitas yang sangat tinggi saat mendeteksi bahaya kritis. |
| **Pandas & NumPy** | `3.0.3` / `2.4.6` | Data Manipulation & Feature Engineering | Memproses matriks data sensor, menghitung deviasi parameter air, encoding variabel jam siklis (`hour_sin`, `hour_cos`), serta estimasi rumus matematis DO. | Library paling efisien dan dioptimalkan secara C-extension untuk komputasi numerik dan pengolahan data terstruktur di Python. |
| **SQLite 3** | Embedded | Relational Database (`aquaagent.db`) | Menyimpan log data telemetri air, riwayat pengaktifan aktuator, serta konfigurasi ambang batas (*threshold settings*). | *Database embedded* tanpa konfigurasi (*zero-config*), disimpan dalam 1 berkas lokal yang ringan, cepat untuk operasi pembacaan/penulisan skala kecil-menengah tanpa memerlukan instalasi server database eksternal yang rumit. |
| **Joblib** | `1.5.3` | Model Serialization | Memuat (*load*) berkas model Machine Learning terlatih (`.pkl`) dan encoder ke memori RAM server secara instan. | Dioptimalkan secara khusus untuk memuat dan menyimpan struktur data NumPy array besar dan objek Scikit-Learn jauh lebih cepat dibanding library `pickle` bawaan. |
| **OpenAI & Gemini API** | External | Generative Decision Support (`/api/chat`, `llm_decision.py`) | Menjawab pertanyaan pengguna dan memberikan rekomendasi penanganan tambak berbasis kecerdasan buatan (*AI Advisor*). | Menggabungkan kepastian klasifikasi *Supervised Machine Learning* (Random Forest) dengan keluwesan komunikasi bahasa alami dari *Large Language Model (LLM)*. |

---

## 3. 🔌 Hardware & IoT Firmware Layer (`iot/`)

Layer ini bertindak sebagai fisik sistem yang ditempatkan langsung di kolam/tambak ikan nila. Membaca kondisi fisik air melalui sensor-sensor analog/digital dan mengendalikan alat-alat aktuator fisik (aerator, pompa air, pakan otomatis, dll).

| Teknologi / Komponen | Tipe / Spesifikasi | Bagian / Fungsi | Buat Apa | Alasan Pemilihan |
| :--- | :--- | :--- | :--- | :--- |
| **ESP32 DevKit V1** | Microcontroller (WROOM-32) | Otak Utama Hardware (`iot/main.py`) | Membaca sinyal sensor fisik, memproses kontrol relay, dan mengirimkan data telemetri ke server via Wi-Fi. | Memiliki modul Wi-Fi & Bluetooth bawaan, kecepatan prosessor Dual-Core 240MHz, harga ekonomis, serta jumlah pin GPIO & ADC yang mencukupi. |
| **MicroPython** | Firmware Runtime (v1.20+) | Firmware Environment ESP32 | Menjalankan program utama IoT (`main.py`) menggunakan bahasa Python tingkat tinggi khusus *embedded system*. | Sintaks konsisten dengan backend Python, mempercepat proses *prototyping* dan *debugging* tanpa kompilasi C++ yang lama, serta memiliki dukungan HTTP client bawaan. |
| **MicroPython Libraries** | `machine`, `network`, `urequests`, `ds18x20` | Embedded Modules | `machine` untuk Pin GPIO/ADC; `network` untuk WiFi LAN; `urequests` untuk pengiriman HTTP POST/GET; `ds18x20` untuk sensor suhu. | Library standar resmi MicroPython yang sangat stabil, efisien menggunakan memori RAM mikrokontroler, dan mudah dikonfigurasi. |
| **Sensor DS18B20** | Sensor Suhu Waterproof (OneWire) | Input Telemetri (GPIO 4) | Membaca suhu air kolam (°C) secara presisi dengan probe kedap air. | Tahan air, akurasi tinggi (±0.5°C), dan menggunakan protokol 1-Wire sehingga hemat penggunaan pin mikrokontroler. |
| **Sensor pH Gravity V2** | Analog pH Meter (DFRobot) | Input Telemetri (GPIO 34 / ADC) | Membaca tingkat keasaman atau kebasaan air kolam tambak (pH 0-14). | Sensor pH analog kelas laboratorium yang kompatibel dengan tegangan 3.3V/5V ESP32 dan memiliki papan pengondisi sinyal terpisah. |
| **Sensor Turbidity SEN0189** | Sensor Kekeruhan Optik | Input Telemetri (GPIO 35 / ADC) | Mengukur tingkat kekeruhan air (NTU) berdasarkan pembiasan cahaya pada partikel terlarut. | Respon cepat dan menggunakan pengukuran optik yang akurat untuk mendeteksi penumpukan sisa pakan atau kotoran di kolam. |
| **Water Level Sensor** | Sensor Ketinggian Air Resistif | Input Telemetri (GPIO 36 / ADC) | Mengukur volume/ketinggian air dalam kolam (cm). | Desain simpel, harga terjangkau, dan langsung memberikan output sinyal analog yang mudah dibaca ADC ESP32. |
| **Modul Relay 4-Channel** | Relay Active LOW (5V Trigger) | Output Aktuator (GPIO 25, 26, 32, 33) | Saklar elektronik untuk menyalakan/mematikan alat fisik bertegangan listrik tinggi (220V AC / 12V DC). | Dilengkapi *optocoupler isolation* untuk melindungi ESP32 dari lonjakan listrik, serta 4 channel terpisah untuk kontrol independen. |
| **Aerator / Air Pump** | Aktuator Fisik (Relay 1 - GPIO 25) | Pengondisi Oksigen Air | Menyuplai oksigen terlarut (DO) ke dalam air kolam secara otomatis saat DO terdeteksi rendah. | Perangkat esensial pembudidayaan ikan untuk mencegah kematian massal akibat asfiksia (kekurangan oksigen). |
| **Pompa Sirkulasi Air** | Aktuator Fisik (Relay 2 - GPIO 26) | Pengondisi Kebersihan Air | Menguras/mensingkronkan sirkulasi air kolam saat kekeruhan air terlalu tinggi. | Menjaga kualitas fisik air dan membuang penumpukan amonia sisa pakan/kotoran ikan. |
| **Feeder Servo / Motor** | Aktuator Fisik (Relay 3 - GPIO 32) | Pemberi Pakan Otomatis | Menggerakkan katup/dispenser pakan ikan sesuai jadwal atau instruksi otomatis. | Memastikan pemberian pakan teratur dan efisien tanpa memerlukan kehadiran fisik pembudidaya 24 jam. |
| **pH Dosing Pump** | Aktuator Fisik (Relay 4 - GPIO 33) | Pengondisi Kimia Air | Menginjeksikan cairan penetral pH (cairan pembenah) ketika pH air terlampau asam atau basa. | Mempertahankan derajat keasaman air pada rentang ideal tilapia (pH 6.5 - 8.0) secara otomatis. |
| **Active Buzzer** | Alarm Suara (GPIO 27) | Output Peringatan Lokal | Membunyikan suara alram peringatan langsung di area fisik tambak saat terjadi kondisi kritis. | Memberikan notifikasi audio seketika kepada petugas lapangan tanpa harus selalu melihat layar dashboard web. |

---

## 4. 🛠️ Development, Data Science & DevOps Tooling

| Perkakas | Bagian / Fungsi | Buat Apa | Alasan Pemilihan |
| :--- | :--- | :--- | :--- |
| **Jupyter Notebook (`.ipynb`)** | Data Science & Model Training (`backend-neela-ai/*.ipynb`) | Melakukan Eksperimen EDA, *feature engineering*, pelatihan model ML, evaluasi matriks (*Confusion Matrix*, *F1-Score*), dan pembanding algoritma. | Eksekusi interaktif per sel kode memudahkan dokumentasi eksperimen, visualisasi plot data, dan pengujian iteratif model. |
| **Git & GitHub** | Distributed Version Control System | Mengelola versi kode program, cabang pengembangan (*branches*), serta repositori terpusat. | Standar industri untuk pelacakan perubahan kode, mempermudah kolaborasi, dan integrasi continuous integration. |
| **ESLint & PostCSS** | Code Quality & Build Tooling | Memeriksa standar kualitas kode JavaScript React (`eslint.config.mjs`) dan mengompilasi Tailwind CSS (`postcss.config.mjs`). | Menghindari bug atau *syntax error* pada frontend sejak dini dan memastikan build CSS efisien. |

---

## 5. 💻 Software Aplikasi & Software Environment yang Digunakan

Berikut adalah rincian seluruh perangkat lunak (software GUI, IDE, tools testing, database manager, dan lingkungan eksekusi) yang dipakai dalam proses pembangunan, pengujian, dan pengoperasian sistem:

| Nama Software / Aplikasi | Kategori | Bagian / Penggunaan | Fungsi & Untuk Apa | Alasan Pemilihan |
| :--- | :--- | :--- | :--- | :--- |
| **VS Code / Antigravity IDE** | Integrated Development Environment (IDE) | Seluruh Proyek (`src/`, `backend-neela-ai/`, `iot/`) | Software IDE utama untuk penulisan kode JavaScript, Python, HTML/CSS, manajemen repositori, serta eksekusi terminal. | IDE paling fleksibel dengan ekosistem *extensions* terlengkap (Python, Pymakr, Tailwind, ESLint). |
| **Thonny IDE / MicroPico / esptool** | IoT Development & Flashing Tool | Firmware ESP32 (`iot/main.py`) | Software GUI untuk mengunggah (*upload*) berkas MicroPython `main.py` ke ESP32 DevKit V1 dan melakukan flashing firmware MicroPython via Serial Port (COM Port). | Ringan, dirancang khusus untuk pengembangan Python di mikrokontroler (MicroPython/CircuitPython), dan menyertakan Serial REPL Terminal bawaan. |
| **Swagger UI (FastAPI Auto-Docs)** | API Testing & Interactive Documentation Tool | Backend API Testing (`http://localhost:8000/docs`) | Software antarmuka interaktif berbasis web untuk menguji seluruh 17 endpoint FastAPI (`/analyze`, `/actuator`, `/settings`, `/latest`, `/history`) secara langsung tanpa aplikasi luar. | Dihasilkan secara otomatis oleh FastAPI, tidak perlu membuat dokumentasi API terpisah, dan mendukung pengujian request/response JSON secara instan di browser. |
| **Postman / Insomnia** | API Testing & Simulation Software | Backend & Middleware Testing | Software untuk mensimulasikan HTTP Request POST/GET dari alat IoT atau Web Simulator untuk pengujian skenario ekstrem API backend. | Memungkinkan pengujian *automated test suite*, inspeksi header HTTP, dan pengiriman payload JSON kompleks secara terstruktur. |
| **Uvicorn** | ASGI Web Server Software Engine | Backend Server Engine (`appv2.py`) | Software server web ASGI (*Asynchronous Server Gateway Interface*) yang menjalankan aplikasi FastAPI di port `8000`. | Berkecepatan sangat tinggi (berbasis UVLoop dan httptools), mendukung mode `--reload` untuk *hot-reloading* saat *development*. |
| **Node.js (v18+/v20+) & npm** | JavaScript Runtime & Package Manager | Web Frontend (`package.json`, `npm run dev`) | Software lingkungan runtime untuk mengeksekusi dev server Next.js di port `3000` serta menginstal/mengelola dependensi pustaka JavaScript. | Standard runtime resmi untuk ekosistem React/Next.js dengan registry paket (npm) terbesar di dunia. |
| **DB Browser for SQLite / DBeaver** | Database Management Software (GUI) | Inspeksi Database (`aquaagent.db`) | Software antarmuka visual (GUI) untuk membuka berkas `aquaagent.db`, melihat skema tabel telemetri/settings, mereset data, dan mengeksekusi query SQL manual. | Gratis, open-source, ringan, dan memungkinkan visualisasi struktur tabel SQLite secara cepat tanpa mengetik perintah CLI. |
| **JupyterLab / Jupyter Notebook App** | Interactive Data Science Workspace | Pelatihan ML (`backend-neela-ai/*.ipynb`) | Software aplikasi web interaktif untuk menjalankan sel kode Python, analisis grafik EDA, eksperimen algoritma Machine Learning, dan pemodelan SMOTE. | Memudahkan analisis visual bertahap, inspeksi matriks data secara *live*, dan menyimpan riwayat eksperimen pelatihan model. |
| **Python Virtual Environment (`venv`)** | Package Isolation Software | Backend Environment (`backend-neela-ai/venv`) | Software pengisolasi lingkungan Python agar dependensi perpustakaan (`requirements.txt`) tidak bentrok dengan instalasi Python sistem global. | Mencegah konflik versi package antar proyek dan memastikan *reproducibility* lingkungan server. |
| **Serial Monitor (PuTTY / Tera Term)** | Serial Communication Software | Debugging Hardware (`iot/main.py`) | Software terminal untuk membaca pesan log output `print()` yang dikirimkan mikrokontroler ESP32 melalui koneksi kabel USB Serial (UART). | Sangat berguna untuk mendiagnosis konektivitas Wi-Fi ESP32, kegagalan pembacaan sensor fisik, dan *baud rate* serial (115200). |
| **Mermaid.js / Live Editor** | Software Diagramming Tool | Visualisasi Arsitektur Sistem (`arsitektur_sistem.md`) | Software berbasis teks-ke-diagram untuk merancang diagram alur komunikasi hardware-backend-frontend. | Diagram ditulis sebagai kode *markdown* sehingga mudah di-update di Git tanpa membutuhkan software grafis terpisah. |

---

## ❓ Kenapa Kombinasi Tech Stack Ini Dipercayakan untuk AQUAAGENT?

1. **Kecepatan & Skalabilitas (FastAPI + Next.js)**:
   * Kombinasi **FastAPI** di backend dan **Next.js** di frontend menghasilkan arsitektur yang sangat responsif. Data telemetri IoT dapat diproses dalam hitungan milidetik (*sub-second latency*), sementara tampilan dashboard web dimuat secara instan (*lightning-fast rendering*).
2. **Kecerdasan Hybrid Presisi Tinggi (Supervised ML + LLM)**:
   * Sistem ini menggunakan **Random Forest / ExtraTrees Classifier** untuk klasifikasi keputusan cepat dan deterministik (akurasi **99.88%** tanpa risiko halusinasi data), lalu memadukannya dengan **LLM (Gemini/OpenAI)** sebagai *AI Chat Assistant* yang ramah pengguna untuk memberikan rekomendasi kontekstual.
3. **Efisiensi Komputasi & Biaya Rendah**:
   * Penggunaan **MicroPython di ESP32** dan **SQLite3 di FastAPI** memungkinkan seluruh sistem ini berjalan pada perangkat dengan spesifikasi terjangkau (bahkan bisa dideploy di Single Board Computer seperti Raspberry Pi / Mini PC lokal di area tambak) tanpa memerlukan biaya insfrastruktur cloud yang mahal.
4. **Resiliensi & Keselamatan Terintegrasi**:
   * Penggunaan **Relay 4-Channel Active LOW** dengan *fail-safe rules* di backend memastikan bahwa alat fisik akan mengambil tindakan otomatis (seperti menyalakan Aerator saat Oksigen kritis atau membunyikan Buzzer) demi mencegah kematian massal ikan pembudidayaan.
