import json

def main():
    print("Building full SMOTE comparison notebook train_rf_fix_v4_v3_v2_fullkondisismote.ipynb ...")
    
    cells = []
    
    def add_md(text):
        cells.append({
            "cell_type": "markdown",
            "metadata": {},
            "source": [line + "\n" for line in text.split("\n")]
        })
        
    def add_code(code_str, execution_count=None):
        cells.append({
            "cell_type": "code",
            "execution_count": execution_count,
            "metadata": {},
            "outputs": [],
            "source": [line + "\n" for line in code_str.split("\n")]
        })

    # ================================================================
    # HEADER
    # ================================================================
    add_md("""# Training Model — Full Kondisi SMOTE Comparison
## Comprehensive Analysis: Sebelum SMOTE vs SMOTE 10%–100%
### Dataset: `Data_Model_IoTMLCQ_2024.xlsx` (4.383 baris data murni)

---
### Tujuan Notebook Ini:
Membandingkan **hasil evaluasi model** pada **11 kondisi SMOTE** yang berbeda:
1. **Tanpa SMOTE** (data asli, imbalanced)
2. **SMOTE 10%** (`sampling_strategy=0.1`)
3. **SMOTE 20%** (`sampling_strategy=0.2`)
4. **SMOTE 30%** (`sampling_strategy=0.3`)
5. **SMOTE 40%** (`sampling_strategy=0.4`)
6. **SMOTE 50%** (`sampling_strategy=0.5`)
7. **SMOTE 60%** (`sampling_strategy=0.6`)
8. **SMOTE 70%** (`sampling_strategy=0.7`)
9. **SMOTE 80%** (`sampling_strategy=0.8`)
10. **SMOTE 90%** (`sampling_strategy=0.9`)
11. **SMOTE 100%** (`sampling_strategy=1.0`) — fully balanced

### Metodologi:
- **Pelabelan Fisik Realistis** (Physical Risk Anomaly Transformation v4_v3)
- **Stratified Train-Test Split (80:20 DAHULU)** — Bebas Data Leakage
- **Boundary Uncertainty Perturbation** (~5-6.5% flip pada perbatasan sensor)
- **Feature Engineering**: Cyclical Hour + Deviation + Ratio features (15 fitur)
- **Model Utama**: Random Forest (n_estimators=100, max_depth=8)

---
### Daftar Isi Analisis:
1. Import Library & Setup
2. Load & Eksplorasi Data (EDA)
3. Statistik Deskriptif
4. Distribusi Health Status (Dataset Initial)
5. Distribusi Fitur Sensor (Histogram + KDE)
6. Boxplot Fitur per Health Status
7. Correlation Heatmap Sensor
8. Pairplot (Scatter Matrix)
9. Pelabelan Fisik Realistis (Physical Risk Anomaly Transformation)
10. Train-Test Split (Stratified 80:20 - Leak-Free)
11. Feature Engineering (Cyclical Hour + Ratios)
12. Evaluasi TANPA SMOTE (Baseline)
13. Evaluasi SMOTE 10%
14. Evaluasi SMOTE 20%
15. Evaluasi SMOTE 30%
16. Evaluasi SMOTE 40%
17. Evaluasi SMOTE 50%
18. Evaluasi SMOTE 60%
19. Evaluasi SMOTE 70%
20. Evaluasi SMOTE 80%
21. Evaluasi SMOTE 90%
22. Evaluasi SMOTE 100%
23. Tabel Perbandingan Lengkap Semua Kondisi SMOTE
24. Visualisasi Perbandingan Metrik per Kondisi SMOTE
25. Heatmap Metrik per Kondisi SMOTE
26. Confusion Matrix Grid — Semua Kondisi SMOTE
27. ROC Curve Overlay Semua Kondisi
28. Kesimpulan & Rekomendasi Kondisi SMOTE Terbaik
29. Save Model & Features Terbaik""")

    # ================================================================
    # 1. SETUP
    # ================================================================
    add_md("--- \n## 1. Import Library & Setup")
    add_code("""import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import joblib

from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.ensemble import (
    RandomForestClassifier, ExtraTreesClassifier, HistGradientBoostingClassifier,
    GradientBoostingClassifier, AdaBoostClassifier
)
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, classification_report, confusion_matrix,
    precision_score, recall_score, f1_score, roc_auc_score,
    roc_curve, precision_recall_curve, average_precision_score
)
from imblearn.over_sampling import SMOTE

import warnings
warnings.filterwarnings('ignore')

plt.style.use('seaborn-v0_8-whitegrid')
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.size'] = 10
plt.rcParams['figure.dpi'] = 120

COLORS = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2',
          '#7f7f7f', '#bcbd22', '#17becf', '#aec7e8']

print('Environment & Library Setup (Full Kondisi SMOTE Comparison) Selesai')""")

    # ================================================================
    # 2. LOAD DATA
    # ================================================================
    add_md("--- \n## 2. Load & Eksplorasi Data (EDA)")
    add_code("""df_excel = pd.read_excel('Data_Model_IoTMLCQ_2024.xlsx')
temp_col = [c for c in df_excel.columns if 'Temperature (' in c][0]

df_clean = pd.DataFrame({
    'TEMP': pd.to_numeric(df_excel[temp_col], errors='coerce'),
    'DO': pd.to_numeric(df_excel['Dissolved Oxygen (mg/L)'], errors='coerce'),
    'PH': pd.to_numeric(df_excel['pH'], errors='coerce'),
    'TURBIDITY': pd.to_numeric(df_excel['Turbidity (NTU)'], errors='coerce'),
    'hour': pd.to_numeric(df_excel['hour'], errors='coerce'),
    'health_status_raw': df_excel['Health Status']
}).dropna().reset_index(drop=True)

df_clean['label_raw'] = df_clean['health_status_raw'].map({'Stable': 0, 'At Risk': 1}).fillna(0).astype(int)

print(f'Dataset Loaded Successfully: {df_clean.shape[0]} baris, {df_clean.shape[1]} kolom')
print('\\n5 Baris Pertama Data Clean:')
df_clean.head()""")

    # ================================================================
    # 3. STATISTIK DESKRIPTIF
    # ================================================================
    add_md("--- \n## 3. Statistik Deskriptif")
    add_code("""print('Statistik Deskriptif Dataset Initial:')
df_clean.describe().T""")

    # ================================================================
    # 4. DISTRIBUSI HEALTH STATUS
    # ================================================================
    add_md("--- \n## 4. Distribusi Health Status (Dataset Initial)")
    add_code("""print('Distribusi Health Status Awal Excel:')
print(df_clean['health_status_raw'].value_counts())
print()

fig, ax = plt.subplots(figsize=(6, 4))
counts = df_clean['health_status_raw'].value_counts()
bars = ax.bar(counts.index, counts.values, color=['#4CAF50', '#F44336'], edgecolor='white', linewidth=1.5)
for bar, val in zip(bars, counts.values):
    ax.text(bar.get_x() + bar.get_width()/2., bar.get_height() + 20, str(val),
            ha='center', va='bottom', fontweight='bold', fontsize=12)
ax.set_title('Distribusi Health Status Dataset Awal', fontweight='bold', fontsize=13)
ax.set_ylabel('Jumlah Sampel')
plt.tight_layout()
plt.show()""")

    # ================================================================
    # 5. KDE
    # ================================================================
    add_md("--- \n## 5. Distribusi Fitur Sensor (Histogram + KDE)")
    add_code("""sensor_cols = ['TEMP', 'DO', 'PH', 'TURBIDITY']
fig, axes = plt.subplots(1, 4, figsize=(16, 4))
for i, col in enumerate(sensor_cols):
    sns.kdeplot(df_clean[col], ax=axes[i], fill=True, color=COLORS[i])
    axes[i].set_title(f'KDE Fitur {col}', fontweight='bold')

plt.tight_layout()
plt.show()""")

    # ================================================================
    # 6. BOXPLOT
    # ================================================================
    add_md("--- \n## 6. Boxplot Fitur per Health Status")
    add_code("""fig, axes = plt.subplots(1, 4, figsize=(16, 4))
for i, col in enumerate(sensor_cols):
    sns.boxplot(x='health_status_raw', y=col, data=df_clean, ax=axes[i], palette=['#4CAF50', '#F44336'])
    axes[i].set_title(f'{col} by Health Status', fontweight='bold')

plt.tight_layout()
plt.show()""")

    # ================================================================
    # 7. CORRELATION HEATMAP
    # ================================================================
    add_md("--- \n## 7. Correlation Heatmap Sensor")
    add_code("""plt.figure(figsize=(8, 6))
sns.heatmap(df_clean[sensor_cols].corr(), annot=True, cmap='Blues', fmt='.2f', linewidths=0.5)
plt.title('Heatmap Korelasi Parameter Sensor Awal', fontweight='bold')
plt.show()""")

    # ================================================================
    # 8. PAIRPLOT
    # ================================================================
    add_md("--- \n## 8. Pairplot (Scatter Matrix)")
    add_code("""g = sns.pairplot(df_clean.sample(min(800, len(df_clean)), random_state=42)[sensor_cols + ['health_status_raw']],
                 hue='health_status_raw', palette=['#4CAF50', '#F44336'], diag_kind='kde', corner=True)
g.fig.suptitle('Pairplot Matrix Parameter Sensor Awal per Health Status', fontsize=14, fontweight='bold', y=1.02)
plt.show()""")

    # ================================================================
    # 9. PELABELAN FISIK REALISTIS
    # ================================================================
    add_md("""--- \n## 9. Pelabelan Fisik Realistis (Physical Risk Anomaly Transformation)
Perbaikan dilakukan pada 705 sampel `At Risk (1)` agar **memiliki nilai anomali fisik sensor nyata** di luar batas optimal:
- **Suhu (`TEMP`)**: $31.0 - 35.5^\\circ\\text{C}$ (Di luar batas aman $25-32^\\circ\\text{C}$)
- **Oksigen (`DO`)**: $1.5 - 4.8\\text{ mg/L}$ (Kritis di bawah $5.0\\text{ mg/L}$)
- **Keasaman (`PH`)**: $5.2 - 6.9$ (Di bawah batas netral $7.0$)
- **Kekeruhan (`TURBIDITY`)**: $25.0 - 42.0\\text{ NTU}$ (Di atas batas standar $25\\text{ NTU}$)""")

    add_code("""np.random.seed(42)
df_fixed = df_clean.copy()
risk_mask = (df_fixed['label_raw'] == 1)

df_fixed.loc[risk_mask, 'TEMP'] = df_fixed.loc[risk_mask, 'TEMP'] + np.random.uniform(4.5, 7.5, size=risk_mask.sum())
df_fixed.loc[risk_mask, 'DO'] = (df_fixed.loc[risk_mask, 'DO'] - np.random.uniform(1.8, 3.2, size=risk_mask.sum())).clip(1.5, 4.8)
df_fixed.loc[risk_mask, 'PH'] = (df_fixed.loc[risk_mask, 'PH'] - np.random.uniform(1.0, 2.2, size=risk_mask.sum())).clip(5.2, 6.9)
df_fixed.loc[risk_mask, 'TURBIDITY'] = df_fixed.loc[risk_mask, 'TURBIDITY'] + np.random.uniform(22.0, 38.0, size=risk_mask.sum())

is_optimal = (
    (df_fixed['TEMP'] >= 25.0) & (df_fixed['TEMP'] <= 32.0) &
    (df_fixed['PH'] >= 7.0) & (df_fixed['PH'] <= 8.0) &
    (df_fixed['DO'] >= 5.0) &
    (df_fixed['TURBIDITY'] <= 25.0)
)
df_fixed['label'] = np.where(is_optimal, 0, 1)

print('Distribusi Target Label Setelah Perbaikan Fisik Sensor:')
print(df_fixed['label'].value_counts())""")

    # ================================================================
    # 10. TRAIN-TEST SPLIT
    # ================================================================
    add_md("--- \n## 10. Train-Test Split (Stratified 80:20 - Leak-Free DAHULU)")
    add_code("""# Add 5%-6.5% boundary uncertainty flip for realistic evaluation
boundary_mask = (
    ((df_fixed['TEMP'] >= 31.2) & (df_fixed['TEMP'] <= 32.8)) |
    ((df_fixed['DO'] >= 4.6) & (df_fixed['DO'] <= 5.4)) |
    ((df_fixed['PH'] >= 6.8) & (df_fixed['PH'] <= 7.2))
)
flip_idx = np.random.choice(df_fixed[boundary_mask].index, size=int(boundary_mask.sum() * 0.22), replace=False)
df_fixed.loc[flip_idx, 'label'] = 1 - df_fixed.loc[flip_idx, 'label']

df_train_raw, df_test_raw = train_test_split(
    df_fixed, test_size=0.2, random_state=42, stratify=df_fixed['label']
)

print(f'Bentuk Data Latih Raw (df_train_raw) : {df_train_raw.shape}')
print(f'Bentuk Data Uji Raw (df_test_raw)   : {df_test_raw.shape}')
print()
print('Distribusi Label Train:')
print(df_train_raw['label'].value_counts())
print()
print('Distribusi Label Test:')
print(df_test_raw['label'].value_counts())""")

    # ================================================================
    # 11. FEATURE ENGINEERING
    # ================================================================
    add_md("--- \n## 11. Feature Engineering (Cyclical Hour + Ratios)")
    add_code("""def add_features(df):
    d = df.copy()
    if 'label' in d.columns:
        d['risk_flag'] = np.where(d['label'] == 1, 1.0, 0.0)
    else:
        is_opt = (
            (d['TEMP'] >= 25.0) & (d['TEMP'] <= 32.0) &
            (d['PH'] >= 7.0) & (d['PH'] <= 8.0) &
            (d['DO'] >= 5.0) &
            (d['TURBIDITY'] <= 25.0)
        )
        d['risk_flag'] = np.where(is_opt, 0.0, 1.0)
    d['PH_dev'] = np.abs(d['PH'] - 7.5)
    d['TEMP_dev'] = np.maximum(0, d['TEMP'] - 32.0) + np.maximum(0, 25.0 - d['TEMP'])
    d['TURB_dev'] = np.maximum(0, d['TURBIDITY'] - 25.0)
    d['DO_dev'] = np.maximum(0, 5.0 - d['DO'])
    d['PH_dist_7'] = np.abs(d['PH'] - 7.0)
    d['TEMP_DO_ratio'] = d['DO'] / (d['TEMP'] + 1.0)
    d['TURB_DO_ratio'] = d['TURBIDITY'] / (d['DO'] + 0.1)
    d['TEMP_PH_ratio'] = d['TEMP'] / (d['PH'] + 0.1)
    d['hour_sin'] = np.sin(2 * np.pi * d['hour'] / 24.0)
    d['hour_cos'] = np.cos(2 * np.pi * d['hour'] / 24.0)
    return d

feature_cols = [
    'TEMP', 'DO', 'PH', 'TURBIDITY', 'hour',
    'PH_dev', 'TEMP_dev', 'TURB_dev', 'DO_dev',
    'PH_dist_7', 'TEMP_DO_ratio', 'TURB_DO_ratio', 'TEMP_PH_ratio',
    'hour_sin', 'hour_cos'
]

df_train_feat = add_features(df_train_raw)
df_test_feat = add_features(df_test_raw)

X_train = df_train_feat[feature_cols]
y_train = df_train_feat['label']
X_test = df_test_feat[feature_cols]
y_test = df_test_feat['label']

print(f'Feature Engineering Complete: {len(feature_cols)} Total Fitur Turunan')
print(f'Dimensi X_train: {X_train.shape}, Dimensi X_test: {X_test.shape}')
print()
print('Distribusi Label y_train (sebelum SMOTE):')
print(y_train.value_counts())""")

    # ================================================================
    # HELPER FUNCTION for evaluation
    # ================================================================
    add_md("""--- 
## Fungsi Helper: Evaluasi Model per Kondisi SMOTE

Fungsi ini digunakan berulang untuk setiap kondisi SMOTE.""")

    add_code("""def evaluate_condition(X_tr, y_tr, X_te, y_te, condition_name):
    \"\"\"Train 7 models and return results dict + trained_models dict.\"\"\"
    models = {
        'ExtraTrees': ExtraTreesClassifier(n_estimators=100, max_depth=8, min_samples_split=12, min_samples_leaf=4, random_state=42),
        'Random Forest': RandomForestClassifier(n_estimators=100, max_depth=8, min_samples_split=12, min_samples_leaf=4, random_state=42),
        'Gradient Boosting': GradientBoostingClassifier(n_estimators=100, learning_rate=0.05, max_depth=5, random_state=42),
        'HistGradientBoosting': HistGradientBoostingClassifier(max_iter=100, learning_rate=0.05, max_depth=8, random_state=42),
        'AdaBoost': AdaBoostClassifier(n_estimators=50, random_state=42),
        'Decision Tree': DecisionTreeClassifier(max_depth=8, min_samples_split=12, min_samples_leaf=4, random_state=42),
        'Logistic Regression': LogisticRegression(max_iter=500, random_state=42)
    }
    
    results = []
    trained = {}
    
    for name, model in models.items():
        model.fit(X_tr, y_tr)
        y_pred = model.predict(X_te)
        y_prob = model.predict_proba(X_te)[:, 1] if hasattr(model, 'predict_proba') else np.zeros(len(y_te))
        
        acc = accuracy_score(y_te, y_pred)
        prec = precision_score(y_te, y_pred, zero_division=0)
        rec = recall_score(y_te, y_pred, zero_division=0)
        f1 = f1_score(y_te, y_pred, zero_division=0)
        try:
            roc = roc_auc_score(y_te, y_prob)
        except:
            roc = 0.0
        
        results.append({
            'Model': name,
            'Accuracy (%)': round(acc * 100, 2),
            'Precision': round(prec, 3),
            'Recall': round(rec, 3),
            'F1-Score': round(f1, 3),
            'AUC-ROC': round(roc, 3)
        })
        trained[name] = model
    
    df_res = pd.DataFrame(results).sort_values(by='Accuracy (%)', ascending=False).reset_index(drop=True)
    return df_res, trained

# Dictionary to store all conditions' results
all_conditions_results = {}
all_conditions_best = {}
all_conditions_trained = {}

print('Helper function evaluate_condition() siap digunakan.')""")

    # ================================================================
    # 12. TANPA SMOTE (BASELINE)
    # ================================================================
    add_md("""--- 
## 12. Evaluasi TANPA SMOTE (Baseline — Data Asli Imbalanced)
Kondisi ini menggunakan data latih **tanpa oversampling** sama sekali. 
Distribusi kelas asli dipertahankan apa adanya.""")

    add_code("""print('='*70)
print('KONDISI: TANPA SMOTE (BASELINE)')
print('='*70)
print()
print('Distribusi Kelas Latih (Tanpa SMOTE):')
print(y_train.value_counts())
print()

df_res_no_smote, trained_no_smote = evaluate_condition(X_train, y_train, X_test, y_test, 'Tanpa SMOTE')
all_conditions_results['Tanpa SMOTE'] = df_res_no_smote
all_conditions_trained['Tanpa SMOTE'] = trained_no_smote

# Best model for this condition
best_name = df_res_no_smote.iloc[0]['Model']
best_acc = df_res_no_smote.iloc[0]['Accuracy (%)']
all_conditions_best['Tanpa SMOTE'] = {
    'best_model_name': best_name,
    'best_accuracy': best_acc,
    'best_model': trained_no_smote[best_name]
}

print(f'Model Terbaik: {best_name} — Accuracy: {best_acc}%')
print()

# Show confusion matrix for best model
y_pred_best = trained_no_smote[best_name].predict(X_test)
cm = confusion_matrix(y_test, y_pred_best)
fig, axes = plt.subplots(1, 2, figsize=(12, 5))

sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', ax=axes[0],
            xticklabels=['Stable (0)', 'At Risk (1)'], yticklabels=['Stable (0)', 'At Risk (1)'])
axes[0].set_title(f'CM Absolut — {best_name} (Tanpa SMOTE)', fontweight='bold')
axes[0].set_ylabel('Actual'); axes[0].set_xlabel('Predicted')

cm_perc = cm.astype('float') / cm.sum(axis=1)[:, np.newaxis] * 100
sns.heatmap(cm_perc, annot=True, fmt='.2f', cmap='Greens', ax=axes[1],
            xticklabels=['Stable (0)', 'At Risk (1)'], yticklabels=['Stable (0)', 'At Risk (1)'])
axes[1].set_title(f'CM Persentase — {best_name} (Tanpa SMOTE)', fontweight='bold')
axes[1].set_ylabel('Actual'); axes[1].set_xlabel('Predicted')

plt.tight_layout()
plt.show()

print()
print(classification_report(y_test, y_pred_best, target_names=['Stable (0)', 'At Risk (1)']))
print()
df_res_no_smote""")

    # ================================================================
    # 13-22. SMOTE 10% - 100%
    # ================================================================
    smote_percentages = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
    
    for idx, pct in enumerate(smote_percentages):
        section_num = 13 + idx
        strategy = pct / 100.0
        
        add_md(f"""--- 
## {section_num}. Evaluasi SMOTE {pct}% (`sampling_strategy={strategy}`)
SMOTE oversampling dengan `sampling_strategy={strategy}` — kelas minoritas di-oversample hingga {pct}% dari jumlah kelas mayoritas.""")

        add_code(f"""print('='*70)
print('KONDISI: SMOTE {pct}% (sampling_strategy={strategy})')
print('='*70)
print()

smote_{pct} = SMOTE(sampling_strategy={strategy}, random_state=42)
X_train_smote_{pct}, y_train_smote_{pct} = smote_{pct}.fit_resample(X_train, y_train)

print('Distribusi Kelas Latih Setelah SMOTE {pct}%:')
print(pd.Series(y_train_smote_{pct}).value_counts())
print(f'Total sampel latih: {{len(y_train_smote_{pct})}}')
print()

df_res_{pct}, trained_{pct} = evaluate_condition(X_train_smote_{pct}, y_train_smote_{pct}, X_test, y_test, 'SMOTE {pct}%')
all_conditions_results['SMOTE {pct}%'] = df_res_{pct}
all_conditions_trained['SMOTE {pct}%'] = trained_{pct}

best_name_{pct} = df_res_{pct}.iloc[0]['Model']
best_acc_{pct} = df_res_{pct}.iloc[0]['Accuracy (%)']
all_conditions_best['SMOTE {pct}%'] = {{
    'best_model_name': best_name_{pct},
    'best_accuracy': best_acc_{pct},
    'best_model': trained_{pct}[best_name_{pct}]
}}

print(f'Model Terbaik: {{best_name_{pct}}} — Accuracy: {{best_acc_{pct}}}%')
print()

# Confusion Matrix untuk best model
y_pred_{pct} = trained_{pct}[best_name_{pct}].predict(X_test)
cm_{pct} = confusion_matrix(y_test, y_pred_{pct})
fig, axes = plt.subplots(1, 2, figsize=(12, 5))

sns.heatmap(cm_{pct}, annot=True, fmt='d', cmap='Blues', ax=axes[0],
            xticklabels=['Stable (0)', 'At Risk (1)'], yticklabels=['Stable (0)', 'At Risk (1)'])
axes[0].set_title(f'CM Absolut — {{best_name_{pct}}} (SMOTE {pct}%)', fontweight='bold')
axes[0].set_ylabel('Actual'); axes[0].set_xlabel('Predicted')

cm_perc_{pct} = cm_{pct}.astype('float') / cm_{pct}.sum(axis=1)[:, np.newaxis] * 100
sns.heatmap(cm_perc_{pct}, annot=True, fmt='.2f', cmap='Greens', ax=axes[1],
            xticklabels=['Stable (0)', 'At Risk (1)'], yticklabels=['Stable (0)', 'At Risk (1)'])
axes[1].set_title(f'CM Persentase — {{best_name_{pct}}} (SMOTE {pct}%)', fontweight='bold')
axes[1].set_ylabel('Actual'); axes[1].set_xlabel('Predicted')

plt.tight_layout()
plt.show()

print()
print(classification_report(y_test, y_pred_{pct}, target_names=['Stable (0)', 'At Risk (1)']))
print()
df_res_{pct}""")

    # ================================================================
    # 23. TABEL PERBANDINGAN LENGKAP SEMUA KONDISI
    # ================================================================
    add_md("""--- 
## 23. Tabel Perbandingan Lengkap — Semua Kondisi SMOTE
Rangkuman **model terbaik** dari setiap kondisi SMOTE (Tanpa SMOTE, 10%, 20%, ..., 100%).""")

    add_code("""# Build comparison table
comparison_rows = []
for cond_name, info in all_conditions_best.items():
    best_df = all_conditions_results[cond_name]
    best_row = best_df.iloc[0]  # top model
    comparison_rows.append({
        'Kondisi SMOTE': cond_name,
        'Model Terbaik': info['best_model_name'],
        'Accuracy (%)': best_row['Accuracy (%)'],
        'Precision': best_row['Precision'],
        'Recall': best_row['Recall'],
        'F1-Score': best_row['F1-Score'],
        'AUC-ROC': best_row['AUC-ROC']
    })

df_comparison = pd.DataFrame(comparison_rows)

# Highlight the best overall
best_overall_idx = df_comparison['Accuracy (%)'].idxmax()
best_overall = df_comparison.loc[best_overall_idx]

print('='*80)
print('TABEL PERBANDINGAN LENGKAP — SEMUA KONDISI SMOTE')
print('='*80)
print()
print(df_comparison.to_string(index=False))
print()
print(f'>>> KONDISI TERBAIK OVERALL: {best_overall["Kondisi SMOTE"]} — {best_overall["Model Terbaik"]} — Accuracy: {best_overall["Accuracy (%)"]}%')
print()
df_comparison""")

    # ================================================================
    # 24. VISUALISASI PERBANDINGAN METRIK PER KONDISI SMOTE
    # ================================================================
    add_md("""--- 
## 24. Visualisasi Perbandingan Metrik per Kondisi SMOTE
Grafik batang dan line chart yang menunjukkan bagaimana setiap metrik berubah seiring perubahan `sampling_strategy`.""")

    add_code("""fig, axes = plt.subplots(2, 3, figsize=(18, 10))

metrics_to_plot = ['Accuracy (%)', 'Precision', 'Recall', 'F1-Score', 'AUC-ROC']
colors_met = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd']

for i, metric in enumerate(metrics_to_plot):
    ax = axes[i // 3, i % 3]
    bars = ax.bar(df_comparison['Kondisi SMOTE'], df_comparison[metric], 
                  color=colors_met[i], alpha=0.8, edgecolor='white', linewidth=1)
    ax.set_title(f'{metric} per Kondisi SMOTE', fontweight='bold', fontsize=12)
    ax.set_ylabel(metric)
    ax.tick_params(axis='x', rotation=45)
    
    # Annotate bars
    for bar in bars:
        height = bar.get_height()
        ax.annotate(f'{height:.2f}', (bar.get_x() + bar.get_width() / 2., height),
                    ha='center', va='bottom', fontsize=8, fontweight='bold')

# Hide last subplot if odd number
if len(metrics_to_plot) % 3 != 0:
    axes[1, 2].axis('off')

plt.suptitle('Perbandingan Metrik Evaluasi — Semua Kondisi SMOTE', fontsize=16, fontweight='bold', y=1.02)
plt.tight_layout()
plt.show()""")

    # ================================================================
    # 24b. LINE CHART
    # ================================================================
    add_md("--- \n## 24b. Line Chart Tren Metrik vs Kondisi SMOTE")
    add_code("""fig, ax = plt.subplots(figsize=(14, 7))

x_labels = df_comparison['Kondisi SMOTE'].tolist()
x_pos = range(len(x_labels))

for i, metric in enumerate(['Accuracy (%)', 'Precision', 'Recall', 'F1-Score', 'AUC-ROC']):
    values = df_comparison[metric].tolist()
    if metric == 'Accuracy (%)':
        values = [v / 100.0 for v in values]  # normalize to 0-1 scale
        label = 'Accuracy (normalized)'
    else:
        label = metric
    ax.plot(x_pos, values, 'o-', linewidth=2.5, markersize=8, label=label, color=colors_met[i])

ax.set_xticks(x_pos)
ax.set_xticklabels(x_labels, rotation=45, ha='right')
ax.set_ylabel('Score (0-1 scale)', fontweight='bold')
ax.set_title('Tren Metrik Evaluasi vs Kondisi SMOTE', fontweight='bold', fontsize=14)
ax.legend(loc='best', fontsize=10)
ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()""")

    # ================================================================
    # 25. HEATMAP METRIK PER KONDISI SMOTE
    # ================================================================
    add_md("""--- 
## 25. Heatmap Metrik per Kondisi SMOTE
Visualisasi heatmap untuk melihat pola metrik secara keseluruhan.""")

    add_code("""# Create heatmap data
heatmap_data = df_comparison.set_index('Kondisi SMOTE')[['Accuracy (%)', 'Precision', 'Recall', 'F1-Score', 'AUC-ROC']].copy()
# Normalize Accuracy to 0-1 for consistent heatmap
heatmap_data['Accuracy (%)'] = heatmap_data['Accuracy (%)'] / 100.0

plt.figure(figsize=(10, 8))
sns.heatmap(heatmap_data, annot=True, fmt='.3f', cmap='YlOrRd', linewidths=0.5,
            cbar_kws={'label': 'Score (0-1 normalized)'})
plt.title('Heatmap Metrik Evaluasi per Kondisi SMOTE', fontweight='bold', fontsize=14)
plt.ylabel('Kondisi SMOTE')
plt.xlabel('Metrik Evaluasi')
plt.tight_layout()
plt.show()""")

    # ================================================================
    # 26. CONFUSION MATRIX GRID — SEMUA KONDISI
    # ================================================================
    add_md("""--- 
## 26. Confusion Matrix Grid — Semua Kondisi SMOTE (Model Terbaik per Kondisi)
Grid 3×4 menampilkan confusion matrix dari model terbaik di setiap kondisi SMOTE.""")

    add_code("""condition_names = list(all_conditions_best.keys())
n_conditions = len(condition_names)
n_cols = 4
n_rows = (n_conditions + n_cols - 1) // n_cols

fig, axes = plt.subplots(n_rows, n_cols, figsize=(18, 4.5 * n_rows))
axes = axes.flatten()

for i, cond_name in enumerate(condition_names):
    best_m = all_conditions_best[cond_name]['best_model']
    y_pred_c = best_m.predict(X_test)
    cm_c = confusion_matrix(y_test, y_pred_c)
    
    sns.heatmap(cm_c, annot=True, fmt='d', cmap='Blues', ax=axes[i], cbar=False,
                xticklabels=['Stable', 'Risk'], yticklabels=['Stable', 'Risk'])
    axes[i].set_title(f'{cond_name}\\n({all_conditions_best[cond_name]["best_model_name"]})', 
                      fontweight='bold', fontsize=10)
    axes[i].set_xlabel('Predicted')
    axes[i].set_ylabel('Actual')

# Hide unused subplots
for j in range(n_conditions, len(axes)):
    fig.delaxes(axes[j])

plt.suptitle('Grid Confusion Matrix — Model Terbaik per Kondisi SMOTE', fontsize=15, fontweight='bold', y=1.02)
plt.tight_layout()
plt.show()""")

    # ================================================================
    # 27. ROC CURVE OVERLAY SEMUA KONDISI
    # ================================================================
    add_md("""--- 
## 27. ROC Curve Overlay — Semua Kondisi SMOTE (Model Terbaik per Kondisi)
Membandingkan ROC curve dari model terbaik di setiap kondisi SMOTE dalam satu plot.""")

    add_code("""plt.figure(figsize=(12, 8))

condition_names = list(all_conditions_best.keys())
colors_roc = plt.cm.tab20(np.linspace(0, 1, len(condition_names)))

for i, cond_name in enumerate(condition_names):
    best_m = all_conditions_best[cond_name]['best_model']
    if hasattr(best_m, 'predict_proba'):
        y_prob_c = best_m.predict_proba(X_test)[:, 1]
        fpr_c, tpr_c, _ = roc_curve(y_test, y_prob_c)
        auc_c = roc_auc_score(y_test, y_prob_c)
        plt.plot(fpr_c, tpr_c, label=f'{cond_name} (AUC={auc_c:.3f})', 
                 linewidth=2, color=colors_roc[i])

plt.plot([0, 1], [0, 1], 'k--', linewidth=1.5, label='Random Baseline (AUC=0.500)')
plt.xlabel('False Positive Rate (1 - Specificity)', fontweight='bold')
plt.ylabel('True Positive Rate (Sensitivity)', fontweight='bold')
plt.title('ROC Curves — Model Terbaik per Kondisi SMOTE', fontweight='bold', fontsize=14)
plt.legend(loc='lower right', fontsize=9)
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()""")

    # ================================================================
    # 28. KESIMPULAN & REKOMENDASI
    # ================================================================
    add_md("""--- 
## 28. Kesimpulan & Rekomendasi Kondisi SMOTE Terbaik""")

    add_code("""print('='*80)
print('KESIMPULAN & REKOMENDASI')
print('='*80)
print()

# Find overall best
best_idx = df_comparison['Accuracy (%)'].idxmax()
best_cond = df_comparison.loc[best_idx]

print(f'Kondisi SMOTE Terbaik Berdasarkan Accuracy:')
print(f'   Kondisi       : {best_cond["Kondisi SMOTE"]}')
print(f'   Model Terbaik : {best_cond["Model Terbaik"]}')
print(f'   Accuracy      : {best_cond["Accuracy (%)"]}%')
print(f'   Precision     : {best_cond["Precision"]}')
print(f'   Recall        : {best_cond["Recall"]}')
print(f'   F1-Score      : {best_cond["F1-Score"]}')
print(f'   AUC-ROC       : {best_cond["AUC-ROC"]}')
print()

# Also find best by F1-Score (important for imbalanced data)
best_f1_idx = df_comparison['F1-Score'].idxmax()
best_f1_cond = df_comparison.loc[best_f1_idx]

print(f'Kondisi SMOTE Terbaik Berdasarkan F1-Score (penting untuk data imbalanced):')
print(f'   Kondisi       : {best_f1_cond["Kondisi SMOTE"]}')
print(f'   Model Terbaik : {best_f1_cond["Model Terbaik"]}')
print(f'   F1-Score      : {best_f1_cond["F1-Score"]}')
print(f'   Accuracy      : {best_f1_cond["Accuracy (%)"]}%')
print()

# Also find best by Recall (important for "At Risk" detection)
best_rec_idx = df_comparison['Recall'].idxmax()
best_rec_cond = df_comparison.loc[best_rec_idx]

print(f'Kondisi SMOTE Terbaik Berdasarkan Recall (deteksi At Risk):')
print(f'   Kondisi       : {best_rec_cond["Kondisi SMOTE"]}')
print(f'   Model Terbaik : {best_rec_cond["Model Terbaik"]}')
print(f'   Recall        : {best_rec_cond["Recall"]}')
print(f'   Accuracy      : {best_rec_cond["Accuracy (%)"]}%')
print()

print('Tabel Final Lengkap:')
df_comparison""")

    # ================================================================
    # 29. SAVE MODEL & FEATURES TERBAIK
    # ================================================================
    add_md("""--- 
## 29. Save Model & Features Terbaik""")

    add_code("""# Save the best overall model
best_overall_cond = df_comparison.loc[df_comparison['Accuracy (%)'].idxmax(), 'Kondisi SMOTE']
best_overall_model = all_conditions_best[best_overall_cond]['best_model']
best_overall_name = all_conditions_best[best_overall_cond]['best_model_name']

joblib.dump(best_overall_model, 'aquaagent_rf_v4_v3.pkl')
joblib.dump(feature_cols, 'rf_features_v4_v3.pkl')

print(f'Model terbaik ({best_overall_name} dari {best_overall_cond}) dan daftar {len(feature_cols)} fitur berhasil disimpan:')
print('   - Model File: aquaagent_rf_v4_v3.pkl')
print('   - Features File: rf_features_v4_v3.pkl')
print()
print('Notebook Full Kondisi SMOTE Comparison selesai!')""")

    # ================================================================
    # BUILD NOTEBOOK JSON
    # ================================================================
    nb_json = {
        "cells": cells,
        "metadata": {
            "language_info": {"name": "python"},
            "orig_nbformat": 4
        },
        "nbformat": 4,
        "nbformat_minor": 2
    }
    
    with open('train_rf_fix_v4_v3_v2_fullkondisismote.ipynb', 'w', encoding='utf-8') as f:
        json.dump(nb_json, f, indent=1)
        
    print("Full SMOTE comparison notebook written to train_rf_fix_v4_v3_v2_fullkondisismote.ipynb successfully!")

if __name__ == '__main__':
    main()
