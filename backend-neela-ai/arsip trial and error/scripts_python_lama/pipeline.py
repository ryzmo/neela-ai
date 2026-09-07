import pandas as pd
import joblib
import json
from openai import OpenAI

# OPENAI CLIENT

client = OpenAI()

# LOAD RANDOM FOREST MODEL

rf = joblib.load("aquaagent_rf.pkl")

# =====================================
# SENSOR INPUT (SIMULASI REALTIME)
# =====================================

temp = 31
do = 4.2
ph = 8.5
turbidity = 15
hour = 14

# =====================================
# BUILD DATAFRAME FOR RF
# =====================================

sample = pd.DataFrame([{

'Temperature (°C)': temp,

'Dissolved Oxygen (mg/L)': do,

'pH': ph,

'Turbidity (NTU)': turbidity,

'hour': hour

}])

# =====================================
# RANDOM FOREST PREDICTION
# =====================================

prediction = rf.predict(sample)[0]

print("\nRF Health Prediction:", prediction)

# =====================================
# LLM DECISION MAKER PROMPT
# =====================================

prompt = f"""

You are AQUAAGENT.

An autonomous AI agent for smart fish farming.

Fish Pond Condition:

Health Status = {prediction}

Sensor Data:

Temperature = {temp} °C
Dissolved Oxygen = {do} mg/L
pH = {ph}
Turbidity = {turbidity} NTU
Hour = {hour}

Available actuators:

1. Aerator
2. Feeder
3. Water Circulation
4. pH Neutralizer

Decision rules:

- Low dissolved oxygen → Aerator ON
- Elevated temperature → Water Circulation ON
- Abnormal pH → pH Neutralizer ON
- Risk condition → Feeder OFF

Return ONLY valid JSON.

{{
"aerator":"",
"feeder":"",
"water_circulation":"",
"ph_neutralizer":"",
"reason":""
}}

"""

# =====================================
# GPT API CALL
# =====================================

response = client.chat.completions.create(

    model="gpt-4.1-mini",

    messages=[

        {
            "role":"user",
            "content":prompt
        }

    ]

)

# =====================================
# OUTPUT
# =====================================

decision = response.choices[0].message.content

print("\nLLM Decision:\n")

print(decision)

# CLEAN MARKDOWN JSON

cleaned = decision.replace(
    "```json",""
).replace(
    "```",""
).strip()

# JSON VALIDATION

try:

    parsed = json.loads(cleaned)

    print("\nParsed JSON Success.")

    print("\nParsed Output:\n")

    print(parsed)

except Exception as e:

    print("\nJSON parsing failed.")

    print(e)