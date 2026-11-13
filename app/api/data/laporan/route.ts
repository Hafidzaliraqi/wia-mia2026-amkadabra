import { connection } from "next/server";
import { ambilSemuaLaporan } from "@/lib/server/laporan";
import { cariInstansi, cariKategori, daftarKelompok } from "@/lib/data/referensi";
import { apakahTerlambat, hitungStatus } from "@/lib/sla";
import { tingkatSaatIni } from "@/lib/eskalasi";
import { namaKota } from "@/lib/wilayah";

// ================================================================
// DATA TERBUKA: laporan publik tanpa identitas pelapor.
// GET /api/data/laporan                → CSV
// GET /api/data/laporan?format=json    → JSON
// Filter opsional: kota, status, kelompok
// ================================================================
export async function GET(permintaan: Request) {
  await connection();
  const p = new URL(permintaan.url).searchParams;
  const kota = p.get("kota");
  const status = p.get("status");
  const kelompok = p.get("kelompok");

  const baris = (await ambilSemuaLaporan())
    .filter((l) => l.visibilitas !== "privat")
    .filter((l) => !kota || l.kotaId === kota)
    .filter((l) => !status || hitungStatus(l) === status)
    .filter((l) => !kelompok || cariKategori(l.kategoriId).kelompok === kelompok)
    .map((l) => {
      const kategori = cariKategori(l.kategoriId);
      return {
        nomor: l.nomor,
        judul: l.judul,
        jenis_masalah: kategori.nama,
        kelompok: daftarKelompok.find((g) => g.id === kategori.kelompok)?.nama ?? "",
        kota: namaKota(l.kotaId),
        kecamatan: l.kecamatan,
        instansi: cariInstansi(l.instansiId).nama,
        status: hitungStatus(l),
        dibuat: l.dibuatPada,
        ditandai_selesai: [...l.riwayat].reverse().find((k) => k.jenis === "ditandai_selesai")?.waktu ?? null,
        lewat_batas: apakahTerlambat(l),
        tingkat_eskalasi: tingkatSaatIni(l),
        dukungan: l.dukungan,
      };
    });

  if (p.get("format") === "json") {
    return Response.json(
      { sumber: "Tuntasin", diperbarui: new Date().toISOString(), jumlah: baris.length, data: baris },
      { headers: { "Cache-Control": "no-store", "Access-Control-Allow-Origin": "*" } },
    );
  }

  const kolom = Object.keys(baris[0] ?? { nomor: "" });
  const sel = (v: unknown) => {
    const s = v === true ? "ya" : v === false ? "tidak" : String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const isi = [kolom.join(","), ...baris.map((b) => Object.values(b).map(sel).join(","))].join("\n");
  return new Response("\uFEFF" + isi, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="tuntasin-laporan-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
