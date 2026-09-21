# Import pustaka jaringan wifi untuk MicroPython ESP32
import network
# Import modul HTTP client MicroPython untuk request API
import urequests
# Import modul waktu untuk delay dan pewaktuan
import time
# Import modul machine untuk kontrol hardware mikrokontroler
import machine
# Import class kontrol GPIO, PWM (servo), dan ADC (analog sensor)
from machine import Pin, PWM, ADC
# Import protokol komunikasi 1-wire
import onewire
# Import driver sensor suhu digital DS18B20
import ds18x20

# Inisialisasi pin output GPIO 25 untuk buzzer
buzzer = Pin(25, Pin.OUT)

# Variabel tombol restart (opsional / dinonaktifkan)
restart_button = None

# Fungsi dasar untuk membunyikan buzzer selama durasi tertentu (detik)
def beep(duration=0.15):
    # Mengaktifkan sinyal buzzer (bunyi ON)
    buzzer.on()
    # Menahan bunyi sesuai durasi
    time.sleep(duration)
    # Mematikan sinyal buzzer (bunyi OFF)
    buzzer.off()

# Bunyi indikator sukses: 1 kali bip singkat
def beep_success():
    beep(0.2)

# Bunyi indikator proses koneksi: 2 kali bip beruntun
def beep_connecting():
    beep(0.1)
    time.sleep(0.1)
    beep(0.1)

# Bunyi indikator gagal: 4 kali bip beruntun
def beep_failed():
    for i in range(4):
        beep(0.1)
        time.sleep(0.1)

# Bunyi indikator aksi/perintah diterima: 1 kali bip pendek
def beep_action():
    beep(0.05)

# Nama SSID hotspot / wifi tujuan
SSID = "Hnn"
# Password wifi tujuan
PASSWORD = "11111111"

# Inisialisasi interface wifi ESP32 dalam mode Station (STA)
wifi = network.WLAN(network.STA_IF)
# Mengaktifkan interface radio wifi
wifi.active(True)
# Menghubungkan ESP32 ke jaringan wifi
wifi.connect(SSID, PASSWORD)

# Menampilkan status sedang menyambung ke wifi
print("Connecting...")
# Membunyikan nada proses koneksi
beep_connecting()

# Menunggu hingga perangkat terhubung ke wifi
while not wifi.isconnected():
    time.sleep(1)

# Menampilkan status sukses terhubung
print("Connected!")
# Menampilkan konfigurasi IP address yang didapat ESP32
print(wifi.ifconfig())
# Membunyikan nada sukses koneksi
beep_success()

# Batas waktu timeout koneksi wifi
timeout = 15
# Loop proteksi timeout koneksi wifi
while not wifi.isconnected() and timeout > 0:
    time.sleep(1)
    timeout -= 1

# URL dasar endpoint backend server
BASE_URL = "http://172.20.10.4:8000"

# Endpoint untuk kirim data sensor & evaluasi AI
API_ANALYZE         = BASE_URL + "/analyze"
# Endpoint konfirmasi eksekusi bunyi buzzer dari web
API_BEEP_ACK        = BASE_URL + "/beep/ack"
# Endpoint mengambil status kontrol aktuator (aerator, pompa, feeder)
API_ACTUATOR        = BASE_URL + "/actuator"
# Endpoint mengambil jadwal pemberian pakan otomatis
API_FEEDING         = BASE_URL + "/feeding-schedule"
# Endpoint cek versi jadwal pakan untuk deteksi perubahan
API_FEEDING_VERSION = BASE_URL + "/feeding-version"
# Endpoint mengambil pengaturan durasi aktuator dari web
API_SETTINGS        = BASE_URL + "/settings"
# Endpoint konfirmasi eksekusi pemberian pakan selesai
API_FEEDER_ACK      = BASE_URL + "/feeder/ack"
# Endpoint konfirmasi eksekusi aktuator selesai
API_ACTUATOR_ACK    = BASE_URL + "/actuator/ack"

# Mengambil status perintah aktuator dari server backend
def get_actuator():
    try:
        # Request GET data kontrol aktuator
        response = urequests.get(API_ACTUATOR)
        # Parse JSON data response
        result = response.json()
        # Tutup koneksi HTTP socket
        response.close()
        # Kembalikan dictionary data aktuator
        return result
    except Exception as e:
        # Tampilkan log error jika gagal request
        print("Actuator Error:", e)
        # Kembalikan None saat terjadi gangguan
        return None

# Mengambil konfigurasi jadwal pemberian pakan dari backend
def get_feeding_schedule():
    try:
        # Request GET data jadwal pakan
        response = urequests.get(API_FEEDING)
        # Parse data jadwal JSON
        data = response.json()
        # Tutup koneksi HTTP
        response.close()
        # Kembalikan objek data jadwal
        return data
    except Exception as e:
        # Tampilkan pesan error jika gagal mengambil jadwal
        print("Schedule Error:", e)
        return None

# Mengambil versi terkini konfigurasi jadwal pakan
def get_feeding_version():
    try:
        # Request GET nomor versi jadwal pakan
        response = urequests.get(API_FEEDING_VERSION)
        # Ambil nilai integer versi dari JSON
        version = response.json()["version"]
        # Tutup koneksi HTTP
        response.close()
        # Kembalikan nilai versi
        return version
    except:
        # Kembalikan None jika request gagal
        return None

# Mengambil pengaturan durasi aktuator dari server
def get_settings():
    try:
        # Request GET pengaturan interval dan durasi aktuator
        response = urequests.get(API_SETTINGS)
        # Parse payload data JSON
        data = response.json()
        # Tutup koneksi HTTP
        response.close()
        # Kembalikan data pengaturan
        return data
    except:
        # Nilai default durasi aman jika server tidak merespons
        return {
            "refreshInterval": 5,
            "aeratorDuration": 5.0,
            "pumpDuration": 0.5,
            "stabilizerDuration": 0.5,
            "buzzerDuration": 5.0,
            "feederDuration": 0.8
        }

# Logika kontrol relay Active-LOW: 0 untuk ON
ON = 0
# Logika kontrol relay Active-LOW: 1 untuk OFF
OFF = 1

# Inisialisasi pin relay aerator pada GPIO 22
relay_aerator = Pin(22, Pin.OUT)
# Inisialisasi pin relay pompa pH UP (basa) pada GPIO 21
relay_pump    = Pin(21, Pin.OUT)
# Inisialisasi pin relay pompa pH DOWN (asam) pada GPIO 19
relay_ph      = Pin(19, Pin.OUT)

# Inisialisasi pin servo pakan ikan dengan sinyal PWM 50Hz pada GPIO 13
servo = PWM(Pin(13), freq=50)
# Nilai duty cycle untuk putar maju servo
FORWARD = 65
# Nilai duty cycle untuk putar mundur servo
BACKWARD = 88
# Nilai duty cycle posisi diam/berhenti servo
STOP = 77

# Set posisi awal servo pakan dalam kondisi diam/berhenti
servo.duty(STOP)

# Inisialisasi pin ADC analog untuk sensor pH pada GPIO 32
ph_pin = ADC(Pin(32))
# Atur atenuasi 11dB agar ADC bisa membaca tegangan 0 - 3.3V
ph_pin.atten(ADC.ATTN_11DB)
# Atur resolusi ADC 12-bit (rentang nilai 0 - 4095)
ph_pin.width(ADC.WIDTH_12BIT)

# Inisialisasi pin ADC analog untuk sensor kekeruhan air pada GPIO 34
turbidity_pin = ADC(Pin(34))
# Atur atenuasi 11dB untuk pembacaan tegangan penuh 3.3V
turbidity_pin.atten(ADC.ATTN_11DB)
# Atur resolusi ADC 12-bit
turbidity_pin.width(ADC.WIDTH_12BIT)

# Inisialisasi pin bus 1-wire sensor suhu DS18B20 pada GPIO 4
data_pin = Pin(4)
# Inisialisasi objek driver sensor suhu DS18B20
ds_sensor = ds18x20.DS18X20(onewire.OneWire(data_pin))
# Pindai alamat ROM perangkat sensor suhu yang terhubung
roms = ds_sensor.scan()
# Tampilkan daftar alamat ROM sensor suhu yang ditemukan
print("DS18B20 Found:", roms)

# Inisialisasi pin trigger sensor ultrasonik level air pada GPIO 26
TRIG = Pin(26, Pin.OUT)
# Inisialisasi pin echo sensor ultrasonik level air pada GPIO 27
ECHO = Pin(27, Pin.IN)

# Jarak fisik dari sensor ke dasar wadah air (cm)
SENSOR_HEIGHT = 8.5
# Ketinggian maksimum kapasitas air wadah (cm)
MAX_WATER_HEIGHT = 6.0

# Membaca jarak pantulan sensor ultrasonik ke permukaan air (cm)
def get_distance():
    # Pastikan trigger mati sesaat
    TRIG.off()
    time.sleep_us(2)

    # Kirim pulsa trigger ultrasonik selama 10 mikrodetik
    TRIG.on()
    time.sleep_us(10)
    TRIG.off()

    # Catat waktu saat pulsa echo mulai dipancarkan
    while ECHO.value() == 0:
        start = time.ticks_us()

    # Catat waktu saat pulsa echo pantulan diterima kembali
    while ECHO.value() == 1:
        end = time.ticks_us()

    # Hitung selisih durasi waktu tempuh gelombang
    duration = time.ticks_diff(end, start)

    # Hitung jarak (cm) berdasarkan kecepatan suara (0.0343 cm/us dibagi 2 bolak-balik)
    distance = (duration * 0.0343) / 2

    return distance

# Menghitung tinggi air aktual dari dasar wadah (cm)
def calculate_water_height(distance):
    # Tinggi air = tinggi total wadah dikurangi jarak pantulan
    water_height = SENSOR_HEIGHT - distance

    # Batasi agar tidak bernilai negatif jika air kosong
    if water_height < 0:
        water_height = 0
    # Batasi agar tidak melebihi kapasitas maksimum wadah
    elif water_height > MAX_WATER_HEIGHT:
        water_height = MAX_WATER_HEIGHT

    return water_height

# Menghitung persentase volume air (0 - 100%)
def calculate_level(water_height):
    # Rasio tinggi air terhadap tinggi maksimum dikali 100%
    level = (water_height / MAX_WATER_HEIGHT) * 100

    # Batasi persentase minimum di 0%
    if level < 0:
        level = 0
    # Batasi persentase maksimum di 100%
    elif level > 100:
        level = 100

    return level

# Membaca metrik ketinggian dan persentase air secara lengkap
def get_water_level():
    # Ambil jarak sensor ke air
    distance = get_distance()
    # Hitung ketinggian air
    water_height = calculate_water_height(distance)
    # Hitung persentase isi air
    level = calculate_level(water_height)

    # Kembalikan dictionary data level air yang dibulatkan 2 desimal
    return {
        "distance": round(distance, 2),
        "height": round(water_height, 2),
        "level": round(level, 2)
    }

# Nilai titik kalibrasi 1: pH asam 4.01
PH_1 = 4.01
# Tegangan referensi titik kalibrasi 1 (Volt)
V_1 = 2.2132

# Nilai titik kalibrasi 2: pH netral rendah 6.86
PH_2 = 6.86
# Tegangan referensi titik kalibrasi 2 (Volt)
V_2 = 1.7668

# Nilai titik kalibrasi 3: pH netral 7.00
PH_3 = 7.00
# Tegangan referensi titik kalibrasi 3 (Volt)
V_3 = 1.7339

# Nilai titik kalibrasi 4: pH basa sedang 9.18
PH_4 = 9.18
# Tegangan referensi titik kalibrasi 4 (Volt)
V_4 = 1.3693

# Nilai titik kalibrasi 5: pH basa kuat 10.01
PH_5 = 10.01
# Tegangan referensi titik kalibrasi 5 (Volt)
V_5 = 1.1714

# Fungsi interpolasi linier multi-titik untuk konversi tegangan sensor ke nilai pH
def interpolate_ph(voltage, v_low, ph_low, v_high, ph_high):
    return ph_low + ((voltage - v_low) * (ph_high - ph_low) / (v_high - v_low))

# Mengonversi tegangan analog sensor menjadi nilai skala pH aktual (0 - 14)
def calculate_ph(voltage):
    # Rentang tegangan pH 4.01 - 6.86
    if voltage <= V_1 and voltage >= V_2:
        ph = interpolate_ph(voltage, V_1, PH_1, V_2, PH_2)
    # Rentang tegangan pH 6.86 - 7.00
    elif voltage < V_2 and voltage >= V_3:
        ph = interpolate_ph(voltage, V_2, PH_2, V_3, PH_3)
    # Rentang tegangan pH 7.00 - 9.18
    elif voltage < V_3 and voltage >= V_4:
        ph = interpolate_ph(voltage, V_3, PH_3, V_4, PH_4)
    # Rentang tegangan pH 9.18 - 10.01
    elif voltage < V_4 and voltage >= V_5:
        ph = interpolate_ph(voltage, V_4, PH_4, V_5, PH_5)
    # Tegangan di atas batas titik kalibrasi 1 (sangat asam)
    elif voltage > V_1:
        ph = PH_1
    # Tegangan di bawah batas titik kalibrasi 5 (sangat basa)
    else:
        ph = PH_5

    # Batasi nilai skala pH antara 0 hingga 14
    if ph < 0:
        ph = 0
    elif ph > 14:
        ph = 14

    return round(ph, 2)

# Membaca nilai pH dengan averaging 50 sampel agar stabil dari noise
def get_ph():
    # Jumlah sampel pembacaan
    samples = 50
    # Variabel akumulasi nilai ADC
    total = 0

    # Mengambil sampel pembacaan berkala setiap 20 milidetik
    for _ in range(samples):
        total += ph_pin.read()
        time.sleep_ms(20)

    # Menghitung rata-rata nilai ADC
    adc = total / samples
    # Mengonversi nilai ADC 12-bit ke tegangan 0 - 3.3V
    voltage = adc * (3.3 / 4095)

    # Mengembalikan nilai pH hasil kalkulasi
    return calculate_ph(voltage)

# Titik tegangan kalibrasi air sangat keruh / pekat (Volt)
V_PEKAT = 0.0000
# Titik tegangan kalibrasi air keruh sedang (Volt)
V_SEDANG = 0.6726
# Titik tegangan kalibrasi air jernih / keran (Volt)
V_KERAN = 0.8830

# Persentase kekeruhan air pekat (100%)
T_PEKAT = 100.0
# Persentase kekeruhan air sedang (50%)
T_SEDANG = 50.0
# Persentase kekeruhan air jernih (0%)
T_KERAN = 0.0

# Mengonversi nilai tegangan analog ke persentase kekeruhan air (%)
def calculate_turbidity(voltage):
    # Kondisi tegangan air sangat keruh
    if voltage <= V_PEKAT:
        turbidity = 100.0
    # Interpolasi linier dari pekat ke sedang
    elif voltage <= V_SEDANG:
        turbidity = T_PEKAT + ((voltage - V_PEKAT) * (T_SEDANG - T_PEKAT) / (V_SEDANG - V_PEKAT))
    # Interpolasi linier dari sedang ke jernih
    elif voltage <= V_KERAN:
        turbidity = T_SEDANG + ((voltage - V_SEDANG) * (T_KERAN - T_SEDANG) / (V_KERAN - V_SEDANG))
    # Tegangan di atas air keran (sangat jernih)
    else:
        turbidity = 0.0

    return turbidity

# Membaca sensor kekeruhan air dan mengklasifikasikan statusnya
def get_turbidity():
    # Membaca nilai ADC 12-bit dari sensor
    adc = turbidity_pin.read()
    # Mengonversi nilai ADC ke tegangan listrik (Volt)
    voltage = adc * 3.3 / 4095
    # Menghitung persentase kekeruhan dari tegangan
    turbidity = calculate_turbidity(voltage)

    # Menentukan kategori status kejernihan air
    if turbidity >= 75:
        status = "PEKAT"
    elif turbidity >= 25:
        status = "SEDANG"
    else:
        status = "JERNIH"

    # Mengembalikan data lengkap kekeruhan air
    return {
        "adc": adc,
        "voltage": round(voltage, 4),
        "turbidity": round(turbidity, 2),
        "status": status
    }

# Pengecekan ketersediaan sensor suhu DS18B20 pada bus 1-wire
if not roms:
    print("DS18B20 tidak ditemukan!")

# Mengambil alamat ROM sensor suhu pertama
rom = roms[0] if roms else None

# Nilai faktor pengali (kemiringan garis kalibrasi suhu)
SLOPE = 1.000632
# Nilai offset koreksi pergeseran titik nol sensor suhu (Celcius)
OFFSET = -0.396

# Membaca nilai suhu air dari sensor DS18B20 dengan koreksi kalibrasi
def get_temperature():
    # Jika sensor tidak terdeteksi, kembalikan nilai default
    if not rom:
        return 0.0

    # Mengirim instruksi konversi suhu ke sensor
    ds_sensor.convert_temp()
    # Waktu tunda minimal untuk proses konversi 12-bit selesai (750ms)
    time.sleep_ms(750)
    # Membaca nilai suhu mentah dari sensor
    sensor_temp = ds_sensor.read_temp(rom)
    # Mengoreksi suhu sensor dengan rumus kalibrasi linier
    temperature = (SLOPE * sensor_temp) + OFFSET

    # Mengembalikan suhu terkalibrasi yang dibulatkan 2 desimal
    return round(temperature, 2)

# Menggerakkan motor servo untuk menabur pakan ikan sesuai durasi tertentu
def feed_now(duration=0.8):
    # Putar servo maju untuk membuka/mendorong pakan
    servo.duty(FORWARD)
    time.sleep(duration)
    # Putar servo mundur untuk mengocok/menutup wadah pakan
    servo.duty(BACKWARD)
    time.sleep(duration)
    # Hentikan putaran servo pakan
    servo.duty(STOP)

# Mengirim konfirmasi (acknowledgement) eksekusi aktuator ke backend
def actuator_ack(name):
    try:
        # Kirim HTTP POST konfirmasi aktuator yang telah dijalankan
        response = urequests.post(API_ACTUATOR_ACK, json={"name": name})
        # Tutup koneksi HTTP
        response.close()
    except Exception as e:
        # Tampilkan error jika ACK gagal terkirim
        print("ACK Error:", e)

# Mengirim pembacaan seluruh sensor kualitas air ke backend untuk dianalisis AI
def send_sensor_data(temperature, ph, turbidity, water_level):
    # Menyiapkan payload data sensor lengkap beserta jam perangkat
    payload = {
        "temperature": temperature,
        "ph": ph,
        "turbidity": turbidity,
        "water_level": water_level,
        "hour": time.localtime()[3],
        "source": "iot"
    }

    try:
        # Kirim data telemetri sensor ke endpoint /analyze
        response = urequests.post(API_ANALYZE, json=payload)
        # Parse hasil analisis AI dari backend
        result = response.json()
        # Tutup koneksi HTTP
        response.close()
        # Kembalikan respons analisis AI
        return result
    except Exception as e:
        # Tampilkan log error jika gagal mengirim data sensor
        print("Send Error:", e)
        return None

# Variabel penyimpan status terakhir tombol pakan manual
last_feeder = False
# Variabel penyimpan identitas unik jadwal pakan terakhir yang dieksekusi
last_feed_key = ""
# Variabel penyimpan data konfigurasi jadwal pakan
feeding_schedule = None
# Variabel pelacak versi konfigurasi jadwal pakan
feeding_version = -1

# Loop utama monitoring dan kontrol otomatis IoT ESP32
while True:
    # Membaca suhu air terkini
    temperature = get_temperature()
    # Membaca pH air terkini
    ph = get_ph()
    # Membaca kekeruhan air terkini
    turbidity = get_turbidity()
    # Membaca ketinggian & persentase air terkini
    water_data = get_water_level()

    # Menampilkan data telemetri ke serial monitor
    print("Distance    :", water_data["distance"], "cm")
    print("Water Height:", water_data["height"], "cm")
    print("Water Level :", water_data["level"], "%")
    print("Temperature :", temperature, "°C")
    print("pH          :", ph)
    print("Turbidity   :", turbidity["turbidity"], "% |", turbidity["status"])
    print("Turbidity V :", turbidity["voltage"], "V")
    print("----------------------------")

    # Mengambil versi jadwal pakan dari server
    current_version = get_feeding_version()
    # Mengambil pengaturan durasi aktuator dari server
    settings = get_settings()

    # Mengekstrak durasi masing-masing aktuator dengan nilai fallback default
    aerator_dur = settings.get("aeratorDuration", 5.0)
    pump_dur = settings.get("pumpDuration", 0.5)
    stabilizer_dur = settings.get("stabilizerDuration", 0.5)
    buzzer_dur = settings.get("buzzerDuration", 5.0)
    feeder_dur = settings.get("feederDuration", 0.8)

    # Memperbarui jadwal pakan jika versi di server berubah
    if current_version is not None and current_version != feeding_version:
        feeding_schedule = get_feeding_schedule()
        feeding_version = current_version
        print("Feeding schedule updated")

    # Logika pengecekan jadwal pemberian pakan otomatis
    if feeding_schedule and feeding_schedule.get("enabled"):
        # Mengambil waktu lokal jam dan menit saat ini
        now = time.localtime()
        current_hour = now[3]
        current_minute = now[4]

        # Mengekstrak jam dan menit mulai dari konfigurasi jadwal
        start_hour, start_minute = map(int, feeding_schedule["feedingTime"].split(":"))
        # Interval pengulangan pakan (jam)
        interval = feeding_schedule["interval"]

        # Menghitung konversi total menit waktu sekarang dan waktu mulai
        current_minutes = current_hour * 60 + current_minute
        start_minutes = start_hour * 60 + start_minute
        # Menghitung selisih waktu dalam siklus 24 jam
        diff = (current_minutes - start_minutes) % (24 * 60)

        # Mengecek apakah selisih waktu cocok dengan interval pakan
        if diff % (interval * 60) == 0:
            # Kunci unik penanda waktu eksekusi jadwal pakan
            feed_key = "{}-{}-{}".format(now[0], now[7], diff)

            # Eksekusi pakan jika kunci belum pernah dieksekusi di menit ini
            if feed_key != last_feed_key:
                print("=== SCHEDULED FEEDING ===")
                # Bunyikan buzzer notifikasi pakan
                beep_action()
                # Putar servo dispenser pakan
                feed_now(feeder_dur)
                # Simpan kunci jadwal terakhir
                last_feed_key = feed_key

    # Mengirim data sensor ke server dan menerima respons evaluasi AI
    data = send_sensor_data(temperature, ph, turbidity["turbidity"], water_data["level"])

    # Mengambil status perintah aktuator dari dashboard web
    actuator = get_actuator()
    print(actuator)

    # Menangani perintah aktivasi buzzer dari web jika ada
    if actuator and actuator.get("beep"):
        beep_action()
        try:
            # Kirim konfirmasi buzzer selesai dibunyikan
            response = urequests.post(API_BEEP_ACK)
            response.close()
        except Exception as e:
            print("Beep Ack Error:", e)

    # Fungsi helper untuk menyegarkan status aktuator setelah eksekusi
    def refresh_actuator():
        act = get_actuator()
        if act is None:
            return None
        print("Refresh:", act)
        return act

    # Eksekusi perintah kontrol perangkat aktuator fisik
    if actuator:
        # Kontrol relay aerator
        if actuator.get("aerator"):
            relay_aerator.value(ON)
            time.sleep(aerator_dur)
            relay_aerator.value(OFF)
            actuator_ack("aerator")
            actuator = refresh_actuator()
        else:
            relay_aerator.value(OFF)

        # Kontrol relay pompa pH UP (menaikan pH / basa)
        if actuator.get("pump"):
            print("Activating pH UP Pump...")
            relay_pump.value(ON)
            time.sleep(pump_dur)
            relay_pump.value(OFF)
            actuator_ack("pump")
            actuator = refresh_actuator()
        else:
            relay_pump.value(OFF)

        # Kontrol relay pompa pH DOWN (menurunkan pH / asam)
        if actuator.get("stabilizer"):
            print("Activating pH DOWN Pump...")
            relay_ph.value(ON)
            time.sleep(stabilizer_dur)
            relay_ph.value(OFF)
            actuator_ack("stabilizer")
            actuator = refresh_actuator()
        else:
            relay_ph.value(OFF)

        # Kontrol alarm buzzer peringatan
        if actuator.get("buzzer"):
            buzzer.on()
            time.sleep(buzzer_dur)
            buzzer.off()
            actuator_ack("buzzer")
            actuator = refresh_actuator()
        else:
            buzzer.off()

        # Kontrol pemberian pakan manual dari dashboard web
        if actuator.get("mode") == "MANUAL":
            if actuator.get("feeder") and not last_feeder:
                print("Manual Feeding")
                beep_action()
                feed_now(feeder_dur)
                try:
                    # Kirim konfirmasi pakan manual selesai
                    response = urequests.post(API_FEEDER_ACK)
                    response.close()
                except Exception as e:
                    print("Feeder Ack Error:", e)

        # Simpan status feeder sebelumnya untuk deteksi perubahan state
        last_feeder = actuator.get("feeder", False)

    # Menampilkan hasil evaluasi dan rekomendasi AI ke serial monitor
    if data:
        if data.get("success") is False:
            print("IoT Receiver OFF")
        else:
            print("===== AI RESULT =====")
            print("Reason :", data.get("reason"))
            print("=====================")

    # Mengambil interval refresh loop monitoring dari server
    settings = get_settings()
    interval = settings.get("refreshInterval", 5)

    # Menunda siklus loop berikutnya sesuai interval refresh
    time.sleep(interval)
