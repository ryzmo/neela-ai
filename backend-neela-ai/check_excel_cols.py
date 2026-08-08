import pandas as pd

excel_path = 'Data_Model_IoTMLCQ_2024.xlsx'
df_excel = pd.read_excel(excel_path)

print("Columns in Excel:")
for col in df_excel.columns:
    print(" -", col)

print("\nHead of Excel:")
print(df_excel.head())
