// Struktur tabel database. Dijalankan otomatis saat aplikasi pertama kali
// terhubung ke database (aman dijalankan berulang karena IF NOT EXISTS).
export const SKEMA = `
CREATE TABLE IF NOT EXISTS pengguna (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  email text NOT NULL UNIQUE,
  hp text NOT NULL UNIQUE,
  hash_sandi text NOT NULL,
  peran text NOT NULL DEFAULT 'warga' CHECK (peran IN ('warga', 'petugas', 'admin')),
  instansi_id text,
  laporan_palsu int NOT NULL DEFAULT 0,
  gagal_masuk int NOT NULL DEFAULT 0,
  terkunci_sampai timestamptz,
  notif_email boolean NOT NULL DEFAULT true,
  dibuat_pada timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sesi (
  hash_token text PRIMARY KEY,
  pengguna_id uuid NOT NULL REFERENCES pengguna(id) ON DELETE CASCADE,
  kedaluwarsa timestamptz NOT NULL,
  dibuat_pada timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS kode_otp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tujuan text NOT NULL CHECK (tujuan IN ('daftar', 'atur_sandi')),
  email text NOT NULL,
  pengguna_id uuid REFERENCES pengguna(id) ON DELETE CASCADE,
  data jsonb,
  hash_kode text NOT NULL,
  percobaan int NOT NULL DEFAULT 0,
  dikirim_pada timestamptz NOT NULL DEFAULT now(),
  kedaluwarsa timestamptz NOT NULL,
  dipakai_pada timestamptz
);

CREATE TABLE IF NOT EXISTS laporan (
  nomor text PRIMARY KEY,
  kategori_id text NOT NULL,
  judul text NOT NULL,
  deskripsi text NOT NULL,
  alamat text NOT NULL,
  kota_id text NOT NULL,
  kecamatan text NOT NULL,
  lat double precision,
  lng double precision,
  tanggal_kejadian date NOT NULL,
  dibuat_pada timestamptz NOT NULL DEFAULT now(),
  pelapor_id uuid REFERENCES pengguna(id) ON DELETE SET NULL,
  nama_pelapor text NOT NULL,
  visibilitas text NOT NULL CHECK (visibilitas IN ('publik', 'sembunyikan_nama', 'privat')),
  instansi_id text NOT NULL,
  dukungan_awal int NOT NULL DEFAULT 0,
  foto_contoh boolean NOT NULL DEFAULT false,
  sorotan boolean NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS laporan_pelapor ON laporan (pelapor_id);

CREATE TABLE IF NOT EXISTS kejadian (
  id bigserial PRIMARY KEY,
  nomor text NOT NULL REFERENCES laporan(nomor) ON DELETE CASCADE,
  jenis text NOT NULL,
  waktu timestamptz NOT NULL DEFAULT now(),
  aktor text NOT NULL,
  aktor_id uuid REFERENCES pengguna(id) ON DELETE SET NULL,
  catatan text,
  batas_baru timestamptz
);
CREATE INDEX IF NOT EXISTS kejadian_nomor ON kejadian (nomor, waktu);

CREATE TABLE IF NOT EXISTS dukungan (
  pengguna_id uuid NOT NULL REFERENCES pengguna(id) ON DELETE CASCADE,
  nomor text NOT NULL REFERENCES laporan(nomor) ON DELETE CASCADE,
  dibuat_pada timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (pengguna_id, nomor)
);

CREATE TABLE IF NOT EXISTS foto (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor text NOT NULL REFERENCES laporan(nomor) ON DELETE CASCADE,
  jenis text NOT NULL CHECK (jenis IN ('awal', 'sesudah')),
  tipe text NOT NULL,
  data bytea NOT NULL,
  diambil_pada timestamptz,
  lat double precision,
  lng double precision,
  dibuat_pada timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS foto_nomor ON foto (nomor);

CREATE TABLE IF NOT EXISTS tanda_tidak_sesuai (
  pengguna_id uuid NOT NULL REFERENCES pengguna(id) ON DELETE CASCADE,
  nomor text NOT NULL REFERENCES laporan(nomor) ON DELETE CASCADE,
  alasan text NOT NULL,
  dibuat_pada timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (pengguna_id, nomor)
);

CREATE TABLE IF NOT EXISTS notifikasi (
  id bigserial PRIMARY KEY,
  pengguna_id uuid NOT NULL REFERENCES pengguna(id) ON DELETE CASCADE,
  judul text NOT NULL,
  isi text NOT NULL,
  tautan text NOT NULL,
  dibaca boolean NOT NULL DEFAULT false,
  dibuat_pada timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS notifikasi_pengguna ON notifikasi (pengguna_id, dibaca);
`;
