import numpy as np
import pandas as pd
import joblib
import sys

# Set stdout encoding to utf-8 if possible
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Load Model v4_v3 & Features List
model = joblib.load('aquaagent_rf_v4_v3.pkl')
feature_cols = joblib.load('rf_features_v4_v3.pkl')

print(f"Model v4_v3 Loaded Successfully: {type(model).__name__}")
print(f"Fitur Input ({len(feature_cols)} Total): {feature_cols}\n")

# Define 10 Diverse Telemetry Scenarios
scenarios = [
    {
        'name': '1. Air Pagi Ideal',
        'TEMP': 27.2, 'DO': 6.5, 'PH': 7.8, 'TURBIDITY': 3.5, 'hour': 6.0,
        'expected': 'Stable (Normal)'
    },
    {
        'name': '2. Air Siang Normal',
        'TEMP': 29.5, 'DO': 5.8, 'PH': 7.6, 'TURBIDITY': 8.2, 'hour': 13.0,
        'expected': 'Stable (Normal)'
    },
    {
        'name': '3. Malam Suhu Hangat',
        'TEMP': 31.2, 'DO': 5.2, 'PH': 7.4, 'TURBIDITY': 12.0, 'hour': 21.0,
        'expected': 'Stable (Normal)'
    },
    {
        'name': '4. Thermal Stress (Suhu Ekstrem >32°C)',
        'TEMP': 34.8, 'DO': 4.5, 'PH': 8.4, 'TURBIDITY': 18.0, 'hour': 14.0,
        'expected': 'At Risk (Bahaya)'
    },
    {
        'name': '5. Hypoxia (DO Drop Kritis <5.0 mg/L)',
        'TEMP': 28.5, 'DO': 2.8, 'PH': 7.3, 'TURBIDITY': 10.0, 'hour': 4.0,
        'expected': 'At Risk (Bahaya)'
    },
    {
        'name': '6. Acidification (pH Asam <7.0)',
        'TEMP': 27.8, 'DO': 5.1, 'PH': 5.6, 'TURBIDITY': 15.0, 'hour': 10.0,
        'expected': 'At Risk (Bahaya)'
    },
    {
        'name': '7. Kekeruhan Tinggi (>25 NTU)',
        'TEMP': 29.0, 'DO': 4.2, 'PH': 8.5, 'TURBIDITY': 38.5, 'hour': 16.0,
        'expected': 'At Risk (Bahaya)'
    },
    {
        'name': '8. Krisis Badai Hujan (DO Drop & Turbidity Spike)',
        'TEMP': 25.2, 'DO': 3.4, 'PH': 6.4, 'TURBIDITY': 45.0, 'hour': 18.0,
        'expected': 'At Risk (Bahaya)'
    },
    {
        'name': '9. Ambang Batas Dekat Normal (Borderline Safe)',
        'TEMP': 31.8, 'DO': 5.1, 'PH': 7.1, 'TURBIDITY': 23.0, 'hour': 11.0,
        'expected': 'Stable (Normal)'
    },
    {
        'name': '10. Ambang Batas Dekat Bahaya (Borderline Risk)',
        'TEMP': 32.4, 'DO': 4.8, 'PH': 6.9, 'TURBIDITY': 26.5, 'hour': 15.0,
        'expected': 'At Risk (Bahaya)'
    }
]

df_test = pd.DataFrame(scenarios)

# Function for Feature Engineering exactly matching v4_v3
def add_features(df):
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

df_feat = add_features(df_test)
X_scen = df_feat[feature_cols]

preds = model.predict(X_scen)
probs = model.predict_proba(X_scen) if hasattr(model, 'predict_proba') else None

print("=== HASIL PENGUJIAN INFERENSI MODEL v4_v3 PADA 10 SKENARIO TAMBAK ===")
print("-" * 115)
print(f"{'Skenario':<50} | {'Sensor Values (T, DO, pH, Turb)':<30} | {'Prediksi Model':<20} | {'Confidence'}")
print("-" * 115)

for i, row in df_test.iterrows():
    p = preds[i]
    prob_pct = probs[i][p] * 100 if probs is not None else 100.0
    label_str = "[NORMAL] Stable" if p == 0 else "[BAHAYA] At Risk"
    sensor_str = f"T:{row['TEMP']}°C, DO:{row['DO']}, pH:{row['PH']}, Turb:{row['TURBIDITY']}"
    print(f"{row['name']:<50} | {sensor_str:<30} | {label_str:<20} | {prob_pct:.1f}%")

print("-" * 115)
