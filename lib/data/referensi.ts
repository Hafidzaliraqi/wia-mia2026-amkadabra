import type { Instansi, Kategori, KategoriId } from "@/lib/types";

// Nama instansi sengaja dibuat umum (tanpa nama kota) karena datanya simulasi.
export const daftarInstansi: Instansi[] = [
  { id: "dpu", nama: "Dinas Pekerjaan Umum", singkatan: "DPU" },
  { id: "dishub", nama: "Dinas Perhubungan", singkatan: "Dishub" },
  { id: "dlh", nama: "Dinas Lingkungan Hidup", singkatan: "DLH" },
  { id: "sda", nama: "Dinas Sumber Daya Air", singkatan: "SDA" },
  { id: "pertamanan", nama: "Dinas Pertamanan", singkatan: "Pertamanan" },
  { id: "dinsos", nama: "Dinas Sosial", singkatan: "Dinsos" },
  { id: "ptsp", nama: "Dinas Penanaman Modal dan PTSP", singkatan: "DPMPTSP" },
  { id: "inspektorat", nama: "Inspektorat", singkatan: "Inspektorat" },
];

// slaHariKerja = batas waktu penyelesaian. instansiDefault = tabel routing.
export const daftarKategori: Kategori[] = [
  { id: "jalan", nama: "Jalan & trotoar", slaHariKerja: 14, instansiDefault: "dpu" },
  { id: "lampu", nama: "Lampu jalan", slaHariKerja: 7, instansiDefault: "dishub" },
  { id: "sampah", nama: "Sampah & kebersihan", slaHariKerja: 3, instansiDefault: "dlh" },
  { id: "drainase", nama: "Drainase & banjir", slaHariKerja: 14, instansiDefault: "sda" },
  { id: "fasum", nama: "Taman & fasilitas umum", slaHariKerja: 14, instansiDefault: "pertamanan" },
  { id: "bansos", nama: "Bantuan sosial", slaHariKerja: 14, instansiDefault: "dinsos" },
  { id: "perizinan", nama: "Perizinan & administrasi", slaHariKerja: 14, instansiDefault: "ptsp" },
  { id: "pungli", nama: "Pungli & penyimpangan", slaHariKerja: 60, instansiDefault: "inspektorat" },
];

// Batas waktu tahap lain (sama untuk semua kategori)
export const SLA_VERIFIKASI_HARI_KERJA = 3;
export const SLA_RESPONS_HARI_KERJA = 5;
export const BATAS_KONFIRMASI_HARI = 10;

export const daftarKecamatan = [
  "Tebet",
  "Setiabudi",
  "Mampang Prapatan",
  "Pancoran",
  "Pasar Minggu",
  "Jagakarsa",
  "Cilandak",
  "Kebayoran Baru",
  "Kebayoran Lama",
  "Pesanggrahan",
];

export function cariKategori(id: KategoriId): Kategori {
  const kategori = daftarKategori.find((k) => k.id === id);
  if (!kategori) throw new Error(`Kategori ${id} tidak ada`);
  return kategori;
}

export function cariInstansi(id: string): Instansi {
  const instansi = daftarInstansi.find((i) => i.id === id);
  if (!instansi) throw new Error(`Instansi ${id} tidak ada`);
  return instansi;
}
