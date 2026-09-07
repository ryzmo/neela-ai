import pandas as pd

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

print("=== STATISTIK NILAI MIN & MAX DATASET MURNI EXCEL ===")
print(f"Total Baris Data: {len(df_clean)}")
print(f"Suhu (TEMP)      : Min = {df_clean['TEMP'].min():.2f}°C, Max = {df_clean['TEMP'].max():.2f}°C  (Batas Aman: 25.0 - 32.0°C)")
print(f"DO (Oksigen)     : Min = {df_clean['DO'].min():.2f} mg/L, Max = {df_clean['DO'].max():.2f} mg/L  (Batas Aman: >= 5.0 mg/L)")
print(f"pH               : Min = {df_clean['PH'].min():.2f}, Max = {df_clean['PH'].max():.2f}        (Batas Aman: 7.0 - 8.0)")
print(f"Kekeruhan (TURB) : Min = {df_clean['TURBIDITY'].min():.2f} NTU, Max = {df_clean['TURBIDITY'].max():.2f} NTU  (Batas Aman: <= 25.0 NTU)")

print("\n=== VERIFIKASI BARIS DI LUAR BATAS AMAN ===")
out_temp = df_clean[(df_clean['TEMP'] < 25.0) | (df_clean['TEMP'] > 32.0)]
out_do = df_clean[df_clean['DO'] < 5.0]
out_ph = df_clean[(df_clean['PH'] < 7.0) | (df_clean['PH'] > 8.0)]
out_turb = df_clean[df_clean['TURBIDITY'] > 25.0]

print(f"Jumlah baris Suhu di luar batas (25-32°C)      : {len(out_temp)} baris")
print(f"Jumlah baris DO di luar batas (< 5.0 mg/L)     : {len(out_do)} baris")
print(f"Jumlah baris pH di luar batas (7.0 - 8.0)      : {len(out_ph)} baris")
print(f"Jumlah baris Kekeruhan di luar batas (> 25 NTU): {len(out_turb)} baris")

is_opt = (
    (df_clean['TEMP'] >= 25.0) & (df_clean['TEMP'] <= 32.0) &
    (df_clean['PH'] >= 7.0) & (df_clean['PH'] <= 8.0) &
    (df_clean['DO'] >= 5.0) &
    (df_clean['TURBIDITY'] <= 25.0)
)

print(f"\nTotal Baris OPTIMAL / NORMAL (Label 0) : {is_opt.sum()} baris ({is_opt.sum()/len(df_clean)*100:.2f}%)")
print(f"Total Baris AT RISK / BAHAYA (Label 1)  : {(~is_opt).sum()} baris ({(~is_opt).sum()/len(df_clean)*100:.2f}%)")
