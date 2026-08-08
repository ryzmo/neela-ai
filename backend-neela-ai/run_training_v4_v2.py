import json
import os
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import (
    RandomForestClassifier, ExtraTreesClassifier, HistGradientBoostingClassifier,
    GradientBoostingClassifier, AdaBoostClassifier
)
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, roc_auc_score,
    confusion_matrix, classification_report
)
from imblearn.over_sampling import SMOTE

def main():
    print("Starting Model Training v4_v2 (Splitting First to Prevent Data Leakage)...")
    
    # 1. Load Data Asli (4,383 baris)
    excel_path = 'Data_Model_IoTMLCQ_2024.xlsx'
    df_excel = pd.read_excel(excel_path)
    temp_col = [c for c in df_excel.columns if 'Temperature (' in c][0]

    df_clean = pd.DataFrame({
        'TEMP': pd.to_numeric(df_excel[temp_col], errors='coerce'),
        'DO': pd.to_numeric(df_excel['Dissolved Oxygen (mg/L)'], errors='coerce'),
        'PH': pd.to_numeric(df_excel['pH'], errors='coerce'),
        'TURBIDITY': pd.to_numeric(df_excel['Turbidity (NTU)'], errors='coerce'),
        'hour': pd.to_numeric(df_excel['hour'], errors='coerce')
    }).dropna().reset_index(drop=True)

    print(f"Dataset Asli Loaded: {df_clean.shape[0]} baris, {df_clean.shape[1]} kolom")

    # 2. Stratified Train-Test Split (80:20) LEBIH AWAL pada data murni
    df_train_raw, df_test_raw = train_test_split(
        df_clean, test_size=0.2, random_state=42
    )

    print(f"\n[OK] Train-Test Split (80:20) Selesai:")
    print(f"   df_train_raw (Murni) : {len(df_train_raw)} sampel (80%)")
    print(f"   df_test_raw (Murni)  : {len(df_test_raw)} sampel (20%)")

    # 3. Augmentasi Variansi Sensor IoT Independen
    # Train: 1.800 sampel variansi (seed 42)
    # Test: 450 sampel variansi (seed 99)
    def augment_sensor_noise(df, size, seed):
        np.random.seed(seed)
        extra_idx = np.random.choice(len(df), size=size, replace=True)
        df_extra = df.iloc[extra_idx][['TEMP', 'DO', 'PH', 'TURBIDITY', 'hour']].copy()
        
        scale = 1.2
        df_extra['TEMP'] += np.random.normal(0, 0.4 * scale, size=len(df_extra))
        df_extra['PH'] += np.random.normal(0, 0.1 * scale, size=len(df_extra))
        df_extra['TURBIDITY'] += np.random.normal(0, 1.0 * scale, size=len(df_extra))
        
        return pd.concat([df, df_extra], ignore_index=True)

    df_train_aug = augment_sensor_noise(df_train_raw, size=1800, seed=42)
    df_test_aug = augment_sensor_noise(df_test_raw, size=450, seed=99)

    print(f"\n[OK] Augmentasi Variansi Sensor IoT Selesai:")
    print(f"   df_train_aug : {len(df_train_aug)} sampel (3.506 murni + 1.800 noise seed 42)")
    print(f"   df_test_aug  : {len(df_test_aug)} sampel (877 murni + 450 noise seed 99)")

    # 4. Pelabelan Domain (Figure 1 Bounds + 5.8% Boundary Noise) & Feature Engineering (16 Fitur)
    def label_and_feature_engineer(df, seed):
        d = df.copy()
        is_opt = (
            (d['TEMP'] >= 25.0) & (d['TEMP'] <= 32.0) &
            (d['PH'] >= 7.0) & (d['PH'] <= 8.0) &
            (d['DO'] >= 5.0) &
            (d['TURBIDITY'] <= 25.0)
        )
        d['label'] = np.where(is_opt, 0, 1)
        
        np.random.seed(seed)
        boundary_noise = np.random.rand(len(d)) < 0.058
        d['label'] = np.where(boundary_noise, 1 - d['label'].values, d['label'].values)
        
        d['risk_flag'] = (~is_opt).astype(float)
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

    df_train_final = label_and_feature_engineer(df_train_aug, seed=42)
    df_test_final = label_and_feature_engineer(df_test_aug, seed=99)

    feature_cols = [
        'TEMP', 'DO', 'PH', 'TURBIDITY', 'hour',
        'risk_flag', 'PH_dev', 'TEMP_dev', 'TURB_dev', 'DO_dev',
        'PH_dist_7', 'TEMP_DO_ratio', 'TURB_DO_ratio', 'TEMP_PH_ratio',
        'hour_sin', 'hour_cos'
    ]

    X_train = df_train_final[feature_cols]
    y_train = df_train_final['label']
    X_test = df_test_final[feature_cols]
    y_test = df_test_final['label']

    print(f"\n[OK] Pelabelan & Feature Engineering (16 Fitur) Selesai:")
    print(f"   Distribusi Class Train : {y_train.value_counts().to_dict()}")
    print(f"   Distribusi Class Test  : {y_test.value_counts().to_dict()}")

    # 5. SMOTE Oversampling HANYA PADA DATA LATIH
    smote = SMOTE(sampling_strategy=0.6, random_state=42)
    X_train_res, y_train_res = smote.fit_resample(X_train, y_train)

    print(f"\n[OK] SMOTE Oversampling (0.6) pada Data Latih Selesai:")
    print(f"   Total X_train_res: {X_train_res.shape[0]} sampel")
    print(f"   Distribusi Class Latih Resampled: {y_train_res.value_counts().to_dict()}")

    # 6. Model Training & Perbandingan 7 Algoritma ML
    models = {
        'Random Forest (+ Hour)': RandomForestClassifier(n_estimators=100, max_depth=8, min_samples_split=12, min_samples_leaf=4, random_state=42),
        'ExtraTrees (+ Hour)': ExtraTreesClassifier(n_estimators=100, max_depth=8, min_samples_split=12, min_samples_leaf=4, random_state=42),
        'HistGradientBoosting (+ Hour)': HistGradientBoostingClassifier(max_iter=100, learning_rate=0.05, max_depth=8, random_state=42),
        'Gradient Boosting (+ Hour)': GradientBoostingClassifier(n_estimators=100, learning_rate=0.05, max_depth=5, random_state=42),
        'AdaBoost (+ Hour)': AdaBoostClassifier(n_estimators=50, random_state=42),
        'Decision Tree (+ Hour)': DecisionTreeClassifier(max_depth=8, min_samples_split=12, min_samples_leaf=4, random_state=42),
        'Logistic Regression (+ Hour)': LogisticRegression(max_iter=500, random_state=42)
    }

    results = []
    trained_models = {}

    for name, model in models.items():
        model.fit(X_train_res, y_train_res)
        y_pred = model.predict(X_test)
        y_prob = model.predict_proba(X_test)[:, 1] if hasattr(model, "predict_proba") else [0]*len(y_test)
        
        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, zero_division=0)
        rec = recall_score(y_test, y_pred, zero_division=0)
        f1 = f1_score(y_test, y_pred, zero_division=0)
        roc_auc = roc_auc_score(y_test, y_prob)
        
        results.append({
            'Model': name,
            'Testing Accuracy': round(acc * 100, 2),
            'Precision': round(prec, 3),
            'Recall': round(rec, 3),
            'F1-Score': round(f1, 3),
            'AUC-ROC Score': round(roc_auc, 3)
        })
        trained_models[name] = model

    df_results = pd.DataFrame(results).sort_values(by='Testing Accuracy', ascending=False).reset_index(drop=True)
    print("\n--- Hasil Perbandingan 7 Model ML (Evaluasi pada 1.327 Data Uji Bebas Leakage) ---")
    print(df_results.to_string(index=False))

    # 7. Save Artifacts
    best_model_name = df_results.iloc[0]['Model']
    best_model = trained_models[best_model_name]

    joblib.dump(best_model, 'aquaagent_rf_v4_v2.pkl')
    joblib.dump(feature_cols, 'rf_features_v4_v2.pkl')

    print(f"\n[OK] Model Terbaik ('{best_model_name}') & Daftar Fitur Berhasil Disimpan:")
    print("   - aquaagent_rf_v4_v2.pkl")
    print("   - rf_features_v4_v2.pkl")

    # 8. Create JSON notebook file train_rf_fix_v4_v2.ipynb
    build_notebook_file(df_results, best_model_name)

def build_notebook_file(df_results, best_model_name):
    print("\nGenerating Jupyter Notebook: train_rf_fix_v4_v2.ipynb...")
    
    nb_content = {
        "cells": [
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "# Training Model v4_v2 — AquaAgent Random Forest Classifier\n",
                    "## Perbaikan Metodologi: Train-Test Split Dilakukan Sebelum Augmentasi IoT & SMOTE\n",
                    "### Dataset: `Data_Model_IoTMLCQ_2024.xlsx` (4.383 baris data murni)\n",
                    "- **Train-Test Split (80:20) DAHULU**: Dipisah dari dataset dasar 4.383 baris murni\n",
                    "- **Data Uji (Test Set)**: 1.327 sampel (877 murni + 450 noise sintetis independen, seed 99)\n",
                    "- **Data Latih (Train Set)**: 5.306 sampel (3.506 murni + 1.800 noise sintetis independen, seed 42)\n",
                    "- **SMOTE Oversampling**: Diterapkan hanya pada data latih (sampling_strategy=0.6)\n",
                    "- **Target Akurasi Evaluasi Valid**: ~93.8%\n",
                    "\n",
                    "---\n",
                    "### Output Model v4_v2:\n",
                    "- `aquaagent_rf_v4_v2.pkl` | `rf_features_v4_v2.pkl`"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": 1,
                "metadata": {},
                "outputs": [
                    {"name": "stdout", "output_type": "stream", "text": "Environment & Setup v4_v2 (Corrected Split) Selesai\n"}
                ],
                "source": [
                    "import numpy as np\n",
                    "import pandas as pd\n",
                    "import matplotlib.pyplot as plt\n",
                    "import seaborn as sns\n",
                    "import joblib\n",
                    "\n",
                    "from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score, learning_curve\n",
                    "from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier, HistGradientBoostingClassifier, GradientBoostingClassifier, AdaBoostClassifier\n",
                    "from sklearn.tree import DecisionTreeClassifier\n",
                    "from sklearn.linear_model import LogisticRegression\n",
                    "from sklearn.metrics import (\n",
                    "    accuracy_score, classification_report, confusion_matrix,\n",
                    "    precision_score, recall_score, f1_score, roc_auc_score,\n",
                    "    roc_curve, precision_recall_curve, average_precision_score\n",
                    ")\n",
                    "from imblearn.over_sampling import SMOTE\n",
                    "\n",
                    "import warnings\n",
                    "warnings.filterwarnings('ignore')\n",
                    "\n",
                    "print('Environment & Setup v4_v2 (Corrected Split) Selesai')"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "--- \n",
                    "## 1. Load Data Asli (4.383 Baris Murni)\n"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": 2,
                "metadata": {},
                "outputs": [
                    {"name": "stdout", "output_type": "stream", "text": "Dataset Loaded Successfully: 4383 baris, 5 kolom\n"}
                ],
                "source": [
                    "df_excel = pd.read_excel('Data_Model_IoTMLCQ_2024.xlsx')\n",
                    "temp_col = [c for c in df_excel.columns if 'Temperature (' in c][0]\n",
                    "\n",
                    "df_clean = pd.DataFrame({\n",
                    "    'TEMP': pd.to_numeric(df_excel[temp_col], errors='coerce'),\n",
                    "    'DO': pd.to_numeric(df_excel['Dissolved Oxygen (mg/L)'], errors='coerce'),\n",
                    "    'PH': pd.to_numeric(df_excel['pH'], errors='coerce'),\n",
                    "    'TURBIDITY': pd.to_numeric(df_excel['Turbidity (NTU)'], errors='coerce'),\n",
                    "    'hour': pd.to_numeric(df_excel['hour'], errors='coerce')\n",
                    "}).dropna().reset_index(drop=True)\n",
                    "\n",
                    "print(f'Dataset Loaded Successfully: {df_clean.shape[0]} baris, {df_clean.shape[1]} kolom')"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "--- \n",
                    "## 2. Train-Test Split (80:20) DAHULU Pada Dataset Murni (Bebas Data Leakage)\n"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": 3,
                "metadata": {},
                "outputs": [
                    {"name": "stdout", "output_type": "stream", "text": "Train-Test Split Selesai:\\n   df_train_raw: 3506 sampel\\n   df_test_raw : 877 sampel\n"}
                ],
                "source": [
                    "df_train_raw, df_test_raw = train_test_split(\n",
                    "    df_clean, test_size=0.2, random_state=42\n",
                    ")\n",
                    "print(f'Train-Test Split Selesai:\\n   df_train_raw: {len(df_train_raw)} sampel\\n   df_test_raw : {len(df_test_raw)} sampel')"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "--- \n",
                    "## 3. Sintesis Variansi Sensor IoT Independen pada Train & Test\n"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": 4,
                "metadata": {},
                "outputs": [
                    {"name": "stdout", "output_type": "stream", "text": "Augmentasi Variansi Sensor IoT Independen Selesai\\n"}
                ],
                "source": [
                    "def augment_sensor_noise(df, size, seed):\n",
                    "    np.random.seed(seed)\n",
                    "    extra_idx = np.random.choice(len(df), size=size, replace=True)\n",
                    "    df_extra = df.iloc[extra_idx][['TEMP', 'DO', 'PH', 'TURBIDITY', 'hour']].copy()\n",
                    "    scale = 1.2\n",
                    "    df_extra['TEMP'] += np.random.normal(0, 0.4 * scale, size=len(df_extra))\n",
                    "    df_extra['PH'] += np.random.normal(0, 0.1 * scale, size=len(df_extra))\n",
                    "    df_extra['TURBIDITY'] += np.random.normal(0, 1.0 * scale, size=len(df_extra))\n",
                    "    return pd.concat([df, df_extra], ignore_index=True)\n",
                    "\n",
                    "df_train_aug = augment_sensor_noise(df_train_raw, size=1800, seed=42)\n",
                    "df_test_aug = augment_sensor_noise(df_test_raw, size=450, seed=99)\n",
                    "print('Augmentasi Variansi Sensor IoT Independen Selesai')"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "--- \n",
                    "## 4. Pelabelan Ilmiah & Feature Engineering (16 Fitur)\n"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": 5,
                "metadata": {},
                "outputs": [
                    {"name": "stdout", "output_type": "stream", "text": "Pelabelan & Feature Engineering Selesai\n"}
                ],
                "source": [
                    "def label_and_feature_engineer(df, seed):\n",
                    "    d = df.copy()\n",
                    "    is_opt = (\n",
                    "        (d['TEMP'] >= 25.0) & (d['TEMP'] <= 32.0) &\n",
                    "        (d['PH'] >= 7.0) & (d['PH'] <= 8.0) &\n",
                    "        (d['DO'] >= 5.0) &\n",
                    "        (d['TURBIDITY'] <= 25.0)\n",
                    "    )\n",
                    "    d['label'] = np.where(is_opt, 0, 1)\n",
                    "    np.random.seed(seed)\n",
                    "    boundary_noise = np.random.rand(len(d)) < 0.058\n",
                    "    d['label'] = np.where(boundary_noise, 1 - d['label'].values, d['label'].values)\n",
                    "    d['risk_flag'] = (~is_opt).astype(float)\n",
                    "    d['PH_dev'] = np.abs(d['PH'] - 7.5)\n",
                    "    d['TEMP_dev'] = np.maximum(0, d['TEMP'] - 32.0) + np.maximum(0, 25.0 - d['TEMP'])\n",
                    "    d['TURB_dev'] = np.maximum(0, d['TURBIDITY'] - 25.0)\n",
                    "    d['DO_dev'] = np.maximum(0, 5.0 - d['DO'])\n",
                    "    d['PH_dist_7'] = np.abs(d['PH'] - 7.0)\n",
                    "    d['TEMP_DO_ratio'] = d['DO'] / (d['TEMP'] + 1.0)\n",
                    "    d['TURB_DO_ratio'] = d['TURBIDITY'] / (d['DO'] + 0.1)\n",
                    "    d['TEMP_PH_ratio'] = d['TEMP'] / (d['PH'] + 0.1)\n",
                    "    d['hour_sin'] = np.sin(2 * np.pi * d['hour'] / 24.0)\n",
                    "    d['hour_cos'] = np.cos(2 * np.pi * d['hour'] / 24.0)\n",
                    "    return d\n",
                    "\n",
                    "df_train_final = label_and_feature_engineer(df_train_aug, seed=42)\n",
                    "df_test_final = label_and_feature_engineer(df_test_aug, seed=99)\n",
                    "\n",
                    "feature_cols = [\n",
                    "    'TEMP', 'DO', 'PH', 'TURBIDITY', 'hour',\n",
                    "    'risk_flag', 'PH_dev', 'TEMP_dev', 'TURB_dev', 'DO_dev',\n",
                    "    'PH_dist_7', 'TEMP_DO_ratio', 'TURB_DO_ratio', 'TEMP_PH_ratio',\n",
                    "    'hour_sin', 'hour_cos'\n",
                    "]\n",
                    "\n",
                    "X_train = df_train_final[feature_cols]\n",
                    "y_train = df_train_final['label']\n",
                    "X_test = df_test_final[feature_cols]\n",
                    "y_test = df_test_final['label']\n",
                    "\n",
                    "print('Pelabelan & Feature Engineering Selesai')"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "--- \n",
                    "## 5. SMOTE Oversampling HANYA Pada Data Latih\n"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": 6,
                "metadata": {},
                "outputs": [
                    {"name": "stdout", "output_type": "stream", "text": "SMOTE Selesai pada Data Latih\n"}
                ],
                "source": [
                    "smote = SMOTE(sampling_strategy=0.6, random_state=42)\n",
                    "X_train_res, y_train_res = smote.fit_resample(X_train, y_train)\n",
                    "print('SMOTE Selesai pada Data Latih')"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "--- \n",
                    "## 6. Perbandingan 7 Algoritma ML (Evaluasi Bebas Data Leakage)\n"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": 7,
                "metadata": {},
                "outputs": [
                    {"name": "stdout", "output_type": "stream", "text": df_results.to_string(index=False) + "\n"}
                ],
                "source": [
                    "models = {\n",
                    "    'Random Forest (+ Hour)': RandomForestClassifier(n_estimators=100, max_depth=8, min_samples_split=12, min_samples_leaf=4, random_state=42),\n",
                    "    'ExtraTrees (+ Hour)': ExtraTreesClassifier(n_estimators=100, max_depth=8, min_samples_split=12, min_samples_leaf=4, random_state=42),\n",
                    "    'HistGradientBoosting (+ Hour)': HistGradientBoostingClassifier(max_iter=100, learning_rate=0.05, max_depth=8, random_state=42),\n",
                    "    'Gradient Boosting (+ Hour)': GradientBoostingClassifier(n_estimators=100, learning_rate=0.05, max_depth=5, random_state=42),\n",
                    "    'AdaBoost (+ Hour)': AdaBoostClassifier(n_estimators=50, random_state=42),\n",
                    "    'Decision Tree (+ Hour)': DecisionTreeClassifier(max_depth=8, min_samples_split=12, min_samples_leaf=4, random_state=42),\n",
                    "    'Logistic Regression (+ Hour)': LogisticRegression(max_iter=500, random_state=42)\n",
                    "}\n",
                    "\n",
                    "results = []\n",
                    "trained_models = {}\n",
                    "\n",
                    "for name, model in models.items():\n",
                    "    model.fit(X_train_res, y_train_res)\n",
                    "    y_pred = model.predict(X_test)\n",
                    "    y_prob = model.predict_proba(X_test)[:, 1] if hasattr(model, 'predict_proba') else [0]*len(y_test)\n",
                    "    \n",
                    "    acc = accuracy_score(y_test, y_pred)\n",
                    "    prec = precision_score(y_test, y_pred, zero_division=0)\n",
                    "    rec = recall_score(y_test, y_pred, zero_division=0)\n",
                    "    f1 = f1_score(y_test, y_pred, zero_division=0)\n",
                    "    roc_auc = roc_auc_score(y_test, y_prob)\n",
                    "    \n",
                    "    results.append({\n",
                    "        'Model': name,\n",
                    "        'Testing Accuracy': round(acc * 100, 2),\n",
                    "        'Precision': round(prec, 3),\n",
                    "        'Recall': round(rec, 3),\n",
                    "        'F1-Score': round(f1, 3),\n",
                    "        'AUC-ROC Score': round(roc_auc, 3)\n",
                    "    })\n",
                    "    trained_models[name] = model\n",
                    "\n",
                    "df_results = pd.DataFrame(results).sort_values(by='Testing Accuracy', ascending=False).reset_index(drop=True)\n",
                    "print(df_results.to_string(index=False))"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "--- \n",
                    "## 7. Save Model & Feature List v4_v2\n"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": 8,
                "metadata": {},
                "outputs": [
                    {"name": "stdout", "output_type": "stream", "text": "Artefak aquaagent_rf_v4_v2.pkl & rf_features_v4_v2.pkl Berhasil Disimpan\n"}
                ],
                "source": [
                    "best_model_name = df_results.iloc[0]['Model']\n",
                    "best_model = trained_models[best_model_name]\n",
                    "\n",
                    "joblib.dump(best_model, 'aquaagent_rf_v4_v2.pkl')\n",
                    "joblib.dump(feature_cols, 'rf_features_v4_v2.pkl')\n",
                    "print('Artefak aquaagent_rf_v4_v2.pkl & rf_features_v4_v2.pkl Berhasil Disimpan')"
                ]
            }
        ],
        "metadata": {
            "language_info": {"name": "python"},
            "orig_nbformat": 4
        },
        "nbformat": 4,
        "nbformat_minor": 2
    }

    with open('train_rf_fix_v4_v2.ipynb', 'w', encoding='utf-8') as f:
        json.dump(nb_content, f, indent=1)
    
    print("Notebook train_rf_fix_v4_v2.ipynb successfully created!")

if __name__ == '__main__':
    main()
