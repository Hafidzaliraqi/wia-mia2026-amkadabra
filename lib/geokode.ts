// Pencarian alamat gratis dari OpenStreetMap (Nominatim).
// Aturan pakainya: maksimal 1 permintaan per detik, jadi pencarian
// di formulir diberi jeda (debounce) dan tidak dipanggil tiap ketikan.
// Kalau nanti butuh lebih stabil, bisa diganti layanan berbayar.

const DASAR = "https://nominatim.openstreetmap.org";

interface HasilMentah {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: Record<string, string>;
}

export interface HasilAlamat {
  id: number;
  nama: string;
  lat: number;
  lng: number;
  kecamatan: string | null;
}

// Cocokkan bagian alamat dengan daftar kecamatan yang kita kenal
function tebakKecamatan(alamat: Record<string, string> | undefined, daftarKecamatan: string[]) {
  if (!alamat) return null;
  const bagian = Object.values(alamat).map((v) => v.toLowerCase().replace(/^kecamatan\s+/, ""));
  return daftarKecamatan.find((k) => bagian.includes(k.toLowerCase())) ?? null;
}

function rapikan(hasil: HasilMentah, daftarKecamatan: string[]): HasilAlamat {
  return {
    id: hasil.place_id,
    // Nama lengkap dari OSM terlalu panjang, ambil 4 bagian pertama saja
    nama: hasil.display_name.split(", ").slice(0, 4).join(", "),
    lat: Number(hasil.lat),
    lng: Number(hasil.lon),
    kecamatan: tebakKecamatan(hasil.address, daftarKecamatan),
  };
}

export async function cariAlamat(
  kata: string,
  daftarKecamatan: string[],
  sinyal?: AbortSignal,
): Promise<HasilAlamat[]> {
  const url =
    `${DASAR}/search?format=jsonv2&addressdetails=1&limit=5&countrycodes=id&accept-language=id` +
    `&q=${encodeURIComponent(kata)}`;
  const respons = await fetch(url, { signal: sinyal, headers: { Accept: "application/json" } });
  if (!respons.ok) throw new Error("Pencarian alamat gagal");
  const data = (await respons.json()) as HasilMentah[];
  return data.map((h) => rapikan(h, daftarKecamatan));
}

export async function alamatDariTitik(
  lat: number,
  lng: number,
  daftarKecamatan: string[],
  sinyal?: AbortSignal,
): Promise<HasilAlamat | null> {
  const url = `${DASAR}/reverse?format=jsonv2&addressdetails=1&zoom=18&accept-language=id&lat=${lat}&lon=${lng}`;
  const respons = await fetch(url, { signal: sinyal, headers: { Accept: "application/json" } });
  if (!respons.ok) return null;
  const data = (await respons.json()) as HasilMentah & { error?: string };
  if (data.error) return null;
  return rapikan(data, daftarKecamatan);
}
