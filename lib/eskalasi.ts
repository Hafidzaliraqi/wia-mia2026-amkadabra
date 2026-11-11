import type { Laporan } from "@/lib/types";
import { hitungTenggat } from "@/lib/sla";
import { tambahHariKerja } from "@/lib/waktu";
import { cariInstansi } from "@/lib/data/referensi";
import { namaKota } from "@/lib/wilayah";

// ================================================================
// ESKALASI BERJENJANG
// Tingkat 0: petugas instansi (normal)
// Tingkat 1: pimpinan instansi, begitu tenggat terlewati
// Tingkat 2: inspektorat daerah, 3 hari kerja setelah tingkat 1
// Tingkat 3: kepala daerah, 5 hari kerja setelah tingkat 2
// Warga yang menyatakan "belum beres" 2 kali juga menaikkan tingkat.
// ================================================================

export const JEDA_NAIK_HARI_KERJA = [3, 5] as const;
export const BATAS_PENOLAKAN_WARGA = 2;

export interface AnakTangga {
  tingkat: number;
  nama: string;
  peran: string;
}

function kepalaDaerah(kotaId: string) {
  const nama = namaKota(kotaId);
  if (nama.startsWith("Kabupaten ")) return `Bupati ${nama.slice(10)}`;
  if (nama.startsWith("Kota ")) return `Wali Kota ${nama.slice(5)}`;
  return `Wali Kota ${nama}`;
}

export function tanggaEskalasi(laporan: Pick<Laporan, "instansiId" | "kotaId">): AnakTangga[] {
  const instansi = cariInstansi(laporan.instansiId);
  const daerah = namaKota(laporan.kotaId).replace(/^(Kota|Kabupaten) /, "");
  const pengawas = instansi.nama.startsWith("Inspektorat") ? `Sekretariat Daerah ${daerah}` : `Inspektorat ${daerah}`;
  return [
    { tingkat: 0, nama: instansi.nama, peran: "Petugas instansi" },
    { tingkat: 1, nama: `Kepala ${instansi.nama}`, peran: "Pimpinan instansi" },
    { tingkat: 2, nama: pengawas, peran: "Pengawas internal" },
    { tingkat: 3, nama: kepalaDaerah(laporan.kotaId), peran: "Kepala daerah" },
  ];
}

// Eskalasi sistem pada tahap yang sedang berjalan (bukan teguran manual admin)
function eskalasiTahapIni(laporan: Laporan) {
  const tenggat = hitungTenggat(laporan);
  if (!tenggat || !tenggat.tanggungJawabPetugas) return null;
  const daftar = laporan.riwayat.filter((k) => k.jenis === "eskalasi" && k.aktor === "Sistem" && k.waktu >= tenggat.mulai);
  let tingkat = 0;
  let waktu: string | null = null;
  for (const k of daftar) {
    const t = Math.min(3, k.tingkat ?? 1);
    if (t >= tingkat) {
      tingkat = t;
      waktu = k.waktu;
    }
  }
  return { tenggat, tingkat, waktu };
}

export function tingkatSaatIni(laporan: Laporan): number {
  return eskalasiTahapIni(laporan)?.tingkat ?? 0;
}

// Kapan laporan naik ke tingkat berikutnya kalau tidak ada tindak lanjut
export function eskalasiBerikutnya(laporan: Laporan): { tingkat: number; nama: string; waktu: string } | null {
  const info = eskalasiTahapIni(laporan);
  if (!info || info.tingkat >= 3) return null;
  const tangga = tanggaEskalasi(laporan);
  const waktu =
    info.tingkat === 0 || !info.waktu
      ? new Date(info.tenggat.batas)
      : tambahHariKerja(new Date(info.waktu), JEDA_NAIK_HARI_KERJA[info.tingkat - 1]);
  const berikut = tangga[info.tingkat + 1];
  return { tingkat: berikut.tingkat, nama: berikut.nama, waktu: waktu.toISOString() };
}

// Eskalasi yang sudah jatuh tempo tapi belum tercatat (dijalankan tugas otomatis)
export function eskalasiJatuhTempo(laporan: Laporan, kini: Date): { tingkat: number; waktu: Date; catatan: string }[] {
  const info = eskalasiTahapIni(laporan);
  if (!info) return [];
  const tangga = tanggaEskalasi(laporan);
  const hasil: { tingkat: number; waktu: Date; catatan: string }[] = [];
  let tingkat = info.tingkat;
  let jatuh =
    tingkat === 0 || !info.waktu ? new Date(info.tenggat.batas) : tambahHariKerja(new Date(info.waktu), JEDA_NAIK_HARI_KERJA[tingkat - 1]);
  while (tingkat < 3 && jatuh <= kini) {
    tingkat++;
    const awal = tingkat === 1 ? `Melewati batas ${info.tenggat.tahap.toLowerCase()}.` : "Belum ada tindak lanjut setelah eskalasi sebelumnya.";
    hasil.push({ tingkat, waktu: jatuh, catatan: `${awal} Dieskalasi ke ${tangga[tingkat].nama}.` });
    if (tingkat < 3) jatuh = tambahHariKerja(jatuh, JEDA_NAIK_HARI_KERJA[tingkat - 1]);
  }
  return hasil;
}
