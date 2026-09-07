"""
Re-train model v2 dengan class_weight='balanced' untuk fix bias ke Stable.
"""
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier, HistGradientBoostingClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, f1_score
import warnings
warnings.filterwarnings('ignore')

print("=" * 60)
print("  RE-TRAIN MODEL v2 (+ class_weight='balanced')")
print("=" * 60)

# ── 1. Load Dataset ──
df = pd.read_csv('archive (9)/Ponds data.csv', low_memory=False)

numeric_cols = ['TEMP', 'DO', 'PH', 'TURBIDITY', 'label']
for col in numeric_cols:
    df[col] = pd.to_numeric(df[col], errors='coerce')

df = df.dropna(subset=numeric_cols).copy()

df['hour'] = pd.to_datetime(df['Time'], format='%H:%M:%S', errors='coerce').dt.hour
df = df.dropna(subset=['hour']).copy()

print(f"\nDataset: {df.shape}")
print(f"Label: {df['label'].value_counts().to_dict()}")

# ── 2. Feature Engineering (sama persis dengan v2) ──
df['PH_dist_7'] = np.abs(df['PH'] - 7.0)
df['TEMP_DO_ratio'] = df['DO'] / (df['TEMP'] + 1.0)
df['TURB_DO_ratio'] = df['TURBIDITY'] / (df['DO'] + 0.1)
df['TEMP_PH_ratio'] = df['TEMP'] / (df['PH'] + 0.1)
df['hour_sin'] = np.sin(2 * np.pi * df['hour'] / 24.0)
df['hour_cos'] = np.cos(2 * np.pi * df['hour'] / 24.0)

features_v2 = [
    'TEMP', 'DO', 'PH', 'TURBIDITY', 'hour',
    'PH_dist_7', 'TEMP_DO_ratio', 'TURB_DO_ratio', 'TEMP_PH_ratio',
    'hour_sin', 'hour_cos'
]

# ── 3. Split ──
X = df[features_v2]
y = df['label'].astype(int)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f"\nTrain: {len(X_train)}, Test: {len(X_test)}")

# ── 4. Training dengan class_weight='balanced' ──
models = {
    'HistGBT (balanced)': HistGradientBoostingClassifier(
        max_iter=300, learning_rate=0.05, max_depth=15,
        class_weight='balanced', random_state=42
    ),
    'RandomForest (balanced)': RandomForestClassifier(
        n_estimators=300, max_depth=25,
        class_weight='balanced', random_state=42, n_jobs=-1
    ),
    'ExtraTrees (balanced)': ExtraTreesClassifier(
        n_estimators=300, max_depth=25,
        class_weight='balanced', random_state=42, n_jobs=-1
    ),
}

print("\n" + "=" * 60)
print("  TRAINING & EVALUASI")
print("=" * 60)

best_name = None
best_f1 = 0
best_model = None

for name, model in models.items():
    print(f"\nTraining {name}...")
    model.fit(X_train, y_train)
    pred = model.predict(X_test)

    acc = accuracy_score(y_test, pred)
    f1 = f1_score(y_test, pred, average='weighted')

    print(f"  Accuracy : {acc*100:.4f}%")
    print(f"  F1-Score : {f1:.4f}")
    print(f"  Report:")
    print(classification_report(y_test, pred, target_names=['Normal (0)', 'Tidak Normal (1)']))

    if f1 > best_f1:
        best_f1 = f1
        best_name = name
        best_model = model

# ── 5. Save Model Terbaik ──
print("=" * 60)
print(f"  BEST MODEL: {best_name}")
print(f"  F1-Score  : {best_f1:.4f}")
print("=" * 60)

joblib.dump(best_model, 'aquaagent_rf_v2.pkl')
print("\n✅ Model saved: aquaagent_rf_v2.pkl")

joblib.dump(features_v2, 'rf_features_v2.pkl')
print("✅ Features saved: rf_features_v2.pkl")

# ── 6. Quick Test ──
print("\n" + "=" * 60)
print("  QUICK TEST")
print("=" * 60)

def calculate_do(temp):
    return round(14.652 - 0.41022*temp + 0.007991*(temp**2) - 0.000077774*(temp**3), 2)

tests = [
    ("Normal",      27.0, 7.2, 10.0, 10),
    ("Buruk",       35.0, 4.5, 80.0, 14),
    ("Borderline",  30.0, 6.0, 25.0, 18),
]

for label, temp, ph, turb, hour in tests:
    do = calculate_do(temp)
    sample = pd.DataFrame([{
        'TEMP': temp, 'DO': do, 'PH': ph, 'TURBIDITY': turb, 'hour': hour,
        'PH_dist_7': abs(ph - 7.0),
        'TEMP_DO_ratio': do / (temp + 1.0),
        'TURB_DO_ratio': turb / (do + 0.1),
        'TEMP_PH_ratio': temp / (ph + 0.1),
        'hour_sin': np.sin(2*np.pi*hour/24.0),
        'hour_cos': np.cos(2*np.pi*hour/24.0),
    }])
    pred = best_model.predict(sample)[0]
    prob = best_model.predict_proba(sample)
    status = "Stable" if pred == 0 else "At Risk"
    print(f"\n  {label}: TEMP={temp}, DO={do}, PH={ph}, TURB={turb}, hour={hour}")
    print(f"    → {status} (confidence: {prob.max():.4f})")
