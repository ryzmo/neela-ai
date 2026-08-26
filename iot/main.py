import network
import urequests
import time
import machine
from machine import Pin, PWM, ADC
import onewire
import ds18x20

buzzer = Pin(25, Pin.OUT)

# Tombol restart
restart_button = Pin(18, Pin.IN, Pin.PULL_UP)

restart_requested = False

def restart_handler(pin):
    global restart_requested
    restart_requested = True

restart_button.irq(
    trigger=Pin.IRQ_FALLING,
    handler=restart_handler
)

def beep(duration=0.15):
    buzzer.on()
    time.sleep(duration)
    buzzer.off()


def beep_success():
    # bip
    beep(0.2)


def beep_connecting():
    # bip bip
    beep(0.1)
    time.sleep(0.1)
    beep(0.1)


def beep_failed():
    # bip bip bip bip
    for i in range(4):
        beep(0.1)
        time.sleep(0.1)


def beep_action():
    # bip pendek
    beep(0.05)


SSID = "Hnn"
PASSWORD = "11111111"

wifi = network.WLAN(network.STA_IF)
wifi.active(True)
wifi.connect(SSID, PASSWORD)

print("Connecting...")

beep_connecting()

while not wifi.isconnected():
    time.sleep(1)

print("Connected!")
print(wifi.ifconfig())
beep_success()

timeout = 15

while not wifi.isconnected() and timeout > 0:
    time.sleep(1)
    timeout -= 1

if not wifi.isconnected():
    print("WiFi Failed")
    beep_failed()

API_ANALYZE = "http://172.20.10.3:8000/analyze"

API_BEEP_ACK = "http://172.20.10.3:8000/beep/ack"

API_ACTUATOR = "http://172.20.10.3:8000/actuator"

API_FEEDING = "http://172.20.10.3:8000/feeding-schedule"

API_FEEDING_VERSION = "http://172.20.10.3:8000/feeding-version"

API_SETTINGS = "http://172.20.10.3:8000/settings"

API_FEEDER_ACK = "http://172.20.10.3:8000/feeder/ack"

API_ACTUATOR_ACK = "http://172.20.10.3:8000/actuator/ack"

def get_actuator():

    try:

        response = urequests.get(API_ACTUATOR)

        result = response.json()

        response.close()

        return result

    except Exception as e:

        print("Actuator Error:", e)

        return None
    
def get_feeding_schedule():

    try:

        response = urequests.get(API_FEEDING)

        data = response.json()

        response.close()

        return data

    except Exception as e:

        print("Schedule Error:", e)

        return None
    
def get_feeding_version():

    try:

        response = urequests.get(API_FEEDING_VERSION)

        version = response.json()["version"]

        response.close()

        return version

    except:

        return None
    
def get_settings():

    try:

        response = urequests.get(API_SETTINGS)

        data = response.json()

        response.close()

        return data

    except:

        return {
            "refreshInterval": 5
        }

# Relay aktif LOW
ON = 0
OFF = 1

relay_aerator = Pin(22, Pin.OUT)
relay_pump = Pin(21, Pin.OUT)
relay_ph = Pin(19, Pin.OUT)



servo = PWM(Pin(13), freq=50)

# ==========================
# PH SENSOR
# ==========================
ph_pin = ADC(Pin(32))
ph_pin.atten(ADC.ATTN_11DB)
ph_pin.width(ADC.WIDTH_12BIT)

# ==========================
# TURBIDITY SENSOR
# ==========================
turbidity_pin = ADC(Pin(34))
turbidity_pin.atten(ADC.ATTN_11DB)
turbidity_pin.width(ADC.WIDTH_12BIT)

# ==========================
# DS18B20
# ==========================
data_pin = Pin(4)
ds_sensor = ds18x20.DS18X20(onewire.OneWire(data_pin))
roms = ds_sensor.scan()

print("DS18B20 Found:", roms)

# ==========================================
# ULTRASONIC / WATER LEVEL
# ==========================================

TRIG = Pin(26, Pin.OUT)
ECHO = Pin(27, Pin.IN)

# ==========================================
# KALIBRASI WATER LEVEL
# ==========================================

SENSOR_HEIGHT = 8.5
MAX_WATER_HEIGHT = 6.0


# ==========================================
# MEMBACA JARAK SENSOR KE PERMUKAAN AIR
# ==========================================

def get_distance():

    TRIG.off()
    time.sleep_us(2)

    TRIG.on()
    time.sleep_us(10)
    TRIG.off()

    while ECHO.value() == 0:
        start = time.ticks_us()

    while ECHO.value() == 1:
        end = time.ticks_us()

    duration = time.ticks_diff(
        end,
        start
    )

    distance = (
        duration * 0.0343
    ) / 2

    return distance


# ==========================================
# MENGHITUNG KETINGGIAN AIR
# ==========================================

def calculate_water_height(distance):

    water_height = SENSOR_HEIGHT - distance

    if water_height < 0:
        water_height = 0

    elif water_height > MAX_WATER_HEIGHT:
        water_height = MAX_WATER_HEIGHT

    return water_height


# ==========================================
# MENGHITUNG PERSENTASE AIR
# ==========================================

def calculate_level(water_height):

    level = (
        water_height / MAX_WATER_HEIGHT
    ) * 100

    if level < 0:
        level = 0

    elif level > 100:
        level = 100

    return level


# ==========================================
# FUNGSI WATER LEVEL
# ==========================================

def get_water_level():

    distance = get_distance()

    water_height = calculate_water_height(
        distance
    )

    level = calculate_level(
        water_height
    )

    return {
        "distance": round(distance, 2),
        "height": round(water_height, 2),
        "level": round(level, 2)
    }

def get_ph():

    # Baca ADC
    adc = ph_pin.read()

    # Konversi ADC ke voltage
    voltage = adc * (3.3 / 4095)

    # ==========================================
    # KALIBRASI POLYNOMIAL
    # pH = aV² + bV + c
    # ==========================================

    a = -13.021343985879776
    b = 52.51123561813835
    c = -43.04810862294683

    ph = (
        a * voltage * voltage
        + b * voltage
        + c
    )

    # Batasi nilai pH
    if ph < 0:
        ph = 0

    elif ph > 14:
        ph = 14

    return round(ph, 2)


def get_turbidity():

    adc = turbidity_pin.read()
    voltage = adc * (3.3 / 4095)

    return {
        "adc": adc,
        "voltage": round(voltage, 2)
    }


def get_temperature():

    if len(roms) == 0:
        return None

    ds_sensor.convert_temp()
    time.sleep(1)

    temp = ds_sensor.read_temp(roms[0])

    return round(temp, 2)

def feed_now():

    servo.duty(FORWARD)
    time.sleep(0.8)

    servo.duty(BACKWARD)
    time.sleep(0.8)

    servo.duty(STOP)
    
def actuator_ack(name):

    try:

        response = urequests.post(
            API_ACTUATOR_ACK,
            json={
                "name": name
            }
        )

        response.close()

    except Exception as e:

        print("ACK Error:", e)
    
def send_sensor_data(temperature, ph, turbidity, water_level):

    payload = {
        "temperature": temperature,
        "ph": ph,
        "turbidity": turbidity,
        "water_level": water_level,
        "hour": time.localtime()[3],
        "source": "iot"
    }

    try:

        response = urequests.post(
            API_ANALYZE,
            json=payload
        )

        result = response.json()
        response.close()

        return result

    except Exception as e:
        print("Send Error:", e)
        return None
    
last_feeder = False
last_feed_key = ""
feeding_schedule = None

feeding_version = -1
previous_data = None

while True:
    
    if restart_requested:
        print("Restarting ESP32...")

        # Matikan semua actuator
        relay_aerator.value(OFF)
        relay_pump.value(OFF)
        relay_ph.value(OFF)
        buzzer.off()

        time.sleep_ms(100)

        machine.reset()
    
    temperature = get_temperature()
    ph = get_ph()
    turbidity = get_turbidity()

    water_data = get_water_level()

    print(
        "Distance    :",
        water_data["distance"],
        "cm"
    )

    print(
        "Water Height:",
        water_data["height"],
        "cm"
    )

    print(
        "Water Level :",
        water_data["level"],
        "%"
    )
        
    print("Temperature :", temperature, "°C")
    print("pH          :", ph)
    print(
        "Turbidity   :",
        turbidity["adc"],
        "|",
        turbidity["voltage"],
        "V"
    )
    print("----------------------------")
        
    current_version = get_feeding_version()

    if (
        current_version is not None and
        current_version != feeding_version
    ):

        feeding_schedule = get_feeding_schedule()

        feeding_version = current_version

        print("Feeding schedule updated")

    if (
        feeding_schedule and
        feeding_schedule["enabled"]
    ):

        now = time.localtime()

        current_hour = now[3]
        current_minute = now[4]

        start_hour, start_minute = map(
            int,
            feeding_schedule["feedingTime"].split(":")
        )

        interval = feeding_schedule["interval"]

        current_minutes = (
            current_hour * 60 +
            current_minute
        )

        start_minutes = (
            start_hour * 60 +
            start_minute
        )

        diff = (
            current_minutes -
            start_minutes
        ) % (24 * 60)

        if diff % (interval * 60) == 0:

            feed_key = "{}-{}-{}".format(
                now[0],
                now[7],
                diff
            )

            if feed_key != last_feed_key:

                print("=== SCHEDULED FEEDING ===")

                beep_action()
                

                feed_now()

                last_feed_key = feed_key

    data = send_sensor_data(
        temperature,
        ph,
        turbidity["voltage"],
        water_data["level"]
    )
    
    actuator = get_actuator()
    print(actuator)
    
    if actuator and actuator.get("beep"):

        beep_action()

        try:

            response = urequests.post(API_BEEP_ACK)
            response.close()

        except Exception as e:

            print("Beep Ack Error:", e)
    def refresh_actuator():

        actuator = get_actuator()

        if actuator is None:
            return None

        print("Refresh:", actuator)

        return actuator

    if actuator:

        if actuator["aerator"]:

            relay_aerator.value(ON)

            time.sleep(5)

            relay_aerator.value(OFF)

            actuator_ack("aerator")
            
            actuator = refresh_actuator()
        else:
            relay_aerator.value(OFF)

        if actuator["pump"]:

            relay_pump.value(ON)

            time.sleep(0.5)

            relay_pump.value(OFF)

            actuator_ack("pump")
            
            actuator = refresh_actuator()
        else:
            relay_pump.value(OFF)

        if actuator["stabilizer"]:

            relay_ph.value(ON)

            time.sleep(0.5)

            relay_ph.value(OFF)

            actuator_ack("stabilizer")
            actuator = refresh_actuator()
        else:
            relay_ph.value(OFF)

        if actuator["buzzer"]:

            buzzer.on()

            time.sleep(5)

            buzzer.off()

            actuator_ack("buzzer")
            actuator = refresh_actuator()
        else:
            buzzer.off()
        # Manual Feed
        if actuator["mode"] == "MANUAL":

            if actuator["feeder"] and not last_feeder:

                print("Manual Feeding")

                beep_action()

                feed_now()

                try:

                    response = urequests.post(API_FEEDER_ACK)

                    response.close()

                except Exception as e:

                    print("Feeder Ack Error:", e)

        last_feeder = actuator["feeder"]
    
    if data:

        if data.get("success") is False:

            print("IoT Receiver OFF")

        else:

            print("===== AI RESULT =====")
            print("Health :", data["health_status"])
            print("DO     :", data["sensor_data"]["do"])
            print("Reason :", data["reason"])
            print("=====================")

    #if data:

        # Ada command baru dari dashboard
        #if previous_data is not None and data != previous_data:
        #   print("New action received")
        #    beep_action()

        # Aerator
        #if data["aerator"] == "ON":
        #    relay_aerator.value(ON)
        #else:
        #    relay_aerator.value(OFF)

        # Pump
        #if data["water_circulation"] == "ON":
        #    relay_pump.value(ON)
        #else:
        #    relay_pump.value(OFF)

        # pH Stabilizer
        #if data["ph_neutralizer"] == "ON":
        #    relay_ph.value(ON)
        #else:
        #    relay_ph.value(OFF)

        # Buzzer
        #if data["buzzer"] == "ON":
        #    buzzer.on()
        #else:
        #    buzzer.off()

        # Feeder
        #if data["feeder"] and not last_feeder:
        #    beep_action()
        #    feed_now()

        #last_feeder = data["feeder"]

        # Simpan data terakhir
        #previous_data = data.copy()

    settings = get_settings()

    interval = settings.get(
        "refreshInterval",
        5
    )

    time.sleep(interval)

