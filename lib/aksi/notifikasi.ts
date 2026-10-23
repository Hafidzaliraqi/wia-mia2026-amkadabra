"use server";

import { refresh } from "next/cache";
import { kueri } from "@/lib/server/db";
import { penggunaSaatIni } from "@/lib/server/sesi";

export async function tandaiNotifikasiDibaca(id?: number) {
  const pengguna = await penggunaSaatIni();
  if (!pengguna) return { ok: false as const };
  if (id) await kueri("UPDATE notifikasi SET dibaca = true WHERE id = $1 AND pengguna_id = $2", [id, pengguna.id]);
  else await kueri("UPDATE notifikasi SET dibaca = true WHERE pengguna_id = $1", [pengguna.id]);
  refresh();
  return { ok: true as const };
}
