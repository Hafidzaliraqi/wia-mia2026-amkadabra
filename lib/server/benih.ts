import "server-only";
import type { JenisKejadian, KategoriId, Visibilitas } from "@/lib/types";
import type { Kueri } from "@/lib/server/db";
import { cariInstansi, cariKategori, daftarKategori, instansiTujuan } from "@/lib/data/referensi";
import { daftarKota } from "@/lib/wilayah";
import { situs } from "@/lib/site";
import { HARI, JAM, tambahHari, tambahHariKerja, tambahJam } from "@/lib/waktu";
import { hashSandi } from "@/lib/server/sandi";

// ================================================================
// DATA CONTOH
// Dimasukkan otomatis saat database masih kosong. Semua waktu dihitung
// mundur dari saat data dibuat, jadi data selalu terlihat "baru".
// Untuk mengulang dari awal: hapus folder .data lalu jalankan lagi
// (atau kosongkan tabel kalau pakai database online).
// ================================================================

export const SANDI_DEMO = "demo1234";

export const akunDemo = [
  { kunci: "warga", nama: "Rina Susanti", email: "warga@demo.id", hp: "081234567890", peran: "warga", instansiId: null },
  { kunci: "admin", nama: "Admin Verifikator", email: "admin@demo.id", hp: "081200000001", peran: "admin", instansiId: null },
  { kunci: "dpu", nama: "Bagus Pratama", email: "petugas.dpu@demo.id", hp: "081200000002", peran: "petugas", instansiId: "dpu-jaksel" },
  { kunci: "dishub", nama: "Sinta Maharani", email: "petugas.dishub@demo.id", hp: "081200000003", peran: "petugas", instansiId: "dishub-jaksel" },
  { kunci: "sda", nama: "Yoga Saputra", email: "petugas.sda@demo.id", hp: "081200000004", peran: "petugas", instansiId: "sda-jaksel" },
] as const;

interface KejadianBenih {
  jenis: JenisKejadian;
  waktu: Date;
  aktor: string;
  catatan?: string;
  batasBaru?: Date;
}

interface LaporanBenih {
  urut?: number;
  kategoriId: KategoriId;
  judul: string;
  deskripsi: string;
  alamat: string;
  kotaId: string;
  kecamatan: string;
  lat: number;
  lng: number;
  dibuat: Date;
  namaPelapor: string;
  pelaporKunci?: string;
  visibilitas: Visibilitas;
  instansiId: string;
  dukunganAwal: number;
  fotoContoh: boolean;
  sorotan?: boolean;
  riwayat: KejadianBenih[];
}

// ---------------- laporan unggulan (cerita lengkap untuk demo) ----------------

function laporanUnggulan(sekarang: Date): (LaporanBenih & { pendukung?: string[] })[] {
  const lalu = (jam: number) => new Date(sekarang.getTime() - jam * JAM);
  const dinas = (id: string) => cariInstansi(id).nama;
  const teruskan = (waktu: Date, id: string): KejadianBenih[] => [
    { jenis: "diverifikasi", waktu, aktor: "Admin verifikator" },
    {
      jenis: "diteruskan",
      waktu,
      aktor: "Sistem",
      catatan: `Diteruskan otomatis ke ${dinas(id)} berdasarkan kategori dan lokasi.`,
    },
  ];

  return [
    {
      urut: 42,
      sorotan: true,
      kategoriId: "jalan-rusak",
      judul: "Jalan berlubang di Jl. Prof. Dr. Soepomo",
      deskripsi:
        "Ada lubang cukup dalam di lajur kiri, lebarnya kira-kira 50 cm. Minggu ini sudah dua motor jatuh di sini, terutama malam hari karena penerangannya kurang.",
      alamat: "Jl. Prof. Dr. Soepomo, depan halte Tebet",
      kotaId: "jaksel",
      kecamatan: "Tebet",
      lat: -6.2309,
      lng: 106.8473,
      dibuat: lalu(434.33),
      namaPelapor: "Rina Susanti",
      pelaporKunci: "warga",
      visibilitas: "publik",
      instansiId: "dpu-jaksel",
      dukunganAwal: 36,
      fotoContoh: true,
      riwayat: [
        { jenis: "dibuat", waktu: lalu(434.33), aktor: "Pelapor" },
        ...teruskan(lalu(428.92), "dpu-jaksel"),
        { jenis: "diproses", waktu: lalu(380), aktor: dinas("dpu-jaksel"), catatan: "Laporan diterima. Tim survei akan cek lokasi minggu ini." },
        {
          jenis: "balasan",
          waktu: lalu(215.67),
          aktor: dinas("dpu-jaksel"),
          catatan: "Lubang sudah ditandai dan diberi pembatas sementara. Penambalan dijadwalkan pekan depan.",
        },
      ],
    },
    {
      urut: 38,
      kategoriId: "lampu-jalan",
      judul: "Lampu jalan mati di Jl. Kemang Raya",
      deskripsi:
        "Tiga lampu jalan berturut-turut mati sejak seminggu lalu, dari depan minimarket sampai pertigaan. Jalannya jadi gelap total setelah jam tujuh malam.",
      alamat: "Jl. Kemang Raya, dekat pertigaan Jl. Bangka",
      kotaId: "jaksel",
      kecamatan: "Mampang Prapatan",
      lat: -6.2556,
      lng: 106.8148,
      dibuat: lalu(228.75),
      namaPelapor: "Dimas A.",
      visibilitas: "publik",
      instansiId: "dishub-jaksel",
      dukunganAwal: 11,
      fotoContoh: true,
      pendukung: ["warga"],
      riwayat: [
        { jenis: "dibuat", waktu: lalu(228.75), aktor: "Pelapor" },
        ...teruskan(lalu(217.5), "dishub-jaksel"),
        { jenis: "diproses", waktu: lalu(192.83), aktor: dinas("dishub-jaksel"), catatan: "Petugas penerangan jalan dijadwalkan cek malam ini." },
        {
          jenis: "ditandai_selesai",
          waktu: lalu(41.5),
          aktor: dinas("dishub-jaksel"),
          catatan: "Lampu sudah diganti dan kabel yang putus sudah disambung.",
        },
      ],
    },
    {
      urut: 27,
      kategoriId: "drainase",
      judul: "Saluran air tersumbat di Jl. Raya Lenteng Agung",
      deskripsi:
        "Saluran di sepanjang jalan penuh lumpur dan sampah plastik. Tiap hujan deras, air meluap ke jalan dan masuk ke rumah warga di gang 5.",
      alamat: "Jl. Raya Lenteng Agung, dari pertigaan sampai gang 5",
      kotaId: "jaksel",
      kecamatan: "Jagakarsa",
      lat: -6.3305,
      lng: 106.8352,
      dibuat: lalu(771.17),
      namaPelapor: "Wulan P.",
      visibilitas: "publik",
      instansiId: "sda-jaksel",
      dukunganAwal: 63,
      fotoContoh: true,
      pendukung: ["warga"],
      riwayat: [
        { jenis: "dibuat", waktu: lalu(771.17), aktor: "Pelapor" },
        ...teruskan(lalu(768), "sda-jaksel"),
        { jenis: "diproses", waktu: lalu(719), aktor: dinas("sda-jaksel"), catatan: "Tim akan mengangkat sedimen di saluran sepanjang 30 meter." },
        { jenis: "ditandai_selesai", waktu: lalu(547), aktor: dinas("sda-jaksel"), catatan: "Saluran sudah dibersihkan." },
        {
          jenis: "dibuka_ulang",
          waktu: lalu(530.5),
          aktor: "Pelapor",
          catatan:
            "Yang dibersihkan cuma bagian depan pertigaan. Saluran di depan gang 5 masih penuh lumpur dan air masih menggenang setelah hujan semalam.",
        },
        { jenis: "balasan", waktu: lalu(505), aktor: dinas("sda-jaksel"), catatan: "Tim kembali ke lokasi hari ini untuk bagian depan gang 5." },
        { jenis: "ditandai_selesai", waktu: lalu(403.67), aktor: dinas("sda-jaksel"), catatan: "Seluruh saluran dari pertigaan sampai gang 5 sudah dikeruk." },
        { jenis: "dikonfirmasi_beres", waktu: lalu(375.92), aktor: "Pelapor", catatan: "Sudah lancar. Kemarin hujan deras dan tidak menggenang lagi." },
      ],
    },
    {
      urut: 19,
      kategoriId: "pohon-taman",
      judul: "Sampah menumpuk di Taman Pejaten",
      deskripsi: "Tumpukan sampah di pojok taman dekat area bermain anak sudah lebih dari seminggu dan mulai bau.",
      alamat: "Taman Pejaten, Jl. Pejaten Raya",
      kotaId: "jaksel",
      kecamatan: "Pasar Minggu",
      lat: -6.278,
      lng: 106.83,
      dibuat: lalu(497.67),
      namaPelapor: "Teguh H.",
      visibilitas: "publik",
      instansiId: "dlh-jaksel",
      dukunganAwal: 9,
      fotoContoh: true,
      riwayat: [
        { jenis: "dibuat", waktu: lalu(497.67), aktor: "Pelapor" },
        ...teruskan(lalu(433.75), "pertamanan-jaksel"),
        {
          jenis: "dialihkan",
          waktu: lalu(428.33),
          aktor: dinas("pertamanan-jaksel"),
          catatan: `Pengangkutan sampah di area taman jadi kewenangan ${dinas("dlh-jaksel")}. Laporan dialihkan.`,
        },
        { jenis: "diproses", waktu: lalu(410.5), aktor: dinas("dlh-jaksel"), catatan: "Truk pengangkut dijadwalkan besok pagi." },
        {
          jenis: "ditandai_selesai",
          waktu: lalu(384),
          aktor: dinas("dlh-jaksel"),
          catatan: "Sampah sudah diangkut. Jadwal pengangkutan di taman ini ditambah jadi dua kali seminggu.",
        },
        { jenis: "ditutup_otomatis", waktu: lalu(144), aktor: "Sistem", catatan: "Tidak ada konfirmasi dari pelapor dan pendukung dalam 10 hari." },
      ],
    },
    {
      urut: 51,
      kategoriId: "pungli",
      judul: "Dugaan pungutan liar parkir di Pasar Mampang",
      deskripsi:
        "Pengunjung pasar ditarik biaya parkir dua kali, di pintu masuk dan pintu keluar, tanpa karcis resmi. Tarifnya juga lebih mahal dari papan tarif.",
      alamat: "Area parkir Pasar Mampang Prapatan",
      kotaId: "jaksel",
      kecamatan: "Mampang Prapatan",
      lat: -6.244,
      lng: 106.824,
      dibuat: lalu(262.5),
      namaPelapor: "Fajar R.",
      visibilitas: "sembunyikan_nama",
      instansiId: "inspektorat-jaksel",
      dukunganAwal: 21,
      fotoContoh: false,
      riwayat: [
        { jenis: "dibuat", waktu: lalu(262.5), aktor: "Pelapor" },
        ...teruskan(lalu(259), "inspektorat-jaksel"),
        { jenis: "diproses", waktu: lalu(216), aktor: dinas("inspektorat-jaksel"), catatan: "Laporan masuk tahap penelusuran. Identitas pelapor dirahasiakan." },
      ],
    },
    {
      urut: 55,
      kategoriId: "trotoar",
      judul: "Trotoar rusak di Jl. RS Fatmawati",
      deskripsi: "Ubin trotoar banyak yang lepas dan ada lubang besar di dekat penyeberangan. Pejalan kaki terpaksa turun ke jalan.",
      alamat: "Jl. RS Fatmawati, sebelum Stasiun MRT Haji Nawi",
      kotaId: "jaksel",
      kecamatan: "Cilandak",
      lat: -6.2665,
      lng: 106.797,
      dibuat: lalu(337),
      namaPelapor: "Maya L.",
      visibilitas: "publik",
      instansiId: "dpu-jaksel",
      dukunganAwal: 17,
      fotoContoh: true,
      pendukung: ["warga"],
      riwayat: [
        { jenis: "dibuat", waktu: lalu(337), aktor: "Pelapor" },
        ...teruskan(lalu(331.5), "dpu-jaksel"),
        {
          jenis: "eskalasi",
          waktu: lalu(163.5),
          aktor: "Sistem",
          catatan: "Instansi belum merespons dalam 5 hari kerja. Laporan dieskalasi ke pengawas.",
        },
      ],
    },
    {
      urut: 60,
      kategoriId: "pohon-taman",
      judul: "Lampu taman mati di Taman Langsat",
      deskripsi: "Lampu di jalur jogging sisi timur mati semua. Banyak warga yang olahraga sore jadi pulang lebih cepat karena gelap.",
      alamat: "Taman Langsat, Jl. Barito",
      kotaId: "jaksel",
      kecamatan: "Kebayoran Baru",
      lat: -6.2386,
      lng: 106.7998,
      dibuat: lalu(2.92),
      namaPelapor: "Lestari W.",
      visibilitas: "publik",
      instansiId: "pertamanan-jaksel",
      dukunganAwal: 0,
      fotoContoh: true,
      riwayat: [{ jenis: "dibuat", waktu: lalu(2.92), aktor: "Pelapor" }],
    },
    {
      urut: 46,
      kategoriId: "bansos",
      judul: "Bantuan sosial belum diterima sejak dua bulan lalu",
      deskripsi:
        "Keluarga kami terdaftar sebagai penerima bantuan pangan, tapi sudah dua bulan bantuannya tidak pernah sampai. Tetangga dengan data yang sama sudah menerima.",
      alamat: "Kelurahan Pengadegan",
      kotaId: "jaksel",
      kecamatan: "Pancoran",
      lat: -6.253,
      lng: 106.854,
      dibuat: lalu(600),
      namaPelapor: "Hendra K.",
      visibilitas: "sembunyikan_nama",
      instansiId: "dinsos-jaksel",
      dukunganAwal: 4,
      fotoContoh: false,
      riwayat: [
        { jenis: "dibuat", waktu: lalu(600), aktor: "Pelapor" },
        ...teruskan(lalu(597), "dinsos-jaksel"),
        { jenis: "diproses", waktu: lalu(553), aktor: dinas("dinsos-jaksel"), catatan: "Data penerima sedang dicek ke pendamping kelurahan." },
        {
          jenis: "perpanjangan",
          waktu: lalu(187),
          aktor: dinas("dinsos-jaksel"),
          catatan: "Perlu pencocokan ulang dengan data kependudukan.",
          batasBaru: lalu(-143),
        },
      ],
    },
  ];
}

// ---------------- laporan acak (mengisi statistik) ----------------

function buatAcak(seed: number) {
  return function acak() {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const masalah: Record<KategoriId, { judul: string; deskripsi: string }[]> = {
  "jalan-rusak": [
    { judul: "Jalan berlubang", deskripsi: "Lubang di tengah jalan makin lebar setelah hujan. Pengendara motor sering mendadak mengerem di titik ini." },
    { judul: "Aspal ambles", deskripsi: "Permukaan aspal turun sekitar 10 cm di dekat penutup saluran. Mobil yang lewat sering terbentur." },
  ],
  trotoar: [
    { judul: "Trotoar rusak", deskripsi: "Paving trotoar banyak yang lepas sehingga pejalan kaki memilih turun ke badan jalan." },
    { judul: "Zebra cross pudar", deskripsi: "Garis penyeberangan di depan sekolah hampir tidak terlihat, kendaraan tidak melambat." },
  ],
  "lampu-jalan": [
    { judul: "Lampu jalan mati", deskripsi: "Beberapa lampu jalan mati dan ruas ini gelap setiap malam." },
    { judul: "Lampu jalan berkedip", deskripsi: "Lampu jalan menyala-mati terus sepanjang malam, membuat silau pengendara." },
  ],
  rambu: [
    { judul: "Rambu dilarang parkir hilang", deskripsi: "Tiang rambu sudah tidak ada sejak ditabrak truk, sekarang banyak mobil parkir sembarangan." },
    { judul: "Lampu lalu lintas mati", deskripsi: "Lampu merah di persimpangan mati sejak pagi, kendaraan saling serobot." },
  ],
  angkutan: [
    { judul: "Halte rusak", deskripsi: "Atap halte bocor dan bangkunya patah, penumpang menunggu sambil kehujanan." },
    { judul: "Angkot ngetem menutup jalan", deskripsi: "Angkot berhenti lama di mulut jalan dan menyebabkan macet setiap sore." },
  ],
  sampah: [
    { judul: "Sampah menumpuk", deskripsi: "Tumpukan sampah rumah tangga tidak diangkut sejak beberapa hari lalu dan mulai menutupi trotoar." },
    { judul: "Pembuangan sampah liar", deskripsi: "Lahan kosong dijadikan tempat buang sampah oleh orang dari luar lingkungan, baunya sampai ke rumah warga." },
  ],
  drainase: [
    { judul: "Saluran air tersumbat", deskripsi: "Saluran tertutup lumpur dan sampah sehingga air meluap ke jalan setiap hujan." },
    { judul: "Genangan setelah hujan", deskripsi: "Air menggenang setinggi mata kaki dan baru surut beberapa jam setelah hujan berhenti." },
  ],
  pencemaran: [
    { judul: "Bau limbah dari saluran", deskripsi: "Saluran berwarna hitam dan berbau menyengat, diduga ada pembuangan limbah usaha." },
    { judul: "Asap pembakaran sampah", deskripsi: "Setiap sore ada pembakaran sampah terbuka, asapnya masuk ke rumah warga." },
  ],
  "pohon-taman": [
    { judul: "Pohon rawan tumbang", deskripsi: "Pohon besar di pinggir jalan miring dan akarnya terangkat, khawatir tumbang saat angin kencang." },
    { judul: "Fasilitas taman rusak", deskripsi: "Bangku dan ayunan di taman patah, besinya mencuat dan berbahaya untuk anak." },
  ],
  faskes: [
    { judul: "Antrean puskesmas terlalu lama", deskripsi: "Pasien harus menunggu lebih dari tiga jam, nomor antrean tidak jelas." },
    { judul: "Obat sering kosong di puskesmas", deskripsi: "Obat untuk penyakit kronis sering kosong, pasien diminta membeli sendiri." },
  ],
  sekolah: [
    { judul: "Atap kelas bocor", deskripsi: "Atap dua ruang kelas bocor, saat hujan murid dipindahkan ke lorong." },
    { judul: "Toilet sekolah rusak", deskripsi: "Toilet siswa tidak ada air dan pintunya rusak sejak awal semester." },
  ],
  fasum: [
    { judul: "Toilet umum tidak terawat", deskripsi: "Toilet umum kotor, air mati, dan kuncinya rusak." },
    { judul: "Atap pasar bocor", deskripsi: "Atap los pasar bocor sehingga lantai licin dan dagangan basah." },
  ],
  kependudukan: [
    { judul: "Pembuatan KTP elektronik tertunda", deskripsi: "Sudah rekam data dua bulan lalu, tapi KTP belum jadi dan tidak ada kabar." },
    { judul: "Data di KK salah", deskripsi: "Tanggal lahir anak di kartu keluarga salah, pengajuan perbaikan belum diproses." },
  ],
  perizinan: [
    { judul: "Izin usaha lambat", deskripsi: "Berkas izin usaha mikro sudah lengkap sejak tiga minggu lalu tapi statusnya tidak berubah." },
    { judul: "Berkas perizinan tanpa kabar", deskripsi: "Sudah bolak-balik ke loket, tapi tidak ada informasi kapan berkas selesai diproses." },
  ],
  bansos: [
    { judul: "Bantuan sosial belum diterima", deskripsi: "Nama kami terdaftar sebagai penerima bantuan, tapi bantuan bulan ini belum diterima." },
    { judul: "Data penerima bantuan tidak sesuai", deskripsi: "Ada warga yang sudah pindah tapi masih tercatat sebagai penerima, sementara keluarga yang membutuhkan belum terdata." },
  ],
  parkir: [
    { judul: "Parkir liar di bahu jalan", deskripsi: "Mobil parkir berjajar di bahu jalan sampai menutup satu lajur." },
    { judul: "Parkir di atas trotoar", deskripsi: "Motor parkir memenuhi trotoar sehingga pejalan kaki tidak bisa lewat." },
  ],
  pkl: [
    { judul: "PKL menutup trotoar", deskripsi: "Lapak pedagang memakai seluruh lebar trotoar dari pagi sampai malam." },
    { judul: "Bangunan liar di bantaran saluran", deskripsi: "Ada bangunan semi permanen baru di atas saluran air yang menghambat aliran." },
  ],
  pungli: [
    { judul: "Dugaan pungutan liar parkir", deskripsi: "Juru parkir menarik tarif di atas ketentuan dan tidak memberi karcis." },
    { judul: "Dugaan pungli layanan administrasi", deskripsi: "Ada permintaan uang tambahan supaya surat keterangan cepat selesai." },
  ],
  wewenang: [
    { judul: "Pelayanan tidak sesuai prosedur", deskripsi: "Petugas loket meminta syarat tambahan yang tidak ada di aturan." },
    { judul: "Perlakuan diskriminatif di loket", deskripsi: "Warga yang dikenal petugas dilayani lebih dulu tanpa antre." },
  ],
};

const catatanSelesai: Partial<Record<KategoriId, string>> = {
  "jalan-rusak": "Lubang sudah ditambal dan permukaan jalan diratakan.",
  "lampu-jalan": "Lampu sudah diganti dan menyala normal.",
  sampah: "Sampah sudah diangkut dan lokasi dibersihkan.",
  drainase: "Saluran sudah dikeruk dan aliran air lancar.",
  bansos: "Data sudah diperbarui dan bantuan dijadwalkan pada pencairan berikutnya.",
  perizinan: "Berkas sudah diproses dan izin sudah terbit.",
  pungli: "Penelusuran selesai dan sudah ada tindakan terhadap petugas yang terlibat.",
};

const namaDepan = [
  "Rina", "Budi", "Siti", "Agus", "Dewi", "Fajar", "Nur", "Yusuf", "Lestari", "Hendra",
  "Putri", "Arif", "Maya", "Dimas", "Wulan", "Rizky", "Indah", "Bayu", "Sari", "Teguh",
  "Asep", "Neng", "Ujang", "Euis", "Cecep", "Dadang", "Rani", "Ilham", "Tika", "Gilang",
];

const bobotKota: [string, number][] = [
  ["jaksel", 30],
  ["kota-bogor", 15],
  ["kab-bogor", 15],
  ["depok", 15],
  ["kota-bandung", 15],
  ["kab-garut", 10],
];

const bobotKategori: Partial<Record<KategoriId, number>> = {
  "jalan-rusak": 14, sampah: 12, drainase: 10, "lampu-jalan": 8, trotoar: 6, parkir: 5, "pohon-taman": 5,
  pkl: 4, rambu: 4, angkutan: 3, pencemaran: 3, faskes: 3, sekolah: 3, fasum: 3, kependudukan: 3,
  bansos: 3, perizinan: 2, pungli: 2, wewenang: 1,
};

const kecepatanJenis: Record<string, number> = {
  dpu: 1.25, dishub: 0.85, dlh: 0.6, sda: 1.3, pertamanan: 0.95, dinkes: 0.9, disdik: 1.1,
  dukcapil: 0.8, ptsp: 0.75, dinsos: 0.95, satpolpp: 1, inspektorat: 1,
};

const tujuanPengalihan: Record<string, string> = {
  dpu: "sda", sda: "dpu", dishub: "dpu", dlh: "pertamanan", pertamanan: "dlh", dinkes: "dinsos",
  disdik: "dpu", dukcapil: "dinsos", ptsp: "satpolpp", dinsos: "dukcapil", satpolpp: "dishub", inspektorat: "ptsp",
};

function laporanAcak(sekarang: Date, jumlah: number): LaporanBenih[] {
  const acak = buatAcak(2026);
  const antara = (min: number, max: number) => min + acak() * (max - min);
  const peluang = (p: number) => acak() < p;
  const pilih = <T,>(daftar: readonly T[]): T => daftar[Math.floor(acak() * daftar.length)];
  const pilihBerbobot = <T extends string>(bobot: [T, number][]): T => {
    let titik = acak() * bobot.reduce((a, [, b]) => a + b, 0);
    for (const [nilai, b] of bobot) {
      titik -= b;
      if (titik <= 0) return nilai;
    }
    return bobot[0][0];
  };
  const kategoriBerbobot = daftarKategori.map((k) => [k.id, bobotKategori[k.id] ?? 1] as [KategoriId, number]);
  const bulatkan = (t: Date) => new Date(Math.round(t.getTime() / 60000) * 60000);
  // Variasi kecepatan tiap instansi supaya rapor tidak seragam
  const variasiInstansi = new Map<string, number>();

  const hasil: LaporanBenih[] = [];
  for (let i = 0; i < jumlah; i++) {
    const idKota = pilihBerbobot(bobotKota);
    const kota = daftarKota.find((k) => k.id === idKota)!;
    const kecamatan = pilih(kota.kecamatan);
    const jalan = pilih(kecamatan.jalan);
    const kategoriId = pilihBerbobot(kategoriBerbobot);
    const kategori = cariKategori(kategoriId);
    const isi = pilih(masalah[kategoriId]);
    let instansi = instansiTujuan(kategoriId, kota.id);
    const dibuat = bulatkan(new Date(sekarang.getTime() - antara(0.2, 80) * HARI));
    const riwayat: KejadianBenih[] = [{ jenis: "dibuat", waktu: dibuat, aktor: "Pelapor" }];
    const catat = (jenis: JenisKejadian, waktu: Date, aktor: string, catatan?: string, batasBaru?: Date) =>
      riwayat.push({ jenis, waktu: bulatkan(waktu), aktor, catatan, batasBaru: batasBaru && bulatkan(batasBaru) });

    const administratif = ["bansos", "perizinan", "kependudukan", "pungli", "wewenang"].includes(kategoriId);
    const visibilitas: Visibilitas = ["pungli", "wewenang", "bansos"].includes(kategoriId)
      ? "sembunyikan_nama"
      : peluang(0.04)
        ? "privat"
        : peluang(0.2)
          ? "sembunyikan_nama"
          : "publik";

    const laporan: LaporanBenih = {
      kategoriId,
      judul: `${isi.judul} di ${administratif ? kecamatan.nama : jalan}`,
      deskripsi: isi.deskripsi,
      alamat: administratif ? `Kecamatan ${kecamatan.nama}` : jalan,
      kotaId: kota.id,
      kecamatan: kecamatan.nama,
      lat: kecamatan.lat + antara(-0.012, 0.012),
      lng: kecamatan.lng + antara(-0.012, 0.012),
      dibuat,
      namaPelapor: `${pilih(namaDepan)} ${pilih("ABDHKLMPRSTW".split(""))}.`,
      visibilitas,
      instansiId: instansi.id,
      dukunganAwal: 0,
      fotoContoh: peluang(0.65),
      riwayat,
    };
    hasil.push(laporan);

    const selesaiSimulasi = () => {
      laporan.instansiId = instansi.id;
      laporan.dukunganAwal = Math.floor(
        acak() * acak() * (riwayat.length === 1 || riwayat.some((k) => k.jenis === "ditolak") ? 3 : 45),
      );
    };

    // 1. Verifikasi (laporan 2 hari terakhir sebagian besar masih antre, biar antrean admin terisi)
    if (sekarang.getTime() - dibuat.getTime() < 2 * HARI && peluang(0.7)) { selesaiSimulasi(); continue; }
    let waktuVerifikasi = tambahJam(dibuat, antara(1, 40));
    if (peluang(0.05)) waktuVerifikasi = tambahJam(waktuVerifikasi, antara(48, 110));
    if (waktuVerifikasi > sekarang) { selesaiSimulasi(); continue; }
    if (peluang(0.05)) {
      catat("ditolak", waktuVerifikasi, "Admin verifikator", pilih([
        "Lokasi kurang jelas. Silakan kirim ulang dengan titik lokasi yang tepat.",
        "Laporan yang sama sudah ada. Kamu bisa mendukung laporan tersebut.",
        "Masalah berada di lahan milik pribadi, di luar kewenangan pemerintah daerah.",
      ]));
      selesaiSimulasi();
      continue;
    }
    catat("diverifikasi", waktuVerifikasi, "Admin verifikator");
    catat("diteruskan", waktuVerifikasi, "Sistem", `Diteruskan otomatis ke ${instansi.nama} berdasarkan kategori dan lokasi.`);

    // 2. Kadang dialihkan
    let waktuDiteruskan = waktuVerifikasi;
    if (peluang(0.06)) {
      const waktuAlih = tambahJam(waktuDiteruskan, antara(3, 30));
      if (waktuAlih > sekarang) { selesaiSimulasi(); continue; }
      const baru = cariInstansi(`${tujuanPengalihan[instansi.jenis]}-${kota.id}`);
      catat("dialihkan", waktuAlih, instansi.nama, `Bukan kewenangan kami. Laporan dialihkan ke ${baru.nama}.`);
      instansi = baru;
      waktuDiteruskan = waktuAlih;
    }

    if (!variasiInstansi.has(instansi.id)) variasiInstansi.set(instansi.id, antara(0.75, 1.25));
    const faktor = (kecepatanJenis[instansi.jenis] ?? 1) * variasiInstansi.get(instansi.id)!;

    // 3. Respons awal
    let waktuProses = tambahJam(waktuDiteruskan, antara(2, 70) * faktor);
    if (peluang(0.08 * faktor)) waktuProses = tambahJam(waktuProses, antara(60, 140));
    const batasRespons = tambahHariKerja(waktuDiteruskan, 5);
    if (batasRespons < sekarang && waktuProses > batasRespons) {
      catat("eskalasi", batasRespons, "Sistem", "Instansi belum merespons dalam 5 hari kerja. Laporan dieskalasi ke pengawas.");
    }
    if (waktuProses > sekarang) { selesaiSimulasi(); continue; }
    catat("diproses", waktuProses, instansi.nama, "Laporan diterima dan petugas dijadwalkan menangani.");

    // 4. Pengerjaan
    let batasSelesai = tambahHariKerja(waktuProses, kategori.slaHariKerja);
    let lamaKerja = antara(0.25, 1.2) * faktor * kategori.slaHariKerja * (7 / 5);
    if (peluang(0.15 * faktor)) lamaKerja *= 1.8;
    let waktuSelesai = tambahHari(waktuProses, Math.min(lamaKerja, 50));
    if (peluang(0.07 * faktor)) waktuSelesai = tambahHari(sekarang, 30);
    if (kategori.slaHariKerja >= 14 && peluang(0.12)) {
      const waktuPerpanjangan = tambahHari(waktuProses, lamaKerja * 0.5);
      if (waktuPerpanjangan < sekarang && waktuPerpanjangan < batasSelesai) {
        batasSelesai = tambahHariKerja(batasSelesai, 7);
        catat("perpanjangan", waktuPerpanjangan, instansi.nama, pilih([
          "Menunggu ketersediaan material.",
          "Pekerjaan perlu koordinasi dengan instansi lain.",
          "Cuaca tidak memungkinkan pekerjaan dilanjutkan.",
        ]), batasSelesai);
      }
    }
    if (batasSelesai < sekarang && waktuSelesai > batasSelesai) {
      catat("eskalasi", batasSelesai, "Sistem", "Melewati batas waktu penyelesaian. Laporan dieskalasi ke pengawas.");
    }
    if (waktuSelesai > sekarang) { selesaiSimulasi(); continue; }
    const teksSelesai = catatanSelesai[kategoriId] ?? "Penanganan sudah selesai dilakukan.";
    catat("ditandai_selesai", waktuSelesai, instansi.nama, teksSelesai);

    // 5. Konfirmasi pelapor
    const pilihan = acak();
    if (pilihan < 0.62) {
      const waktuJawab = tambahJam(waktuSelesai, antara(3, 120));
      if (waktuJawab <= sekarang) catat("dikonfirmasi_beres", waktuJawab, "Pelapor");
    } else if (pilihan < 0.74) {
      const waktuJawab = tambahJam(waktuSelesai, antara(3, 72));
      if (waktuJawab <= sekarang) {
        catat("dibuka_ulang", waktuJawab, "Pelapor", pilih([
          "Masalahnya belum beres, kondisinya masih sama seperti sebelumnya.",
          "Baru sebagian yang dikerjakan.",
          "Sempat diperbaiki tapi sudah rusak lagi.",
        ]));
        const waktuSelesai2 = tambahHari(waktuJawab, antara(1, 6) * faktor);
        if (waktuSelesai2 <= sekarang) {
          catat("ditandai_selesai", waktuSelesai2, instansi.nama, teksSelesai);
          const waktuJawab2 = tambahJam(waktuSelesai2, antara(3, 96));
          if (waktuJawab2 <= sekarang) catat("dikonfirmasi_beres", waktuJawab2, "Pelapor");
        }
      }
    } else {
      const waktuTutup = tambahHari(waktuSelesai, 10);
      if (waktuTutup <= sekarang) {
        catat("ditutup_otomatis", waktuTutup, "Sistem", "Tidak ada konfirmasi dari pelapor dan pendukung dalam 10 hari.");
      }
    }
    selesaiSimulasi();
  }
  for (const l of hasil) l.riwayat.sort((a, b) => a.waktu.getTime() - b.waktu.getTime());
  return hasil;
}

// ---------------- memasukkan ke database ----------------

function nomorLaporan(dibuat: Date, urut: number) {
  const wib = new Date(dibuat.getTime() + 7 * JAM);
  const yymm = `${String(wib.getUTCFullYear() % 100).padStart(2, "0")}${String(wib.getUTCMonth() + 1).padStart(2, "0")}`;
  return `${situs.kodeLaporan}-${yymm}-${String(urut).padStart(4, "0")}`;
}

async function sisipkanBanyak(kueri: Kueri, tabel: string, kolom: string[], baris: unknown[][]) {
  for (let i = 0; i < baris.length; i += 200) {
    const potongan = baris.slice(i, i + 200);
    const nilai: unknown[] = [];
    const tempat = potongan.map((b) => {
      const awal = nilai.length;
      nilai.push(...b);
      return `(${b.map((_, j) => `$${awal + j + 1}`).join(", ")})`;
    });
    await kueri(`INSERT INTO ${tabel} (${kolom.join(", ")}) VALUES ${tempat.join(", ")}`, nilai);
  }
}

export async function isiDataContoh(kueri: Kueri) {
  const sekarang = new Date();
  const hashDemo = await hashSandi(SANDI_DEMO);

  const idAkun = new Map<string, string>();
  for (const akun of akunDemo) {
    const [baris] = await kueri<{ id: string }>(
      `INSERT INTO pengguna (nama, email, hp, hash_sandi, peran, instansi_id, dibuat_pada)
       VALUES ($1, $2, $3, $4, $5, $6, now() - interval '60 days') RETURNING id`,
      [akun.nama, akun.email, akun.hp, hashDemo, akun.peran, akun.instansiId],
    );
    idAkun.set(akun.kunci, baris.id);
  }

  const unggulan = laporanUnggulan(sekarang);
  const acak = laporanAcak(sekarang, 240);

  // Nomor urut acak mulai 101 per bulan supaya tidak bentrok dengan laporan unggulan
  const urutPerBulan = new Map<string, number>();
  const semua = [
    ...unggulan.map((l) => ({ ...l, nomor: nomorLaporan(l.dibuat, l.urut!) })),
    ...acak
      .sort((a, b) => a.dibuat.getTime() - b.dibuat.getTime())
      .map((l) => {
        const kunci = nomorLaporan(l.dibuat, 0).slice(0, -4);
        const urut = (urutPerBulan.get(kunci) ?? 100) + 1;
        urutPerBulan.set(kunci, urut);
        return { ...l, nomor: nomorLaporan(l.dibuat, urut) };
      }),
  ];

  await sisipkanBanyak(
    kueri,
    "laporan",
    ["nomor", "kategori_id", "judul", "deskripsi", "alamat", "kota_id", "kecamatan", "lat", "lng", "tanggal_kejadian",
      "dibuat_pada", "pelapor_id", "nama_pelapor", "visibilitas", "instansi_id", "dukungan_awal", "foto_contoh", "sorotan"],
    semua.map((l) => [
      l.nomor, l.kategoriId, l.judul, l.deskripsi, l.alamat, l.kotaId, l.kecamatan, l.lat, l.lng,
      new Date(l.dibuat.getTime() + 7 * JAM).toISOString().slice(0, 10), l.dibuat,
      l.pelaporKunci ? idAkun.get(l.pelaporKunci) : null, l.namaPelapor, l.visibilitas, l.instansiId,
      l.dukunganAwal, l.fotoContoh, l.sorotan ?? false,
    ]),
  );

  await sisipkanBanyak(
    kueri,
    "kejadian",
    ["nomor", "jenis", "waktu", "aktor", "catatan", "batas_baru"],
    semua.flatMap((l) => l.riwayat.map((k) => [l.nomor, k.jenis, k.waktu, k.aktor, k.catatan ?? null, k.batasBaru ?? null])),
  );

  const dukungan = unggulan
    .map((l, i) => ({ l, nomor: semua[i].nomor }))
    .flatMap(({ l, nomor }) => ((l as { pendukung?: string[] }).pendukung ?? []).map((k) => [idAkun.get(k), nomor]));
  if (dukungan.length) await sisipkanBanyak(kueri, "dukungan", ["pengguna_id", "nomor"], dukungan);
}
