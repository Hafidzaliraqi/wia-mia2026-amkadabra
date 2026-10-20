import type { Metadata } from "next";
import { SegeraHadir } from "@/components/segera-hadir";

export const metadata: Metadata = { title: "Riwayat" };

export default function HalamanRiwayat() {
  return (
    <SegeraHadir
      judul="Riwayat laporan"
      isi="Di sini nanti muncul laporan yang kamu buat dan laporan yang kamu dukung, lengkap dengan laporan yang menunggu konfirmasimu."
    />
  );
}
