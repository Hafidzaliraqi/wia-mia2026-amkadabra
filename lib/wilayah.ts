// Wilayah layanan. Titik koordinat kecamatan adalah perkiraan titik tengah,
// dipakai untuk menebak lokasi pengguna dan mengurutkan laporan terdekat.

export interface Kecamatan {
  nama: string;
  lat: number;
  lng: number;
  jalan: string[];
}

export interface Kota {
  id: string;
  nama: string; // nama tampilan, misal "Kota Bogor"
  provinsi: string;
  kecamatan: Kecamatan[];
}

export const daftarKota: Kota[] = [
  {
    id: "jaksel",
    nama: "Jakarta Selatan",
    provinsi: "DKI Jakarta",
    kecamatan: [
      { nama: "Tebet", lat: -6.2264, lng: 106.8559, jalan: ["Jl. Tebet Raya", "Jl. Dr. Saharjo", "Jl. Prof. Dr. Soepomo"] },
      { nama: "Setiabudi", lat: -6.2146, lng: 106.8304, jalan: ["Jl. Casablanca", "Jl. HR Rasuna Said"] },
      { nama: "Mampang Prapatan", lat: -6.2425, lng: 106.8237, jalan: ["Jl. Kapten Tendean", "Jl. Bangka Raya", "Jl. Kemang Raya"] },
      { nama: "Pancoran", lat: -6.249, lng: 106.8433, jalan: ["Jl. Pasar Minggu Raya", "Jl. Raya Pengadegan"] },
      { nama: "Pasar Minggu", lat: -6.282, lng: 106.8432, jalan: ["Jl. Raya Pasar Minggu", "Jl. Pejaten Raya"] },
      { nama: "Jagakarsa", lat: -6.3347, lng: 106.8233, jalan: ["Jl. Moh. Kahfi", "Jl. Raya Lenteng Agung"] },
      { nama: "Cilandak", lat: -6.289, lng: 106.794, jalan: ["Jl. RS Fatmawati", "Jl. Ampera Raya"] },
      { nama: "Kebayoran Baru", lat: -6.2433, lng: 106.7985, jalan: ["Jl. Senopati", "Jl. Wolter Monginsidi", "Jl. Barito"] },
      { nama: "Kebayoran Lama", lat: -6.245, lng: 106.777, jalan: ["Jl. Gandaria", "Jl. Ciputat Raya"] },
      { nama: "Pesanggrahan", lat: -6.248, lng: 106.757, jalan: ["Jl. Ulujami Raya", "Jl. Bintaro Raya"] },
    ],
  },
  {
    id: "jakbar",
    nama: "Jakarta Barat",
    provinsi: "DKI Jakarta",
    kecamatan: [
      { nama: "Cengkareng", lat: -6.15, lng: 106.735, jalan: ["Jl. Daan Mogot", "Jl. Kamal Raya"] },
      { nama: "Grogol Petamburan", lat: -6.163, lng: 106.79, jalan: ["Jl. Kyai Tapa", "Jl. Latumenten"] },
      { nama: "Taman Sari", lat: -6.145, lng: 106.815, jalan: ["Jl. Hayam Wuruk", "Jl. Mangga Besar"] },
      { nama: "Tambora", lat: -6.145, lng: 106.8, jalan: ["Jl. Jembatan Dua", "Jl. Pekojan"] },
      { nama: "Kebon Jeruk", lat: -6.192, lng: 106.77, jalan: ["Jl. Panjang", "Jl. Kebon Jeruk Raya"] },
      { nama: "Kalideres", lat: -6.14, lng: 106.7, jalan: ["Jl. Peta Selatan", "Jl. Kamal Raya"] },
      { nama: "Palmerah", lat: -6.2, lng: 106.795, jalan: ["Jl. Palmerah Barat", "Jl. Kemanggisan Raya", "Jl. K.H. Syahdan"] },
      { nama: "Kembangan", lat: -6.19, lng: 106.74, jalan: ["Jl. Puri Kencana", "Jl. Meruya Ilir"] },
    ],
  },
  {
    id: "jakpus",
    nama: "Jakarta Pusat",
    provinsi: "DKI Jakarta",
    kecamatan: [
      { nama: "Gambir", lat: -6.17, lng: 106.82, jalan: ["Jl. Medan Merdeka Barat", "Jl. Ir. H. Juanda"] },
      { nama: "Sawah Besar", lat: -6.155, lng: 106.83, jalan: ["Jl. Gunung Sahari", "Jl. Pangeran Jayakarta"] },
      { nama: "Kemayoran", lat: -6.16, lng: 106.85, jalan: ["Jl. Benyamin Sueb", "Jl. Garuda"] },
      { nama: "Senen", lat: -6.18, lng: 106.845, jalan: ["Jl. Kramat Raya", "Jl. Senen Raya"] },
      { nama: "Cempaka Putih", lat: -6.18, lng: 106.87, jalan: ["Jl. Letjen Suprapto", "Jl. Cempaka Putih Raya"] },
      { nama: "Menteng", lat: -6.195, lng: 106.835, jalan: ["Jl. HOS Cokroaminoto", "Jl. Cikini Raya"] },
      { nama: "Tanah Abang", lat: -6.205, lng: 106.81, jalan: ["Jl. KH Mas Mansyur", "Jl. Jati Baru"] },
      { nama: "Johar Baru", lat: -6.185, lng: 106.855, jalan: ["Jl. Percetakan Negara", "Jl. Johar Baru Raya"] },
    ],
  },
  {
    id: "jaktim",
    nama: "Jakarta Timur",
    provinsi: "DKI Jakarta",
    kecamatan: [
      { nama: "Matraman", lat: -6.205, lng: 106.86, jalan: ["Jl. Matraman Raya", "Jl. Pramuka"] },
      { nama: "Pulo Gadung", lat: -6.19, lng: 106.9, jalan: ["Jl. Pemuda", "Jl. Bekasi Raya"] },
      { nama: "Jatinegara", lat: -6.23, lng: 106.87, jalan: ["Jl. Jatinegara Barat", "Jl. Otista Raya"] },
      { nama: "Kramat Jati", lat: -6.27, lng: 106.865, jalan: ["Jl. Raya Bogor", "Jl. Dewi Sartika"] },
      { nama: "Pasar Rebo", lat: -6.315, lng: 106.86, jalan: ["Jl. TB Simatupang", "Jl. Raya Bogor"] },
      { nama: "Cakung", lat: -6.18, lng: 106.945, jalan: ["Jl. Raya Bekasi", "Jl. Cakung Cilincing"] },
      { nama: "Duren Sawit", lat: -6.23, lng: 106.91, jalan: ["Jl. Kolonel Sugiono", "Jl. Raden Inten"] },
      { nama: "Makasar", lat: -6.27, lng: 106.885, jalan: ["Jl. Raya Pondok Gede", "Jl. Halim Perdanakusuma"] },
      { nama: "Ciracas", lat: -6.33, lng: 106.875, jalan: ["Jl. Raya Ciracas", "Jl. Raya Lapangan Tembak"] },
      { nama: "Cipayung", lat: -6.32, lng: 106.9, jalan: ["Jl. Raya Cipayung", "Jl. Bambu Apus"] },
    ],
  },
  {
    id: "jakut",
    nama: "Jakarta Utara",
    provinsi: "DKI Jakarta",
    kecamatan: [
      { nama: "Penjaringan", lat: -6.125, lng: 106.78, jalan: ["Jl. Pluit Raya", "Jl. Muara Karang"] },
      { nama: "Pademangan", lat: -6.135, lng: 106.835, jalan: ["Jl. RE Martadinata", "Jl. Pademangan Raya"] },
      { nama: "Tanjung Priok", lat: -6.12, lng: 106.875, jalan: ["Jl. Enggano", "Jl. Yos Sudarso"] },
      { nama: "Koja", lat: -6.115, lng: 106.905, jalan: ["Jl. Plumpang Raya", "Jl. Koja Raya"] },
      { nama: "Kelapa Gading", lat: -6.16, lng: 106.905, jalan: ["Jl. Boulevard Raya", "Jl. Kelapa Gading Raya"] },
      { nama: "Cilincing", lat: -6.12, lng: 106.945, jalan: ["Jl. Cilincing Raya", "Jl. Kalibaru"] },
    ],
  },
  {
    id: "kota-bogor",
    nama: "Kota Bogor",
    provinsi: "Jawa Barat",
    kecamatan: [
      { nama: "Bogor Tengah", lat: -6.596, lng: 106.797, jalan: ["Jl. Suryakencana", "Jl. Kapten Muslihat"] },
      { nama: "Bogor Utara", lat: -6.565, lng: 106.815, jalan: ["Jl. Ahmad Yani", "Jl. Pandu Raya"] },
      { nama: "Bogor Selatan", lat: -6.63, lng: 106.81, jalan: ["Jl. Batutulis", "Jl. Lawang Gintung"] },
      { nama: "Bogor Timur", lat: -6.612, lng: 106.829, jalan: ["Jl. Pajajaran", "Jl. Raya Tajur"] },
      { nama: "Bogor Barat", lat: -6.58, lng: 106.765, jalan: ["Jl. Dr. Semeru", "Jl. Mayjen Ishak Djuarsa"] },
      { nama: "Tanah Sareal", lat: -6.548, lng: 106.788, jalan: ["Jl. Sholeh Iskandar", "Jl. Kebon Pedes"] },
    ],
  },
  {
    id: "kab-bogor",
    nama: "Kabupaten Bogor",
    provinsi: "Jawa Barat",
    kecamatan: [
      { nama: "Cibinong", lat: -6.4815, lng: 106.854, jalan: ["Jl. Mayor Oking", "Jl. Tegar Beriman"] },
      { nama: "Citeureup", lat: -6.487, lng: 106.882, jalan: ["Jl. Raya Citeureup"] },
      { nama: "Gunung Putri", lat: -6.427, lng: 106.905, jalan: ["Jl. Raya Mercedes Benz"] },
      { nama: "Bojonggede", lat: -6.48, lng: 106.8, jalan: ["Jl. Raya Bojonggede"] },
      { nama: "Cileungsi", lat: -6.394, lng: 106.962, jalan: ["Jl. Raya Narogong"] },
      { nama: "Dramaga", lat: -6.56, lng: 106.73, jalan: ["Jl. Raya Dramaga"] },
      { nama: "Ciawi", lat: -6.66, lng: 106.85, jalan: ["Jl. Raya Puncak", "Jl. Raya Ciawi"] },
      { nama: "Cisarua", lat: -6.68, lng: 106.94, jalan: ["Jl. Raya Puncak Cisarua"] },
    ],
  },
  {
    id: "depok",
    nama: "Kota Depok",
    provinsi: "Jawa Barat",
    kecamatan: [
      { nama: "Beji", lat: -6.372, lng: 106.819, jalan: ["Jl. Margonda Raya", "Jl. Kukusan"] },
      { nama: "Pancoran Mas", lat: -6.399, lng: 106.809, jalan: ["Jl. Raya Sawangan", "Jl. Kartini"] },
      { nama: "Cimanggis", lat: -6.372, lng: 106.865, jalan: ["Jl. Raya Bogor", "Jl. Raya Cimanggis"] },
      { nama: "Sukmajaya", lat: -6.403, lng: 106.843, jalan: ["Jl. Tole Iskandar", "Jl. Juanda"] },
      { nama: "Cinere", lat: -6.333, lng: 106.783, jalan: ["Jl. Raya Cinere"] },
      { nama: "Sawangan", lat: -6.413, lng: 106.755, jalan: ["Jl. Raya Muchtar"] },
      { nama: "Tapos", lat: -6.42, lng: 106.885, jalan: ["Jl. Raya Tapos"] },
    ],
  },
  {
    id: "kota-bandung",
    nama: "Kota Bandung",
    provinsi: "Jawa Barat",
    kecamatan: [
      { nama: "Coblong", lat: -6.89, lng: 107.615, jalan: ["Jl. Ir. H. Juanda", "Jl. Dipatiukur"] },
      { nama: "Sukajadi", lat: -6.885, lng: 107.595, jalan: ["Jl. Sukajadi", "Jl. Pasteur"] },
      { nama: "Cicendo", lat: -6.905, lng: 107.585, jalan: ["Jl. Pasirkaliki"] },
      { nama: "Andir", lat: -6.915, lng: 107.575, jalan: ["Jl. Jenderal Sudirman"] },
      { nama: "Bandung Wetan", lat: -6.905, lng: 107.615, jalan: ["Jl. Riau", "Jl. Diponegoro"] },
      { nama: "Sumur Bandung", lat: -6.918, lng: 107.61, jalan: ["Jl. Asia Afrika", "Jl. Braga"] },
      { nama: "Lengkong", lat: -6.93, lng: 107.625, jalan: ["Jl. Lengkong Besar"] },
      { nama: "Buahbatu", lat: -6.95, lng: 107.64, jalan: ["Jl. Terusan Buah Batu"] },
      { nama: "Antapani", lat: -6.915, lng: 107.66, jalan: ["Jl. Terusan Jakarta"] },
    ],
  },
  {
    id: "kab-garut",
    nama: "Kabupaten Garut",
    provinsi: "Jawa Barat",
    kecamatan: [
      { nama: "Garut Kota", lat: -7.215, lng: 107.905, jalan: ["Jl. Ahmad Yani Garut", "Jl. Ciledug"] },
      { nama: "Tarogong Kidul", lat: -7.2, lng: 107.89, jalan: ["Jl. Cimanuk", "Jl. Pembangunan"] },
      { nama: "Tarogong Kaler", lat: -7.17, lng: 107.88, jalan: ["Jl. Raya Tarogong"] },
      { nama: "Karangpawitan", lat: -7.21, lng: 107.94, jalan: ["Jl. Raya Karangpawitan"] },
      { nama: "Leles", lat: -7.105, lng: 107.9, jalan: ["Jl. Raya Leles"] },
      { nama: "Cibatu", lat: -7.105, lng: 107.985, jalan: ["Jl. Raya Cibatu"] },
      { nama: "Bayongbong", lat: -7.27, lng: 107.83, jalan: ["Jl. Raya Bayongbong"] },
    ],
  },
];

export function cariKota(id: string): Kota | undefined {
  return daftarKota.find((k) => k.id === id);
}

export function namaKota(id: string): string {
  return cariKota(id)?.nama ?? id;
}

export function kecamatanValid(kotaId: string, kecamatan: string): boolean {
  return cariKota(kotaId)?.kecamatan.some((k) => k.nama === kecamatan) ?? false;
}

// Jarak dua titik dalam kilometer (rumus haversine)
export function jarakKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Tebak kecamatan dari koordinat: kecamatan dengan titik tengah terdekat
export function wilayahTerdekat(titik: { lat: number; lng: number }) {
  let terbaik: { kota: Kota; kecamatan: Kecamatan; jarak: number } | null = null;
  for (const kota of daftarKota) {
    for (const kecamatan of kota.kecamatan) {
      const jarak = jarakKm(titik, kecamatan);
      if (!terbaik || jarak < terbaik.jarak) terbaik = { kota, kecamatan, jarak };
    }
  }
  return terbaik;
}

function bersihkan(teks: string) {
  return teks
    .toLowerCase()
    .replace(/^(kecamatan|kota administrasi|kota adm\.|kota|kabupaten|kab\.|daerah khusus ibukota|provinsi)\s+/g, "")
    .trim();
}

// Cocokkan bagian alamat dari peta (OpenStreetMap) dengan wilayah layanan.
// Mengembalikan null kalau kecamatannya tidak ada di daftar.
export function cocokkanWilayah(bagianAlamat: string[]): { kota: Kota; kecamatan: Kecamatan } | null {
  const bagian = bagianAlamat.map(bersihkan);
  const kandidat = daftarKota.flatMap((kota) =>
    kota.kecamatan.filter((k) => bagian.includes(k.nama.toLowerCase())).map((kecamatan) => ({ kota, kecamatan })),
  );
  if (kandidat.length === 0) return null;
  // Kalau nama kecamatan sama di dua kota, pilih yang nama kotanya juga muncul di alamat
  const namaKotaDasar = (k: Kota) => bersihkan(k.nama);
  return kandidat.find((c) => bagian.some((b) => b.includes(namaKotaDasar(c.kota)))) ?? kandidat[0];
}
