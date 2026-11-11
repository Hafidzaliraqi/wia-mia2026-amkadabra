import type { KelompokId } from "@/lib/types";

// Warna setiap kelompok masalah. Kelas Tailwind ditulis lengkap
// supaya ikut terbaca saat build. Semua pasangan teks/latar lolos WCAG AA.
export const warnaKelompok: Record<KelompokId, { kuat: string; muda: string; tile: string; teks: string }> = {
  jalan: { kuat: "#1e48d4", muda: "#e8edfd", tile: "bg-[#e8edfd] text-[#1e48d4]", teks: "text-[#1e48d4]" },
  lingkungan: { kuat: "#0a7446", muda: "#e1f4ea", tile: "bg-[#e1f4ea] text-[#0a7446]", teks: "text-[#0a7446]" },
  fasilitas: { kuat: "#6d28d9", muda: "#f1ebfd", tile: "bg-[#f1ebfd] text-[#6d28d9]", teks: "text-[#6d28d9]" },
  administrasi: { kuat: "#b2410c", muda: "#fdeee3", tile: "bg-[#fdeee3] text-[#b2410c]", teks: "text-[#b2410c]" },
  ketertiban: { kuat: "#be185d", muda: "#fde8f1", tile: "bg-[#fde8f1] text-[#be185d]", teks: "text-[#be185d]" },
  integritas: { kuat: "#0e7490", muda: "#e0f4f8", tile: "bg-[#e0f4f8] text-[#0e7490]", teks: "text-[#0e7490]" },
};
