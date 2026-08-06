from openai import OpenAI

client = OpenAI()

health_status = "At Risk"

prompt = f"""

You are AQUAAGENT.

Fish Pond Status:

Health Status = {health_status}

Sensor Data:

Temperature = 31°C
DO = 4.2 mg/L
pH = 8.5
Turbidity = 15 NTU

Return ONLY valid JSON.

{
"aerator":"",
"feeder":"",
"water_circulation":"",
"ph_neutralizer":"",
"reason":""
}

Return format:

Aerator:
Feeder:
Water Circulation:
pH Neutralizer:

Short reasoning.

"""

response = client.chat.completions.create(

model="gpt-4.1-mini",

messages=[

{"role":"user","content":prompt}

]

)

print(
response.choices[0].message.content
)