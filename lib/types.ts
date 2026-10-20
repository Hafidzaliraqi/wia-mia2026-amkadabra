// Tipe data utama aplikasi.
// Orang yang pegang backend bisa pakai file ini sebagai acuan skema database.

export type KategoriId =
  | "jalan"
  | "lampu"
  | "sampah"
  | "drainase"
  | "fasum"
  | "bansos"
  | "perizinan"
  | "pungli";

export interface Kategori {
  id: KategoriId;
  nama: string;
  // Batas waktu penyelesaian dalam hari kerja (dihitung sejak mulai dikerjakan)
  slaHariKerja: number;
  // Instansi yang otomatis dituju saat laporan diverifikasi
  instansiDefault: string;
}

export interface Instansi {
  id: string;
  nama: string;
  singkatan: string;
}

// Status dihitung dari riwayat (timeline), bukan diisi manual.
export type StatusLaporan =
  | "terkirim" // menunggu verifikasi admin
  | "diteruskan" // sudah diverifikasi, menunggu respons awal instansi
  | "diproses" // sedang dikerjakan instansi
  | "menunggu_konfirmasi" // instansi bilang selesai, menunggu jawaban pelapor
  | "selesai" // pelapor mengonfirmasi sudah beres
  | "ditutup_otomatis" // pelapor tidak menjawab dalam 10 hari
  | "ditolak";

export type JenisKejadian =
  | "dibuat"
  | "diverifikasi"
  | "diteruskan"
  | "dialihkan"
  | "diproses"
  | "balasan"
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
  batasBaru?: string; // khusus "perpanjangan", ISO 8601
}

export type Visibilitas = "publik" | "sembunyikan_nama" | "privat";

export interface Laporan {
  nomor: string; // contoh: TSN-2610-0042
  kategoriId: KategoriId;
  judul: string;
  deskripsi: string;
  alamat: string;
  kecamatan: string;
  dibuatPada: string; // ISO 8601
  namaPelapor: string;
  visibilitas: Visibilitas;
  instansiId: string; // instansi yang menangani sekarang
  dukungan: number;
  adaFotoAwal: boolean;
  riwayat: Kejadian[]; // urut dari paling lama ke paling baru
}
