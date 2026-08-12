import json
import pandas as pd

with open('train_rf_fix_v4_v3_v2.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

global_env = {}
for idx, cell in enumerate(nb['cells']):
    if cell['cell_type'] == 'code':
        source = ''.join(cell['source'])
        try:
            exec(source, global_env)
        except Exception as e:
            print(f"Error in cell {idx}: {e}")

if 'df_results' in global_env and 'cv_scores' in global_env:
    df_res = global_env['df_results'].copy()
    cv_scores = global_env['cv_scores']
    df_res['CV Accuracy (%)'] = df_res['Model'].map(lambda x: f"{cv_scores[x][0]:.2f}% ± {cv_scores[x][1]:.2f}%")
    print(df_res.to_markdown(index=False))
