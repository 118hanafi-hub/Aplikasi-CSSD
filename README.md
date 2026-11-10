# Aplikasi CSSD

Aplikasi web responsif untuk pengelolaan CSSD dengan fokus pada:

- Inventaris instrumen, mesin, dan sarana prasarana
- Pencatatan alat kotor dan proses penerimaan
- Proses sterilisasi dan label QR/barcode sebelum start mesin
- Log suhu dan lingkungan kerja
- Pemeliharaan mesin dan jadwal service
- Laporan operasional dan aktivitas harian

## Fitur utama

- Dashboard modern dan responsif
- Tabel inventaris dengan status peralatan
- Data set instrumen dan rincian isi set
- Queue sterilisasi dan status mesin
- Preview label QR untuk paket sterilisasi
- Log suhu dan pemeliharaan mesin
- UI mobile-friendly untuk HP maupun komputer

## Cara menjalankan

1. Instal dependency:
   ```bash
   npm install
   ```
2. Jalankan aplikasi:
   ```bash
   npm run dev
   ```
3. Buka aplikasi di browser:
   ```bash
   http://localhost:5173
   ```

## Build untuk produksi

```bash
npm run build
```

## Catatan

Aplikasi ini merupakan prototype dashboard dan alur kerja CSSD yang siap dikembangkan lebih lanjut menjadi aplikasi full-stack dengan backend, autentikasi, database, dan integrasi QR scanner sesuai kebutuhan rumah sakit atau fasilitas kesehatan.
