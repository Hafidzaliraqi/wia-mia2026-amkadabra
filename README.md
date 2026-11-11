# Tuntasin

[![CI](https://github.com/Hafidzaliraqi/wia-mia2026-amkadabra/actions/workflows/ci.yml/badge.svg)](https://github.com/Hafidzaliraqi/wia-mia2026-amkadabra/actions/workflows/ci.yml)

Tuntasin adalah platform pelaporan warga yang meneruskan laporan ke instansi yang tepat secara otomatis, menampilkan batas waktu setiap tahap ke publik, dan baru menutup laporan setelah warga mengonfirmasi masalahnya benar-benar beres. Dibuat untuk Web In Action (WIA) MIA 2026, subtema Civic Reporting & Accountability.

## Tech Stack

- Next.js 16 (App Router, Server Actions, Cache Components) + TypeScript
- Tailwind CSS 4, font Bricolage Grotesque, Plus Jakarta Sans, dan JetBrains Mono (ditanam di project)
- PostgreSQL: PGlite untuk pengembangan lokal, Neon/Supabase saat online
- Leaflet + OpenStreetMap untuk peta lokasi laporan
- Nodemailer (SMTP Gmail) dan Fonnte (WhatsApp, opsional) untuk kode OTP dan pemberitahuan
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

Di halaman Masuk ada tombol **masuk sekali klik** untuk ketiga peran. Akun warga baru bisa dibuat sendiri lewat halaman Daftar (verifikasi kode OTP lewat email).

## Arsitektur

Satu aplikasi Next.js berisi antarmuka dan backend. Semua perubahan data lewat Server Actions yang memeriksa hak akses di server. Status dan tenggat laporan tidak disimpan sebagai kolom, melainkan dihitung dari tabel `kejadian` (riwayat), sehingga riwayat penanganan tidak bisa diubah diam-diam.

```
app/
  (publik)/        Beranda, Jelajah, Detail laporan, Transparansi, Data terbuka, Tentang, Simulasi, akun warga
  (dasbor)/        Dasbor petugas dan admin
  api/             Foto, data terbuka (CSV/JSON), status deploy
components/        Komponen tampilan (beranda, dasbor, simulasi, transparansi, dll.)
lib/
  sla.ts           Status dan tenggat dari riwayat (hari kerja)
  eskalasi.ts      Eskalasi berjenjang: pimpinan instansi, inspektorat, kepala daerah
  statistik.ts     Metrik publik, prioritas penanganan, rapor instansi
  wilayah.ts       10 kota/kabupaten, deteksi kecamatan dari alamat dan GPS
  aksi/            Server Actions: akun, laporan, petugas, admin, simulasi
  server/          Database (PGlite/PostgreSQL), sesi, OTP, email, WhatsApp, notifikasi
tests/             Unit test (Vitest)
```

## Pengujian

```bash
npm test           # unit test: tenggat hari kerja, eskalasi berjenjang, deteksi wilayah, nomor laporan
npm run typecheck  # pemeriksaan tipe TypeScript
npm run lint       # ESLint
```

Setiap pull request otomatis menjalankan lint, typecheck, test, dan build lewat GitHub Actions (`.github/workflows/ci.yml`).

## Data terbuka

- `GET /api/data/laporan` → CSV semua laporan publik
- `GET /api/data/laporan?format=json&kota=jaksel&status=diproses` → JSON

Tanpa nama, kontak, foto, atau koordinat pelapor. Kamus data ada di halaman `/data`.

## Deploy

Website di-deploy ke Vercel dengan database Neon (region Singapura). Variabel lingkungan yang wajib diisi di Vercel: `DATABASE_URL`, `RAHASIA_APLIKASI`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, dan `ALAMAT_SITUS`. Opsional: `FONNTE_TOKEN` supaya kode OTP juga dikirim lewat WhatsApp. Setelah deploy, buka `/api/status` untuk memastikan database dan email sudah siap.

## Progress

- [x] Beranda: lacak nomor laporan, kinerja layanan, daerah terbanyak, laporan terbaru
- [x] Jelajah laporan: filter kota/kabupaten, kecamatan, kelompok masalah, status, laporan di sekitar pengguna
- [x] Detail laporan: tahap, hitung mundur tenggat, riwayat penanganan, foto sebelum/sesudah, dukungan, bagikan, konfirmasi warga
- [x] Percakapan dua arah petugas dan warga, halaman diperbarui otomatis tanpa muat ulang
- [x] Buat laporan 6 langkah: peta lokasi, daerah terdeteksi dari alamat peta, cek laporan serupa, foto dengan data EXIF, privasi
- [x] Akun: daftar dengan OTP email, masuk, lupa kata sandi, kunci akun setelah 5 kali gagal
- [x] Riwayat, notifikasi, dan pengaturan akun warga
- [x] Transparansi: peta sebaran laporan, rapor instansi per daerah, dan standar waktu layanan
- [x] Dasbor petugas: antrean instansi, terima, kirim kabar, perpanjangan, alihkan, tandai selesai dengan foto
- [x] Dasbor admin: verifikasi dengan tanda risiko, tolak, tindak lanjut laporan yang ditandai warga, pemantauan tenggat, teguran, akun petugas
- [x] Tugas otomatis: tutup laporan tanpa konfirmasi 10 hari
- [x] Eskalasi berjenjang otomatis: pimpinan instansi, inspektorat, lalu kepala daerah; juga saat warga menolak hasil 2 kali
- [x] Dasbor publik real-time di Transparansi: persen tuntas, rata-rata penyelesaian, respons awal, tren mingguan, filter daerah
- [x] Data terbuka: halaman `/data`, unduhan CSV, dan API JSON dengan filter
- [x] Prioritas penanganan: kecamatan dan jenis masalah paling mendesak sebagai bahan keputusan
- [x] Unit test (Vitest) dan CI GitHub Actions
- [x] Simulasi alur untuk presentasi (`/demo`) dengan log integrasi webhook
- [x] Tombol aksi utama menempel di bawah layar HP (konfirmasi, dukung, lanjut formulir)
- [x] Halaman Tentang & FAQ, masuk sekali klik untuk juri, pratinjau tautan saat dibagikan
- [ ] Deploy online (Vercel + Neon)
- [ ] Foto asli untuk laporan contoh

Wilayah layanan: seluruh DKI Jakarta, Kota/Kabupaten Bogor, Kota Depok, Kota Bandung, dan Kabupaten Garut.

Data laporan dan kinerja instansi di website ini adalah data simulasi untuk keperluan lomba.
