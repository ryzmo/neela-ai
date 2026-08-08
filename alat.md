# 🔌 NEELA AI — Task List Pembuatan Alat IoT

> **Dokumen Pembagian Tugas: Hardware & Firmware ESP32 Smart Aquaculture**
> **Last Updated**: 6 Agustus 2026

---

## 🏗️ Arsitektur Alat

```
┌─────────────────────────────────────────────────────────────────┐
│                        ESP32 DevKit V1                          │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ DS18B20      │  │ pH Sensor    │  │ Turbidity    │          │
│  │ (Suhu Air)   │  │ Gravity V2   │  │ SEN0189      │          │
│  │ GPIO 4       │  │ GPIO 34 (A)  │  │ GPIO 35 (A)  │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                   │
│  ┌──────┴─────────────────┴─────────────────┴───────┐          │
│  │              ESP32 WROOM-32                       │          │
│  │              (Microcontroller)                    │          │
│  └──────┬─────────────────┬─────────────────┬───────┘          │
│         │                 │                 │                   │
│  ┌──────┴───────┐  ┌──────┴───────┐  ┌──────┴───────┐          │
│  │ Relay 4CH    │  │ Buzzer       │  │ Water Level  │          │
│  │ (Aktuator)   │  │ Active       │  │ Sensor       │          │
│  │ GPIO 25-33   │  │ GPIO 27      │  │ GPIO 36 (A)  │          │
│  └──────┬───────┘  └──────────────┘  └──────────────┘          │
│         │                                                       │
│  ┌──────┴───────────────────────────────────┐                   │
│  │ Aerator │ Pompa Air │ Feeder │ pH Stab   │                   │
│  │ Relay 1 │ Relay 2   │ Relay 3│ Relay 4   │                   │
│  └──────────────────────────────────────────┘                   │
│                                                                 │
│              WiFi ──► POST /analyze ──► FastAPI Backend          │
│              WiFi ◄── GET /actuator ◄── (Port 8000)             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📌 Pin Mapping ESP32

| Pin ESP32 | Tipe | Komponen | Keterangan |
|-----------|------|----------|------------|
| `GPIO 4` | Digital | DS18B20 (Suhu) | OneWire protocol, butuh resistor pull-up 4.7kΩ |
| `GPIO 34` | Analog Input | Gravity pH Sensor V2 | ADC, range 0-3.3V |
| `GPIO 35` | Analog Input | SEN0189 (Turbidity) | ADC, range 0-3.3V |
| `GPIO 36` | Analog Input | Water Level Sensor | ADC, range 0-3.3V |
| `GPIO 25` | Digital Output | Relay 1 — Aerator (Air Pump) | Active LOW |
| `GPIO 26` | Digital Output | Relay 2 — Water Pump | Active LOW |
| `GPIO 32` | Digital Output | Relay 3 — Feeder (Servo/Motor) | Active LOW |
| `GPIO 33` | Digital Output | Relay 4 — pH Stabilizer | Active LOW |
| `GPIO 27` | Digital Output | Buzzer (Active) | Alarm kondisi kritis |
| `3.3V` | Power | Sensor power | Untuk sensor analog |
| `5V` | Power | Relay module power | Dari USB atau adaptor |
| `GND` | Ground | Common ground | Semua komponen |

---

## 📦 FASE 1: Persiapan Komponen (Bill of Materials)

| # | Komponen | Qty | Spesifikasi | Status | Assignee |
|---|----------|-----|-------------|--------|----------|
| A-01 | ESP32 DevKit V1 (WROOM-32) | 1 | 30-pin, WiFi + Bluetooth | `[ ]` | |
| A-02 | DS18B20 Waterproof Temperature Sensor | 1 | -55°C ~ +125°C, OneWire, kabel waterproof | `[ ]` | |
| A-03 | DFRobot Gravity Analog pH Sensor V2 | 1 | Range pH 0-14, tegangan output 0-3V, include probe | `[ ]` | |
| A-04 | DFRobot Gravity Optical DO Sensor | 1 | Range 0-20mg/L *(opsional, bisa pakai estimasi rumus)* | `[ ]` | |
| A-05 | SEN0189 Turbidity Sensor | 1 | Output analog, range 0-3000 NTU | `[ ]` | |
| A-06 | Water Level Sensor | 1 | Analog output, tipe resistif | `[ ]` | |
| A-07 | Relay Module 4 Channel | 1 | 5V trigger, Active LOW, optocoupler isolated | `[ ]` | |
| A-08 | Active Buzzer Module | 1 | 3.3V/5V compatible | `[ ]` | |
| A-09 | Aerator / Air Pump | 1 | 220V AC atau 12V DC (sesuaikan relay) | `[ ]` | |
| A-10 | Water Pump (Pompa Air) | 1 | 220V AC atau 12V DC | `[ ]` | |
| A-11 | Feeder Motor / Servo | 1 | Servo SG90 atau motor DC + hopper | `[ ]` | |
| A-12 | Resistor 4.7kΩ | 1 | Pull-up untuk DS18B20 OneWire | `[ ]` | |
| A-13 | Breadboard + Jumper Wires | 1 set | Male-Male, Male-Female, Female-Female | `[ ]` | |
| A-14 | Power Supply / Adaptor | 1 | 5V 2A untuk ESP32, 12V untuk aktuator (jika DC) | `[ ]` | |

---

## 🔧 FASE 2: Perakitan Hardware (Wiring)

### Sensor Wiring

| # | Task | Deskripsi | Status | Assignee |
|---|------|-----------|--------|----------|
| H-01 | **Wiring DS18B20** | VCC → 3.3V, GND → GND, DATA → GPIO 4, pasang resistor 4.7kΩ antara VCC dan DATA (pull-up) | `[ ]` | |
| H-02 | **Wiring pH Sensor V2** | Board pH: VCC → 5V, GND → GND, Analog Out → GPIO 34. Probe pH → BNC connector board | `[ ]` | |
| H-03 | **Wiring Turbidity SEN0189** | VCC → 5V, GND → GND, Analog Out → GPIO 35 | `[ ]` | |
| H-04 | **Wiring Water Level Sensor** | VCC → 3.3V, GND → GND, Analog Out → GPIO 36 | `[ ]` | |
| H-05 | **Test Sensor Readings** | Upload sketch tes baca analog/digital, pastikan semua sensor memberikan nilai | `[ ]` | |

### Aktuator Wiring

| # | Task | Deskripsi | Status | Assignee |
|---|------|-----------|--------|----------|
| H-06 | **Wiring Relay Module** | VCC → 5V, GND → GND, IN1 → GPIO 25 (Aerator), IN2 → GPIO 26 (Pump), IN3 → GPIO 32 (Feeder), IN4 → GPIO 33 (pH Stab) | `[ ]` | |
| H-07 | **Wiring Buzzer** | VCC → GPIO 27, GND → GND (active buzzer, langsung driven) | `[ ]` | |
| H-08 | **Koneksi Aerator ke Relay 1** | Sambungkan air pump ke terminal relay 1 (NO/COM), sumber listrik sesuai spek pump | `[ ]` | |
| H-09 | **Koneksi Water Pump ke Relay 2** | Sambungkan pompa air ke terminal relay 2 (NO/COM) | `[ ]` | |
| H-10 | **Koneksi Feeder ke Relay 3** | Sambungkan servo/motor feeder ke relay 3 atau langsung ke GPIO via driver | `[ ]` | |
| H-11 | **Koneksi pH Stabilizer ke Relay 4** | Sambungkan dosing pump pH ke relay 4 (NO/COM) | `[ ]` | |
| H-12 | **Test Relay ON/OFF** | Upload sketch test toggle setiap relay, pastikan klik terdengar dan aktuator aktif | `[ ]` | |

---

## 💻 FASE 3: Firmware ESP32 (Arduino / PlatformIO)

### Setup & Library

| # | Task | Deskripsi | Status | Assignee |
|---|------|-----------|--------|----------|
| F-01 | **Install Arduino IDE / PlatformIO** | Install IDE, tambahkan board ESP32 ke Board Manager | `[ ]` | |
| F-02 | **Install Library** | `OneWire`, `DallasTemperature` (DS18B20), `WiFi.h`, `HTTPClient.h`, `ArduinoJson` | `[ ]` | |

### Kode Firmware

| # | Task | Deskripsi | Status | Assignee |
|---|------|-----------|--------|----------|
| F-03 | **WiFi Connection** | Koneksi ke WiFi (`ssid`, `password`), reconnect otomatis jika terputus | `[ ]` | |
| F-04 | **Baca Sensor Suhu (DS18B20)** | Inisialisasi OneWire bus GPIO 4, baca suhu dalam °C | `[ ]` | |
| F-05 | **Baca Sensor pH** | `analogRead(GPIO 34)`, konversi voltage → pH value (linear mapping berdasarkan kalibrasi) | `[ ]` | |
| F-06 | **Baca Sensor Turbidity** | `analogRead(GPIO 35)`, konversi voltage → NTU | `[ ]` | |
| F-07 | **Baca Water Level** | `analogRead(GPIO 36)`, konversi ke level (cm atau %) | `[ ]` | |
| F-08 | **Kirim Data ke Backend** | HTTP POST ke `http://<SERVER_IP>:8000/analyze` dengan JSON body: `{ temperature, ph, turbidity, water_level, hour, source: "iot" }` | `[ ]` | |
| F-09 | **Poll Actuator State** | HTTP GET ke `/actuator`, parse JSON response, set relay GPIO sesuai state (aerator, pump, feeder, stabilizer, buzzer) | `[ ]` | |
| F-10 | **Poll Feeding Schedule** | HTTP GET ke `/feeding-version`, bandingkan version, jika berubah GET `/feeding-schedule` dan update timer pakan lokal | `[ ]` | |
| F-11 | **Auto Feeding Timer** | Berdasarkan `feedingTime` dan `interval`, aktifkan feeder pada waktu yang tepat, lalu POST `/feeder/ack` | `[ ]` | |
| F-12 | **Buzzer Acknowledge** | Saat buzzer dinyalakan, bunyikan selama N detik lalu POST `/beep/ack` untuk matikan flag | `[ ]` | |
| F-13 | **Actuator Acknowledge** | Setelah aktuator aktif, kirim POST `/actuator/ack` dengan `{ name: "feeder" }` atau nama aktuator lain | `[ ]` | |
| F-14 | **Main Loop Cycle** | Loop utama: `baca sensor → kirim ke /analyze → poll /actuator → update relay → cek feeding → delay` (interval sesuai settings) | `[ ]` | |

---

## 🔬 FASE 4: Kalibrasi Sensor

| # | Task | Deskripsi | Status | Assignee |
|---|------|-----------|--------|----------|
| K-01 | **Kalibrasi pH Sensor** | Celupkan probe ke buffer pH 4.0 → catat voltage, celupkan ke buffer pH 7.0 → catat voltage, hitung slope & offset untuk linear mapping | `[ ]` | |
| K-02 | **Kalibrasi Suhu** | Bandingkan pembacaan DS18B20 dengan termometer referensi, catat offset jika ada | `[ ]` | |
| K-03 | **Kalibrasi Turbidity** | Air jernih = 0 NTU (catat voltage), tambahkan kotoran bertahap, buat mapping voltage → NTU | `[ ]` | |
| K-04 | **Kalibrasi Water Level** | Ukur voltage di level 0%, 25%, 50%, 75%, 100%, buat lookup table atau linear fit | `[ ]` | |
| K-05 | **Validasi Akurasi** | Bandingkan pembacaan sensor dengan alat ukur standar, dokumentasikan error margin | `[ ]` | |

---

## 🔗 FASE 5: Integrasi dengan Backend

| # | Task | Deskripsi | Status | Assignee |
|---|------|-----------|--------|----------|
| I-01 | **Test POST /analyze** | Kirim data dari ESP32, verifikasi data masuk ke SQLite database di backend | `[ ]` | |
| I-02 | **Test GET /actuator** | Verifikasi ESP32 bisa baca state aktuator dari backend dan set relay sesuai | `[ ]` | |
| I-03 | **Test Mode AUTONOMOUS** | Pastikan saat mode AUTONOMOUS, relay diatur otomatis oleh Decision Engine backend | `[ ]` | |
| I-04 | **Test Mode MANUAL** | Pastikan saat mode MANUAL dari web, relay di ESP32 mengikuti command manual | `[ ]` | |
| I-05 | **Test Feeding Schedule Sync** | Ubah jadwal pakan dari web Settings, verifikasi ESP32 update jadwal via `/feeding-version` | `[ ]` | |
| I-06 | **Test IoT Toggle** | Matikan IoT dari Settings web (`iotEnabled: false`), verifikasi backend reject data dari ESP32 | `[ ]` | |
| I-07 | **Test Email Alert Trigger** | Simulasikan kondisi kritis (DO rendah), verifikasi email terkirim ke recipients | `[ ]` | |
| I-08 | **Test Dashboard Real-time** | Buka dashboard web, verifikasi data sensor dari ESP32 muncul dan update otomatis | `[ ]` | |

---

## 📦 FASE 6: Casing & Perakitan Fisik

| # | Task | Deskripsi | Status | Assignee |
|---|------|-----------|--------|----------|
| C-01 | **Desain Casing Waterproof** | Box tahan air untuk ESP32 + relay + breadboard, lubang kabel sensor | `[ ]` | |
| C-02 | **Mounting Sensor ke Kolam** | Bracket/holder untuk probe pH, DS18B20, turbidity sensor masuk ke air | `[ ]` | |
| C-03 | **Routing Kabel** | Rapikan kabel sensor dan aktuator, cable management, label setiap kabel | `[ ]` | |
| C-04 | **Power Distribution** | Distribusi daya: 5V untuk ESP32/relay, 12V/220V untuk aktuator, gunakan terminal block | `[ ]` | |
| C-05 | **Final Assembly** | Rakit semua komponen ke casing, test power on, verifikasi semua koneksi | `[ ]` | |

---

## ✅ FASE 7: Testing & Validasi Akhir

| # | Task | Deskripsi | Status | Assignee |
|---|------|-----------|--------|----------|
| T-01 | **Stress Test 24 Jam** | Jalankan alat selama 24 jam non-stop, monitor kestabilan koneksi WiFi dan pembacaan sensor | `[ ]` | |
| T-02 | **Test Failover WiFi** | Cabut WiFi, pastikan ESP32 reconnect otomatis dan tidak crash | `[ ]` | |
| T-03 | **Test Failover Power** | Cabut dan nyalakan ulang power, pastikan ESP32 boot dan mulai kirim data kembali | `[ ]` | |
| T-04 | **Test Aktuator Beban Nyata** | Test aerator, pump, feeder dengan beban nyata (bukan hanya relay klik) | `[ ]` | |
| T-05 | **Dokumentasi Foto/Video** | Foto rangkaian, video demo alat bekerja, screenshot dashboard saat data masuk | `[ ]` | |
| T-06 | **Pengukuran Konsumsi Daya** | Ukur total ampere yang dipakai seluruh sistem untuk menentukan kapasitas power supply | `[ ]` | |
| T-07 | **Laporan Pengujian** | Dokumentasi hasil kalibrasi, error margin sensor, uptime test, dan catatan perbaikan | `[ ]` | |

---

## 📊 Ringkasan Task Alat IoT

| Fase | Jumlah Task |
|------|-------------|
| 📦 Fase 1: Persiapan Komponen (BOM) | 14 item |
| 🔧 Fase 2: Perakitan Hardware | 12 task |
| 💻 Fase 3: Firmware ESP32 | 14 task |
| 🔬 Fase 4: Kalibrasi Sensor | 5 task |
| 🔗 Fase 5: Integrasi Backend | 8 task |
| 📦 Fase 6: Casing & Fisik | 5 task |
| ✅ Fase 7: Testing & Validasi | 7 task |
| **TOTAL** | **65 task** |

---

## ⚠️ Catatan Penting

> [!WARNING]
> **Keamanan Listrik**: Jika menggunakan aktuator 220V AC (aerator, pompa), pastikan wiring relay dilakukan oleh yang berpengalaman. Gunakan relay dengan optocoupler isolation.

> [!IMPORTANT]
> **Sensor pH harus dikalibrasi** sebelum dipakai. Tanpa kalibrasi, pembacaan pH bisa meleset jauh. Gunakan buffer solution pH 4.0 dan pH 7.0.

> [!TIP]
> **DO Sensor opsional** — Pada backend saat ini, Dissolved Oxygen (DO) dihitung menggunakan rumus estimasi dari suhu air (Henry's Law). Sensor DO fisik bisa ditambahkan nanti sebagai upgrade.

> [!NOTE]
> **WiFi Range** — Pastikan kolam berada dalam jangkauan WiFi router. Jika terlalu jauh, pertimbangkan WiFi repeater atau antena eksternal untuk ESP32.

---

## 📌 Urutan Pengerjaan yang Disarankan

```
Fase 1 (Beli Komponen)
    ↓
Fase 2 (Wiring Sensor → Test → Wiring Relay → Test)
    ↓
Fase 3 (Firmware: WiFi → Baca Sensor → Kirim ke API → Poll Actuator)
    ↓
Fase 4 (Kalibrasi semua sensor)
    ↓
Fase 5 (Integrasi end-to-end dengan Backend + Frontend)
    ↓
Fase 6 (Casing, rapikan kabel)
    ↓
Fase 7 (Testing 24 jam, dokumentasi)
```

---

## 📌 Cara Update Status

1. **Isi kolom `Assignee`** dengan nama anggota tim yang bertanggung jawab
2. **Update kolom `Status`**:
   - `[ ]` — Belum dikerjakan
   - `[/]` — Sedang dikerjakan  
   - `[x]` — Selesai
3. **Prioritas utama**: Fase 1 → 2 → 3 (harus berurutan, karena ada dependency hardware)

---

> **NEELA AI IoT Module** — *ESP32-based Smart Aquaculture Monitoring & Control System* 🐟⚡
