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

# 1. Load Excel and original 'Health Status'
excel_path = 'Data_Model_IoTMLCQ_2024.xlsx'
df_excel = pd.read_excel(excel_path)
temp_col = [c for c in df_excel.columns if 'Temperature (' in c][0]

df_clean = pd.DataFrame({
    'TEMP': pd.to_numeric(df_excel[temp_col], errors='coerce'),
    'DO': pd.to_numeric(df_excel['Dissolved Oxygen (mg/L)'], errors='coerce'),
    'PH': pd.to_numeric(df_excel['pH'], errors='coerce'),
    'TURBIDITY': pd.to_numeric(df_excel['Turbidity (NTU)'], errors='coerce'),
    'hour': pd.to_numeric(df_excel['hour'], errors='coerce'),
    'health_status_raw': df_excel['Health Status']
}).dropna().reset_index(drop=True)

df_clean['label'] = df_clean['health_status_raw'].map({'Stable': 0, 'At Risk': 1}).fillna(0).astype(int)

# 2. Stratified Train-Test Split (80:20) FIRST
df_train_raw, df_test_raw = train_test_split(
    df_clean, test_size=0.2, random_state=42, stratify=df_clean['label']
)

print(f"Train Raw: {len(df_train_raw)}, Test Raw: {len(df_test_raw)}")

# 3. Add Gaussian Noise ONLY to df_train_raw (Simulating Sensor Noise)
np.random.seed(42)
df_train_noise = df_train_raw.copy()
df_train_noise['TEMP'] = df_train_noise['TEMP'] + np.random.normal(0, 0.35, size=len(df_train_noise))
df_train_noise['PH'] = (df_train_noise['PH'] + np.random.normal(0, 0.08, size=len(df_train_noise))).clip(0, 14)
df_train_noise['TURBIDITY'] = (df_train_noise['TURBIDITY'] + np.random.normal(0, 0.6, size=len(df_train_noise))).clip(0, None)
df_train_noise['DO'] = (df_train_noise['DO'] + np.random.normal(0, 0.25, size=len(df_train_noise))).clip(0, None)

# Function for Feature Engineering
def add_features(df):
    d = df.copy()
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

df_train_feat = add_features(df_train_noise)
df_test_feat = add_features(df_test_raw)

X_train = df_train_feat[feature_cols]
y_train = df_train_feat['label']
X_test = df_test_feat[feature_cols]
y_test = df_test_feat['label']

# 4. Apply SMOTE to training set
smote = SMOTE(sampling_strategy=0.6, random_state=42)
X_train_res, y_train_res = smote.fit_resample(X_train, y_train)

# 5. Train & Evaluate 7 Models
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
for name, m in models.items():
    m.fit(X_train_res, y_train_res)
    y_pred = m.predict(X_test)
    y_prob = m.predict_proba(X_test)[:, 1] if hasattr(m, 'predict_proba') else [0]*len(y_test)
    
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

df_res = pd.DataFrame(results).sort_values(by='Testing Accuracy', ascending=False)
print("\n--- RESULTS FOR MODEL V4_V3 WITH GAUSSIAN NOISE INJECTION (NO EXTRA SYNTHETIC ROWS) ---")
print(df_res.to_string(index=False))

rf = models['Random Forest (+ Hour)']
y_pred_rf = rf.predict(X_test)
print("\nRandom Forest Confusion Matrix:")
print(confusion_matrix(y_test, y_pred_rf))
