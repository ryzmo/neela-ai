# Neela AI Web - Frontend
source venv/Scripts/activate

Neela AI Web adalah antarmuka pengguna (frontend) berbasis Next.js dan Tailwind CSS untuk sistem pemantauan kualitas air tambak ikan cerdas. Aplikasi ini terhubung dengan backend FastAPI dan model Machine Learning untuk menampilkan data sensor realtime, status kesehatan tambak, kontrol aktuator otomatis/manual, simulasi kondisi air, serta rekomendasi keputusan berbasis AI.

---

## Prasyarat Sistem

Sebelum memulai, pastikan perangkat Anda telah terpasang:
- Node.js versi 18.17.0 atau lebih baru (disarankan versi LTS)
- npm (bawaan Node.js), yarn, atau pnpm
- Backend Neela AI yang aktif dan berjalan (secara default di `http://localhost:8000`)

---

## Panduan Instalasi dan Menjalankan Aplikasi

Ikuti langkah-langkah berikut secara berurutan untuk menjalankan frontend dari awal:

### 1. Masuk ke Direktori Proyek

Buka terminal atau command prompt, lalu arahkan ke folder root frontend:

```bash
cd neela-ai
```

### 2. Konfigurasi Environment Variable

Buat berkas `.env.local` pada root direktori proyek jika belum tersedia. Berkas ini digunakan untuk konfigurasi pengiriman email notifikasi (menggunakan SMTP seperti Brevo/Gmail):

```env
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_USER=email_anda@domain.com
EMAIL_PASS=password_smtp_anda
```

Catatan: Jika fitur pengiriman email tidak digunakan, aplikasi tetap dapat berjalan normal untuk fungsi monitoring dan simulasi.

### 3. Instalasi Dependensi

Jalankan perintah berikut untuk mengunduh dan memasang semua dependensi yang dibutuhkan:

```bash
npm install
```

### 4. Menjalankan Server Pengembangan

Mulai server lokal Next.js dengan perintah:

```bash
npm run dev
```

Server akan berjalan secara default pada port 3000.

### 5. Mengakses Aplikasi

Buka peramban web (Google Chrome, Firefox, Edge, dll.) dan akses alamat:

```
http://localhost:3000
```

---

## Panduan Penggunaan Halaman dan Fitur

Setelah aplikasi terbuka di peramban, Anda dapat menggunakan modul-modul berikut melalui navigasi sidebar:

1. Dashboard Utama (`/`)
   - Menampilkan ringkasan status kualitas air tambak (Suhu, DO, pH, Turbiditas).
   - Menampilkan status kesehatan tambak (Normal / At Risk), tingkat risiko, dan aksi aktuator yang sedang aktif.
   - Grafik riwayat sensor dan tren parameter air secara realtime.

2. Simulator Sensor (`/simulator`)
   - Digunakan untuk menguji sistem dengan memasukkan nilai sensor kustom secara manual (Suhu, DO, pH, Turbidity, Jam).
   - Menyediakan tombol preset skenario (Normal Optimal, DO Kritis Malam Hari, pH Asam Ekstrem, Suhu Tinggi Siang Hari).
   - Mengirim data langsung ke endpoint backend `/analyze` untuk melihat hasil inferensi model Machine Learning dan keputusan aktuator seketika.

3. AI Decision Center (`/ai-center`)
   - Memvisualisasikan proses penarikan keputusan AI (ExtraTrees Classifier + LLM Reasoning).
   - Menampilkan probabilitas kelas, faktor penentu risiko, dan alasan rekomendasi tindakan.

4. Kontrol Aktuator (`/actuator`)
   - Menampilkan status 4 aktuator: Aerator, Feeder, Water Circulation, dan pH Neutralizer.
   - Mendukung peralihan mode antara Otomatis (dikendalikan AI) dan Manual (dikendalikan operator tambak).

5. Pohon Keputusan (`/decision-tree`)
   - Menampilkan alur logika deterministik dan threshold parameter yang digunakan sistem untuk menentukan tindakan proteksi tambak.

6. Analisis Data (`/analytics`)
   - Menampilkan grafik mendalam parameter air, korelasi antar parameter, dan ekspor laporan ringkasan data.

7. Riwayat Peringatan (`/alerts`)
   - Mencatat semua kejadian anomali parameter air beserta tingkat keparahan (Low, Medium, High).

8. Pengaturan Sistem (`/settings`)
   - Konfigurasi ambang batas parameter (threshold), target penerima email darurat, dan preferensi interval pembacaan sensor.

9. AI Assistant (`/chat`)
   - Fitur tanya jawab interaktif seputar kondisi tambak, budidaya ikan, dan troubleshooting kualitas air.

---

## Perintah Tambahan

### Build untuk Mode Produksi

Untuk mengompilasi dan mengoptimalkan aplikasi untuk lingkungan produksi:

```bash
npm run build
```

### Menjalankan Hasil Build Produksi

Setelah proses build selesai, jalankan server produksi dengan:

```bash
npm run start
```

### Menjalankan Linter

Untuk memeriksa kesesuaian gaya kode dan potensi kesalahan sintaks:

```bash
npm run lint
```

---

## Pemecahan Masalah (Troubleshooting)

- Status data sensor tidak muncul atau loading terus menerus:
  Pastikan backend FastAPI sudah berjalan di `http://localhost:8000`. Jika backend berjalan pada port atau host yang berbeda, sesuaikan URL endpoint pada konfigurasi fetch frontend.
- Port 3000 sudah digunakan:
  Next.js akan otomatis menawarkan port berikutnya (misal port 3001), atau Anda dapat menentukan port secara manual dengan perintah:
  ```bash
  npx next dev -p 3005
  ```
- Modul dependensi error setelah update:
  Hapus folder `node_modules` dan `.next`, lalu jalankan kembali `npm install` dan `npm run dev`.
