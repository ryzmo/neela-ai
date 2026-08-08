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

# Map Health Status: 'Stable' -> 0, 'At Risk' -> 1
df_clean['label'] = df_clean['health_status_raw'].map({'Stable': 0, 'At Risk': 1}).fillna(0).astype(int)

print(f"Dataset Asli Loaded: {df_clean.shape[0]} baris")
print("Original Health Status distribution:")
print(df_clean['label'].value_counts())

# 2. Feature Engineering (11 fitur deviasi/rasio)
df_feat = df_clean.copy()
# Deviation features based on mean/optimal or physical bounds
df_feat['risk_flag'] = np.where(df_feat['label'] == 1, 1.0, 0.0)
df_feat['PH_dev'] = (df_feat['PH'] - 7.5).abs()
df_feat['TEMP_dev'] = np.maximum(0, df_feat['TEMP'] - 32.0) + np.maximum(0, 25.0 - df_feat['TEMP'])
df_feat['TURB_dev'] = np.maximum(0, df_feat['TURBIDITY'] - 25.0)
df_feat['DO_dev'] = np.maximum(0, 5.0 - df_feat['DO'])
df_feat['PH_dist_7'] = (df_feat['PH'] - 7.0).abs()
df_feat['TEMP_DO_ratio'] = df_feat['DO'] / (df_feat['TEMP'] + 1.0)
df_feat['TURB_DO_ratio'] = df_feat['TURBIDITY'] / (df_feat['DO'] + 0.1)
df_feat['TEMP_PH_ratio'] = df_feat['TEMP'] / (df_feat['PH'] + 0.1)
df_feat['hour_sin'] = np.sin(2 * np.pi * df_feat['hour'] / 24.0)
df_feat['hour_cos'] = np.cos(2 * np.pi * df_feat['hour'] / 24.0)

feature_cols = [
    'TEMP', 'DO', 'PH', 'TURBIDITY', 'hour',
    'PH_dev', 'TEMP_dev', 'TURB_dev', 'DO_dev',
    'PH_dist_7', 'TEMP_DO_ratio', 'TURB_DO_ratio', 'TEMP_PH_ratio',
    'hour_sin', 'hour_cos'
]

X = df_feat[feature_cols]
y = df_feat['label']

# 3. Train-Test Split (80:20)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f"\nTrain size: {len(X_train)}, Test size: {len(X_test)}")
print(f"y_test counts:\n{y_test.value_counts()}")

# 4. SMOTE on Training Set
smote = SMOTE(sampling_strategy=0.6, random_state=42)
X_train_res, y_train_res = smote.fit_resample(X_train, y_train)

print(f"\nX_train_res counts:\n{y_train_res.value_counts()}")

# 5. Evaluate 7 Models
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
        'Accuracy': round(acc*100, 2),
        'Precision': round(prec, 3),
        'Recall': round(rec, 3),
        'F1': round(f1, 3),
        'AUC': round(roc_auc, 3)
    })

df_res = pd.DataFrame(results).sort_values(by='Accuracy', ascending=False)
print("\n--- RESULTS FOR MODEL V4_V3 (ORIGINAL HEALTH STATUS & SMOTE, NO SYNTHETIC NOISE) ---")
print(df_res.to_string(index=False))

rf = models['Random Forest (+ Hour)']
y_pred_rf = rf.predict(X_test)
print("\nRandom Forest Confusion Matrix:")
print(confusion_matrix(y_test, y_pred_rf))
print("\nRandom Forest Classification Report:")
print(classification_report(y_test, y_pred_rf))
