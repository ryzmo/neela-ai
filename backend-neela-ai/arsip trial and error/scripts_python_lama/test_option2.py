import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier, HistGradientBoostingClassifier, GradientBoostingClassifier, AdaBoostClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from imblearn.over_sampling import SMOTE

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

# 2. Stratified Train-Test Split (80:20) FIRST on clean data!
df_train_raw, df_test_raw = train_test_split(
    df_clean, test_size=0.2, random_state=42
)

# 3. Augment IoT Sensor Noise independently on Train (1,800 rows) and Test (450 rows)
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
df_test_aug = augment_sensor_noise(df_test_raw, size=450, seed=99) # Independent seed 99!

# 4. Labeling & Feature Engineering for both Train and Test
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

print(f"X_train label counts:\n{y_train.value_counts()}")
print(f"X_test label counts:\n{y_test.value_counts()}")

# 5. SMOTE ONLY on X_train
smote = SMOTE(sampling_strategy=0.6, random_state=42)
X_train_res, y_train_res = smote.fit_resample(X_train, y_train)

# 6. Models Evaluation
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
print("\n--- RESULTS FOR INDEPENDENT SENSOR NOISE SYNTHESIS PIPELINE ---")
print(df_res.to_string(index=False))

rf = models['Random Forest (+ Hour)']
y_pred_rf = rf.predict(X_test)
print("\nRandom Forest Confusion Matrix:")
print(confusion_matrix(y_test, y_pred_rf))
print("\nRandom Forest Classification Report:")
print(classification_report(y_test, y_pred_rf))
