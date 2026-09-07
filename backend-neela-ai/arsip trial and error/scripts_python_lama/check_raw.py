import pandas as pd

df_excel = pd.read_excel('Data_Model_IoTMLCQ_2024.xlsx')
temp_col = [c for c in df_excel.columns if 'Temperature (' in c][0]

df_clean = pd.DataFrame({
    'TEMP': pd.to_numeric(df_excel[temp_col], errors='coerce'),
    'DO': pd.to_numeric(df_excel['Dissolved Oxygen (mg/L)'], errors='coerce'),
    'PH': pd.to_numeric(df_excel['pH'], errors='coerce'),
    'TURBIDITY': pd.to_numeric(df_excel['Turbidity (NTU)'], errors='coerce'),
    'hour': pd.to_numeric(df_excel['hour'], errors='coerce')
}).dropna().reset_index(drop=True)

is_opt = (
    (df_clean['TEMP'] >= 25.0) & (df_clean['TEMP'] <= 32.0) &
    (df_clean['PH'] >= 7.0) & (df_clean['PH'] <= 8.0) &
    (df_clean['DO'] >= 5.0) &
    (df_clean['TURBIDITY'] <= 25.0)
)

print(f"Total rows in df_clean: {len(df_clean)}")
print(f"Total optimal rows in df_clean: {is_opt.sum()}")
print(f"Total non-optimal rows in df_clean: {(~is_opt).sum()}")
