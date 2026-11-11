import { connection } from "next/server";
import { ambilSemuaLaporan } from "@/lib/server/laporan";
import { cariInstansi, cariKategori, daftarKelompok } from "@/lib/data/referensi";
import { apakahTerlambat, hitungStatus } from "@/lib/sla";
import { tingkatSaatIni } from "@/lib/eskalasi";
import { namaKota } from "@/lib/wilayah";

// Data terbuka: semua laporan publik dalam format CSV (tanpa identitas pelapor)
export async function GET() {
  await connection();
  const laporan = (await ambilSemuaLaporan()).filter((l) => l.visibilitas !== "privat");
  const sel = (v: unknown) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const kolom = ["nomor", "judul", "jenis_masalah", "kelompok", "kota", "kecamatan", "instansi", "status", "dibuat", "ditandai_selesai", "lewat_batas", "tingkat_eskalasi", "dukungan"];
  const baris = laporan.map((l) => {
    const kategori = cariKategori(l.kategoriId);
    const selesai = [...l.riwayat].reverse().find((k) => k.jenis === "ditandai_selesai")?.waktu ?? "";
    return [
      l.nomor,
      l.judul,
      kategori.nama,
      daftarKelompok.find((g) => g.id === kategori.kelompok)?.nama ?? "",
      namaKota(l.kotaId),
      l.kecamatan,
      cariInstansi(l.instansiId).nama,
      hitungStatus(l),
      l.dibuatPada,
      selesai,
      apakahTerlambat(l) ? "ya" : "tidak",
      tingkatSaatIni(l),
      l.dukungan,
    ]
      .map(sel)
      .join(",");
  });
  const tanggal = new Date().toISOString().slice(0, 10);
  return new Response("\uFEFF" + [kolom.join(","), ...baris].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="tuntasin-laporan-${tanggal}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
