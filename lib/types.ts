// Tipe data utama aplikasi. Bentuknya sama dengan tabel di database
// (lihat lib/server/skema.ts).

export type KelompokId = "jalan" | "lingkungan" | "fasilitas" | "administrasi" | "ketertiban" | "integritas";

export type KategoriId =
  | "jalan-rusak"
  | "trotoar"
  | "lampu-jalan"
  | "rambu"
  | "angkutan"
  | "sampah"
  | "drainase"
  | "pencemaran"
  | "pohon-taman"
  | "faskes"
  | "sekolah"
  | "fasum"
  | "kependudukan"
  | "perizinan"
  | "bansos"
  | "parkir"
  | "pkl"
  | "pungli"
  | "wewenang";

export interface Kelompok {
  id: KelompokId;
  nama: string;
}

export interface Kategori {
  id: KategoriId;
  kelompok: KelompokId;
  nama: string;
  contoh: string;
  slaHariKerja: number;
  jenisInstansi: string;
}

export interface Instansi {
  id: string;
  nama: string;
  singkatan: string;
  jenis: string;
  kotaId: string;
}

export type Peran = "warga" | "petugas" | "admin";

// Status dihitung dari riwayat (kejadian), bukan disimpan manual.
export type StatusLaporan =
  | "terkirim" // menunggu verifikasi admin
  | "diteruskan" // sudah diverifikasi, menunggu respons awal instansi
  | "diproses" // sedang dikerjakan instansi
  | "menunggu_konfirmasi" // instansi bilang selesai, menunggu jawaban pelapor
  | "selesai" // pelapor/pendukung mengonfirmasi sudah beres
  | "ditutup_otomatis" // tidak ada jawaban dalam 10 hari
  | "ditolak";

export type JenisKejadian =
  | "dibuat"
  | "diverifikasi"
  | "diteruskan"
  | "dialihkan"
  | "diproses"
  | "balasan" // pesan petugas ke warga
  | "tanggapan" // pesan warga (pelapor/pendukung) ke petugas
  | "perpanjangan"
  | "eskalasi"
  | "ditandai_selesai"
  | "dikonfirmasi_beres"
  | "dibuka_ulang"
  | "ditutup_otomatis"
  | "ditolak";

export interface Kejadian {
  jenis: JenisKejadian;
  waktu: string; // ISO 8601
  aktor: string; // "Pelapor", "Admin verifikator", nama instansi, atau "Sistem"
  catatan?: string;
  batasBaru?: string; // khusus "perpanjangan"
  aktorId?: string; // akun yang melakukan (kalau ada)
}

export type Visibilitas = "publik" | "sembunyikan_nama" | "privat";

export interface FotoLaporan {
  id: string;
  jenis: "awal" | "sesudah";
  diambilPada: string | null; // dari EXIF foto, kalau ada
  lat: number | null;
  lng: number | null;
}

export interface Laporan {
  nomor: string; // contoh: TSN-2610-0042
  kategoriId: KategoriId;
  judul: string;
  deskripsi: string;
  alamat: string;
  kotaId: string;
  kecamatan: string;
  lat: number | null;
  lng: number | null;
  tanggalKejadian: string; // YYYY-MM-DD
  dibuatPada: string;
  pelaporId: string | null;
  namaPelapor: string;
  visibilitas: Visibilitas;
  instansiId: string; // instansi yang menangani sekarang
  dukungan: number; // total dukungan
  adaFotoContoh: boolean; // data contoh tanpa foto asli
  foto: FotoLaporan[];
  riwayat: Kejadian[]; // urut dari paling lama ke paling baru
  sorotan: boolean; // laporan contoh yang ditampilkan di beranda
}

// Versi ringkas untuk daftar. Semua sudah berupa teks/angka biasa,
// jadi aman dikirim ke komponen client.
export interface RingkasanLaporan {
  nomor: string;
  judul: string;
  kategoriId: KategoriId;
  kategoriNama: string;
  kelompok: KelompokId;
  alamat: string;
  kotaId: string;
  kotaNama: string;
  kecamatan: string;
  lat: number | null;
  lng: number | null;
  status: StatusLaporan;
  labelStatus: string;
  terlambat: boolean;
  dukungan: number;
  dibuatPada: string;
  dibuatTeks: string;
  instansiNama: string;
  tenggatTeks: string | null;
}

// Data pengguna yang aman dikirim ke browser (tanpa hash sandi dsb.)
export interface PenggunaRingkas {
  nama: string;
  email: string;
  peran: Peran;
}

export interface NotifikasiRingkas {
  id: number;
  judul: string;
  isi: string;
  tautan: string;
  dibaca: boolean;
  waktuTeks: string;
}
