# Aplikasi CSSD

Prototype aplikasi web responsif untuk membantu merancang alur kerja CSSD di HP dan komputer.

## Yang tersedia pada versi prototype

- Dashboard dengan ringkasan operasional dan akses cepat.
- Pencatatan penerimaan/pengembalian instrumen kotor.
- Contoh data inventaris set dan daftar isi/jumlah instrumen.
- Pembuatan muatan sterilisasi serta QR sungguhan untuk label kemasan sebelum Start.
- Tampilan detail label berisi isi kemasan, tanggal sterilisasi/kedaluwarsa, metode, mesin, lot/siklus, petugas, dan status.
- Pencatatan log suhu dan jadwal pemeliharaan.
- Ringkasan laporan prototype.
- Data formulir disimpan pada localStorage browser/perangkat yang digunakan.

## Jalankan untuk pengembangan

```bash
npm install
npm run dev
```

Buka URL yang ditampilkan Vite. Untuk akses melalui HP di jaringan yang sama, gunakan alamat Network yang ditampilkan terminal.

## Batasan penting

Ini adalah prototype frontend. Data tersimpan hanya di browser lokal dan tidak dibagikan antarperangkat/pengguna. Belum ada autentikasi, database server, sinkronisasi 50–60 pengguna, kontrol akses, backup, atau audit trail yang memadai untuk operasional. QR label membuka rekaman pada aplikasi yang sama; aplikasi perlu di-host dan terhubung backend agar dapat dipindai dari perangkat lain. Gunakan data simulasi saja, bukan data pasien atau data sensitif. SOP, validasi siklus, masa berlaku, dan keputusan pelepasan alat tetap mengikuti kebijakan fasilitas.

## Build

```bash
npm run build
```
