# Aplikasi CSSD

Prototype aplikasi web responsif untuk membantu merancang alur kerja CSSD di HP dan komputer.

## Fitur prototype

- Dashboard dan navigasi responsif.
- Pencatatan penerimaan/pengembalian instrumen kotor.
- Contoh data inventaris set dan daftar isi/jumlah instrumen.
- Pembuatan muatan sterilisasi dan QR label sebelum Start.
- Detail label: isi kemasan, tanggal, metode, mesin, lot/siklus, petugas, dan status.
- Log suhu, jadwal pemeliharaan, dan ringkasan prototype.
- Integrasi login Supabase opsional (memerlukan konfigurasi).

## Coba lokal

```bash
npm install
npm run dev
```

## Demo online gratis

Panduan deploy dari repo privat ke Vercel ada di [`DEPLOY_VERCEL.md`](DEPLOY_VERCEL.md). Konfigurasi build Vercel ada di `vercel.json`. Saya tidak dapat menghubungkan akun Vercel Anda atau menerbitkan deployment tanpa otorisasi pada akun hosting tersebut.

## Status database dan keselamatan

Skema database awal ada di `supabase/migrations/`; panduan login ada di `supabase/LOGIN_SETUP.md`. Frontend saat ini belum melakukan CRUD ke database bersama: data operasional prototype disimpan lokal di browser. Jangan gunakan untuk catatan CSSD resmi, data pasien, atau informasi sensitif. SOP, validasi siklus, masa berlaku, serta keputusan pelepasan alat wajib mengikuti kebijakan fasilitas dan ditinjau penanggung jawab.

## Build

```bash
npm run build
```
