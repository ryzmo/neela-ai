import machine
import time
import network
import urequests
import json
from machine import Pin, ADC

# ==========================================
# 🌐 KONFIGURASI JARINGAN & BACKEND SERVER
# ==========================================
WIFI_SSID = "YOUR_WIFI_SSID"
WIFI_PASS = "YOUR_WIFI_PASSWORD"
BACKEND_URL = "http://192.168.1.50:8000"  # Sesuaikan dengan IP Server Backend LAN

# Interval Refresh Pengiriman Data (detik)
REFRESH_INTERVAL = 5

# ==========================================
# 🔌 PIN MAPPING ESP32
# ==========================================
# Sensor Digital & Analog
PIN_DS18B20 = 4       # Suhu Air (OneWire)
PIN_PH = 34           # pH Sensor (ADC)
PIN_TURBIDITY = 35    # Turbidity Sensor (ADC)
PIN_WATER_LEVEL = 36  # Water Level Sensor (ADC)

# Aktuator Relay (Active LOW)
PIN_RELAY_AERATOR = 25     # Relay 1: Aerator Air Pump
PIN_RELAY_PUMP = 26        # Relay 2: Water Circulation Pump
PIN_RELAY_FEEDER = 32      # Relay 3: Auto Feeder Motor/Servo
PIN_RELAY_STABILIZER = 33  # Relay 4: pH Neutralizer Dosing Pump
PIN_BUZZER = 27            # Active Buzzer Alarm

# Inisialisasi Relay (Default OFF / HIGH untuk Active LOW)
relay_aerator = Pin(PIN_RELAY_AERATOR, Pin.OUT, value=1)
relay_pump = Pin(PIN_RELAY_PUMP, Pin.OUT, value=1)
relay_feeder = Pin(PIN_RELAY_FEEDER, Pin.OUT, value=1)
relay_stabilizer = Pin(PIN_RELAY_STABILIZER, Pin.OUT, value=1)
buzzer = Pin(PIN_BUZZER, Pin.OUT, value=0)

# Inisialisasi Analog Sensor (ADC)
adc_ph = ADC(Pin(PIN_PH))
adc_ph.atten(ADC.ATTN_11DB)  # 0 - 3.3V range

adc_turbidity = ADC(Pin(PIN_TURBIDITY))
adc_turbidity.atten(ADC.ATTN_11DB)

adc_water_level = ADC(Pin(PIN_WATER_LEVEL))
adc_water_level.atten(ADC.ATTN_11DB)

# Standard DS18B20 OneWire Sensor
try:
    import onewire, ds18x20
    ow_pin = Pin(PIN_DS18B20)
    ds_sensor = ds18x20.DS18X20(onewire.OneWire(ow_pin))
    roms = ds_sensor.scan()
    print("Found DS18B20 sensors:", len(roms))
except Exception as e:
    ds_sensor = None
    roms = []
    print("DS18B20 initialization error:", e)

# ==========================================
# 📶 WIFICONNECTION HELPER
# ==========================================
def connect_wifi():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    if not wlan.isconnected():
        print("Connecting to WiFi:", WIFI_SSID)
        wlan.connect(WIFI_SSID, WIFI_PASS)
        timeout = 20
        while not wlan.isconnected() and timeout > 0:
            time.sleep(0.5)
            timeout -= 1
    if wlan.isconnected():
        print("WiFi Connected! IP Info:", wlan.ifconfig())
    else:
        print("WiFi Connection Failed!")

# ==========================================
# 🌡️ SENSOR READING FUNCTIONS
# ==========================================
def read_temperature():
    """Membaca suhu air (°C) dari DS18B20."""
    if ds_sensor and roms:
        try:
            ds_sensor.convert_temp()
            time.sleep_ms(750)
            for rom in roms:
                temp = ds_sensor.read_temp(rom)
                if temp and temp > -55 and temp < 125:
                    return round(temp, 2)
        except Exception as e:
            print("Error reading DS18B20:", e)
    # Default fallback temperature jika sensor belum terpasang
    return 28.5

def read_ph():
    """Membaca nilai keasaman (pH) dari Gravity Analog pH Sensor."""
    raw = adc_ph.read()
    voltage = (raw / 4095.0) * 3.3
    # Formula linear mapping (Kalibrasi pH 4.0 & 7.0)
    ph_val = 3.5 * voltage + 1.2
    return round(max(0.0, min(14.0, ph_val)), 2)

def read_turbidity():
    """Membaca tingkat kekeruhan air (NTU) dari SEN0189 Optical Sensor."""
    raw = adc_turbidity.read()
    voltage = (raw / 4095.0) * 3.3
    # Formula linear mapping kekeruhan
    turb_ntu = max(0.0, (2.5 - voltage) * 100.0)
    return round(turb_ntu, 1)

def read_water_level():
    """Membaca ketinggian air (cm) dari sensor water level resistif."""
    raw = adc_water_level.read()
    voltage = (raw / 4095.0) * 3.3
    level_cm = (voltage / 3.3) * 25.0
    return round(max(0.0, level_cm), 1)

# ==========================================
# 🕹️ ACTUATOR RELAY CONTROL (ACTIVE LOW)
# ==========================================
def update_actuators(act_data):
    """Menyetel state Relay (Active LOW: ON = 0, OFF = 1)."""
    if not act_data:
        return

    # Aerator
    is_aerator_on = (act_data.get("aerator") == "ON" or act_data.get("aerator") is True)
    relay_aerator.value(0 if is_aerator_on else 1)

    # Water Circulation Pump
    is_pump_on = (act_data.get("water_circulation") == "ON" or act_data.get("pump") is True)
    relay_pump.value(0 if is_pump_on else 1)

    # pH Neutralizer Dosing Pump
    is_ph_on = (act_data.get("ph_neutralizer") == "ON" or act_data.get("stabilizer") is True)
    relay_stabilizer.value(0 if is_ph_on else 1)

    # Auto Feeder
    is_feeder_on = (act_data.get("feeder") == "ON" or act_data.get("feeder") is True)
    relay_feeder.value(0 if is_feeder_on else 1)

    # Alarm Buzzer (Active HIGH)
    is_buzzer_on = (act_data.get("buzzer") == "ON" or act_data.get("buzzer") is True)
    buzzer.value(1 if is_buzzer_on else 0)

# ==========================================
# 🚀 MAIN ESP32 LOOP
# ==========================================
def main():
    connect_wifi()

    print("AquaAgent (NEELA AI) ESP32 Firmware Started.")

    while True:
        try:
            # 1. Pembacaan Telemetri Sensor
            temp = read_temperature()
            ph = read_ph()
            turb = read_turbidity()
            w_level = read_water_level()

            current_hour = time.localtime()[3] if time else 12

            payload = {
                "temperature": temp,
                "ph": ph,
                "turbidity": turb,
                "water_level": w_level,
                "hour": current_hour,
                "source": "iot"
            }

            print("\n[TELEMETRY SEND]", payload)

            # 2. HTTP POST Telemetry ke Endpoint /analyze
            res = urequests.post(
                BACKEND_URL + "/analyze",
                headers={"Content-Type": "application/json"},
                data=json.dumps(payload)
            )

            if res.status_code == 200:
                result_data = res.json()
                print("[ANALYZE RESPONSE]", result_data.get("health_status"), result_data.get("reason"))
            res.close()

            # 3. HTTP GET Current Actuator State
            act_res = urequests.get(BACKEND_URL + "/actuator")
            if act_res.status_code == 200:
                act_data = act_res.json()
                print("[ACTUATOR STATE]", act_data)
                update_actuators(act_data)
            act_res.close()

        except Exception as e:
            print("[MAIN LOOP ERROR]", e)
            # Reconnect WiFi jika terputus
            connect_wifi()

        time.sleep(REFRESH_INTERVAL)

if __name__ == "__main__":
    main()
