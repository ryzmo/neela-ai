# DOKUMENTASI SISTEM AQUAAGENT (NEELA AI)
**Sistem Pemantauan, Inferensi Cerdas & Kendali Otomatis Tambak Ikan Nila Berbasis IoT, Machine Learning (ExtraTrees), Hybrid Decision Engine, dan Explainable AI**

---

## DAFTAR ISI
1. [Ringkasan Eksekutif & Arsitektur Sistem Global](#1-ringkasan-eksekutif--arsitektur-sistem-global)
2. [Dataset & Machine Learning Lifecycle: Mengapa & Bagaimana ExtraTrees Terpilih](#2-dataset--machine-learning-lifecycle-mengapa--bagaimana-extratrees-terpilih)
   * 2.1 Sumber Dataset & Karakteristik Data Mentah
   * 2.2 Problematika Data Awal & Rasionalisasi Perbaikan
   * 2.3 Rincian Langkah Demi Langkah Pembuatan Machine Learning
   * 2.4 Mengapa Harus Ada 15 Fitur Turunan? (Analisis Mendalam Per Fitur)
   * 2.5 Mengapa Harus Mencoba SMOTE & Apa Hasilnya?
   * 2.6 Mengapa Memilih ExtraTrees Classifier Dibandingkan 6 Model Lainnya?
   * 2.7 Hasil Evaluasi Model, Confusion Matrix & Feature Importance
3. [Backend API & Engine Keputusan Hybrid (appv2.py)](#3-backend-api--engine-keputusan-hybrid-appv2py)
   * 3.1 Filosofi Desain & Arsitektur Backend FastAPI
   * 3.2 Estimator Oksigen Terlarut Fisik-Empiris (DO Formula)
   * 3.3 Engine Keputusan Dual-Tier (ExtraTrees + Rule-Based Engine)
   * 3.4 Explainable AI (XAI) & Tree Decision Path Tracing
   * 3.5 Protokol Sinkronisasi Hardware & Handshake Acknowledgment
   * 3.6 Layanan Notifikasi Email Kritis & Algoritma Cooldown
   * 3.7 Skema Database Persistence SQLite (aquaagent.db)
   * 3.8 Dokumentasi Lengkap Endpoint RESTful API
4. [Hardware Layer & IoT Microcontroller Node (iot/main.py)](#4-hardware-layer--iot-microcontroller-node-iotmainpy)
   * 4.1 Pemilihan Komponen Hardware & Spesifikasi Pin ESP32
   * 4.2 Sensorik & Teknik Kalibrasi Sinyal Analog/Digital
   * 4.3 Aktuator, Relay Active-LOW & Kontrol PWM Servo Pakan
   * 4.4 Algoritma Siklus Kerja main.py (Polling, Handshake, Fail-Safe)
   * 4.5 Sistem Penjadwalan Pakan Lokal & Sinkronisasi Versi
   * 4.6 Pola Feedback Audio (Buzzer Beep Sequences)
5. [Analisis Desain End-to-End: Rasionalisasi & Pertimbangan Teknologi (Why & How)](#5-analisis-desain-end-to-end-rasionalisasi--pertimbangan-teknologi-why--how)
   * 5.1 Mengapa Hybrid ML + Rule Engine (Bukan Hanya Salah Satunya)?
   * 5.2 Mengapa HTTP Polling Terjadwal (Bukan Pure MQTT / WebSockets)?
   * 5.3 Mengapa MicroPython di ESP32 (Bukan Arduino C++)?
   * 5.4 Mengapa Explainable AI (XAI) Sangat Krusial untuk Akuakultur?
6. [Panduan Instalasi, Konfigurasi & Pengoperasian Sistem](#6-panduan-instalasi-konfigurasi--pengoperasian-sistem)

---

# 1. Ringkasan Eksekutif & Arsitektur Sistem Global

AQUAAGENT (NEELA AI) adalah platform cerdas terintegrasi End-to-End untuk akuakultur presisi (smart precision aquaculture), khususnya budidaya ikan Nila (*Oreochromis niloticus*). Sistem ini mengintegrasikan empat pilar teknologi:

```
+-----------------------------------------------------------------------------+
|                          ARSITEKTUR GLOBAL AQUAAGENT                        |
+-----------------------------------------------------------------------------+

  [ HARDWARE LAYER (ESP32) ]
   |-- Sensor Suhu (DS18B20 OneWire) ---------------+
   |-- Sensor pH (Gravity V2 + Interpolasi) --------|
   |-- Sensor Kekeruhan / Turbidity (SEN0189) ------|
   +-- Sensor Ketinggian Air (HC-SR04 Ultrasonic) --+
                           |
                           v (HTTP POST /analyze - JSON Telemetry)
  [ BACKEND LAYER (FastAPI appv2.py) ]
   |-- 1. Feature Engineering Engine (15 Fitur Fisik & Siklik)
   |-- 2. ExtraTrees Machine Learning Classifier (aquaagent_rf_v4_v3.pkl)
   |-- 3. Rule-Based Decision Engine (Threshold Safety Checks)
   |-- 4. Explainable AI Engine (LLM Biological Diagnostic + Decision Tree Trace)
   |-- 5. SQLite Persistence Engine (aquaagent.db)
   +-- 6. Emergency Dispatcher (email_service.py)
                           |
             +-------------+-------------+
             v                           v
  [ FRONTEND WEB LAYER ]        [ NOTIFIKASI & AKTUATOR FISIK ]
   |-- Dashboard Real-Time       |-- Relay Aerator O2 (Active LOW)
   |-- Kontrol Aktuator Manual   |-- Relay Pompa pH UP (Active LOW)
   |-- Visualisasi XAI & Tree    |-- Relay Pompa pH DOWN (Active LOW)
   |-- Neela AI Chat Assistant   |-- Servo Pakan Otomatis (PWM)
   +-- Konfigurasi Threshold     |-- Sirine Alarm Buzzer
                                 +-- Email Peringatan Darurat (SMTP)
```

Sistem ini dirancang untuk menjawab permasalahan utama kegagalan panen ikan nila:
1. Keterlambatan deteksi penurunan Oksigen Terlarut (*Dissolved Oxygen* / DO).
2. Fluktuasi asam-basa (pH) drastis akibat sisa pakan dan metabolisme amonia.
3. Kekeruhan ekstrem dan penurunan kualitas air yang memicu penyumbatan insang.
4. Anomali suhu lingkungan yang memicu stres fisiologis dan mortalitas massal.

---

# 2. Dataset & Machine Learning Lifecycle: Mengapa & Bagaimana ExtraTrees Terpilih

Bagian ini menguraikan secara komprehensif seluruh siklus hidup pengembangan model Machine Learning (ML), mulai dari asal-usul data mentah, problematika biologis, justifikasi matematis di balik 15 fitur rekayasa, eksperimen oversampling SMOTE, hingga alasan ilmiah mengapa ExtraTrees Classifier terpilih sebagai model produksi terbaik.

---

## 2.1 Sumber Dataset & Karakteristik Data Mentah
Dataset utama bersumber dari file `Data_Model_IoTMLCQ_2024.xlsx` yang memuat 4.383 baris data telemetri murni. Data ini mencatat parameter kualitas air kolam tambak secara kontinu:

1. `TEMP` (Temperature / Suhu Air): Rentang pembacaan sensor dalam satuan Celsius (°C).
2. `DO` (Dissolved Oxygen / Oksigen Terlarut): Konsentrasi oksigen terlarut dalam satuan mg/L.
3. `PH` (Derajat Keasaman Air): Skala logaritmik konsentrasi ion hidrogen (0.00 – 14.00).
4. `TURBIDITY` (Kekeruhan Air): Tingkat kekeruhan akibat partikel tersuspensi dalam satuan NTU / persentase.
5. `hour` (Waktu Pengamatan): Jam pengukuran (0 – 23) yang merefleksikan siklus fotoperiode matahari.
6. `Health Status` (Target Klasifikasi): Status kualitas lingkungan tambak (Stable [0] vs At Risk [1]).

---

## 2.2 Problematika Data Awal & Rasionalisasi Perbaikan

Sebelum dilakukan pemodelan, dataset mentah memiliki 3 kelemahan mendasar:

1. **Ketidakseimbangan Kelas Ekstrem (Severe Class Imbalance)**:
   * Kondisi Stable (0): 3.678 sampel (83.9%)
   * Kondisi At Risk (1): 705 sampel (16.1%)
   * Konsekuensi: Model standar cenderung bias memprediksi kelas mayoritas (Stable) untuk meraih akurasi semu tinggi, namun gagal mendeteksi kondisi kritis (At Risk).
2. **Inkonsistensi Ambang Batas Empiris (Boundary Ambiguity)**:
   * Data mentah mengandung beberapa sampel berlabel At Risk padahal seluruh nilai fisiknya berada pada rentang ideal ikan Nila, serta sebaliknya beberapa sampel berlabel Stable padahal suhu atau pH berada di zona kritis.
3. **Ketiadaan Informasi Interaksi Multivariat**:
   * Nilai mentah univariat tidak mampu menyampaikan fenomena bio-kimia kompleks kepada algoritma (misalnya hubungan antara kenaikan suhu terhadap penurunan kelarutan oksigen).

---

## 2.3 Rincian Langkah Demi Langkah Pembuatan Machine Learning

Berikut adalah 8 langkah terstruktur yang dieksekusi secara ketat dalam pembuatan model:

```
+-----------------------------------------------------------------------------+
|                 TAHAPAN KRONOLOGIS PEMBUATAN MODEL ML                       |
+-----------------------------------------------------------------------------+

 [ Langkah 1: Data Cleaning & Type Casting ]
  +-- Validasi tipe data numerik, eliminasi null/NaN, sanitasi format kolom.
                      |
                      v
 [ Langkah 2: Physical Risk Anomaly Shift (Domain-Expert Calibration) ]
  +-- Rekalibrasi 705 sampel At Risk agar memiliki anomali fisik nyata (FAO Standard).
                      |
                      v
 [ Langkah 3: Pelabelan Ground Truth Fisik (is_optimal) ]
  +-- Penetapan label deterministik berbasis batas fisiologis ikan Nila.
                      |
                      v
 [ Langkah 4: Injeksi Noise Perbatasan (Boundary Perturbation 5.0% - 6.5%) ]
  +-- Simulasi ketidakpastian/noise sensor dunia nyata agar model tidak overfit.
                      |
                      v
 [ Langkah 5: Stratified 80:20 Train-Test Split (WAJIB DILAKUKAN DAHULU) ]
  +-- 3.506 Data Latih | 877 Data Uji Murni (Bebas 100% Kebocoran / Zero-Leakage).
                      |
                      v
 [ Langkah 6: Feature Engineering (Ekstraksi 15 Fitur Komprehensif) ]
  +-- 5 Fitur Dasar + 10 Fitur Deviasi, Rasio Fisika-Kimia & Siklus Trigonometri.
                      |
                      v
 [ Langkah 7: Eksperimen 11 Kondisi SMOTE (0% s.d. 100% Linear Interpolation) ]
  +-- Evaluasi efek oversampling minoritas pada Data Latih (X_train).
                      |
                      v
 [ Langkah 8: Pelatihan & Komparasi 7 Algoritma Machine Learning ]
  +-- Seleksi model terbaik berdasarkan Akurasi, Precision, Recall, F1, dan AUC-ROC.
```

---

## 2.4 Mengapa Harus Ada 15 Fitur Turunan? (Analisis Mendalam Per Fitur)

Fitur sensor mentah univariat (`TEMP`, `DO`, `PH`, `TURBIDITY`, `hour`) tidak memadai untuk klasifikasi kualitas air akuakultur karena:
* Hubungan fisiologis ikan bersifat non-linier dengan batas toleransi dua arah (misalnya: pH < 6.5 berbahaya, dan pH > 8.0 juga berbahaya). Jika hanya menggunakan fitur mentah `PH`, Decision Tree membutuhkan minimal 2 kali pemisahan mendalam untuk mengisolasi zona bahaya, yang memperbesar kedalaman pohon dan risiko overfitting.
* Fenomena perairan melibatkan interaksi fisika-kimia simultan yang tidak dapat ditangkap oleh pemisahan satu sumbu linier.

Oleh karena itu, dirancang 15 fitur turunan dengan rincian berikut:

### Tabel Rincian & Alasan 15 Fitur Input:

| No | Nama Fitur | Formula Matematis | Mengapa Fitur Ini Dibuat? (Alasan Biologis & Matematis) | Dampak Jika Fitur Tidak Ada |
|:---:|:---|:---|:---|:---|
| 1 | `TEMP` | sensor.temp | Suhu dasar (°C) yang mengatur laju metabolisme basal ikan Nila dan laju disolusi gas. | Model kehilangan acuan temperatur absolut air. |
| 2 | `DO` | sensor.do | Parameter penentu ketersediaan respirasi aerobik jaringan ikan. | Model tidak dapat mendeteksi kondisi hipoksia langsung. |
| 3 | `PH` | sensor.ph | Mengukur keasaman air; mempengaruhi permeabilitas insang dan toksisitas amonia. | Model buta terhadap stres asam-basa darah ikan. |
| 4 | `TURBIDITY` | sensor.turbidity | Indikator suspensi lumpur, feses, sisa pakan, atau ledakan mikroalga. | Partikel penyumbat insang tidak terdeteksi. |
| 5 | `hour` | sensor.hour | Jam pengukuran (0–23) untuk melacak siklus fotosintesis siang hari dan respirasi malam hari. | Model tidak mengetahui konteks waktu siang/malam. |
| 6 | `risk_flag` | 1.0 jika anomali, 0.0 jika optimal | Sinyal Biner Tegas: Mengintegrasikan seluruh pelanggaran ambang batas menjadi sinyal 1-bit, membantu pohon memisahkan sampel normal dan abnormal pada root node. | Pohon harus membuat banyak percabangan bertingkat hanya untuk mengecek batas aman. |
| 7 | `PH_dev` | abs(PH - 7.5) | Deviasi Linier Simetris: Titik pH optimal ikan Nila adalah 7.5. Fitur ini mengubah masalah toleransi dua arah menjadi jarak skalar absolut satu arah. Cukup 1 split untuk mendeteksi bahaya asam maupun basa. | Pohon harus melakukan split ganda (PH < 6.7 dan PH > 8.3), menggandakan kompleksitas. |
| 8 | `TEMP_dev` | max(0, T-32) + max(0, 25-T) | Magnitudo Stres Termal: Bernilai 0 jika suhu aman (25–32°C), dan bernilai positif proporsional terhadap besarnya kedinginan (< 25°C) atau kepanasan (> 32°C). | Model kesulitan mengukur magnitudo keparahan deviasi suhu. |
| 9 | `TURB_dev` | max(0, TURB - 25.0) | Kelebihan Kekeruhan: Mengisolasi hanya nilai turbiditas yang melampaui batas toleransi 25 NTU. Nilai di bawah 25 NTU dinolkan agar tidak membuang komputasi pada variasi air jernih. | Model membuang split pada variasi air jernih yang tidak memiliki dampak patologis. |
| 10 | `DO_dev` | max(0, 5.0 - DO) | Defisit Oksigen Kritis: Mengukur defisit O2 di bawah batas aman 5.0 mg/L secara terukur jelas. | Model memperlakukan penurunan dari 8 ke 6 mg/L sama dengan 5 ke 3 mg/L, padahal < 5 mg/L mematikan. |
| 11 | `PH_dist_7` | abs(PH - 7.0) | Jarak Batas Bawah Netralitas: Mengukur kedekatan pH terhadap batas kritis asidosis (7.0). | Sensitivitas deteksi asidosis menjadi lebih lambat. |
| 12 | `TEMP_DO_ratio` | DO / (TEMP + 1.0) | Termodinamika Kelarutan Gas (Hukum Henry): Kelarutan O2 dalam air berbanding terbalik dengan suhu. Rasio ini menangkap interaksi kelarutan termal nyata. | Model tidak mampu membedakan penyebab DO rendah (suhu tinggi vs konsumsi bakteri). |
| 13 | `TURB_DO_ratio`| TURBIDITY / (DO + 0.1) | Indeks Dekomposisi Organik: Kekeruhan tinggi dengan DO rendah mengindikasikan pembusukan bahan organik oleh bakteri yang menyedot oksigen massal. | Model gagal mengenali kondisi organic overload secara dini. |
| 14 | `TEMP_PH_ratio`| TEMP / (PH + 0.1) | Indeks Toksisitas Amonia Bebas (NH3): Toksisitas amonia total terhadap ikan Nila meningkat tajam saat suhu tinggi dan pH basa. | Risiko keracunan amonia pada cuaca panas terik tidak terdeteksi dini. |
| 15 | `hour_sin` | sin(2 * pi * hour / 24) | Komponen Sinus Waktu Siklik: Pada jam integer, jam 23:00 bernilai 23 dan 00:00 bernilai 0 (jarak linier 23), padahal jarak waktu nyata 1 jam. Transformasi sinus menjaga kontinuitas siklus harian. | Model menganggap jam 23:00 dan 00:00 terpisah jauh, merusak kontinuitas siklus nokturnal. |
| 16 | `hour_cos` | cos(2 * pi * hour / 24) | Komponen Kosinus Waktu Siklik: Pasangan orthogonal dari hour_sin untuk membedakan fase waktu (pagi vs sore). | Terjadi ambiguitas fase waktu antara pagi dan sore hari. |

---

## 2.5 Mengapa Harus Mencoba SMOTE & Apa Hasilnya?

### Rasionalisasi Pengujian SMOTE (Synthetic Minority Over-sampling Technique)
Dalam dataset akuakultur nyata, kondisi bahaya (At Risk) adalah kejadian minoritas (12.6% – 16.1%). Model klasifikasi standar yang dilatih pada data timpang berisiko memprioritaskan kelas mayoritas (Stable) dan menghasilkan False Negative tinggi (kondisi kritis lolos tanpa peringatan).

Untuk menguji sensitivitas model, diimplementasikan fungsi interpolasi linier `safe_smote_resample()` pada 11 tingkat SMOTE (0% hingga 100% oversampling):
$$\text{target\_ratio} = \text{current\_ratio} + \text{pct\_level} \times (1.0 - \text{current\_ratio})$$

### Prinsip Pencegahan Data Leakage
Pemisahan data (Train-Test Split) dilakukan sebelum penerapan SMOTE. Data Uji (877 sampel) dipisahkan secara murni sejak awal dan tidak pernah tersentuh SMOTE untuk memastikan validitas pengujian pada data riil yang belum pernah dilihat model.

### Hasil Komparasi SMOTE pada Data Uji Murni (877 Sampel):

| Kondisi SMOTE | Target Ratio | Akurasi (%) | Recall Risk | F1-Score | AUC-ROC |
|:---|:---:|:---:|:---:|:---:|:---:|
| 1. Tanpa SMOTE (Baseline) | 0.1443 | 96.47% | 1.000 (100%) | 0.877 | 0.980 |
| 2. SMOTE 10% | 0.2298 | 96.47% | 1.000 (100%) | 0.877 | 0.979 |
| 3. SMOTE 20% | 0.3154 | 96.47% | 1.000 (100%) | 0.877 | 0.979 |
| 4. SMOTE 50% | 0.5721 | 96.47% | 1.000 (100%) | 0.877 | 0.978 |
| 5. SMOTE 100% (Balanced) | 1.0000 | 96.47% | 1.000 (100%) | 0.877 | 0.980 |

**Kesimpulan**: 15 fitur rekayasa menghasilkan separabilitas kelas yang sangat tegas, sehingga model ExtraTrees sudah mampu mencapai Recall 1.000 secara sempurna pada kondisi baseline tanpa SMOTE dan tetap stabil pada seluruh rentang oversampling.

---

## 2.6 Mengapa Memilih ExtraTrees Classifier Dibandingkan 6 Model Lainnya?

Sebanyak 7 algoritma Machine Learning dievaluasi pada kondisi data uji murni yang sama:

| Peringkat | Algoritma Model | Akurasi (%) | Precision | Recall (Risk) | F1-Score | AUC-ROC | Status |
|:---:|:---|:---:|:---:|:---:|:---:|:---:|:---|
| 1 | ExtraTrees Classifier | 96.47% | 0.782 | 1.000 (100%) | 0.877 | 0.980 | Model Terpilih (Production) |
| 2 | Logistic Regression | 96.47% | 0.782 | 1.000 (100%) | 0.877 | 0.980 | Terbatas pada batas linier |
| 3 | Random Forest Classifier | 96.35% | 0.780 | 0.991 (99.1%) | 0.873 | 0.978 | Sangat Baik |
| 4 | AdaBoost Classifier | 96.35% | 0.780 | 0.991 (99.1%) | 0.873 | 0.980 | Baik |
| 5 | HistGradientBoosting | 96.24% | 0.787 | 0.964 (96.4%) | 0.866 | 0.981 | Terdapat False Negative |
| 6 | Gradient Boosting | 95.90% | 0.774 | 0.955 (95.5%) | 0.855 | 0.979 | Terdapat False Negative |
| 7 | Decision Tree (Single) | 95.55% | 0.773 | 0.919 (91.9%) | 0.840 | 0.980 | Rawan Overfitting |

### 5 Alasan Teknis Pemilihan ExtraTrees Classifier:
1. **Random Cut-Point Thresholding**: ExtraTrees memilih nilai ambang batas pemisahan secara acak untuk setiap kandidat fitur, mendekorelasikan pohon-pohon individual dalam ensemble dan mereduksi varians secara maksimal.
2. **Resistensi Terhadap Noise Sensor IoT**: Karakteristik pemisahan acak mencegah pohon membentuk batas keputusan bergerigi yang overfit terhadap fluktuasi sinyal sensor.
3. **Recall Sempurna 1.000**: Berhasil mendeteksi 111 dari 111 kondisi kritis pada data uji murni (Zero False Negatives).
4. **Efisiensi Komputasi Sub-Milidetik**: Waktu inferensi < 2 ms pada backend FastAPI, sangat efisien untuk pemrosesan telemetri kontinu.
5. **Transparansi Explainable AI (XAI)**: Struktur pohon ensemble dapat diparsing langsung ke format representasi hierarkis JSON untuk visualisasi alur logika penalaran.

### Konfigurasi Hyperparameter ExtraTrees Terpilih:
```python
ExtraTreesClassifier(
    n_estimators=100,       # 100 pohon keputusan independen untuk stabilitas voting
    max_depth=8,            # Pembatasan kedalaman maksimal 8 level untuk mencegah overfitting
    min_samples_split=12,   # Minimal 12 sampel pada internal node sebelum bercabang
    min_samples_leaf=4,     # Minimal 4 sampel riil pada setiap terminal leaf node
    random_state=42         # Menjamin reproduktifitas hasil pengujian
)
```

---

## 2.7 Hasil Evaluasi Model, Confusion Matrix & Feature Importance

### Confusion Matrix pada Data Uji Murni (877 Sampel):
```
                  +-----------------------------------------+
                  |             PREDIKSI MODEL              |
                  +--------------------+--------------------+
                  |  Prediksi: Stable  | Prediksi: At Risk  |
+--------+--------+--------------------+--------------------+
| AKTUAL | Stable | 735 (True Negative)|  31 (False Positive)|
| DATA   +--------+--------------------+--------------------+
|        |At Risk |   0 (False Negative| 111 (True Positive) |
|        |        |   ZERO MISSED)     |                    |
+--------+--------+--------------------+--------------------+
```
* True Positive (TP = 111): Seluruh kondisi kritis terdeteksi akurat.
* True Negative (TN = 735): Kondisi kolam normal teridentifikasi aman.
* False Negative (FN = 0): Nol kasus bahaya yang lolos.
* False Positive (FP = 31): Peringatan preventif di zona perbatasan akibat perturbasi batas 5–6.5%.

### Kontribusi Relatif Fitur (Feature Importance Ranking):
1. `risk_flag` (24.8%): Sinyal utama deviasi parameter gabungan.
2. `DO_dev` (18.4%): Besaran defisit oksigen di bawah 5.0 mg/L.
3. `TEMP_DO_ratio` (12.6%): Interaksi termodinamika suhu dan kelarutan gas.
4. `PH_dev` (10.2%): Besaran deviasi keasaman terhadap pH ideal 7.5.
5. `TURB_DO_ratio` (8.7%): Indeks dekomposisi bahan organik penyedot oksigen.
6. `DO` (7.5%): Nilai konsentrasi oksigen terlarut absolut.
7. `TEMP_dev` (5.3%): Tingkat keparahan stres termal.
8. `PH` & `TURBIDITY` (4.9%): Pembacaan langsung sensor keasaman dan kekeruhan.
9. `hour_sin` & `hour_cos` (4.1%): Komponen siklus fotoperiode 24 jam.
10. Fitur rasio dan jarak lainnya (3.5%).

---

# 3. Backend API & Engine Keputusan Hybrid (appv2.py)

## 3.1 Filosofi Desain & Arsitektur Backend FastAPI
Backend diimplementasikan menggunakan FastAPI berbasis Python asinkron berkinerja tinggi. Backend bertindak sebagai Otak Sentral yang menggabungkan Machine Learning, Rule Engine, Explainable AI, Database SQLite, dan sinkronisasi hardware.

```
                  +----------------------------------------+
                  |             POST /analyze              |
                  +-------------------+-+------------------+
                                      |
               +----------------------+----------------------+
               v                                             v
  [ ExtraTrees ML Inference ]                   [ Rule-Based Safety Engine ]
  * Transformasi 15 Fitur Input                 * Evaluasi Ambang Batas Sensor
  * Model: aquaagent_rf_v4_v3.pkl               * Thresholds dari SQLite settings
  * Output: Stable / At Risk                    * Kontrol Aktuator (Aerator, Pump,
  * Probabilitas & Confidence                   |  pH Stabilizer, Buzzer)
               |                                             |
               +----------------------+----------------------+
                                      |
                                      v
                       [ Hybrid Decision Aggregator ]
                                      |
          +---------------------------+---------------------------+
          v                           v                           v
[ Explainable AI (XAI) ]     [ SQLite Persistence ]     [ Emergency Dispatcher ]
* LLM Diagnostic Prompt      * Log ke tabel history     * Evaluasi Level Kritis
* Local Biological Fallback  * Catat timestamp & status * Email Alert (Cooldown 30m)
```

---

## 3.2 Estimator Oksigen Terlarut Fisik-Empiris (DO Formula)
Jika parameter DO tidak dikirim oleh perangkat sensor (`do == None`), backend menghitung estimasi saturasi DO berdasarkan suhu air (`TEMP`) menggunakan model polinomial kelarutan gas:

$$\text{DO}_{\text{est}} = 14.652 - 0.41022 \times \text{TEMP} + 0.007991 \times \text{TEMP}^2 - 0.000077774 \times \text{TEMP}^3$$

Pada suhu 25°C, $\text{DO}_{\text{est}} \approx 8.26\text{ mg/L}$; pada suhu 30°C, $\text{DO}_{\text{est}} \approx 7.53\text{ mg/L}$.

---

## 3.3 Engine Keputusan Dual-Tier (ExtraTrees + Rule-Based Engine)
Sistem menggunakan pendekatan Dual-Tier Hybrid:
1. Tier 1 (Machine Learning): Mendeteksi pola bahaya multivariat tersembunyi antara suhu, pH, oksigen, turbiditas, dan waktu.
2. Tier 2 (Rule-Based Engine): Memberikan jaminan aksi deterministik instan sesuai konfigurasi batas aman di tabel settings:

| Komponen Aktuator | Kondisi Aktivasi (ON) | Argumen Ilmiah / Alasan Tindakan |
|:---|:---|:---|
| Aerator O2 | DO < doThreshold (Default: < 5.0 mg/L) | Memompa oksigen difusi tinggi mencegah hipoksia dan kematian asfiksia. |
| Pompa pH UP (`water_circulation`) | pH < phMin (Default: < 6.5) | Menginjeksikan larutan penyangga basa menaikkan pH. |
| Pompa pH DOWN (`ph_neutralizer`) | pH > phMax (Default: > 8.0) | Menginjeksikan larutan asam organik menurunkan kebasaan. |
| Sirine Alarm Buzzer | Water Level > waterLevelMax ATAU Health Status == "At Risk" | Memberikan peringatan audio visual darurat saat kolam dalam kondisi kritis. |

---

## 3.4 Explainable AI (XAI) & Tree Decision Path Tracing

Backend menyediakan transparansi keputusan melalui dua mekanisme:

### A. Diagnosa Naratif Berbasis Biologi Ikan Nila (`generate_llm_explanation`)
Menyusun penjelasan 4 dimensi: efek fisiologis pada ikan Nila, intervensi aktuator yang aktif, prognosis estimasi waktu pulih, dan panduan taktis pengelola tambak. Jika OpenAI API aktif, teks di-generate via GPT; jika tidak, dieksekusi Domain Expert Fallback Engine lokal.

### B. Ekstraksi Hierarki Pohon Keputusan (`/tree-structure` & `/tree-trace`)
Membongkar estimator DecisionTreeClassifier individual menjadi struktur hierarki JSON yang mencakup nama fitur uji, threshold pemisahan, kondisi yang terpenuhi, arah traversal (LEFT vs RIGHT), dan voting consensus ensemble.

---

## 3.5 Protokol Sinkronisasi Hardware & Handshake Acknowledgment
Untuk menjamin eksekusi yang idempotent:
1. Saat ESP32 selesai mengeksekusi aktuator atau pakan, ESP32 mengirim request `POST /actuator/ack` atau `POST /feeder/ack`.
2. Backend menerima sinyal tersebut dan me-reset status pemicu di server, mencegah eksekusi ganda atau pemborosan pakan.

---

## 3.6 Layanan Notifikasi Email Kritis & Algoritma Cooldown (email_service.py)
Saat kondisi kritis terdeteksi, backend memicu pengiriman email darurat ke daftar penerima di tabel `email_recipients` dengan mekanisme cooldown (default 30 menit) untuk mencegah pengiriman pesan berlebih (email flooding).

---

## 3.7 Skema Database Persistence SQLite (aquaagent.db)

```sql
-- 1. Riwayat Telemetri & Prediksi
CREATE TABLE history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT,
    temperature REAL,
    do_value REAL,
    ph REAL,
    turbidity REAL,
    water_level REAL,
    health_status TEXT
);

-- 2. Konfigurasi Ambang Batas & Sistem
CREATE TABLE settings (
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
    alert_cooldown_seconds INTEGER DEFAULT 0,
    aerator_duration REAL DEFAULT 5.0,
    pump_duration REAL DEFAULT 0.5,
    stabilizer_duration REAL DEFAULT 0.5,
    buzzer_duration REAL DEFAULT 5.0,
    feeder_duration REAL DEFAULT 0.8
);

-- 3. Manajemen Jadwal Pakan Otomatis
CREATE TABLE feeding_schedule (
    id INTEGER PRIMARY KEY,
    feeding_time TEXT,
    interval_hours INTEGER,
    enabled INTEGER DEFAULT 1,
    version INTEGER DEFAULT 0
);

-- 4. Daftar Penerima Alarm Email
CREATE TABLE email_recipients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE
);
```

---

## 3.8 Dokumentasi Lengkap Endpoint RESTful API

| Method | Endpoint Path | Payload / Parameter | Deskripsi Fungsi & Output |
|:---:|:---|:---|:---|
| `GET` | `/` | - | Health check status server backend. |
| `POST` | `/analyze` | JSON `SensorInput` | Ingest data sensor, hitung 15 fitur, inferensi ExtraTrees, eksekusi decision engine, simpan ke database SQLite, dan trigger email. |
| `GET` | `/actuator` | - | Mengambil status mode (AUTONOMOUS/MANUAL) dan status saklar relay semua aktuator. |
| `POST` | `/actuator` | JSON `ActuatorInput` | Memperbarui mode kontrol dan status manual aktuator dari antarmuka Web. |
| `POST` | `/actuator/ack` | `{"name": "aerator"}` | Handshake konfirmasi eksekusi aktuator dari mikrokontroler ESP32. |
| `POST` | `/feeder/ack` | - | Konfirmasi bahwa servo pakan telah selesai berputar. |
| `POST` | `/beep/ack` | - | Konfirmasi bahwa sinyal beeper alarm telah dibunyikan di hardware. |
| `GET` | `/settings` | - | Mengambil konfigurasi ambang batas, durasi aktuator, dan interval polling. |
| `POST` | `/settings` | JSON `SettingsInput` | Memperbarui ambang batas sensor, interval refresh, dan durasi aktuator. |
| `GET` | `/feeding-schedule`| - | Mengambil jadwal jam pakan dan interval pakan aktif. |
| `POST` | `/feeding-schedule`| JSON `FeedingScheduleInput` | Memperbarui jadwal pakan dan menaikkan nomor version. |
| `GET` | `/feeding-version` | - | Endpoint ringan bagi ESP32 untuk mengecek pembaruan jadwal pakan. |
| `GET` | `/emails` | - | Menampilkan seluruh daftar email penerima notifikasi darurat. |
| `POST` | `/emails` | `{"email": "user@mail.com"}`| Menambahkan email penerima baru ke SQLite. |
| `DELETE`| `/emails/{email}` | Path variable `email` | Menghapus email penerima dari database. |
| `GET` | `/latest` | - | Mengambil hasil analisis telemetri & prediksi AI paling mutakhir. |
| `GET` | `/history` | `limit: int = 50` | Mengambil 50 data riwayat telemetri untuk grafik visualisasi. |
| `GET` | `/tree-structure` | `tree_idx`, `depth` | Mengambil struktur hierarki pohon keputusan ExtraTrees dalam format JSON. |
| `POST` | `/tree-trace` | JSON `SensorInput`, `tree_idx` | Menelusuri jalur keputusan step-by-step (decision path) pada pohon ML. |

---

# 4. Hardware Layer & IoT Microcontroller Node (iot/main.py)

## 4.1 Pemilihan Komponen Hardware & Spesifikasi Pin ESP32

Modul mikrokontroler diprogram menggunakan MicroPython pada papan pengembangan ESP32 DevKit:

```
+-----------------------------------------------------------------------------+
|                      DIAGRAM WIRING PINOUT ESP32                            |
+-----------------------------------------------------------------------------+

                  +------------------------------+
                  |         ESP32 DEVKIT         |
                  |                              |
  DS18B20 Temp ---+ GPIO 4 (OneWire Data)        |
  pH Sensor V2 ---+ GPIO 32 (ADC1_CH4, 12-bit)   |
  Turbidity    ---+ GPIO 34 (ADC1_CH6, 12-bit)   |
  Ultrasonic   ---+ TRIG: GPIO 26 | ECHO: GPIO 27|
                  |                              |
  Relay Aerator---+ GPIO 22 (Output Active LOW)  |
  Relay pH UP  ---+ GPIO 21 (Output Active LOW)  |
  Relay pH DOWN---+ GPIO 19 (Output Active LOW)  |
  Servo Feeder ---+ GPIO 13 (PWM 50 Hz)          |
  Active Buzzer---+ GPIO 25 (Digital Output)     |
                  +------------------------------+
```

---

## 4.2 Sensorik & Teknik Kalibrasi Sinyal Analog/Digital

### 1. Sensor Suhu Air Digital DS18B20 (GPIO 4)
* Protokol: Dallas OneWire Bus dengan delay konversi 750 ms (`ds_sensor.convert_temp()`).
* Formula Kalibrasi Linier:
  $$\text{Temperature}_{\text{cal}} = 1.000632 \times \text{Sensor\_Raw} - 0.396$$

### 2. Sensor pH Air Analog Gravity V2 (GPIO 32)
* Akuisisi Sinyal: 50 sampel oversampling dengan interval 20 ms untuk meredam noise frekuensi tinggi.
* Kalibrasi Non-Linier (Piecewise Linear Interpolation 5 Titik):
  * Buffer pH 4.01 -> 2.2132 V
  * Buffer pH 6.86 -> 1.7668 V
  * Buffer pH 7.00 -> 1.7339 V
  * Buffer pH 9.18 -> 1.3693 V
  * Buffer pH 10.01 -> 1.1714 V
  $$\text{pH}(V) = \text{pH}_{\text{low}} + \frac{(V - V_{\text{low}}) \times (\text{pH}_{\text{high}} - \text{pH}_{\text{low}})}{V_{\text{high}} - V_{\text{low}}}$$

### 3. Sensor Kekeruhan Air Optik SEN0189 (GPIO 34)
* Kalibrasi Tegangan:
  * $V \leq 0.0000\text{ V}$: Kekeruhan 100% (Pekat)
  * $0.0000\text{ V} < V \leq 0.6726\text{ V}$: Kekeruhan 100% -> 50% (Pekat ke Sedang)
  * $0.6726\text{ V} < V \leq 0.8830\text{ V}$: Kekeruhan 50% -> 0% (Sedang ke Jernih)
  * $V > 0.8830\text{ V}$: Kekeruhan 0% (Jernih Air Keran)

### 4. Sensor Ketinggian Air Ultrasonik HC-SR04 (TRIG: 26, ECHO: 27)
* Formula Jarak & Level Air:
  $$\text{Distance (cm)} = \frac{\Delta t (\mu s) \times 0.0343}{2}$$
  $$\text{Water Height (cm)} = 8.5\text{ cm} - \text{Distance}$$
  $$\text{Water Level (\%)} = \left(\frac{\text{Water Height}}{6.0\text{ cm}}\right) \times 100\%$$

---

## 4.3 Aktuator, Relay Active-LOW & Kontrol PWM Servo Pakan

### A. Relay Modul Active-LOW (`ON = 0, OFF = 1`)
Logika Active-LOW dipilih untuk menjamin keselamatan saat mikrokontroler boot-up (pin GPIO default berada pada kondisi pull-up sehingga relay tidak menyala spontan saat start-up):
* Relay 1 (Pin 22): Aerator Difusi O2.
* Relay 2 (Pin 21): Pompa pH UP.
* Relay 3 (Pin 19): Pompa pH DOWN.

### B. Servo Feeder Pakan Otomatis (Pin 13 - PWM 50 Hz)
* `FORWARD (duty = 65)`: Memutar ulir dispenser pakan selama durasi pakan (default 0.8 detik).
* `BACKWARD (duty = 88)`: Memutar balik sedikit untuk mencegah penyumbatan pelet (anti-jamming).
* `STOP (duty = 77)`: Menghentikan motor servo.

---

## 4.4 Algoritma Siklus Kerja main.py (Polling, Handshake, Fail-Safe)

```
+-----------------------------------------------------------------------------+
|                       MAIN LOOP ALGORITHM (iot/main.py)                     |
+-----------------------------------------------------------------------------+

 1. [ Akuisisi Data Sensor ]
    |-- Ambil Suhu DS18B20 (Delay konversi 750ms)
    |-- Ambil pH (50x oversampling ADC)
    |-- Ambil Kekeruhan Turbidity (ADC -> piecewise voltage)
    +-- Ambil Ketinggian Air (Ultrasonik ToF)
                     |
                     v
 2. [ Evaluasi Jadwal Pakan Lokal ]
    |-- Cek versi jadwal via GET /feeding-version
    |-- Jika versi baru -> Unduh jadwal via GET /feeding-schedule
    +-- Jika waktu cocok -> Bunyikan Beep + Putar Servo Feeder (feed_now)
                     |
                     v
 3. [ Telemetry Ingestion ]
    +-- Kirim JSON sensor ke server: POST /analyze
                     |
                     v
 4. [ Polling Perintah Aktuator ]
    +-- Ambil state aktuator: GET /actuator
                     |
                     v
 5. [ Eksekusi Aktuator & Handshake Acknowledgment ]
    |-- Jika aerator == True    -> Nyalakan Relay 22 -> Sleep durasi -> Matikan -> POST /actuator/ack
    |-- Jika pump == True       -> Nyalakan Relay 21 -> Sleep durasi -> Matikan -> POST /actuator/ack
    |-- Jika stabilizer == True -> Nyalakan Relay 19 -> Sleep durasi -> Matikan -> POST /actuator/ack
    |-- Jika buzzer == True     -> Nyalakan Pin 25   -> Sleep durasi -> Matikan -> POST /actuator/ack
    +-- Jika manual feed == True-> Putar Servo       -> POST /feeder/ack
                     |
                     v
 6. [ Dynamic Polling Sleep ]
    +-- Tidur selama refreshInterval detik (dibaca dinamis dari settings)
```

---

## 4.5 Sistem Penjadwalan Pakan Lokal & Sinkronisasi Versi
1. ESP32 menyimpan jadwal pakan lokal di memori RAM sehingga pemberian pakan tetap berjalan tepat waktu meskipun koneksi internet terputus sementara.
2. Mengevaluasi modulo waktu harian:
   $$\text{diff} = (\text{current\_minutes} - \text{start\_minutes}) \pmod{1440}$$
   $$\text{is\_feed\_time} = (\text{diff} \pmod{\text{interval\_hours} \times 60} == 0)$$
3. Menggunakan `last_feed_key` untuk mencegah pakan berulang pada menit yang sama, dan hanya mengunduh jadwal saat `feeding_version` berubah.

---

## 4.6 Pola Feedback Audio (Buzzer Beep Sequences)
* `beep_connecting()`: Nada ganda pendek saat mencoba terhubung ke WiFi.
* `beep_success()`: Nada tunggal mantap saat jaringan dan server terhubung.
* `beep_failed()`: Nada berulang 4 kali jika inisialisasi jaringan gagal.
* `beep_action()`: Nada singkat saat eksekusi pakan atau perintah aktuator.

---

# 5. Analisis Desain End-to-End: Rasionalisasi & Pertimbangan Teknologi (Why & How)

## 5.1 Mengapa Hybrid ML + Rule Engine (Bukan Hanya Salah Satunya)?

| Aspek Evaluasi | Hanya Menggunakan Machine Learning | Hanya Menggunakan Rule-Based | Pendekatan Hybrid AQUAAGENT (Terpilih) |
|:---|:---|:---|:---|
| Deteksi Pola Multivariat | Sangat Baik (Mendeteksi anomali interaksi tersembunyi). | Terbatas (Kaku, sulit menyusun aturan kombinasi 5+ variabel). | Sangat Baik (Dikelola oleh ExtraTrees 15 fitur). |
| Kepastian & Keselamatan Aktuator | Berisiko (Dapat terjadi bias probabilitas pada kasus langka). | Sangat Aman (Batas ambang fisik pasti dieksekusi). | Sangat Aman & Deterministik (Rule Engine menjamin batas keselamatan). |
| Adaptabilitas Pengguna | Sulit (Perlu pelatihan ulang model jika standar diubah peternak). | Mudah (Cukup perbarui threshold di antarmuka web). | Sangat Fleksibel (Pengguna bebas menyetel threshold di database SQLite). |
| Transparansi / Explainability | Terbatas (Black box tanpa XAI). | Transparan (Alasan eksplisit). | Lengkap & Komprehensif (Transparansi XAI + Tree Tracing + Alasan Aturan). |

---

## 5.2 Mengapa HTTP Polling Terjadwal (Bukan Pure MQTT / WebSockets)?
1. **Stateless Resilience**: Node sensor di lingkungan tambak luar ruangan sering mengalami fluktuasi sinyal WiFi. Protokol HTTP bersifat stateless; jika satu request gagal akibat gangguan sinyal sesaat, ESP32 tidak mengalami memory leak atau broken socket state dan dapat langsung mencoba pada siklus berikutnya.
2. **Kesesuaian Waktu Respon Akuakultur**: Parameter kualitas air berubah secara gradual dalam hitungan menit, bukan milidetik. Polling setiap 5 detik sudah lebih dari cukup untuk mitigasi bahaya secara presisi tanpa membebani daya mikrokontroler.
3. **Kemudahan Integrasi REST API & Swagger**: Memungkinkan pengujian mandiri setiap endpoint via Swagger UI `/docs` tanpa ketergantungan pada broker MQTT pihak ketiga.

---

## 5.3 Mengapa MicroPython di ESP32 (Bukan Arduino C++)?
1. **Kemudahan Parsing JSON Kompleks**: MicroPython menyediakan modul bawaan `ujson` dan `urequests` yang fleksibel mengolah payload bertingkat tanpa risiko buffer overflow.
2. **Modularitas & Pemeliharaan**: Logika kalibrasi non-linier dan penjadwalan modular dapat ditulis dengan ringkas dan mudah dipelihara di lapangan.

---

## 5.4 Mengapa Explainable AI (XAI) Sangat Krusial untuk Akuakultur?
Peternak ikan membutuhkan transparansi alasan medis/biologis di balik rekomendasi sistem:
* Peternak memahami mengapa kolam dinyatakan At Risk (misal: "Penurunan O2 menjadi 4.1 mg/L pada suhu 31°C memicu hipoksia respirasi").
* Peternak mengetahui tindakan korektif otomatis yang sedang berjalan (misal: "Aerator aktif memompa O2").
* Peternak memperoleh kepastian estimasi waktu pemulihan dan panduan taktis pencegahan.

---

# 6. Panduan Instalasi, Konfigurasi & Pengoperasian Sistem

## 6.1 Persyaratan Sistem
* Sistem Operasi: Windows / Linux / macOS
* Python: Versi 3.9+
* Node.js: Versi 18.x atau lebih baru
* Hardware: ESP32 Dev Module, Relay Module 4-Channel, DS18B20, Gravity pH V2, SEN0189 Turbidity, HC-SR04, Active Buzzer, TowerPro MG996R / SG90 Servo.

---

## 6.2 Menjalankan Backend FastAPI (`backend-neela-ai`)
```bash
# 1. Masuk ke direktori backend
cd backend-neela-ai

# 2. Buat & aktifkan virtual environment (Opsional)
python -m venv venv
venv\Scripts\activate  # Windows

# 3. Install paket dependensi
pip install -r requirements.txt

# 4. Jalankan server FastAPI
uvicorn appv2:app --reload --host 0.0.0.0 --port 8000
```
* Akses Swagger UI: `http://localhost:8000/docs`

---

## 6.3 Menjalankan Frontend Web Next.js
```bash
# 1. Masuk ke direktori root web
cd aquaagent-web

# 2. Install dependensi Node.js
npm install

# 3. Jalankan development server
npm run dev
```
* Akses Web Dashboard: `http://localhost:3000`

---

## 6.4 Flash & Upload Program ESP32 (`iot/main.py`)
1. Buka software Thonny IDE atau VS Code (Pymakr).
2. Hubungkan papan ESP32 ke port USB komputer.
3. Sesuaikan konfigurasi pada `iot/main.py`:
   * `SSID = "Nama_WiFi"`
   * `PASSWORD = "Password_WiFi"`
   * `BASE_URL = "http://<IP_KOMPUTER_SERVER>:8000"`
4. Unggah file `main.py` ke direktori root ESP32 (`/main.py`).
5. Tekan tombol EN/RST pada ESP32 untuk memulai pemantauan.
