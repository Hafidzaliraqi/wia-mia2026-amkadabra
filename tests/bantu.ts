import type { Kejadian, Laporan } from "@/lib/types";
import { instansiTujuan } from "@/lib/data/referensi";

// Membuat laporan tiruan untuk pengujian
export function laporanUji(riwayat: Kejadian[], ubah: Partial<Laporan> = {}): Laporan {
  const kotaId = ubah.kotaId ?? "jaksel";
  return {
    nomor: "TSN-2610-0001",
    kategoriId: "jalan-rusak",
    judul: "Jalan berlubang",
    deskripsi: "Lubang di lajur kiri",
    alamat: "Jl. Tebet Raya",
    kotaId,
    kecamatan: "Tebet",
    lat: null,
    lng: null,
    tanggalKejadian: "2026-10-01",
    dibuatPada: riwayat[0]?.waktu ?? "2026-10-05T02:00:00.000Z",
    pelaporId: null,
    namaPelapor: "Warga",
    visibilitas: "publik",
    instansiId: instansiTujuan("jalan-rusak", kotaId).id,
    dukungan: 0,
    adaFotoContoh: false,
    foto: [],
    sorotan: false,
    simulasi: false,
    ...ubah,
    riwayat,
  };
}

export const k = (jenis: Kejadian["jenis"], waktu: string, tambahan: Partial<Kejadian> = {}): Kejadian => ({
  jenis,
  waktu,
  aktor: "Sistem",
  ...tambahan,
});

export const HARI = 86_400_000;
export const selisihHari = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / HARI);
