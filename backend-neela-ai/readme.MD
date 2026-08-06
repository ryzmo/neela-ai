pip install pandas numpy scikit-learn openpyxl matplotlib seaborn joblib

source venv/Scripts/activate

pip freeze > requirements.txt

pip install openai

pip install fastapi uvicorn

uvicorn app:app --reload
uvicorn app:app --host 0.0.0.0 --port 8000 --reload



// ini real app.py

from fastapi import FastAPI
from pydantic import BaseModel

import pandas as pd
import joblib
import json

from openai import OpenAI

# ==========================================
# INIT
# ==========================================

app = FastAPI(
    title="AQUAAGENT API",
    description="Hybrid Random Forest + LLM Fish Farm Decision System",
    version="1.0"
)

client = OpenAI()

rf = joblib.load("aquaagent_rf.pkl")

# ==========================================
# INPUT SCHEMA
# ==========================================

class SensorInput(BaseModel):

    temperature: float
    do: float
    ph: float
    turbidity: float
    hour: int

# ==========================================
# ROOT ROUTE
# ==========================================

@app.get("/")

def root():

    return {
        "message":"AQUAAGENT API Running"
    }

# ==========================================
# ANALYZE ROUTE
# ==========================================

@app.post("/analyze")

def analyze(sensor: SensorInput):

    # ----------------------------------
    # BUILD RF INPUT
    # ----------------------------------

    sample = pd.DataFrame([{

        'Temperature (°C)': sensor.temperature,

        'Dissolved Oxygen (mg/L)': sensor.do,

        'pH': sensor.ph,

        'Turbidity (NTU)': sensor.turbidity,

        'hour': sensor.hour

    }])

    # ----------------------------------
    # RANDOM FOREST PREDICTION
    # ----------------------------------

    health_status = rf.predict(sample)[0]

    confidence = rf.predict_proba(sample).max()

    # ----------------------------------
    # RISK LEVEL
    # ----------------------------------

    risk_level = "LOW"

    if health_status == "At Risk":

        risk_level = "HIGH"

    elif sensor.do < 5:

        risk_level = "MEDIUM"

    # ----------------------------------
    # LLM PROMPT
    # ----------------------------------

    prompt = f"""

You are AQUAAGENT.

An autonomous AI agent for smart fish farming.

Fish Pond Analysis:

Health Status = {health_status}

Risk Level = {risk_level}

Sensor Data:

Temperature = {sensor.temperature} °C
Dissolved Oxygen = {sensor.do} mg/L
pH = {sensor.ph}
Turbidity = {sensor.turbidity} NTU
Hour = {sensor.hour}

AVAILABLE ACTUATORS:

1. Aerator
2. Feeder
3. Water Circulation
4. pH Neutralizer

STRICT DECISION LOGIC:

1. DO < 5
→ Aerator ON

2. Temperature > 30
→ Water Circulation ON

3. pH < 6.5 OR pH > 8.0
→ pH Neutralizer ON

4. If ANY abnormal condition exists
(DO low OR temperature high OR abnormal pH OR Health Status = At Risk)

→ Feeder OFF

5. Only enable Feeder ON when ALL conditions are normal.

Return ONLY valid JSON.

{{
"aerator":"",
"feeder":"",
"water_circulation":"",
"ph_neutralizer":"",
"reason":""
}}

"""

    # ----------------------------------
    # OPENAI CALL
    # ----------------------------------

    response = client.chat.completions.create(

        model="gpt-4.1-mini",

        messages=[

            {
                "role":"user",
                "content":prompt
            }

        ]

    )

    # ----------------------------------
    # CLEAN LLM OUTPUT
    # ----------------------------------

    decision = response.choices[0].message.content

    cleaned = decision.replace(
        "```json",""
    ).replace(
        "```",""
    ).strip()

    # ----------------------------------
    # SAFE JSON PARSE
    # ----------------------------------

    try:

        parsed = json.loads(cleaned)

    except Exception:

        parsed = {

            "aerator":"UNKNOWN",

            "feeder":"UNKNOWN",

            "water_circulation":"UNKNOWN",

            "ph_neutralizer":"UNKNOWN",

            "reason":"JSON parsing failed."

        }

    # ----------------------------------
    # FINAL RESPONSE
    # ----------------------------------

    return {

        "health_status": health_status,

        "risk_level": risk_level,

        "rf_confidence": round(
            float(confidence),
            3
        ),

        "sensor_data": {

            "temperature": sensor.temperature,

            "do": sensor.do,

            "ph": sensor.ph,

            "turbidity": sensor.turbidity,

            "hour": sensor.hour

        },

        **parsed

    }