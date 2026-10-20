import type { StatusLaporan } from "@/lib/types";

// Label status dipisah ke file sendiri supaya aman dipakai di komponen client.
export const labelStatus: Record<StatusLaporan, string> = {
  terkirim: "Menunggu verifikasi",
  diteruskan: "Diteruskan ke instansi",
  diproses: "Sedang dikerjakan",
  menunggu_konfirmasi: "Menunggu konfirmasi",
  selesai: "Selesai",
  ditutup_otomatis: "Ditutup otomatis",
  ditolak: "Ditolak",
};
