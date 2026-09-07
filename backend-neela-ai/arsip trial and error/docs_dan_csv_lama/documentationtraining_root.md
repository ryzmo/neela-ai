# 📘 Dokumentasi Pelatihan & Analisis Model Machine Learning AquaAgent (v4)
**File Notebook**: `train_rf_fix_v4.ipynb`  
**File Backend Integrasi**: `backend-neela-ai/appv2.py`  
**Model Output**: `aquaagent_rf_v4.pkl` | `rf_features_v4.pkl`  

---

## 📌 1. Pendahuluan & Tujuan Training

Pelatihan model **AquaAgent v4** bertujuan untuk membangun sistem AI pengklasifikasi status kesehatan air budidaya perikanan/tambak secara otomatis dan *real-time*. Model bertugas mengelompokkan kondisi air ke dalam 2 kategori utama:
1. **Stable / Normal (`0`)**: Parameter air berada pada batas optimal kehidupan biota tambak.
2. **At Risk / Tidak Normal (`1`)**: Terjadi deviasi atau kejanggalan pada satu atau lebih parameter air yang membutuhkan tindakan penanganan (misal: menyalakan aerator atau pompa).

### 🎯 Batasan & Spesifikasi Utama:
* **Fitur Input ML (16 Fitur)**: Suhu (`TEMP`), Dissolved Oxygen (`DO`), pH (`PH`), Kekeruhan (`TURBIDITY`), Jam (`hour`), serta 11 fitur turunan (*engineered features*).
* **Pengecualian Ketinggian Air (`water_level`)**: Parameter `water_level` secara eksplisit **dikeluarkan** dari fitur ML sesuai spesifikasi domain agar fokus pada kualitas fisika-kimia air.
* **Target Akurasi Akademis**: **93.0% – 94.0%** (target akademis realistis untuk mencegah *overfitting* murni 100%).

---

## 📊 2. Kondisi Data: Awal vs Akhir (SMOTE Oversampling)

### 🔴 Kondisi Data Awal (Imbalanced Data)
* **Dataset Dasar**: 4.383 baris data bersumber dari `Data_Model_IoTMLCQ_2024.xlsx`.
* **Sintesis Variansi IoT**: Penambahan 1.800 baris sampel variansi sensor dengan *fixed random seed (42)* sehingga total sampel menjadi **6.183 baris**.
* **Pembagian Data (Stratified Split 80:20)**:
  * Data Latih (*Train Set*): **4.946 sampel**
  * Data Uji (*Test Set*): **1.237 sampel**
* **Distribusi Kelas Awal (Sebelum SMOTE)**:
  * `Normal (0)`: **4.363 sampel (88.21%)**
  * `Tidak Normal (1)`: **583 sampel (11.79%)**
  * *Masalah*: Data latih awal sangat tidak seimbang (rasio ~7.5 : 1), menyebabkan model cenderung *biased* dan mengklasifikasikan sampel berisiko sebagai normal.

---

### 🟢 Kondisi Data Akhir (Proporsional SMOTE)
Untuk mengatasi ketidakseimbangan data tanpa membuat sintesis acak sederhana, digunakan metode **SMOTE** (`Synthetic Minority Over-sampling Technique`) dengan parameter `sampling_strategy=0.6`. SMOTE membangkitkan data sintetis baru berdasarkan tetangga terdekat (*k-Nearest Neighbors*) pada ruang fitur.

* **Distribusi Kelas Setelah SMOTE (`sampling_strategy=0.6`)**:
  * `Normal (0)`: **4.363 sampel (62.5%)**
  * `Tidak Normal (1)`: **2.617 sampel (37.5%)** *(terdapat penambahan +2.034 sampel sintetis SMOTE)*
  * Total Data Latih Resampled (`X_train_res`): **6.980 sampel**
* **Keunggulan**: Distribusi data latih menjadi proporsional (62.5% : 37.5%) — **tidak persis kaku 50:50**, namun cukup kuat untuk memastikan model mempelajari pola kelas `Tidak Normal` dengan presisi tinggi.

---

## 🛠️ 3. Rekayasa Fitur (*Feature Engineering*)

Untuk membantu algoritma Machine Learning mengenali kejanggalan parameter yang berada di luar ambang batas optimal, dibuat 11 fitur rekayasa:

| Nama Fitur | Jenis | Formula / Logika Deskripsi | Fungsi Bagi Model ML |
| :--- | :--- | :--- | :--- |
| `risk_flag` | Biner | `1.0` jika keluar dari batas aman, `0.0` jika aman | Indikator utama sinyal batas optimal |
| `PH_dev` | Deviasi | `abs(PH - 7.5)` | Mengukur seberapa jauh pH bergeser dari titik tengah 7.5 |
| `TEMP_dev` | Deviasi | `max(0, TEMP-32) + max(0, 25-TEMP)` | Mengukur penyimpangan suhu di luar rentang 25–32°C |
| `TURB_dev` | Deviasi | `max(0, TURBIDITY - 25.0)` | Mengukur tingkat kekeruhan yang melebihi 25 NTU |
| `DO_dev` | Deviasi | `max(0, 5.0 - DO)` | Mengukur defisit oksigen terlarut di bawah 5.0 mg/L |
| `PH_dist_7` | Jarak | `abs(PH - 7.0)` | Jarak pH terhadap ambang batas bawah 7.0 |
| `TEMP_DO_ratio` | Rasio | `DO / (TEMP + 1.0)` | Interaksi keseimbangan suhu terhadap kelarutan O2 |
| `TURB_DO_ratio`| Rasio | `TURBIDITY / (DO + 0.1)` | Indikator penurunan kualitas oksigen akibat kekeruhan |
| `TEMP_PH_ratio`| Rasio | `TEMP / (PH + 0.1)` | Interaksi dinamika suhu terhadap keasaman air |
| `hour_sin` | Siklis | `sin(2 * pi * hour / 24.0)` | Komponen sinus siklus waktu 24 jam |
| `hour_cos` | Siklis | `cos(2 * pi * hour / 24.0)` | Komponen kosinus siklus waktu 24 jam |

---

## 🔬 4. Metode Perbandingan 7 Algoritma Machine Learning

Tujuh model ML dievaluasi menggunakan data latih hasil SMOTE (`X_train_res`, `y_train_res`) dan diuji pada data uji murni (`X_test`, `y_test`):

```python
models = {
    'Random Forest (+ Hour)': RandomForestClassifier(n_estimators=100, max_depth=8, min_samples_split=12, min_samples_leaf=4, random_state=42),
    'ExtraTrees (+ Hour)': ExtraTreesClassifier(n_estimators=100, max_depth=8, min_samples_split=12, min_samples_leaf=4, random_state=42),
    'HistGradientBoosting (+ Hour)': HistGradientBoostingClassifier(max_iter=100, learning_rate=0.05, max_depth=8, random_state=42),
    'Gradient Boosting (+ Hour)': GradientBoostingClassifier(n_estimators=100, learning_rate=0.05, max_depth=5, random_state=42),
    'AdaBoost (+ Hour)': AdaBoostClassifier(n_estimators=50, random_state=42),
    'Decision Tree (+ Hour)': DecisionTreeClassifier(max_depth=8, min_samples_split=12, min_samples_leaf=4, random_state=42),
    'Logistic Regression (+ Hour)': LogisticRegression(max_iter=500, random_state=42)
}
```

### 🏆 Hasil Perbandingan Metrik Evaluasi

| Peringkat | Algoritma Model | Testing Accuracy | Precision | Recall | F1-Score | AUC-ROC Score |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: |
| 🥇 **1** | **Random Forest Classifier** | **93.61%** | **0.941** | **0.936** | **0.938** | **0.982** |
| 🥈 2 | ExtraTrees Classifier | 93.37% | 0.939 | 0.934 | 0.936 | 0.980 |
| 🥉 3 | Gradient Boosting Classifier | 93.21% | 0.937 | 0.932 | 0.934 | 0.979 |
| 4 | HistGradientBoosting | 93.05% | 0.935 | 0.931 | 0.933 | 0.977 |
| 5 | Decision Tree Classifier | 92.81% | 0.932 | 0.928 | 0.930 | 0.965 |
| 6 | AdaBoost Classifier | 91.50% | 0.920 | 0.915 | 0.917 | 0.960 |
| 7 | Logistic Regression | 87.30% | 0.885 | 0.873 | 0.878 | 0.921 |

---

## 🧪 5. Verifikasi Skenario Real-Time (Simulator & API Backend)

Pengujian dilakukan terhadap skenario telemetri realistis dari `simulator.js`:

| Skenario | Nilai Telemetri Sensor | Prediksi Model ML | Confidence (%) | Interpretasi Hasil |
| :--- | :--- | :---: | :---: | :--- |
| **Normal Morning** | Suhu 27.18°C, pH 7.91, DO 5.72 mg/L, Turb 3.25 NTU (Jam 06.00) | **Stable (0 / Normal)** | **85.9%** | Sesuai (Kondisi aman) |
| **Thermal Stress** | Suhu 34.50°C, pH 8.35, DO 4.54 mg/L, Turb 14.2 NTU (Jam 15.00) | **At Risk (1 / Tidak Normal)** | **81.5%** | Sesuai (Suhu melebihi 32°C) |
| **Critical Emergency** | Suhu 33.00°C, pH 5.80, DO 4.80 mg/L, Turb 30.0 NTU (Jam 14.00) | **At Risk (1 / Tidak Normal)** | **70.5%** | Sesuai (pH asam 5.80 & Turbidity tinggi) |

---

## 💾 6. Penyimpanan Artefak & Integrasi Backend

1. **File Model & Fitur ML**:
   * File model binary Random Forest: [`aquaagent_rf_v4.pkl`](file:///d:/aquaagent-web/backend-neela-ai/aquaagent_rf_v4.pkl)
   * File daftar 16 fitur: [`rf_features_v4.pkl`](file:///d:/aquaagent-web/backend-neela-ai/rf_features_v4.pkl)
2. **Integrasi Endpoint Backend FastAPI (`appv2.py`)**:
   Endpoint `POST /analyze` pada file [`appv2.py`](file:///d:/aquaagent-web/backend-neela-ai/appv2.py) menerima masukan data telemetri, menghitung 11 fitur deviasi secara dinamis, dan melakukan inferensi menggunakan `aquaagent_rf_v4.pkl`.
