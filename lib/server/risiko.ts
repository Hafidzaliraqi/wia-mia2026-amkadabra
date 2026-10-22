import "server-only";
import type { Laporan } from "@/lib/types";
import { kueri } from "@/lib/server/db";
import { jarakKm } from "@/lib/wilayah";
import { HARI } from "@/lib/waktu";

export interface Risiko {
  label: string;
  tingkat: "tinggi" | "sedang" | "info";
}

// Tanda-tanda yang perlu dicek admin sebelum memverifikasi laporan
export async function hitungRisiko(daftar: Laporan[], tandaTidakSesuai: Map<string, number>): Promise<Map<string, Risiko[]>> {
  const idPelapor = [...new Set(daftar.map((l) => l.pelaporId).filter((id): id is string => id !== null))];
  const pelapor = new Map<string, { dibuat: Date; palsu: number; ditolak: number }>();
  if (idPelapor.length) {
    const baris = await kueri<{ id: string; dibuat_pada: Date; laporan_palsu: number; ditolak: number }>(
      `SELECT p.id, p.dibuat_pada, p.laporan_palsu,
        (SELECT count(*)::int FROM laporan l JOIN kejadian k ON k.nomor = l.nomor AND k.jenis = 'ditolak' WHERE l.pelapor_id = p.id) AS ditolak
       FROM pengguna p WHERE p.id = ANY($1::uuid[])`,
      [idPelapor],
    );
    for (const b of baris) pelapor.set(b.id, { dibuat: new Date(b.dibuat_pada), palsu: b.laporan_palsu, ditolak: b.ditolak });
  }

  const hasil = new Map<string, Risiko[]>();
  for (const l of daftar) {
    const r: Risiko[] = [];
    const fotoAwal = l.foto.filter((f) => f.jenis === "awal");
    if (fotoAwal.length === 0 && !l.adaFotoContoh) r.push({ label: "Tanpa foto", tingkat: "sedang" });
    const dibuat = new Date(l.dibuatPada).getTime();
    if (fotoAwal.some((f) => f.diambilPada && dibuat - new Date(f.diambilPada).getTime() > 7 * HARI)) {
      r.push({ label: "Foto diambil lebih dari 7 hari sebelum laporan", tingkat: "tinggi" });
    }
    if (
      l.lat !== null &&
      l.lng !== null &&
      fotoAwal.some((f) => f.lat !== null && f.lng !== null && jarakKm({ lat: l.lat!, lng: l.lng! }, { lat: f.lat, lng: f.lng }) > 1)
    ) {
      r.push({ label: "Lokasi foto jauh dari titik laporan", tingkat: "tinggi" });
    }
    if (fotoAwal.length > 0 && fotoAwal.every((f) => !f.diambilPada)) r.push({ label: "Foto tanpa data waktu", tingkat: "info" });
    const p = l.pelaporId ? pelapor.get(l.pelaporId) : undefined;
    if (p && dibuat - p.dibuat.getTime() < HARI) r.push({ label: "Akun baru (kurang dari 1 hari)", tingkat: "info" });
    if (p && p.palsu > 0) r.push({ label: `Pernah ${p.palsu}× ditandai laporan palsu`, tingkat: "tinggi" });
    else if (p && p.ditolak >= 2) r.push({ label: `${p.ditolak} laporan sebelumnya ditolak`, tingkat: "sedang" });
    const tanda = tandaTidakSesuai.get(l.nomor) ?? 0;
    if (tanda > 0) r.push({ label: `Ditandai tidak sesuai oleh ${tanda} warga`, tingkat: "sedang" });
    hasil.set(l.nomor, r);
  }
  return hasil;
}
