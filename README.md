# Tuntasin

Tuntasin adalah platform pelaporan warga yang meneruskan laporan ke instansi yang tepat secara otomatis, menampilkan batas waktu setiap tahap ke publik, dan baru menutup laporan setelah warga mengonfirmasi masalahnya benar-benar beres. Dibuat untuk Web In Action (WIA) MIA 2026, subtema Civic Reporting & Accountability.

## Tech Stack

- Next.js 16 (App Router, Server Actions, Cache Components) + TypeScript
- Tailwind CSS 4
- PostgreSQL: PGlite untuk pengembangan lokal, Neon/Supabase saat online
- Leaflet + OpenStreetMap untuk peta lokasi laporan
- Nodemailer (SMTP Gmail) untuk kode OTP dan email pemberitahuan
- exifr untuk membaca waktu dan lokasi foto (deteksi laporan palsu)

## Cara Menjalankan

Prasyarat: Node.js 24 LTS dan Git.

```bash
git clone https://github.com/Hafidzaliraqi/wia-mia2026-amkadabra.git
cd wia-mia2026-amkadabra
npm install
npm run dev
```

Buka http://localhost:3000. Saat pertama kali dibuka, database lokal dibuat otomatis di folder `.data/` lengkap dengan data contoh (sekitar 10 detik).

Pengaturan opsional ada di `.env.example`. Salin menjadi `.env.local` lalu isi:

- `SMTP_*`: supaya kode OTP benar-benar terkirim ke email. Tanpa ini, isi email dicetak di terminal.
- `DATABASE_URL`: kalau ingin memakai database online.
- `RAHASIA_APLIKASI`: wajib diisi saat website di-deploy.

Untuk mengulang data contoh dari awal, matikan server, hapus folder `.data`, lalu jalankan `npm run dev` lagi.

## Akun Demo

Semua kata sandi: `demo1234`

| Peran | Email |
|---|---|
| Warga | warga@demo.id |
| Petugas DPU Jakarta Selatan | petugas.dpu@demo.id |
| Petugas Dishub Jakarta Selatan | petugas.dishub@demo.id |
| Petugas SDA Jakarta Selatan | petugas.sda@demo.id |
| Admin verifikator | admin@demo.id |

Akun warga baru bisa dibuat sendiri lewat halaman Daftar (verifikasi kode OTP email).

## Progress

- [x] Beranda: lacak nomor laporan, kinerja layanan, daerah terbanyak, laporan terbaru
- [x] Jelajah laporan: filter kota/kabupaten, kecamatan, kelompok masalah, status, laporan di sekitar pengguna
- [x] Detail laporan: tahap, tenggat, riwayat penanganan, foto sebelum/sesudah, dukungan, konfirmasi warga
- [x] Buat laporan 6 langkah: peta lokasi, daerah otomatis, cek laporan serupa, foto dengan data EXIF, privasi
- [x] Akun: daftar dengan OTP email, masuk, lupa kata sandi, kunci akun setelah 5 kali gagal
- [x] Riwayat, notifikasi, dan pengaturan akun warga
- [x] Transparansi: rapor instansi per daerah dan standar waktu layanan
- [x] Dasbor petugas: antrean instansi, terima, kirim kabar, perpanjangan, alihkan, tandai selesai dengan foto
- [x] Dasbor admin: verifikasi dengan tanda risiko, tolak, pemantauan tenggat, teguran, akun petugas
- [x] Tugas otomatis: tutup laporan tanpa konfirmasi 10 hari, eskalasi laporan lewat batas waktu
- [ ] Deploy online (Vercel + Neon)
- [ ] Foto asli untuk laporan contoh

Data laporan dan kinerja instansi di website ini adalah data simulasi untuk keperluan lomba.
