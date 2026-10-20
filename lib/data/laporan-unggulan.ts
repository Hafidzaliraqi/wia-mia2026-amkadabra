import type { Laporan } from "@/lib/types";

// Laporan contoh dengan cerita lengkap, dipakai buat demo dan pitching.
// Masing-masing nunjukin satu skenario status yang berbeda.

// Waktu ditulis dalam WIB biar gampang dibaca: w("2026-10-12T07:40")
const w = (waktu: string) => new Date(`${waktu}:00+07:00`).toISOString();

type LaporanTanpaNomor = Omit<Laporan, "nomor"> & { urut: number };

export const laporanUnggulan: LaporanTanpaNomor[] = [
  // Sedang dikerjakan, tenggat tinggal beberapa hari (dipakai di hero)
  {
    urut: 42,
    kategoriId: "jalan",
    judul: "Jalan berlubang di Jl. Prof. Dr. Soepomo",
    deskripsi:
      "Ada lubang cukup dalam di lajur kiri, lebarnya kira-kira 50 cm. Minggu ini sudah dua motor jatuh di sini, terutama malam hari karena penerangannya kurang.",
    alamat: "Jl. Prof. Dr. Soepomo, depan halte Tebet",
    kecamatan: "Tebet",
    dibuatPada: w("2026-10-12T07:40"),
    namaPelapor: "Rina S.",
    visibilitas: "publik",
    instansiId: "dpu",
    dukungan: 37,
    adaFotoAwal: true,
    riwayat: [
      { jenis: "dibuat", waktu: w("2026-10-12T07:40"), aktor: "Pelapor" },
      { jenis: "diverifikasi", waktu: w("2026-10-12T13:05"), aktor: "Admin verifikator" },
      {
        jenis: "diteruskan",
        waktu: w("2026-10-12T13:05"),
        aktor: "Sistem",
        catatan: "Diteruskan otomatis ke Dinas Pekerjaan Umum berdasarkan kategori dan lokasi.",
      },
      {
        jenis: "diproses",
        waktu: w("2026-10-14T14:00"),
        aktor: "Dinas Pekerjaan Umum",
        catatan: "Laporan diterima. Tim survei akan cek lokasi minggu ini.",
      },
      {
        jenis: "balasan",
        waktu: w("2026-10-21T10:20"),
        aktor: "Dinas Pekerjaan Umum",
        catatan:
          "Lubang sudah ditandai dan diberi pembatas sementara. Penambalan dijadwalkan sebelum 3 November.",
      },
    ],
  },

  // Instansi bilang selesai, menunggu konfirmasi pelapor
  {
    urut: 38,
    kategoriId: "lampu",
    judul: "Lampu jalan mati di Jl. Kemang Raya",
    deskripsi:
      "Tiga lampu jalan berturut-turut mati sejak seminggu lalu, dari depan minimarket sampai pertigaan. Jalannya jadi gelap total setelah jam tujuh malam.",
    alamat: "Jl. Kemang Raya, dekat pertigaan Jl. Bangka",
    kecamatan: "Mampang Prapatan",
    dibuatPada: w("2026-10-20T21:15"),
    namaPelapor: "Dimas A.",
    visibilitas: "publik",
    instansiId: "dishub",
    dukungan: 12,
    adaFotoAwal: true,
    riwayat: [
      { jenis: "dibuat", waktu: w("2026-10-20T21:15"), aktor: "Pelapor" },
      { jenis: "diverifikasi", waktu: w("2026-10-21T08:30"), aktor: "Admin verifikator" },
      {
        jenis: "diteruskan",
        waktu: w("2026-10-21T08:30"),
        aktor: "Sistem",
        catatan: "Diteruskan otomatis ke Dinas Perhubungan berdasarkan kategori dan lokasi.",
      },
      {
        jenis: "diproses",
        waktu: w("2026-10-22T09:10"),
        aktor: "Dinas Perhubungan",
        catatan: "Petugas penerangan jalan dijadwalkan cek malam ini.",
      },
      {
        jenis: "ditandai_selesai",
        waktu: w("2026-10-28T16:30"),
        aktor: "Dinas Perhubungan",
        catatan: "Lampu sudah diganti dan kabel yang putus sudah disambung.",
      },
    ],
  },

  // Sempat dibuka ulang karena belum beres, lalu dikonfirmasi selesai
  {
    urut: 27,
    kategoriId: "drainase",
    judul: "Saluran air tersumbat di Jl. Raya Lenteng Agung",
    deskripsi:
      "Saluran di sepanjang jalan penuh lumpur dan sampah plastik. Tiap hujan deras, air meluap ke jalan dan masuk ke rumah warga di gang 5.",
    alamat: "Jl. Raya Lenteng Agung, dari pertigaan sampai gang 5",
    kecamatan: "Jagakarsa",
    dibuatPada: w("2026-09-28T06:50"),
    namaPelapor: "Wulan P.",
    visibilitas: "publik",
    instansiId: "sda",
    dukungan: 64,
    adaFotoAwal: true,
    riwayat: [
      { jenis: "dibuat", waktu: w("2026-09-28T06:50"), aktor: "Pelapor" },
      { jenis: "diverifikasi", waktu: w("2026-09-28T10:00"), aktor: "Admin verifikator" },
      {
        jenis: "diteruskan",
        waktu: w("2026-09-28T10:00"),
        aktor: "Sistem",
        catatan: "Diteruskan otomatis ke Dinas Sumber Daya Air berdasarkan kategori dan lokasi.",
      },
      {
        jenis: "diproses",
        waktu: w("2026-09-30T11:00"),
        aktor: "Dinas Sumber Daya Air",
        catatan: "Tim akan mengangkat sedimen di saluran sepanjang 30 meter.",
      },
      {
        jenis: "ditandai_selesai",
        waktu: w("2026-10-07T15:00"),
        aktor: "Dinas Sumber Daya Air",
        catatan: "Saluran sudah dibersihkan.",
      },
      {
        jenis: "dibuka_ulang",
        waktu: w("2026-10-08T07:30"),
        aktor: "Pelapor",
        catatan:
          "Yang dibersihkan cuma bagian depan pertigaan. Saluran di depan gang 5 masih penuh lumpur dan air masih menggenang setelah hujan semalam.",
      },
      {
        jenis: "balasan",
        waktu: w("2026-10-09T09:00"),
        aktor: "Dinas Sumber Daya Air",
        catatan: "Tim kembali ke lokasi hari ini untuk bagian depan gang 5.",
      },
      {
        jenis: "ditandai_selesai",
        waktu: w("2026-10-13T14:20"),
        aktor: "Dinas Sumber Daya Air",
        catatan: "Seluruh saluran dari pertigaan sampai gang 5 sudah dikeruk.",
      },
      {
        jenis: "dikonfirmasi_beres",
        waktu: w("2026-10-14T18:05"),
        aktor: "Pelapor",
        catatan: "Sudah lancar. Kemarin hujan deras dan tidak menggenang lagi.",
      },
    ],
  },

  // Sempat dialihkan ke instansi lain, lalu ditutup otomatis
  {
    urut: 19,
    kategoriId: "fasum",
    judul: "Sampah menumpuk di Taman Pejaten",
    deskripsi:
      "Tumpukan sampah di pojok taman dekat area bermain anak sudah lebih dari seminggu dan mulai bau.",
    alamat: "Taman Pejaten, Jl. Pejaten Raya",
    kecamatan: "Pasar Minggu",
    dibuatPada: w("2026-10-09T16:20"),
    namaPelapor: "Teguh H.",
    visibilitas: "publik",
    instansiId: "dlh",
    dukungan: 9,
    adaFotoAwal: true,
    riwayat: [
      { jenis: "dibuat", waktu: w("2026-10-09T16:20"), aktor: "Pelapor" },
      { jenis: "diverifikasi", waktu: w("2026-10-12T08:15"), aktor: "Admin verifikator" },
      {
        jenis: "diteruskan",
        waktu: w("2026-10-12T08:15"),
        aktor: "Sistem",
        catatan: "Diteruskan otomatis ke Dinas Pertamanan berdasarkan kategori dan lokasi.",
      },
      {
        jenis: "dialihkan",
        waktu: w("2026-10-12T13:40"),
        aktor: "Dinas Pertamanan",
        catatan:
          "Pengangkutan sampah di area taman jadi kewenangan Dinas Lingkungan Hidup. Laporan dialihkan ke Dinas Lingkungan Hidup.",
      },
      {
        jenis: "diproses",
        waktu: w("2026-10-13T07:30"),
        aktor: "Dinas Lingkungan Hidup",
        catatan: "Truk pengangkut dijadwalkan besok pagi.",
      },
      {
        jenis: "ditandai_selesai",
        waktu: w("2026-10-14T10:00"),
        aktor: "Dinas Lingkungan Hidup",
        catatan:
          "Sampah sudah diangkut. Jadwal pengangkutan di taman ini ditambah jadi dua kali seminggu.",
      },
      {
        jenis: "ditutup_otomatis",
        waktu: w("2026-10-24T10:00"),
        aktor: "Sistem",
        catatan: "Tidak ada konfirmasi dari pelapor dan pendukung dalam 10 hari.",
      },
    ],
  },

  // Laporan sensitif: nama pelapor disembunyikan
  {
    urut: 51,
    kategoriId: "pungli",
    judul: "Dugaan pungutan liar parkir di Pasar Mampang",
    deskripsi:
      "Pengunjung pasar ditarik biaya parkir dua kali, di pintu masuk dan pintu keluar, tanpa karcis resmi. Tarifnya juga lebih mahal dari papan tarif.",
    alamat: "Area parkir Pasar Mampang Prapatan",
    kecamatan: "Mampang Prapatan",
    dibuatPada: w("2026-10-19T11:30"),
    namaPelapor: "Fajar R.",
    visibilitas: "sembunyikan_nama",
    instansiId: "inspektorat",
    dukungan: 21,
    adaFotoAwal: false,
    riwayat: [
      { jenis: "dibuat", waktu: w("2026-10-19T11:30"), aktor: "Pelapor" },
      { jenis: "diverifikasi", waktu: w("2026-10-19T15:00"), aktor: "Admin verifikator" },
      {
        jenis: "diteruskan",
        waktu: w("2026-10-19T15:00"),
        aktor: "Sistem",
        catatan: "Diteruskan otomatis ke Inspektorat berdasarkan kategori dan lokasi.",
      },
      {
        jenis: "diproses",
        waktu: w("2026-10-21T10:00"),
        aktor: "Inspektorat",
        catatan: "Laporan masuk tahap penelusuran. Identitas pelapor dirahasiakan.",
      },
    ],
  },

  // Instansi belum merespons, lewat batas waktu dan dieskalasi
  {
    urut: 55,
    kategoriId: "jalan",
    judul: "Trotoar rusak di Jl. RS Fatmawati",
    deskripsi:
      "Ubin trotoar banyak yang lepas dan ada lubang besar di dekat penyeberangan. Pejalan kaki terpaksa turun ke jalan.",
    alamat: "Jl. RS Fatmawati, sebelum Stasiun MRT Haji Nawi",
    kecamatan: "Cilandak",
    dibuatPada: w("2026-10-16T09:00"),
    namaPelapor: "Maya L.",
    visibilitas: "publik",
    instansiId: "dpu",
    dukungan: 18,
    adaFotoAwal: true,
    riwayat: [
      { jenis: "dibuat", waktu: w("2026-10-16T09:00"), aktor: "Pelapor" },
      { jenis: "diverifikasi", waktu: w("2026-10-16T14:30"), aktor: "Admin verifikator" },
      {
        jenis: "diteruskan",
        waktu: w("2026-10-16T14:30"),
        aktor: "Sistem",
        catatan: "Diteruskan otomatis ke Dinas Pekerjaan Umum berdasarkan kategori dan lokasi.",
      },
      {
        jenis: "eskalasi",
        waktu: w("2026-10-23T14:30"),
        aktor: "Sistem",
        catatan: "Instansi belum merespons dalam 5 hari kerja. Laporan dieskalasi ke pengawas.",
      },
    ],
  },

  // Baru masuk, menunggu verifikasi
  {
    urut: 60,
    kategoriId: "fasum",
    judul: "Lampu taman mati di Taman Langsat",
    deskripsi:
      "Lampu di jalur jogging sisi timur mati semua. Banyak warga yang olahraga sore jadi pulang lebih cepat karena gelap.",
    alamat: "Taman Langsat, Jl. Barito",
    kecamatan: "Kebayoran Baru",
    dibuatPada: w("2026-10-30T07:05"),
    namaPelapor: "Lestari W.",
    visibilitas: "publik",
    instansiId: "pertamanan",
    dukungan: 0,
    adaFotoAwal: true,
    riwayat: [{ jenis: "dibuat", waktu: w("2026-10-30T07:05"), aktor: "Pelapor" }],
  },

  // Dapat perpanjangan waktu
  {
    urut: 46,
    kategoriId: "bansos",
    judul: "Bantuan sosial belum diterima sejak Agustus",
    deskripsi:
      "Keluarga kami terdaftar sebagai penerima bantuan pangan, tapi sejak Agustus bantuannya tidak pernah sampai. Tetangga dengan data yang sama sudah menerima.",
    alamat: "Kelurahan Pengadegan",
    kecamatan: "Pancoran",
    dibuatPada: w("2026-10-05T10:00"),
    namaPelapor: "Hendra K.",
    visibilitas: "sembunyikan_nama",
    instansiId: "dinsos",
    dukungan: 4,
    adaFotoAwal: false,
    riwayat: [
      { jenis: "dibuat", waktu: w("2026-10-05T10:00"), aktor: "Pelapor" },
      { jenis: "diverifikasi", waktu: w("2026-10-05T13:00"), aktor: "Admin verifikator" },
      {
        jenis: "diteruskan",
        waktu: w("2026-10-05T13:00"),
        aktor: "Sistem",
        catatan: "Diteruskan otomatis ke Dinas Sosial berdasarkan kategori dan lokasi.",
      },
      {
        jenis: "diproses",
        waktu: w("2026-10-07T09:00"),
        aktor: "Dinas Sosial",
        catatan: "Data penerima sedang dicek ke pendamping kelurahan.",
      },
      {
        jenis: "perpanjangan",
        waktu: w("2026-10-22T15:00"),
        aktor: "Dinas Sosial",
        catatan: "Perlu pencocokan ulang dengan data kependudukan.",
        batasBaru: w("2026-11-05T09:00"),
      },
    ],
  },
];
