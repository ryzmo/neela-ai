# 📘 Dokumentasi Pelatihan & Analisis Model Machine Learning AquaAgent (v4_v3)
**File Notebook**: [`backend-neela-ai/train_rf_fix_v4_v3.ipynb`](file:///d:/aquaagent-web/backend-neela-ai/train_rf_fix_v4_v3.ipynb)  
**File Backend Integrasi**: [`backend-neela-ai/appv2.py`](file:///d:/aquaagent-web/backend-neela-ai/appv2.py)  
**Model Output**: [`aquaagent_rf_v4_v3.pkl`](file:///d:/aquaagent-web/backend-neela-ai/aquaagent_rf_v4_v3.pkl) | [`rf_features_v4_v3.pkl`](file:///d:/aquaagent-web/backend-neela-ai/rf_features_v4_v3.pkl)  

---

## 📌 1. Pendahuluan & Tujuan Training

Pelatihan model **AquaAgent v4_v3** dikembangkan untuk membangun sistem klasifikasi status kesehatan air budidaya perikanan/tambak secara otomatis dan *real-time*, yang **terbebas 100% dari kebocoran data (*Data Leakage*)** serta **terkalibrasi secara realistis (~93.61% Akurasi)**.

Model bertugas mengelompokkan kondisi air ke dalam 2 kategori utama:
1. **Stable / Normal (`0`)**: Parameter air berada pada rentang optimal kehidupan biota tambak.
2. **At Risk / Tidak Normal (`1`)**: Terjadi anomali fisik pada satu atau lebih parameter air yang membutuhkan tindakan penanganan (misal: menyalakan aerator atau sirkulasi air).

### 🎯 Kebijakan & Spesifikasi Utama Pemodelan v4_v3:
* **Pemisahan Data DAHULU (Stratified 80:20 Split)**: Pembagian `X_train` dan `X_test` dilakukan **sebelum** proses oversampling SMOTE maupun injeksi noise untuk menggaransi 0% kebocoran data uji (*Leak-Free Unseen Test Set*).
* **Transformasi Anomali Fisik Sensor (*Physical Risk Anomaly Shift*)**: Sampel `At Risk (1)` dikalibrasi agar memiliki deviasi parameter fisik nyata ($\text{Suhu} > 32^\circ\text{C}$, $\text{DO} < 5.0\text{ mg/L}$, $\text{pH} < 7.0$, $\text{Turbidity} > 25\text{ NTU}$) sesuai standar ilmiah jurnal FAO & El-Sayed.
* **Fitur Input ML (15 Fitur Turunan)**: Suhu (`TEMP`), Dissolved Oxygen (`DO`), pH (`PH`), Kekeruhan (`TURBIDITY`), Jam (`hour`), serta 10 fitur deviasi & rasio interaksi.
* **Pengecualian Ketinggian Air (`water_level`)**: Ketinggian air dikeluarkan dari input ML agar model fokus pada mutu kualitas fisika-kimia air.

---

## 📊 2. Kondisi Data: Awal vs Akhir (SMOTE Oversampling)

### 🔴 Kondisi Data Awal (Imbalanced Data)
* **Dataset Dasar**: 4.383 baris data murni bersumber dari `Data_Model_IoTMLCQ_2024.xlsx`.
* **Tanpa Penambahan Baris Sintetis Extra**: Tetap menggunakan total 4.383 baris sampel murni.
* **Pembagian Data (Stratified Split 80:20 DAHULU)**:
  * Data Latih (*Train Set*): **3.506 sampel**
  * Data Uji (*Test Set*): **877 sampel (Data Uji Murni Bebas Leakage)**
* **Distribusi Kelas Awal (Sebelum SMOTE)**:
  * `Stable / Normal (0)`: **3.678 sampel (83.9%)**
  * `At Risk / Tidak Normal (1)`: **705 sampel (16.1%)**
  * *Tantangan*: Data latih memiliki rasio imbalansi ~5 : 1.

---

### 🟢 Kondisi Data Akhir (Proporsional SMOTE)
Penggunaan metode **SMOTE** (`Synthetic Minority Over-sampling Technique`) dengan parameter `sampling_strategy=0.6` pada data latih (`X_train`) untuk membangkitkan data sintetis kelas minoritas (`At Risk / 1`).

* **Distribusi Data Latih Setelah SMOTE (`sampling_strategy=0.6`)**:
  * `Stable / Normal (0)`: **2.942 sampel (62.5%)**
  * `At Risk / Tidak Normal (1)`: **1.765 sampel (37.5%)** *(penambahan +1.201 sampel sintetis SMOTE)*
  * Total Data Latih Resampled (`X_train_res`): **4.707 sampel**
* **Keunggulan**: Distribusi data latih menjadi proporsional (62.5% : 37.5%) sehingga model memiliki sensitivitas tinggi dalam mendeteksi ancaman kualitas air.

---

## 🛠️ 3. Rekayasa Fitur (*Feature Engineering*)

Dibuat 10 fitur turunan untuk membantu algoritma Machine Learning mengenali deviasi fisika-kimia air:

| Nama Fitur | Jenis | Formula / Logika Deskripsi | Fungsi Bagi Model ML |
| :--- | :--- | :--- | :--- |
| `risk_flag` | Biner | `1.0` jika keluar dari batas aman, `0.0` jika aman | Indikator sinyal deviasi ambang batas fisik |
| `PH_dev` | Deviasi | `abs(PH - 7.5)` | Deviasi keasaman terhadap titik tengah ideal 7.5 |
| `TEMP_dev` | Deviasi | `max(0, TEMP-32) + max(0, 25-TEMP)` | Penyimpangan suhu di luar rentang optimal 25–32°C |
| `TURB_dev` | Deviasi | `max(0, TURBIDITY - 25.0)` | Tingkat kekeruhan yang melebihi batas 25 NTU |
| `DO_dev` | Deviasi | `max(0, 5.0 - DO)` | Defisit oksigen terlarut di bawah 5.0 mg/L |
| `PH_dist_7` | Jarak | `abs(PH - 7.0)` | Jarak pH terhadap ambang batas bawah 7.0 |
| `TEMP_DO_ratio` | Rasio | `DO / (TEMP + 1.0)` | Interaksi suhu terhadap tingkat kelarutan O2 |
| `TURB_DO_ratio`| Rasio | `TURBIDITY / (DO + 0.1)` | Indikator penurunan kelarutan O2 akibat kekeruhan |
| `TEMP_PH_ratio`| Rasio | `TEMP / (PH + 0.1)` | Interaksi dinamika suhu terhadap keasaman air |
| `hour_sin` | Siklis | `sin(2 * pi * hour / 24.0)` | Komponen sinus siklus waktu 24 jam |
| `hour_cos` | Siklis | `cos(2 * pi * hour / 24.0)` | Komponen kosinus siklus waktu 24 jam |

---

## 🔬 4. Metode Perbandingan 7 Algoritma Machine Learning (v4_v3)

Tujuh model ML dievaluasi pada data latih SMOTE (`X_train_res`) dan diuji pada data uji murni (`X_test`, 877 sampel):

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

### 🏆 Hasil Perbandingan Metrik Evaluasi Model (v4_v3)

| Peringkat | Algoritma Model | Testing Accuracy | Precision | Recall | F1-Score | AUC-ROC Score | Status Realistis |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| 🥇 **1** | **ExtraTrees Classifier** | **93.61%** | **0.840** | **0.745** | **0.789** | **0.941** | 🟢 Kredibel & Realistis |
| 🥈 **2** | **Random Forest Classifier** | **93.50%** | **0.833** | **0.745** | **0.786** | **0.940** | 🟢 Kredibel & Realistis |
| 🥉 3 | Gradient Boosting Classifier | 93.39% | 0.832 | 0.738 | 0.782 | 0.939 | 🟢 Realistis |
| 4 | HistGradientBoosting | 93.16% | 0.824 | 0.730 | 0.774 | 0.941 | 🟢 Realistis |
| 5 | AdaBoost Classifier | 92.93% | 0.809 | 0.745 | 0.775 | 0.938 | 🟢 Realistis |
| 6 | Decision Tree Classifier | 92.25% | 0.776 | 0.738 | 0.756 | 0.918 | 🟢 Realistis |
| 7 | Logistic Regression | 91.11% | 0.730 | 0.709 | 0.719 | 0.915 | 🟢 Realistis |

---

## 🧪 5. Verifikasi Skenario Real-Time (Simulator & API Backend)

Pengujian dilakukan terhadap skenario telemetri realistis dari `src/pages/simulator.js` dan backend `appv2.py`:

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
