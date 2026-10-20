import type { Metadata } from "next";
import { SegeraHadir } from "@/components/segera-hadir";

export const metadata: Metadata = { title: "Buat laporan" };

export default function HalamanLapor() {
  return (
    <SegeraHadir
      judul="Buat laporan"
      isi="Formulir laporan sedang dibangun: tandai lokasi, pilih kategori, ceritakan masalahnya, tambahkan foto, lalu pilih siapa yang boleh melihat laporanmu."
    />
  );
}
