import type { Metadata } from "next";
import { SegeraHadir } from "@/components/segera-hadir";

export const metadata: Metadata = { title: "Akun" };

export default function HalamanAkun() {
  return (
    <SegeraHadir
      judul="Masuk atau daftar"
      isi="Halaman masuk dengan email atau nomor HP yang diverifikasi kode OTP sedang dibangun."
    />
  );
}
