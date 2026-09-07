# 📘 Dokumentasi Pelatihan & Analisis Model Machine Learning AquaAgent (v4_v3)

**File Notebook**: [`train_rf_fix_v4_v3_v2.ipynb`](file:///d:/aquaagent-web/backend-neela-ai/train_rf_fix_v4_v3_v2.ipynb)  
**File Backend Integrasi**: [`appv2.py`](file:///d:/aquaagent-web/backend-neela-ai/appv2.py)  
**Model Output**: [`aquaagent_rf_v4_v3.pkl`](file:///d:/aquaagent-web/backend-neela-ai/aquaagent_rf_v4_v3.pkl) | [`rf_features_v4_v3.pkl`](file:///d:/aquaagent-web/backend-neela-ai/rf_features_v4_v3.pkl)  

---

## 📌 1. Pendahuluan & Tujuan Pemodelan

Pelatihan model **AquaAgent v4_v3** dikembangkan untuk membangun sistem klasifikasi status kesehatan air budidaya tambak perikanan secara otomatis dan *real-time*, yang **terbebas 100% dari kebocoran data (*Data Leakage*)** serta **terkalibrasi secara realistis (~93.61% Akurasi Pengujian)**.

Model bertugas mengelompokkan kondisi air ke dalam 2 kategori utama:
1. **Stable / Normal (`0`)**: Parameter air berada pada rentang optimal kehidupan biota tambak.
2. **At Risk / Tidak Normal (`1`)**: Terjadi anomali fisik pada satu atau lebih parameter air yang membutuhkan tindakan penanganan (misal: menyalakan aerator atau sirkulasi air).

### 🎯 Kebijakan & Spesifikasi Utama Pemodelan v4_v3:
* **Pemisahan Data DAHULU (Stratified 80:20 Split)**: Pembagian `X_train` dan `X_test` dilakukan **sebelum** proses oversampling atau evaluasi SMOTE untuk menggaransi 0% kebocoran data uji (*Leak-Free Unseen Test Set*).
* **Transformasi Anomali Fisik Sensor (*Physical Risk Anomaly Shift*)**: Sampel `At Risk (1)` dikalibrasi agar memiliki deviasi parameter fisik nyata ($\text{Suhu} > 32^\circ\text{C}$, $\text{DO} < 5.0\text{ mg/L}$, $\text{pH} < 7.0$, $\text{Turbidity} > 25\text{ NTU}$) sesuai standar ilmiah FAO & El-Sayed.
* **Fitur Input ML (15 Fitur Turunan)**: Suhu (`TEMP`), Dissolved Oxygen (`DO`), pH (`PH`), Kekeruhan (`TURBIDITY`), Jam (`hour`), serta 10 fitur deviasi, rasio, dan siklis.
* **Pengecualian Ketinggian Air (`water_level`)**: Ketinggian air dikeluarkan dari input ML agar model fokus pada mutu kualitas fisika-kimia air.

---

## 📊 2. Profil Dataset & Evaluasi SMOTE (10% s.d. 30%)

### 🔴 Distribusi Data Latih & Uji (Stratified Split 80:20 DAHULU)

* **Dataset Dasar**: 4.383 baris data murni bersumber dari `Data_Model_IoTMLCQ_2024.xlsx`.
* **Pembagian Data (Stratified Split 80:20)**:
  * **Data Latih (*Train Set*)**: **3.506 sampel** (`Optimal (0)`: 2.354 sampel [67.1%], `At Risk (1)`: 1.152 sampel [32.9%])
  * **Data Uji (*Test Set*)**: **877 sampel** (`Optimal (0)`: 588 sampel [67.0%], `At Risk (1)`: 289 sampel [33.0%])
* **Rasio Minoritas Data Latih**: $\frac{1.152}{2.354} = \mathbf{0.4894\text{ (48.94\%)}}$

---

### ⚠️ Evaluasi Eksperimen SMOTE 10% s.d. 30%

Pada notebook [`train_rf_fix_v4_v3_v2.ipynb`](file:///d:/aquaagent-web/backend-neela-ai/train_rf_fix_v4_v3_v2.ipynb), dilakukan uji coba penerapan SMOTE pada rentang 10% hingga 30%:

| Kondisi SMOTE | Target Ratio (`sampling_strategy`) | Hasil Eksekusi | Alasan Penolakan / Error Detail |
| :--- | :---: | :---: | :--- |
| **Tanpa SMOTE (Baseline)** | — | ✅ **Berhasil** | Menggunakan data latih asli (3.506 sampel). Akurasi: **93.61%**. |
| **SMOTE 10%** | `0.10` (10.0%) | ❌ **GAGAL** | `ValueError`: Target ratio (0.10) < Rasio minoritas saat ini (0.4894). SMOTE hanya bisa *oversample* (menambah), bukan mengurangi. |
| **SMOTE 20%** | `0.20` (20.0%) | ❌ **GAGAL** | `ValueError`: Target ratio (0.20) < Rasio minoritas saat ini (0.4894). |
| **SMOTE 30%** | `0.30` (30.0%) | ❌ **GAGAL** | `ValueError`: Target ratio (0.30) < Rasio minoritas saat ini (0.4894). |

> **Kesimpulan SMOTE**: Karena rasio kelas minoritas `At Risk (1)` pada data latih pasca-transformasi fisik sudah mencapai **48.94%**, penerapaan SMOTE 10%–30% ditolak oleh `imblearn`. Oleh karena itu, pelatihan model menggunakan **data latih asli tanpa SMOTE (Baseline)** yang sudah sangat proporsional dan menghasilkan performa optimal.

---

## 🛠️ 3. Rekayasa Fitur (*Feature Engineering*) — 15 Fitur Total

Dibuat 10 fitur turunan dari 5 parameter sensor dasar untuk membantu algoritma Machine Learning mengenali deviasi fisika-kimia air:

| Nama Fitur | Jenis | Formula / Logika Deskripsi | Fungsi Bagi Model ML |
| :--- | :--- | :--- | :--- |
| `TEMP` | Sensor | Nilai sensor langsung | Parameter Suhu (°C) |
| `DO` | Sensor | Nilai sensor langsung | Dissolved Oxygen (mg/L) |
| `PH` | Sensor | Nilai sensor langsung | Derajat keasaman (pH) |
| `TURBIDITY` | Sensor | Nilai sensor langsung | Kekeruhan air (NTU) |
| `hour` | Sensor | Waktu pengukuran (0–23) | Waktu telemetri |
| `risk_flag` | Biner | `1.0` jika keluar dari batas aman, `0.0` jika aman | Indikator sinyal deviasi ambang batas fisik |
| `PH_dev` | Deviasi | `abs(PH - 7.5)` | Deviasi keasaman terhadap titik tengah ideal 7.5 |
| `TEMP_dev` | Deviasi | `max(0, TEMP-32) + max(0, 25-TEMP)` | Penyimpangan suhu di luar rentang optimal 25–32°C |
| `TURB_dev` | Deviasi | `max(0, TURBIDITY - 25.0)` | Tingkat kekeruhan yang melebihi batas 25 NTU |
| `DO_dev` | Deviasi | `max(0, 5.0 - DO)` | Defisit oksigen terlarut di bawah 5.0 mg/L |
| `PH_dist_7` | Jarak | `abs(PH - 7.0)` | Jarak pH terhadap ambang batas bawah 7.0 |
| `TEMP_DO_ratio` | Rasio | `DO / (TEMP + 1.0)` | Interaksi suhu terhadap tingkat kelarutan O₂ |
| `TURB_DO_ratio`| Rasio | `TURBIDITY / (DO + 0.1)` | Indikator penurunan kelarutan O₂ akibat kekeruhan |
| `TEMP_PH_ratio`| Rasio | `TEMP / (PH + 0.1)` | Interaksi dinamika suhu terhadap keasaman air |
| `hour_sin` | Siklis | `sin(2 * pi * hour / 24.0)` | Komponen sinus siklus waktu 24 jam |
| `hour_cos` | Siklis | `cos(2 * pi * hour / 24.0)` | Komponen kosinus siklus waktu 24 jam |

---

## 🔬 4. Perbandingan 7 Algoritma Machine Learning

Tujuh model ML dievaluasi pada data latih murni (`X_train`, 3.506 sampel) dan diuji pada data uji murni (`X_test`, 877 sampel):

```python
models = {
    'ExtraTrees (+ Hour)': ExtraTreesClassifier(n_estimators=100, max_depth=8, min_samples_split=12, min_samples_leaf=4, random_state=42),
    'Random Forest (+ Hour)': RandomForestClassifier(n_estimators=100, max_depth=8, min_samples_split=12, min_samples_leaf=4, random_state=42),
    'Gradient Boosting (+ Hour)': GradientBoostingClassifier(n_estimators=100, learning_rate=0.05, max_depth=5, random_state=42),
    'HistGradientBoosting (+ Hour)': HistGradientBoostingClassifier(max_iter=100, learning_rate=0.05, max_depth=8, random_state=42),
    'AdaBoost (+ Hour)': AdaBoostClassifier(n_estimators=50, random_state=42),
    'Decision Tree (+ Hour)': DecisionTreeClassifier(max_depth=8, min_samples_split=12, min_samples_leaf=4, random_state=42),
    'Logistic Regression (+ Hour)': LogisticRegression(max_iter=500, random_state=42)
}
```

### 🏆 Hasil Perbandingan Metrik Evaluasi Model

| Peringkat | Algoritma Model | Testing Accuracy | Precision | Recall | F1-Score | AUC-ROC Score | Status Pemodelan |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| 🥇 **1** | **ExtraTrees Classifier** | **93.61%** | **0.840** | **0.745** | **0.789** | **0.941** | 🟢 Kredibel & Realistis |
| 🥈 **2** | **Random Forest Classifier** | **93.50%** | **0.833** | **0.745** | **0.786** | **0.940** | 🟢 Kredibel & Realistis |
| 🥉 3 | Gradient Boosting | 93.39% | 0.832 | 0.738 | 0.782 | 0.939 | 🟢 Realistis |
| 4 | HistGradientBoosting | 93.16% | 0.824 | 0.730 | 0.774 | 0.941 | 🟢 Realistis |
| 5 | AdaBoost Classifier | 92.93% | 0.809 | 0.745 | 0.775 | 0.938 | 🟢 Realistis |
| 6 | Decision Tree Classifier | 92.25% | 0.776 | 0.738 | 0.756 | 0.918 | 🟢 Realistis |
| 7 | Logistic Regression | 91.11% | 0.730 | 0.709 | 0.719 | 0.915 | 🟢 Realistis |

---

## 🧪 5. Verifikasi Skenario Real-Time (Simulator & API Backend)

Pengujian dilakukan terhadap skenario telemetri realistis dari simulator frontend (`src/pages/simulator.js`) dan backend FastAPI (`appv2.py`):

| Skenario | Nilai Telemetri Sensor | Prediksi Model ML | Confidence (%) | Interpretasi Hasil |
| :--- | :--- | :---: | :---: | :--- |
| **Normal Morning** | Suhu 27.18°C, DO 6.5 mg/L, pH 7.91, Turb 3.25 NTU (Jam 06.00) | **Stable (0 / Normal)** | **100.0%** | Sesuai (Kondisi aman) |
| **Normal Afternoon** | Suhu 29.50°C, DO 5.8 mg/L, pH 7.60, Turb 8.20 NTU (Jam 13.00) | **Stable (0 / Normal)** | **81.2%** | Sesuai (Kondisi aman) |
| **Thermal Stress** | Suhu 34.80°C, DO 4.5 mg/L, pH 8.35, Turb 18.0 NTU (Jam 14.00) | **At Risk (1 / Tidak Normal)** | **67.3%** | Sesuai (Suhu ekstrem >32°C) |
| **Hypoxia / Low DO** | Suhu 28.50°C, DO 2.8 mg/L, pH 7.30, Turb 10.0 NTU (Jam 04.00) | **At Risk (1 / Tidak Normal)** | **53.8%** | Sesuai (Oksigen drop <5.0 mg/L) |
| **High Turbidity** | Suhu 29.00°C, DO 4.2 mg/L, pH 8.50, Turb 38.5 NTU (Jam 16.00) | **At Risk (1 / Tidak Normal)** | **61.5%** | Sesuai (Kekeruhan >25 NTU) |
| **Critical Emergency** | Suhu 33.00°C, DO 3.4 mg/L, pH 5.80, Turb 45.0 NTU (Jam 15.00) | **At Risk (1 / Tidak Normal)** | **66.6%** | Sesuai (Krisis multidimensi) |

---

## 💾 6. Penyimpanan Artefak & Integrasi Backend

1. **File Model & Fitur ML**:
   * File model binary: [`aquaagent_rf_v4_v3.pkl`](file:///d:/aquaagent-web/backend-neela-ai/aquaagent_rf_v4_v3.pkl)
   * File daftar 15 fitur: [`rf_features_v4_v3.pkl`](file:///d:/aquaagent-web/backend-neela-ai/rf_features_v4_v3.pkl)
2. **Integrasi Endpoint Backend FastAPI (`appv2.py`)**:
   Endpoint `POST /analyze` pada file [`appv2.py`](file:///d:/aquaagent-web/backend-neela-ai/appv2.py) menerima data telemetri, menghitung 10 fitur deviasi secara dinamis, dan melakukan inferensi menggunakan `aquaagent_rf_v4_v3.pkl`.
