import "server-only";
import type { Laporan } from "@/lib/types";
import type { LangkahDemo } from "@/components/panel-demo-laporan";
import { kueri } from "@/lib/server/db";
import { cariInstansi } from "@/lib/data/referensi";
import { hitungStatus } from "@/lib/sla";

// Langkah berikutnya dalam alur laporan untuk mode demo, atau null kalau tidak ada
export async function langkahDemo(laporan: Laporan): Promise<LangkahDemo | null> {
  if (process.env.MODE_DEMO === "0") return null;
  const status = hitungStatus(laporan);
  const nomor = laporan.nomor;
  if (status === "terkirim") {
    return { peran: "admin", label: "Verifikasi sebagai admin", tujuan: `/admin/laporan/${nomor}`, keterangan: "Laporan ini menunggu verifikasi. Lanjutkan alurnya dari sisi admin." };
  }
  if (status === "diteruskan" || status === "diproses") {
    const instansi = cariInstansi(laporan.instansiId);
    return {
      peran: "petugas",
      instansiId: instansi.id,
      label: `Tangani sebagai petugas ${instansi.singkatan}`,
      tujuan: `/petugas/laporan/${nomor}`,
      keterangan: `Laporan ini ditangani ${instansi.nama}. Lanjutkan alurnya dari sisi petugas instansi tersebut.`,
    };
  }
  if (status === "menunggu_konfirmasi" && laporan.pelaporId) {
    const [pelapor] = await kueri<{ email: string }>("SELECT email FROM pengguna WHERE id = $1", [laporan.pelaporId]);
    if (pelapor?.email === "warga@demo.id") {
      return { peran: "warga", label: "Konfirmasi sebagai pelapor", tujuan: `/laporan/${nomor}#konfirmasi`, keterangan: "Petugas sudah menandai selesai. Konfirmasi hasilnya dari sisi pelapor (akun demo warga)." };
    }
  }
  return null;
}
