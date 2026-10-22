import { kueri } from "@/lib/server/db";
import { penggunaSaatIni } from "@/lib/server/sesi";

// Menampilkan foto laporan yang disimpan di database
export async function GET(_permintaan: Request, { params }: RouteContext<"/api/foto/[id]">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response("Tidak ditemukan", { status: 404 });

  const [foto] = await kueri<{ tipe: string; data: Uint8Array; visibilitas: string; pelapor_id: string | null }>(
    `SELECT f.tipe, f.data, l.visibilitas, l.pelapor_id FROM foto f JOIN laporan l ON l.nomor = f.nomor WHERE f.id = $1`,
    [id],
  );
  if (!foto) return new Response("Tidak ditemukan", { status: 404 });

  if (foto.visibilitas === "privat") {
    const pengguna = await penggunaSaatIni();
    const boleh = pengguna && (pengguna.peran !== "warga" || pengguna.id === foto.pelapor_id);
    if (!boleh) return new Response("Tidak ditemukan", { status: 404 });
  }

  return new Response(new Uint8Array(foto.data), {
    headers: {
      "Content-Type": foto.tipe,
      "Cache-Control": foto.visibilitas === "privat" ? "private, max-age=3600" : "public, max-age=86400, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
