import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
from imblearn.over_sampling import SMOTE

# Let's run EXACTLY the logic in train_rf_fix_v4.ipynb
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

# In train_rf_fix_v4.ipynb:
np.random.seed(42)
extra_idx = np.random.choice(len(df_clean), size=1800, replace=True)
df_extra = df_clean.iloc[extra_idx].copy()

scale = 1.2
df_extra['TEMP'] += np.random.normal(0, 0.4 * scale, size=len(df_extra))
df_extra['PH'] += np.random.normal(0, 0.1 * scale, size=len(df_extra))
df_extra['TURBIDITY'] += np.random.normal(0, 1.0 * scale, size=len(df_extra))

df_feat = pd.concat([df_clean, df_extra], ignore_index=True)

is_fig1_optimal = (
    (df_feat['TEMP'] >= 25.0) & (df_feat['TEMP'] <= 32.0) &
    (df_feat['PH'] >= 7.0) & (df_feat['PH'] <= 8.0) &
    (df_feat['DO'] >= 5.0) &
    (df_feat['TURBIDITY'] <= 25.0)
)
df_feat['label'] = np.where(is_fig1_optimal, 0, 1)

np.random.seed(42)
boundary_noise = np.random.rand(len(df_feat)) < 0.058
df_feat['label'] = np.where(boundary_noise, 1 - df_feat['label'].values, df_feat['label'].values)

df_feat['risk_flag'] = (~is_fig1_optimal).astype(float)
df_feat['PH_dev'] = np.abs(df_feat['PH'] - 7.5)
df_feat['TEMP_dev'] = np.maximum(0, df_feat['TEMP'] - 32.0) + np.maximum(0, 25.0 - df_feat['TEMP'])
df_feat['TURB_dev'] = np.maximum(0, df_feat['TURBIDITY'] - 25.0)
df_feat['DO_dev'] = np.maximum(0, 5.0 - df_feat['DO'])
df_feat['PH_dist_7'] = np.abs(df_feat['PH'] - 7.0)
df_feat['TEMP_DO_ratio'] = df_feat['DO'] / (df_feat['TEMP'] + 1.0)
df_feat['TURB_DO_ratio'] = df_feat['TURBIDITY'] / (df_feat['DO'] + 0.1)
df_feat['TEMP_PH_ratio'] = df_feat['TEMP'] / (df_feat['PH'] + 0.1)
df_feat['hour_sin'] = np.sin(2 * np.pi * df_feat['hour'] / 24.0)
df_feat['hour_cos'] = np.cos(2 * np.pi * df_feat['hour'] / 24.0)

feature_cols = [
    'TEMP', 'DO', 'PH', 'TURBIDITY', 'hour',
    'risk_flag', 'PH_dev', 'TEMP_dev', 'TURB_dev', 'DO_dev',
    'PH_dist_7', 'TEMP_DO_ratio', 'TURB_DO_ratio', 'TEMP_PH_ratio',
    'hour_sin', 'hour_cos'
]

X = df_feat[feature_cols]
y = df_feat['label']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print("v4 Original y_test counts:", y_test.value_counts().to_dict())
smote = SMOTE(sampling_strategy=0.6, random_state=42)
X_train_res, y_train_res = smote.fit_resample(X_train, y_train)

rf = RandomForestClassifier(n_estimators=100, max_depth=8, min_samples_split=12, min_samples_leaf=4, random_state=42)
rf.fit(X_train_res, y_train_res)
y_pred = rf.predict(X_test)

print("--- ORIGINAL V4 CONFUSION MATRIX ---")
print(confusion_matrix(y_test, y_pred))
print(classification_report(y_test, y_pred))
