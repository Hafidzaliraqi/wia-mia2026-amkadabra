import { connection } from "next/server";
import { kueri } from "@/lib/server/db";
import { emailSiap } from "@/lib/server/email";

// Cek cepat setelah deploy: buka /api/status di browser.
// Tidak menampilkan isi rahasia, hanya apakah sudah diatur.
export async function GET() {
  await connection();
  let database: string;
  let laporan: number | null = null;
  try {
    const [baris] = await kueri<{ jumlah: number }>("SELECT count(*)::int AS jumlah FROM laporan");
    laporan = baris.jumlah;
    database = "terhubung";
  } catch (galat) {
    database = `gagal: ${galat instanceof Error ? galat.message : "tidak diketahui"}`;
  }
  return Response.json({
    database,
    jenisDatabase: process.env.DATABASE_URL ? "PostgreSQL online" : "PGlite lokal",
    jumlahLaporan: laporan,
    email: emailSiap() ? "siap" : "belum diatur (SMTP_HOST, SMTP_USER, SMTP_PASS)",
    whatsapp: process.env.FONNTE_TOKEN ? "siap" : "belum diatur (FONNTE_TOKEN, opsional)",
    kunciRahasia: process.env.RAHASIA_APLIKASI ? "sudah diatur" : "BELUM DIATUR",
    alamatSitus: process.env.ALAMAT_SITUS ?? "belum diatur",
  });
}
