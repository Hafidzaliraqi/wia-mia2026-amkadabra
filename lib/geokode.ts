import { cocokkanWilayah } from "@/lib/wilayah";

// Pencarian alamat gratis dari OpenStreetMap (Nominatim).
// Aturan pakainya: maksimal 1 permintaan per detik, jadi pemanggilan
// di formulir diberi jeda (debounce) dan tidak dipanggil tiap ketikan.

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
  nama: string; // alamat ringkas, misal "Jalan Haji Suit, Kemanggisan"
  lat: number;
  lng: number;
  wilayah: { kotaId: string; kecamatan: string } | null; // null = di luar wilayah layanan
  daerahTerbaca: string; // nama daerah dari peta, untuk pesan "di luar wilayah"
}

function rapikan(h: HasilMentah): HasilAlamat {
  const a = h.address ?? {};
  const cocok = cocokkanWilayah(Object.values(a));
  const jalan = a.road ?? a.pedestrian ?? a.neighbourhood ?? h.display_name.split(", ")[0];
  const sekitar = a.suburb ?? a.village ?? a.quarter ?? a.city_district;
  return {
    id: h.place_id,
    nama: [jalan, sekitar].filter(Boolean).join(", "),
    lat: Number(h.lat),
    lng: Number(h.lon),
    wilayah: cocok ? { kotaId: cocok.kota.id, kecamatan: cocok.kecamatan.nama } : null,
    daerahTerbaca: [a.city_district ?? a.suburb, a.city ?? a.county ?? a.state].filter(Boolean).join(", "),
  };
}

export async function cariAlamat(kata: string, sinyal?: AbortSignal): Promise<HasilAlamat[]> {
  const url = `${DASAR}/search?format=jsonv2&addressdetails=1&limit=5&countrycodes=id&accept-language=id&q=${encodeURIComponent(kata)}`;
  const respons = await fetch(url, { signal: sinyal, headers: { Accept: "application/json" } });
  if (!respons.ok) throw new Error("Pencarian alamat gagal");
  return ((await respons.json()) as HasilMentah[]).map(rapikan);
}

export async function alamatDariTitik(lat: number, lng: number, sinyal?: AbortSignal): Promise<HasilAlamat | null> {
  const url = `${DASAR}/reverse?format=jsonv2&addressdetails=1&zoom=18&accept-language=id&lat=${lat}&lon=${lng}`;
  const respons = await fetch(url, { signal: sinyal, headers: { Accept: "application/json" } });
  if (!respons.ok) return null;
  const data = (await respons.json()) as HasilMentah & { error?: string };
  return data.error ? null : rapikan(data);
}
