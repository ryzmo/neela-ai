import json

nb_path = 'd:/aquaagent-web/backend-neela-ai/train_rf_fix_v4.ipynb'
with open(nb_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

# Update Cell 2 imports to include joblib
cell_2_code = """%pip install -q imbalanced-learn

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import joblib

from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score, learning_curve
from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier, HistGradientBoostingClassifier, GradientBoostingClassifier, AdaBoostClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, classification_report, confusion_matrix,
    precision_score, recall_score, f1_score, roc_auc_score,
    roc_curve, precision_recall_curve, average_precision_score
)
from imblearn.over_sampling import SMOTE

import warnings
warnings.filterwarnings('ignore')

plt.style.use('seaborn-v0_8-whitegrid')
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.size'] = 10
plt.rcParams['figure.dpi'] = 120

COLORS = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2']

print('✅ Environment & Library Setup (SMOTE Enabled) Selesai')
"""

# Update Cell 50 to include import joblib at top
cell_50_code = """import joblib

joblib.dump(best_model, 'aquaagent_rf_v4.pkl')
joblib.dump(features_engineered, 'rf_features_v4.pkl')

print(f'✅ Model v4 disimpan: aquaagent_rf_v4.pkl')
print(f'✅ Features v4 disimpan: rf_features_v4.pkl')
print(f'\\n📊 Model Terbaik: {best_model_name}')
print(f'📊 Jumlah Fitur: {len(features_engineered)}')
print(f'📊 Daftar Fitur: {features_engineered}')
"""

def set_source(cell, code_str):
    cell['source'] = [line + '\n' for line in code_str.split('\n')]
    if cell['source'] and cell['source'][-1] == '\n':
        cell['source'][-1] = ''

set_source(nb['cells'][2], cell_2_code)
set_source(nb['cells'][50], cell_50_code)

with open(nb_path, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1, ensure_ascii=False)

print("[SUCCESS] Added import joblib to Cell 2 and Cell 50 of train_rf_fix_v4.ipynb")
