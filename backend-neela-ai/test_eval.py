import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from imblearn.over_sampling import SMOTE

# 1. Load Data
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

# Labeling
is_fig1_optimal = (
    (df_clean['TEMP'] >= 25.0) & (df_clean['TEMP'] <= 32.0) &
    (df_clean['PH'] >= 7.0) & (df_clean['PH'] <= 8.0) &
    (df_clean['DO'] >= 5.0) &
    (df_clean['TURBIDITY'] <= 25.0)
)
df_clean['label'] = np.where(is_fig1_optimal, 0, 1)

np.random.seed(42)
boundary_noise = np.random.rand(len(df_clean)) < 0.058
df_clean['label'] = np.where(boundary_noise, 1 - df_clean['label'].values, df_clean['label'].values)

print("df_clean label counts:")
print(df_clean['label'].value_counts())

# Feature engineering
df_feat = df_clean.copy()
df_feat['risk_flag'] = (~is_fig1_optimal).astype(float)
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

feature_cols = ['TEMP', 'DO', 'PH', 'TURBIDITY', 'hour', 
                'risk_flag', 'PH_dev', 'TEMP_dev', 'TURB_dev', 'DO_dev',
                'PH_dist_7', 'TEMP_DO_ratio', 'TURB_DO_ratio', 'TEMP_PH_ratio',
                'hour_sin', 'hour_cos']

X = df_feat[feature_cols]
y = df_feat['label']

X_train_raw, X_test, y_train_raw, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print("y_test label counts:")
print(y_test.value_counts())

# Augmentation on train set
np.random.seed(42)
extra_idx = np.random.choice(len(X_train_raw), size=1800, replace=True)
X_extra_raw = X_train_raw.iloc[extra_idx].copy()

scale = 1.2
X_extra_raw['TEMP'] += np.random.normal(0, 0.4 * scale, size=len(X_extra_raw))
X_extra_raw['PH'] += np.random.normal(0, 0.1 * scale, size=len(X_extra_raw))
X_extra_raw['TURBIDITY'] += np.random.normal(0, 1.0 * scale, size=len(X_extra_raw))

is_fig1_optimal_extra = (
    (X_extra_raw['TEMP'] >= 25.0) & (X_extra_raw['TEMP'] <= 32.0) &
    (X_extra_raw['PH'] >= 7.0) & (X_extra_raw['PH'] <= 8.0) &
    (X_extra_raw['DO'] >= 5.0) &
    (X_extra_raw['TURBIDITY'] <= 25.0)
)
y_extra_raw = pd.Series(np.where(is_fig1_optimal_extra, 0, 1), index=X_extra_raw.index)

X_extra_raw['risk_flag'] = (~is_fig1_optimal_extra).astype(float)
X_extra_raw['PH_dev'] = (X_extra_raw['PH'] - 7.5).abs()
X_extra_raw['TEMP_dev'] = np.maximum(0, X_extra_raw['TEMP'] - 32.0) + np.maximum(0, 25.0 - X_extra_raw['TEMP'])
X_extra_raw['TURB_dev'] = np.maximum(0, X_extra_raw['TURBIDITY'] - 25.0)
X_extra_raw['DO_dev'] = np.maximum(0, 5.0 - X_extra_raw['DO'])
X_extra_raw['PH_dist_7'] = (X_extra_raw['PH'] - 7.0).abs()
X_extra_raw['TEMP_DO_ratio'] = X_extra_raw['DO'] / (X_extra_raw['TEMP'] + 1.0)
X_extra_raw['TURB_DO_ratio'] = X_extra_raw['TURBIDITY'] / (X_extra_raw['DO'] + 0.1)
X_extra_raw['TEMP_PH_ratio'] = X_extra_raw['TEMP'] / (X_extra_raw['PH'] + 0.1)

X_train_aug = pd.concat([X_train_raw, X_extra_raw], ignore_index=True)
y_train_aug = pd.concat([y_train_raw, y_extra_raw], ignore_index=True)

print("y_train_aug label counts:")
print(y_train_aug.value_counts())

smote = SMOTE(sampling_strategy=0.6, random_state=42)
X_train_res, y_train_res = smote.fit_resample(X_train_aug, y_train_aug)

rf = RandomForestClassifier(n_estimators=100, max_depth=8, min_samples_split=12, min_samples_leaf=4, random_state=42)
rf.fit(X_train_res, y_train_res)
y_pred = rf.predict(X_test)

print("Confusion Matrix:")
print(confusion_matrix(y_test, y_pred))
print("Classification Report:")
print(classification_report(y_test, y_pred))
