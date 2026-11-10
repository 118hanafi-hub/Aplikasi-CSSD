# Aplikasi CSSD

Prototype aplikasi web responsif untuk membantu merancang alur kerja CSSD di HP dan komputer.

## Yang tersedia

- Dashboard dan navigasi responsif.
- Pencatatan penerimaan/pengembalian instrumen kotor.
- Contoh data inventaris set dan daftar isi/jumlah instrumen.
- Pembuatan muatan sterilisasi dan QR label sebelum Start.
- Detail label: isi kemasan, tanggal, metode, mesin, lot/siklus, petugas, dan status.
- Log suhu, jadwal pemeliharaan, dan ringkasan prototype.
- Supabase Auth login integration (optional configuration).

## Jalankan untuk pengembangan

```bash
npm install
npm run dev
```

Buka URL yang ditampilkan Vite. Untuk akses melalui HP pada jaringan yang sama, gunakan alamat Network yang ditampilkan terminal.

## Login dan database

Skema shared database awal ada di `supabase/migrations/`; setup login ada di `supabase/LOGIN_SETUP.md`. Login Supabase dapat diaktifkan dengan `.env.local` dari `.env.example`. **Walaupun login aktif, formulir operasional saat ini masih menyimpan data di browser lokal dan belum tersinkron ke database.** Backend CRUD dan role-based UI perlu diselesaikan sebelum uji operasional.

## Batasan dan keselamatan

Jangan masukkan data pasien atau data sensitif. Prototype ini belum layak untuk pencatatan operasional resmi: belum ada backend CRUD terhubung, sinkronisasi antarperangkat, backup, alur approval, atau validasi klinis/regulasi. SOP, parameter siklus, masa berlaku, dan keputusan pelepasan alat wajib mengikuti kebijakan fasilitas dan ditinjau penanggung jawab.

## Build

```bash
npm run build
```
