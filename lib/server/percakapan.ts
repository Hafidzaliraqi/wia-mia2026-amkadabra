import "server-only";
import type { Laporan } from "@/lib/types";
import type { PesanPercakapan } from "@/components/percakapan";
import { cariInstansi } from "@/lib/data/referensi";
import { formatRelatif } from "@/lib/waktu";

// Pesan petugas (balasan) dan warga (tanggapan) dalam urutan waktu
export function susunPercakapan(laporan: Laporan, penggunaId: string | null, sudut: "warga" | "petugas"): PesanPercakapan[] {
  return laporan.riwayat
    .filter((k) => k.jenis === "balasan" || k.jenis === "tanggapan")
    .map((k, i) => {
      const dariPetugas = k.jenis === "balasan";
      const pelapor = k.aktor === "Pelapor";
      return {
        kunci: `${k.waktu}-${i}`,
        dari: dariPetugas ? ("petugas" as const) : ("warga" as const),
        nama: dariPetugas
          ? k.aktor
          : pelapor
            ? laporan.visibilitas === "publik" || sudut === "petugas"
              ? `${laporan.namaPelapor} (pelapor)`
              : "Pelapor"
            : "Warga pendukung",
        isi: k.catatan ?? "",
        waktuTeks: formatRelatif(k.waktu),
        milikSaya: sudut === "petugas" ? dariPetugas : penggunaId !== null && k.aktorId === penggunaId,
      };
    });
}

export function namaInstansiSingkat(id: string) {
  return cariInstansi(id).singkatan;
}
