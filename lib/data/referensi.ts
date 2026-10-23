import type { Instansi, Kategori, KategoriId, Kelompok, KelompokId } from "@/lib/types";
import { daftarKota } from "@/lib/wilayah";

export const daftarKelompok: Kelompok[] = [
  { id: "jalan", nama: "Jalan & transportasi" },
  { id: "lingkungan", nama: "Lingkungan & kebersihan" },
  { id: "fasilitas", nama: "Fasilitas publik" },
  { id: "administrasi", nama: "Layanan administrasi" },
  { id: "ketertiban", nama: "Ketertiban umum" },
  { id: "integritas", nama: "Integritas aparatur" },
];

// slaHariKerja = batas penyelesaian sejak mulai dikerjakan.
// jenisInstansi = tabel routing: laporan otomatis diteruskan ke jenis instansi
// ini di kota/kabupaten tempat kejadian.
export const daftarKategori: Kategori[] = [
  { id: "jalan-rusak", kelompok: "jalan", nama: "Jalan rusak", contoh: "Lubang, aspal ambles, retak", slaHariKerja: 14, jenisInstansi: "dpu" },
  { id: "trotoar", kelompok: "jalan", nama: "Trotoar & penyeberangan", contoh: "Trotoar rusak, zebra cross pudar", slaHariKerja: 14, jenisInstansi: "dpu" },
  { id: "lampu-jalan", kelompok: "jalan", nama: "Lampu jalan", contoh: "Mati, berkedip, tiang miring", slaHariKerja: 7, jenisInstansi: "dishub" },
  { id: "rambu", kelompok: "jalan", nama: "Rambu & lampu lalu lintas", contoh: "Rambu hilang, lampu merah mati", slaHariKerja: 5, jenisInstansi: "dishub" },
  { id: "angkutan", kelompok: "jalan", nama: "Angkutan umum & halte", contoh: "Halte rusak, angkot ngetem", slaHariKerja: 14, jenisInstansi: "dishub" },
  { id: "sampah", kelompok: "lingkungan", nama: "Sampah", contoh: "Menumpuk, tidak diangkut, buang liar", slaHariKerja: 3, jenisInstansi: "dlh" },
  { id: "drainase", kelompok: "lingkungan", nama: "Drainase & banjir", contoh: "Saluran tersumbat, genangan", slaHariKerja: 14, jenisInstansi: "sda" },
  { id: "pencemaran", kelompok: "lingkungan", nama: "Pencemaran", contoh: "Limbah, asap, bau, kebisingan", slaHariKerja: 14, jenisInstansi: "dlh" },
  { id: "pohon-taman", kelompok: "lingkungan", nama: "Pohon & taman", contoh: "Pohon rawan tumbang, taman rusak", slaHariKerja: 7, jenisInstansi: "pertamanan" },
  { id: "faskes", kelompok: "fasilitas", nama: "Fasilitas kesehatan", contoh: "Puskesmas, antrean, obat kosong", slaHariKerja: 14, jenisInstansi: "dinkes" },
  { id: "sekolah", kelompok: "fasilitas", nama: "Sekolah", contoh: "Bangunan rusak, fasilitas belajar", slaHariKerja: 14, jenisInstansi: "disdik" },
  { id: "fasum", kelompok: "fasilitas", nama: "Fasilitas umum lainnya", contoh: "Toilet umum, pasar, ruang bermain", slaHariKerja: 14, jenisInstansi: "pertamanan" },
  { id: "kependudukan", kelompok: "administrasi", nama: "KTP, KK & akta", contoh: "Layanan lambat, data salah", slaHariKerja: 7, jenisInstansi: "dukcapil" },
  { id: "perizinan", kelompok: "administrasi", nama: "Perizinan usaha", contoh: "Izin lambat, berkas tanpa kabar", slaHariKerja: 14, jenisInstansi: "ptsp" },
  { id: "bansos", kelompok: "administrasi", nama: "Bantuan sosial", contoh: "Belum diterima, data tidak sesuai", slaHariKerja: 14, jenisInstansi: "dinsos" },
  { id: "parkir", kelompok: "ketertiban", nama: "Parkir liar", contoh: "Parkir di bahu jalan atau trotoar", slaHariKerja: 5, jenisInstansi: "dishub" },
  { id: "pkl", kelompok: "ketertiban", nama: "PKL & bangunan liar", contoh: "Menutup trotoar, tanpa izin", slaHariKerja: 14, jenisInstansi: "satpolpp" },
  { id: "pungli", kelompok: "integritas", nama: "Pungutan liar", contoh: "Biaya tidak resmi, uang pelicin", slaHariKerja: 60, jenisInstansi: "inspektorat" },
  { id: "wewenang", kelompok: "integritas", nama: "Penyalahgunaan wewenang", contoh: "Pelayanan diskriminatif, tidak sesuai aturan", slaHariKerja: 60, jenisInstansi: "inspektorat" },
];

export const daftarJenisInstansi = [
  { id: "dpu", nama: "Dinas Pekerjaan Umum", singkatan: "DPU" },
  { id: "dishub", nama: "Dinas Perhubungan", singkatan: "Dishub" },
  { id: "dlh", nama: "Dinas Lingkungan Hidup", singkatan: "DLH" },
  { id: "sda", nama: "Dinas Sumber Daya Air", singkatan: "SDA" },
  { id: "pertamanan", nama: "Dinas Pertamanan", singkatan: "Pertamanan" },
  { id: "dinkes", nama: "Dinas Kesehatan", singkatan: "Dinkes" },
  { id: "disdik", nama: "Dinas Pendidikan", singkatan: "Disdik" },
  { id: "dukcapil", nama: "Dinas Kependudukan dan Catatan Sipil", singkatan: "Disdukcapil" },
  { id: "ptsp", nama: "Dinas Penanaman Modal dan PTSP", singkatan: "DPMPTSP" },
  { id: "dinsos", nama: "Dinas Sosial", singkatan: "Dinsos" },
  { id: "satpolpp", nama: "Satuan Polisi Pamong Praja", singkatan: "Satpol PP" },
  { id: "inspektorat", nama: "Inspektorat", singkatan: "Inspektorat" },
];

// Satu instansi untuk tiap jenis di tiap kota/kabupaten, misal "dpu-kota-bogor"
export const daftarInstansi: Instansi[] = daftarKota.flatMap((kota) =>
  daftarJenisInstansi.map((jenis) => ({
    id: `${jenis.id}-${kota.id}`,
    nama: `${jenis.nama} ${kota.nama}`,
    singkatan: `${jenis.singkatan} ${kota.nama.replace(/^(Kota|Kabupaten) /, "")}`,
    jenis: jenis.id,
    kotaId: kota.id,
  })),
);

// Batas waktu tahap lain (sama untuk semua kategori)
export const SLA_VERIFIKASI_HARI_KERJA = 3;
export const SLA_RESPONS_HARI_KERJA = 5;
export const BATAS_KONFIRMASI_HARI = 10;
export const BATAS_BUKA_ULANG_HARI = 30;

export function cariKategori(id: string): Kategori {
  const kategori = daftarKategori.find((k) => k.id === id);
  if (!kategori) throw new Error(`Kategori ${id} tidak ada`);
  return kategori;
}

export function kategoriValid(id: string): id is KategoriId {
  return daftarKategori.some((k) => k.id === id);
}

export function cariKelompok(id: KelompokId): Kelompok {
  return daftarKelompok.find((k) => k.id === id) ?? daftarKelompok[0];
}

export function cariInstansi(id: string): Instansi {
  const instansi = daftarInstansi.find((i) => i.id === id);
  if (!instansi) throw new Error(`Instansi ${id} tidak ada`);
  return instansi;
}

// Instansi yang menangani kategori ini di kota tertentu
export function instansiTujuan(kategoriId: string, kotaId: string): Instansi {
  return cariInstansi(`${cariKategori(kategoriId).jenisInstansi}-${kotaId}`);
}
