import json
import io
import sys
import os
import contextlib
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import base64

def main():
    print("Populating execution outputs & base64 plots into train_rf_fix_v4_v3.ipynb...")
    
    with open('train_rf_fix_v4_v3.ipynb', 'r', encoding='utf-8') as f:
        nb = json.load(f)
        
    global_env = {}
    
    # Persistent monkeypatch on plt.show so figures stay open for capture
    custom_show = lambda *args, **kwargs: None
    
    for idx, cell in enumerate(nb['cells']):
        if cell['cell_type'] == 'code':
            code = "".join(cell['source'])
            print(f"Executing cell {cell['execution_count']}...")
            
            f_out = io.StringIO()
            outputs = []
            plt.close('all')
            
            with contextlib.redirect_stdout(f_out):
                try:
                    exec(code, global_env)
                    if 'plt' in global_env:
                        global_env['plt'].show = custom_show
                    if 'matplotlib.pyplot' in sys.modules:
                        sys.modules['matplotlib.pyplot'].show = custom_show
                except Exception as e:
                    print(f"Error in cell {cell['execution_count']}: {e}")
                    
            stdout_str = f_out.getvalue()
            if stdout_str:
                outputs.append({
                    "name": "stdout",
                    "output_type": "stream",
                    "text": [line + "\n" for line in stdout_str.splitlines()]
                })
                
            fig_nums = plt.get_fignums()
            if fig_nums:
                for fig_num in fig_nums:
                    fig = plt.figure(fig_num)
                    img_buf = io.BytesIO()
                    fig.savefig(img_buf, format='png', bbox_inches='tight')
                    img_buf.seek(0)
                    b64_str = base64.b64encode(img_buf.read()).decode('utf-8')
                    outputs.append({
                        "data": {
                            "image/png": b64_str,
                            "text/plain": [f"<Figure size {fig.get_size_inches()[0]*100:.0f}x{fig.get_size_inches()[1]*100:.0f} with {len(fig.axes)} Axes>"]
                        },
                        "execution_count": cell['execution_count'],
                        "metadata": {},
                        "output_type": "display_data"
                    })
                plt.close('all')
                
            cell['outputs'] = outputs
            
    with open('train_rf_fix_v4_v3.ipynb', 'w', encoding='utf-8') as f:
        json.dump(nb, f, indent=1)
        
    print("All cell outputs and base64 plots successfully populated in train_rf_fix_v4_v3.ipynb!")

if __name__ == '__main__':
    main()
