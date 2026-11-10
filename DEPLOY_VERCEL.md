# Hosting demo gratis di Vercel

Panduan ini menerbitkan frontend prototype CSSD dari repo GitHub privat. Repo tetap privat; URL demo yang dihasilkan dapat dibuka oleh siapa pun yang memilikinya kecuali Anda mengaktifkan proteksi akses di Vercel.

## Deploy pertama kali

1. Buat/masuk ke akun Vercel dan pilih paket gratis sesuai ketentuan Vercel saat ini.
2. Dari Vercel, pilih **Add New → Project**, lalu hubungkan akun GitHub dan beri Vercel akses ke repo `118hanafi-hub/Aplikasi-CSSD`.
3. Pilih repo tersebut. Vercel akan membaca `vercel.json`; pastikan framework **Vite**, build command `npm run build`, dan output directory `dist`.
4. Untuk demo frontend lokal, environment variable Supabase tidak wajib. Klik **Deploy**.
5. Setelah build berhasil, buka URL `.vercel.app` yang ditampilkan. Setiap push ke branch `main` akan memicu deployment baru.

Jika mengaktifkan Supabase Auth, atur `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` pada Project Settings → Environment Variables di Vercel, lalu lakukan redeploy. Jangan tambahkan service-role key ke frontend atau repo.

## Batasan demo saat ini

- Vercel meng-host frontend; data formulir prototype masih berada di localStorage browser dan tidak dibagikan antarperangkat.
- Login Supabase dapat ditampilkan setelah dikonfigurasi, tetapi formulir operasional belum terhubung ke database. Jangan buat akun staf untuk penggunaan nyata atau masukkan data operasional/pasien.
- QR label demo belum bisa mengambil data dari perangkat/browser lain.
- URL publik tidak otomatis terlindungi. Jangan masukkan informasi rahasia; untuk demo terbatas, aktifkan proteksi akses Vercel jika tersedia pada paket dan pengaturan akun Anda.
- Paket gratis, kuota, dan fitur hosting dapat berubah; tinjau ketentuan penyedia sebelum penggunaan.

## Deploy alternatif

Situs ini juga dapat dibangun di hosting statis yang mendukung Vite: build command `npm run build`, output folder `dist`. Hosting frontend tidak menggantikan database backend.
