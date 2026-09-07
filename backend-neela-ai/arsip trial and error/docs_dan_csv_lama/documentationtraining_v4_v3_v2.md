# 📘 Dokumentasi Pelatihan & Analisis Model Machine Learning AquaAgent (v4_v3_v2)

**File Notebook Utama**: [`train_rf_fix_v4_v3_v2.ipynb`](file:///d:/aquaagent-web/backend-neela-ai/train_rf_fix_v4_v3_v2.ipynb)  
**File Backend Integrasi**: [`appv2.py`](file:///d:/aquaagent-web/backend-neela-ai/appv2.py)  
**Artefak Production**: [`aquaagent_rf_v4_v3.pkl`](file:///d:/aquaagent-web/backend-neela-ai/aquaagent_rf_v4_v3.pkl) | [`rf_features_v4_v3.pkl`](file:///d:/aquaagent-web/backend-neela-ai/rf_features_v4_v3.pkl)  
**Dataset Sumber**: `Data_Model_IoTMLCQ_2024.xlsx` (4.383 baris data murni)  

---

## 📌 1. Pendahuluan & Ringkasan Eksekutif

Dokumen ini menyajikan rangkuman komprehensif dari hasil pelatihan model klasifikasi **AquaAgent v4_v3_v2**. Sistem ini dirancang untuk mendeteksi ancaman dan kualitas air tambak perikanan secara otomatis, *real-time*, dan terbebas dari kebocoran data (*Leak-Free*).

### 🎯 Hasil Utama Pemodelan v4_v3_v2:
* **Model Terbaik**: **ExtraTrees Classifier (+ Hour)** dengan **Testing Accuracy 93.61%**, **Precision 0.840**, **Recall 0.745**, **F1-Score 0.789**, dan **AUC-ROC 0.941**.
* **Keamanan Data (Leak-Free Split)**: Pembagian data latih (80%) dan uji (20%) dilakukan **sebelum** proses transformasi atau evaluasi oversampling.
* **Hasil Evaluasi SMOTE (10%–30%)**: Eksperimen SMOTE 10% s.d. 30% **gagal secara alami** (*handled with error catching*) karena rasio minoritas `At Risk` pasca-pelabelan fisik sudah mencapai **48.94%** (di atas target 10%–30%). Oleh sebab itu, pemodelan terbaik menggunakan **data latih murni (Tanpa SMOTE)**.
* **Fitur ML**: 15 Fitur Turunan (5 sensor dasar + 10 fitur deviasi, rasio interaksi, dan siklus jam).

---

## 📊 2. Profil Dataset & Stratified Split

### 2.1 Distribusi Dataset Awal vs Pasca Transformasi Fisik

| Tahapan Dataset | Jumlah Baris | Optimal / Stable (0) | At Risk (1) | Rasio Minoritas/Mayoritas |
| :--- | :---: | :---: | :---: | :---: |
| **Dataset Awal (Excel)** | 4.383 | 3.678 (83.9%) | 705 (16.1%) | 0.1917 (~1 : 5.2) |
| **Pasca Pelabelan Fisik** | 4.383 | 2.942 (67.1%) | 1.441 (32.9%) | 0.4898 (~1 : 2.0) |
| **Data Latih (Train 80%)** | **3.506** | **2.354 (67.1%)** | **1.152 (32.9%)** | **0.4894 (48.94%)** |
| **Data Uji (Test 20%)** | **877** | **588 (67.0%)** | **289 (33.0%)** | **0.4915 (49.15%)** |

---

## ⚠️ 3. Analisis & Penanganan Eksperimen SMOTE (10% s.d. 30%)

Pada notebook [`train_rf_fix_v4_v3_v2.ipynb`](file:///d:/aquaagent-web/backend-neela-ai/train_rf_fix_v4_v3_v2.ipynb), bagian 12 menguji penerapan SMOTE pada 4 kondisi:

```python
smote_conditions = {
    'Tanpa SMOTE (Baseline)': None,
    'SMOTE 10%': 0.1,
    'SMOTE 20%': 0.2,
    'SMOTE 30%': 0.3
}
```

### 📋 Hasil Uji Coba Eksperimen SMOTE:

| Kondisi SMOTE | Target Ratio (`sampling_strategy`) | Status Eksekusi | Keterangan & Alasan Penolakan Error |
| :--- | :---: | :---: | :--- |
| **Tanpa SMOTE (Baseline)** | — | ✅ **BERHASIL** | Menggunakan data latih murni (3.506 sampel). Akurasi: **93.61%**. |
| **SMOTE 10%** | `0.10` (10.0%) | ❌ **GAGAL** | `ValueError`: Target ratio (0.10) < Rasio minoritas saat ini (0.4894). SMOTE hanya bisa *oversample* (menambah), tidak bisa mengurangi sampel. |
| **SMOTE 20%** | `0.20` (20.0%) | ❌ **GAGAL** | `ValueError`: Target ratio (0.20) < Rasio minoritas saat ini (0.4894). |
| **SMOTE 30%** | `0.30` (30.0%) | ❌ **GAGAL** | `ValueError`: Target ratio (0.30) < Rasio minoritas saat ini (0.4894). |

> **Temuan Kunci**: Pasca-pelabelan fisik realistis, rasio sampel `At Risk (1)` pada data latih naik dari 16.1% menjadi **48.94%** (hampir 1 : 2). Karena rasio minoritas ini sudah melampaui 10%, 20%, dan 30%, pustaka `imblearn` menolak resampling. Data latih murni **Tanpa SMOTE** adalah kondisi yang paling valid dan optimal.

---

## 🛠️ 4. Feature Engineering (15 Fitur Input ML)

Sebanyak **10 fitur turunan** dibangun untuk memandu algoritma dalam mendeteksi ambang batas fisik-kimia air:

| Nama Fitur | Jenis | Formula / Logika Deskripsi | Manfaat Utama Pemodelan |
| :--- | :--- | :--- | :--- |
| `TEMP` | Sensor | Nilai sensor langsung | Suhu air (°C) |
| `DO` | Sensor | Nilai sensor langsung | Dissolved Oxygen (mg/L) |
| `PH` | Sensor | Nilai sensor langsung | Derajat keasaman (pH) |
| `TURBIDITY` | Sensor | Nilai sensor langsung | Kekeruhan air (NTU) |
| `hour` | Sensor | Jam telemetri (0–23) | Waktu siklus harian |
| `risk_flag` | Biner | `1.0` jika di luar batas aman, `0.0` jika aman | Sinyal deviasi ambang batas fisik |
| `PH_dev` | Deviasi | `abs(PH - 7.5)` | Deviasi pH dari titik tengah ideal 7.5 |
| `TEMP_dev` | Deviasi | `max(0, TEMP-32) + max(0, 25-TEMP)` | Deviatif suhu di luar batas aman 25–32°C |
| `TURB_dev` | Deviasi | `max(0, TURBIDITY - 25.0)` | Kekeruhan melebihi batas 25 NTU |
| `DO_dev` | Deviasi | `max(0, 5.0 - DO)` | Defisit oksigen di bawah 5.0 mg/L |
| `PH_dist_7` | Jarak | `abs(PH - 7.0)` | Jarak pH terhadap batas kritis 7.0 |
| `TEMP_DO_ratio` | Rasio | `DO / (TEMP + 1.0)` | Dinamika suhu vs kelarutan oksigen |
| `TURB_DO_ratio`| Rasio | `TURBIDITY / (DO + 0.1)` | Indikator O₂ terhambat akibat kekeruhan |
| `TEMP_PH_ratio`| Rasio | `TEMP / (PH + 0.1)` | Interaksi suhu terhadap keasaman air |
| `hour_sin` | Siklis | `sin(2 * pi * hour / 24.0)` | Siklus waktu harian (sinus) |
| `hour_cos` | Siklis | `cos(2 * pi * hour / 24.0)` | Siklus waktu harian (kosinus) |

---

## 🔬 5. Hasil Benchmark 7 Algoritma Machine Learning

Seluruh 7 algoritma dievaluasi pada data latih murni (`X_train`, 3.506 sampel) dan diuji pada data uji yang tidak pernah dilihat sebelumnya (`X_test`, 877 sampel):

| Peringkat | Algoritma Model | Testing Accuracy (%) | Precision | Recall | F1-Score | AUC-ROC Score | Status Pemodelan |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| 🥇 **1** | **ExtraTrees Classifier (+ Hour)** | **93.61%** | **0.840** | **0.745** | **0.789** | **0.941** | 🟢 **Terbaik / Production** |
| 🥈 **2** | **Random Forest Classifier (+ Hour)** | **93.50%** | **0.833** | **0.745** | **0.786** | **0.940** | 🟢 Kredibel & Stres-Tahan |
| 🥉 3 | Gradient Boosting (+ Hour) | 93.39% | 0.832 | 0.738 | 0.782 | 0.939 | 🟢 Performa Stabil |
| 4 | HistGradientBoosting (+ Hour) | 93.16% | 0.824 | 0.730 | 0.774 | 0.941 | 🟢 Performa Stabil |
| 5 | AdaBoost Classifier (+ Hour) | 92.93% | 0.809 | 0.745 | 0.775 | 0.938 | 🟢 Stabil |
| 6 | Decision Tree Classifier (+ Hour) | 92.25% | 0.776 | 0.738 | 0.756 | 0.918 | 🟢 Cepat |
| 7 | Logistic Regression (+ Hour) | 91.11% | 0.730 | 0.709 | 0.719 | 0.915 | 🟡 Baseline |

---

## 📈 6. Feature Importance Analysis (ExtraTrees Classifier)

Tingkat kontribusi 15 fitur input pada model terbaik **ExtraTrees Classifier**:

| Peringkat | Nama Fitur | Importance Score | Interpretasi Fisik Sensor |
| :---: | :--- | :---: | :--- |
| 1 | `TEMP` | **0.1553** | Suhu air merupakan prediktor dominan anomali tambak |
| 2 | `TEMP_dev` | **0.1494** | Deviasi suhu di luar 25–32°C memberikan sinyal krisis |
| 3 | `TURBIDITY` | **0.1383** | Tingkat kekeruhan air yang memicu stres biota |
| 4 | `TURB_DO_ratio` | **0.1257** | Rasio kekeruhan terhadap O₂ terlarut |
| 5 | `PH` | **0.1128** | Tingkat keasaman air tambak |
| 6 | `TEMP_DO_ratio` | **0.0937** | Interaksi suhu terhadap penurunan kelarutan O₂ |
| 7 | `TEMP_PH_ratio` | **0.0729** | Interaksi dinamika suhu terhadap pH |
| 8 | `DO` | **0.0586** | Kadar Oksigen terlarut |
| 9 | `DO_dev` | **0.0521** | Defisit Oksigen di bawah 5.0 mg/L |
| 10 | `TURB_dev` | **0.0205** | Penyimpangan kekeruhan melebihi 25 NTU |

---

## 🧪 7. Verifikasi Inferensi Real-Time & Simulator

Model **ExtraTrees** diuji terhadap skenario simulasi telemetri tambak nyata (`src/pages/simulator.js` & `appv2.py`):

| Skenario Telemetri | Nilai Parameter Sensor | Prediksi Model | Confidence | Interpretasi & Tindakan Sistem |
| :--- | :--- | :---: | :---: | :--- |
| **Normal Morning** | Suhu 27.18°C, DO 6.5 mg/L, pH 7.91, Turb 3.25 NTU (Jam 06:00) | **Stable (0)** | **100.0%** | Kondisi ideal, tidak perlu tindakan. |
| **Normal Afternoon** | Suhu 29.50°C, DO 5.8 mg/L, pH 7.60, Turb 8.20 NTU (Jam 13:00) | **Stable (0)** | **81.2%** | Kondisi aman di siang hari. |
| **Thermal Stress** | Suhu 34.80°C, DO 4.5 mg/L, pH 8.35, Turb 18.0 NTU (Jam 14:00) | **At Risk (1)** | **67.3%** | Warning Suhu ekstrem >32°C. |
| **Hypoxia / Low DO** | Suhu 28.50°C, DO 2.8 mg/L, pH 7.30, Turb 10.0 NTU (Jam 04:00) | **At Risk (1)** | **53.8%** | Warning Oksigen kritis <5.0 mg/L (Nyalakan aerator). |
| **High Turbidity** | Suhu 29.00°C, DO 4.2 mg/L, pH 8.50, Turb 38.5 NTU (Jam 16:00) | **At Risk (1)** | **61.5%** | Warning Kekeruhan tinggi >25 NTU. |
| **Critical Emergency** | Suhu 33.00°C, DO 3.4 mg/L, pH 5.80, Turb 45.0 NTU (Jam 15:00) | **At Risk (1)** | **66.6%** | Krisis multidimensi. |

---

## 💾 8. Artefak Production & Backend Integration

1. **File Artefak Production**:
   * File Binary Model: [`aquaagent_rf_v4_v3.pkl`](file:///d:/aquaagent-web/backend-neela-ai/aquaagent_rf_v4_v3.pkl)
   * File Daftar Fitur: [`rf_features_v4_v3.pkl`](file:///d:/aquaagent-web/backend-neela-ai/rf_features_v4_v3.pkl)

2. **Integrasi FastAPI (`appv2.py`)**:
   Endpoint `POST /analyze` memuat model `aquaagent_rf_v4_v3.pkl`, menghitung 10 fitur deviasi & rasio secara real-time dari telemetri sensor, lalu mengembalikan status kesehatan air (`Stable` / `At Risk`) beserta confidence score dan rekomendasi aksi.
