import type { JenisKejadian, Kejadian, KategoriId, Laporan, Visibilitas } from "@/lib/types";
import { cariInstansi, cariKategori } from "@/lib/data/referensi";
import {
  HARI,
  WAKTU_DEMO,
  tambahHari,
  tambahHariKerja,
  tambahJam,
} from "@/lib/waktu";

// Pembuat laporan dummy dalam jumlah banyak supaya statistik dan rapor
// instansi kelihatan realistis. Hasilnya selalu sama tiap kali dijalankan
// karena pakai angka acak dengan seed tetap (bukan Math.random).

function buatAcak(seed: number) {
  return function acak() {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const acak = buatAcak(2026);
const antara = (min: number, max: number) => min + acak() * (max - min);
const peluang = (p: number) => acak() < p;
function pilih<T>(daftar: T[]): T {
  return daftar[Math.floor(acak() * daftar.length)];
}

const bobotKategori: [KategoriId, number][] = [
  ["jalan", 25],
  ["sampah", 20],
  ["drainase", 15],
  ["lampu", 12],
  ["fasum", 10],
  ["bansos", 7],
  ["perizinan", 6],
  ["pungli", 5],
];

function pilihKategori(): KategoriId {
  const total = bobotKategori.reduce((jumlah, [, bobot]) => jumlah + bobot, 0);
  let titik = acak() * total;
  for (const [id, bobot] of bobotKategori) {
    titik -= bobot;
    if (titik <= 0) return id;
  }
  return "jalan";
}

const lokasi: { jalan: string; kecamatan: string }[] = [
  { jalan: "Jl. Tebet Raya", kecamatan: "Tebet" },
  { jalan: "Jl. Dr. Saharjo", kecamatan: "Tebet" },
  { jalan: "Jl. Casablanca", kecamatan: "Setiabudi" },
  { jalan: "Jl. HR Rasuna Said", kecamatan: "Setiabudi" },
  { jalan: "Jl. Kapten Tendean", kecamatan: "Mampang Prapatan" },
  { jalan: "Jl. Bangka Raya", kecamatan: "Mampang Prapatan" },
  { jalan: "Jl. Pasar Minggu Raya", kecamatan: "Pancoran" },
  { jalan: "Jl. Raya Pasar Minggu", kecamatan: "Pasar Minggu" },
  { jalan: "Jl. Pejaten Raya", kecamatan: "Pasar Minggu" },
  { jalan: "Jl. Moh. Kahfi", kecamatan: "Jagakarsa" },
  { jalan: "Jl. Raya Lenteng Agung", kecamatan: "Jagakarsa" },
  { jalan: "Jl. RS Fatmawati", kecamatan: "Cilandak" },
  { jalan: "Jl. Ampera Raya", kecamatan: "Cilandak" },
  { jalan: "Jl. Senopati", kecamatan: "Kebayoran Baru" },
  { jalan: "Jl. Wolter Monginsidi", kecamatan: "Kebayoran Baru" },
  { jalan: "Jl. Gandaria", kecamatan: "Kebayoran Lama" },
  { jalan: "Jl. Ciputat Raya", kecamatan: "Kebayoran Lama" },
  { jalan: "Jl. Ulujami Raya", kecamatan: "Pesanggrahan" },
  { jalan: "Jl. Bintaro Raya", kecamatan: "Pesanggrahan" },
];

const masalah: Record<KategoriId, { judul: string; deskripsi: string }[]> = {
  jalan: [
    { judul: "Jalan berlubang", deskripsi: "Lubang di tengah jalan makin lebar setelah hujan. Pengendara motor sering mendadak mengerem di titik ini." },
    { judul: "Aspal ambles", deskripsi: "Permukaan aspal turun sekitar 10 cm di dekat penutup saluran. Mobil yang lewat sering terbentur." },
    { judul: "Trotoar rusak", deskripsi: "Paving trotoar banyak yang lepas sehingga pejalan kaki memilih turun ke badan jalan." },
  ],
  lampu: [
    { judul: "Lampu jalan mati", deskripsi: "Beberapa lampu jalan mati dan ruas ini gelap setiap malam." },
    { judul: "Lampu jalan berkedip", deskripsi: "Lampu jalan menyala-mati terus sepanjang malam, membuat silau pengendara." },
  ],
  sampah: [
    { judul: "Sampah menumpuk", deskripsi: "Tumpukan sampah rumah tangga tidak diangkut sejak beberapa hari lalu dan mulai menutupi trotoar." },
    { judul: "Tempat pembuangan sampah liar", deskripsi: "Lahan kosong dijadikan tempat buang sampah oleh orang dari luar lingkungan, baunya sampai ke rumah warga." },
    { judul: "Tempat sampah umum penuh", deskripsi: "Tempat sampah umum penuh dan sampahnya tercecer ke jalan." },
  ],
  drainase: [
    { judul: "Saluran air tersumbat", deskripsi: "Saluran tertutup lumpur dan sampah sehingga air meluap ke jalan setiap hujan." },
    { judul: "Genangan setelah hujan", deskripsi: "Air menggenang setinggi mata kaki dan baru surut beberapa jam setelah hujan berhenti." },
    { judul: "Penutup saluran hilang", deskripsi: "Penutup saluran di tepi jalan hilang dan lubangnya cukup dalam, berbahaya untuk anak-anak." },
  ],
  fasum: [
    { judul: "Bangku taman rusak", deskripsi: "Beberapa bangku taman patah dan besinya mencuat." },
    { judul: "Wahana bermain anak rusak", deskripsi: "Rantai ayunan putus dan perosotan retak, tapi masih dipakai anak-anak." },
  ],
  bansos: [
    { judul: "Bantuan sosial belum diterima", deskripsi: "Nama kami terdaftar sebagai penerima bantuan, tapi bantuan bulan ini belum diterima." },
    { judul: "Data penerima bantuan tidak sesuai", deskripsi: "Ada warga yang sudah pindah tapi masih tercatat sebagai penerima, sementara keluarga yang membutuhkan belum terdata." },
  ],
  perizinan: [
    { judul: "Pengurusan izin usaha lambat", deskripsi: "Berkas izin usaha mikro sudah lengkap sejak tiga minggu lalu tapi statusnya tidak berubah." },
    { judul: "Berkas perizinan tanpa kabar", deskripsi: "Sudah bolak-balik ke loket, tapi tidak ada informasi kapan berkas selesai diproses." },
  ],
  pungli: [
    { judul: "Dugaan pungutan liar parkir", deskripsi: "Juru parkir menarik tarif di atas ketentuan dan tidak memberi karcis." },
    { judul: "Dugaan pungli layanan administrasi", deskripsi: "Ada permintaan uang tambahan supaya surat keterangan cepat selesai." },
  ],
};

const catatanProses: Record<KategoriId, string> = {
  jalan: "Laporan diterima. Tim survei dijadwalkan cek lokasi.",
  lampu: "Petugas penerangan jalan dijadwalkan cek ke lokasi.",
  sampah: "Truk pengangkut dijadwalkan ke lokasi.",
  drainase: "Tim pengerukan dijadwalkan ke lokasi.",
  fasum: "Petugas taman dijadwalkan memeriksa fasilitas.",
  bansos: "Data penerima sedang dicek ke pendamping kelurahan.",
  perizinan: "Status berkas sedang ditelusuri ke bagian terkait.",
  pungli: "Laporan masuk tahap penelusuran. Identitas pelapor dirahasiakan.",
};

const catatanSelesai: Record<KategoriId, string> = {
  jalan: "Perbaikan sudah selesai dikerjakan.",
  lampu: "Lampu sudah diganti dan menyala normal.",
  sampah: "Sampah sudah diangkut.",
  drainase: "Saluran sudah dibersihkan.",
  fasum: "Fasilitas sudah diperbaiki.",
  bansos: "Data sudah diperbarui dan bantuan dijadwalkan pada pencairan berikutnya.",
  perizinan: "Berkas sudah diproses dan izin sudah terbit.",
  pungli: "Penelusuran selesai dan sudah ada tindakan terhadap petugas yang terlibat.",
};

const alasanTolak = [
  "Laporan tidak menyertakan lokasi yang jelas. Silakan kirim ulang dengan titik lokasi yang tepat.",
  "Laporan yang sama sudah ada. Kamu bisa mendukung laporan tersebut.",
  "Masalah berada di lahan milik pribadi, di luar kewenangan pemerintah daerah.",
];

const alasanBukaUlang = [
  "Masalahnya belum beres, kondisinya masih sama seperti sebelumnya.",
  "Baru sebagian yang dikerjakan.",
  "Sempat diperbaiki tapi sudah rusak lagi.",
];

const alasanPerpanjangan = [
  "Menunggu ketersediaan material.",
  "Pekerjaan perlu koordinasi dengan instansi lain.",
  "Cuaca tidak memungkinkan pekerjaan dilanjutkan.",
];

const namaDepan = [
  "Rina", "Budi", "Siti", "Agus", "Dewi", "Fajar", "Nur", "Yusuf", "Lestari", "Hendra",
  "Putri", "Arif", "Maya", "Dimas", "Wulan", "Rizky", "Indah", "Bayu", "Sari", "Teguh",
];
const inisial = "ABDHKLMPRSTW";

// Seberapa cepat tiap instansi bekerja (1 = normal, makin besar makin lambat)
const kecepatan: Record<string, number> = {
  dpu: 1.25,
  dishub: 0.8,
  dlh: 0.55,
  sda: 1.3,
  pertamanan: 0.95,
  dinsos: 0.9,
  ptsp: 0.75,
  inspektorat: 1,
};

// Instansi tujuan kalau laporan dialihkan
const tujuanPengalihan: Record<KategoriId, string> = {
  jalan: "sda",
  lampu: "pertamanan",
  sampah: "pertamanan",
  drainase: "dpu",
  fasum: "dlh",
  bansos: "ptsp",
  perizinan: "inspektorat",
  pungli: "ptsp",
};

type LaporanTanpaNomor = Omit<Laporan, "nomor">;

function bulatkanKeMenit(tanggal: Date): Date {
  return new Date(Math.round(tanggal.getTime() / 60000) * 60000);
}

function buatSatuLaporan(): LaporanTanpaNomor {
  const now = WAKTU_DEMO;
  const kategoriId = pilihKategori();
  const kategori = cariKategori(kategoriId);
  const tempat = pilih(lokasi);
  const isi = pilih(masalah[kategoriId]);
  let instansi = cariInstansi(kategori.instansiDefault);

  const dibuat = bulatkanKeMenit(new Date(now.getTime() - antara(0.2, 75) * HARI));
  const riwayat: { jenis: JenisKejadian; waktu: Date; aktor: string; catatan?: string; batasBaru?: Date }[] = [];
  const catat = (
    jenis: JenisKejadian,
    waktu: Date,
    aktor: string,
    catatan?: string,
    batasBaru?: Date,
  ) => riwayat.push({ jenis, waktu, aktor, catatan, batasBaru });

  const hasil = (): LaporanTanpaNomor => {
    const r = acak();
    const visibilitas: Visibilitas =
      kategoriId === "pungli" || kategoriId === "bansos"
        ? "sembunyikan_nama"
        : r < 0.04
          ? "privat"
          : r < 0.25
            ? "sembunyikan_nama"
            : "publik";
    return {
      kategoriId,
      // Masalah administrasi lebih cocok disebut per kecamatan, bukan nama jalan
      judul: ["bansos", "perizinan"].includes(kategoriId)
        ? `${isi.judul} di ${tempat.kecamatan}`
        : `${isi.judul} di ${tempat.jalan}`,
      deskripsi: isi.deskripsi,
      alamat: tempat.jalan,
      kecamatan: tempat.kecamatan,
      dibuatPada: dibuat.toISOString(),
      namaPelapor: `${pilih(namaDepan)} ${pilih(inisial.split(""))}.`,
      visibilitas,
      instansiId: instansi.id,
      // Laporan yang baru masuk atau ditolak hampir tidak punya pendukung
      dukungan: Math.floor(
        acak() * acak() * (riwayat.length === 1 || riwayat.some((k) => k.jenis === "ditolak") ? 3 : 45),
      ),
      adaFotoAwal: peluang(0.65),
      riwayat: riwayat
        .sort((a, b) => a.waktu.getTime() - b.waktu.getTime())
        .map(
          (k): Kejadian => ({
            jenis: k.jenis,
            waktu: bulatkanKeMenit(k.waktu).toISOString(),
            aktor: k.aktor,
            ...(k.catatan ? { catatan: k.catatan } : {}),
            ...(k.batasBaru ? { batasBaru: bulatkanKeMenit(k.batasBaru).toISOString() } : {}),
          }),
        ),
    };
  };

  catat("dibuat", dibuat, "Pelapor");

  // 1. Verifikasi admin
  let waktuVerifikasi = tambahJam(dibuat, antara(1, 40));
  if (peluang(0.05)) waktuVerifikasi = tambahJam(waktuVerifikasi, antara(48, 110));
  if (waktuVerifikasi > now) return hasil();

  if (peluang(0.05)) {
    catat("ditolak", waktuVerifikasi, "Admin verifikator", pilih(alasanTolak));
    return hasil();
  }
  catat("diverifikasi", waktuVerifikasi, "Admin verifikator");
  catat(
    "diteruskan",
    waktuVerifikasi,
    "Sistem",
    `Diteruskan otomatis ke ${instansi.nama} berdasarkan kategori dan lokasi.`,
  );

  // 2. Kadang dialihkan karena bukan kewenangan
  let waktuDiteruskan = waktuVerifikasi;
  if (peluang(0.07)) {
    const waktuAlih = tambahJam(waktuDiteruskan, antara(3, 30));
    if (waktuAlih > now) return hasil();
    const baru = cariInstansi(tujuanPengalihan[kategoriId]);
    catat(
      "dialihkan",
      waktuAlih,
      instansi.nama,
      `Bukan kewenangan kami. Laporan dialihkan ke ${baru.nama}.`,
    );
    instansi = baru;
    waktuDiteruskan = waktuAlih;
  }

  const faktor = kecepatan[instansi.id] ?? 1;

  // 3. Respons awal instansi
  let waktuProses = tambahJam(waktuDiteruskan, antara(2, 70) * faktor);
  if (peluang(0.08 * faktor)) waktuProses = tambahJam(waktuProses, antara(60, 140));
  const batasRespons = tambahHariKerja(waktuDiteruskan, 5);
  if (batasRespons < now && waktuProses > batasRespons) {
    catat("eskalasi", batasRespons, "Sistem", "Instansi belum merespons dalam 5 hari kerja. Laporan dieskalasi ke pengawas.");
  }
  if (waktuProses > now) return hasil();
  catat("diproses", waktuProses, instansi.nama, catatanProses[kategoriId]);

  // 4. Pengerjaan
  let batasSelesai = tambahHariKerja(waktuProses, kategori.slaHariKerja);
  let lamaKerja = antara(0.25, 1.2) * faktor * kategori.slaHariKerja * (7 / 5);
  if (peluang(0.15 * faktor)) lamaKerja *= 1.8; // sebagian pekerjaan macet
  let waktuSelesai = tambahHari(waktuProses, Math.min(lamaKerja, 50));
  if (peluang(0.07 * faktor)) waktuSelesai = tambahHari(now, 30); // pekerjaan terbengkalai

  if (kategori.slaHariKerja >= 14 && peluang(0.12)) {
    const waktuPerpanjangan = tambahHari(waktuProses, lamaKerja * 0.5);
    if (waktuPerpanjangan < now && waktuPerpanjangan < batasSelesai) {
      batasSelesai = tambahHariKerja(batasSelesai, 7);
      catat("perpanjangan", waktuPerpanjangan, instansi.nama, pilih(alasanPerpanjangan), batasSelesai);
    }
  }

  if (batasSelesai < now && waktuSelesai > batasSelesai) {
    catat("eskalasi", batasSelesai, "Sistem", "Melewati batas waktu penyelesaian. Laporan dieskalasi ke pengawas.");
  }
  if (waktuSelesai > now) return hasil();
  catat("ditandai_selesai", waktuSelesai, instansi.nama, catatanSelesai[kategoriId]);

  // 5. Konfirmasi pelapor
  const pilihan = acak();
  if (pilihan < 0.62) {
    const waktuJawab = tambahJam(waktuSelesai, antara(3, 120));
    if (waktuJawab > now) return hasil();
    catat("dikonfirmasi_beres", waktuJawab, "Pelapor");
  } else if (pilihan < 0.74) {
    const waktuJawab = tambahJam(waktuSelesai, antara(3, 72));
    if (waktuJawab > now) return hasil();
    catat("dibuka_ulang", waktuJawab, "Pelapor", pilih(alasanBukaUlang));

    waktuSelesai = tambahHari(waktuJawab, antara(1, 6) * faktor);
    if (waktuSelesai > now) return hasil();
    catat("ditandai_selesai", waktuSelesai, instansi.nama, catatanSelesai[kategoriId]);

    const waktuJawabKedua = tambahJam(waktuSelesai, antara(3, 96));
    if (waktuJawabKedua > now) return hasil();
    catat("dikonfirmasi_beres", waktuJawabKedua, "Pelapor");
  } else {
    const waktuTutup = tambahHari(waktuSelesai, 10);
    if (waktuTutup > now) return hasil();
    catat("ditutup_otomatis", waktuTutup, "Sistem", "Tidak ada konfirmasi dari pelapor dan pendukung dalam 10 hari.");
  }

  return hasil();
}

export const laporanAcak: LaporanTanpaNomor[] = Array.from({ length: 150 }, buatSatuLaporan);
