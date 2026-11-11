import "server-only";
import type { Laporan } from "@/lib/types";
import type { ItemKerja } from "@/components/dasbor/daftar-kerja";
import type { Risiko } from "@/lib/server/risiko";
import { apakahTerlambat, hitungStatus, hitungTenggat } from "@/lib/sla";
import { tanggaEskalasi, tingkatSaatIni } from "@/lib/eskalasi";
import { namaKota } from "@/lib/wilayah";
import { formatRelatif, formatSisaWaktu } from "@/lib/waktu";

// Ubah laporan jadi baris antrean kerja di dasbor
export function keItemKerja(laporan: Laporan, tab: string[], risiko?: Risiko[]): ItemKerja {
  const tenggat = hitungTenggat(laporan);
  const tingkat = tingkatSaatIni(laporan);
  const lencana: Risiko[] = tingkat > 0 ? [{ label: `Eskalasi: ${tanggaEskalasi(laporan).at(tingkat)?.peran.toLowerCase()}`, tingkat: "tinggi" }] : [];
  return {
    nomor: laporan.nomor,
    judul: laporan.judul,
    kategoriId: laporan.kategoriId,
    daerah: `${laporan.kecamatan}, ${namaKota(laporan.kotaId)}`,
    status: hitungStatus(laporan),
    terlambat: apakahTerlambat(laporan),
    tenggatTeks: tenggat ? formatSisaWaktu(tenggat.batas).teks : null,
    tenggatMs: tenggat ? new Date(tenggat.batas).getTime() : null,
    dukungan: laporan.dukungan,
    dibuatTeks: formatRelatif(laporan.dibuatPada),
    risiko: lencana.length || risiko ? [...lencana, ...(risiko ?? [])] : undefined,
    tab,
  };
}
