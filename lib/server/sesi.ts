import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import type { Peran } from "@/lib/types";
import { kueri } from "@/lib/server/db";
import { hashToken, tokenAcak } from "@/lib/server/sandi";

const NAMA_COOKIE = "tuntasin_sesi";
const UMUR_SESI_HARI = 30;

export interface Pengguna {
  id: string;
  nama: string;
  email: string;
  hp: string;
  peran: Peran;
  instansiId: string | null;
  laporanPalsu: number;
  notifEmail: boolean;
  dibuatPada: string;
}

export function barisKePengguna(b: Record<string, unknown>): Pengguna {
  return {
    id: String(b.id),
    nama: String(b.nama),
    email: String(b.email),
    hp: String(b.hp),
    peran: b.peran as Peran,
    instansiId: (b.instansi_id as string | null) ?? null,
    laporanPalsu: Number(b.laporan_palsu ?? 0),
    notifEmail: Boolean(b.notif_email),
    dibuatPada: new Date(b.dibuat_pada as string).toISOString(),
  };
}

export async function buatSesi(penggunaId: string) {
  const token = tokenAcak();
  const kedaluwarsa = new Date(Date.now() + UMUR_SESI_HARI * 24 * 60 * 60 * 1000);
  await kueri("INSERT INTO sesi (hash_token, pengguna_id, kedaluwarsa) VALUES ($1, $2, $3)", [
    hashToken(token),
    penggunaId,
    kedaluwarsa,
  ]);
  (await cookies()).set(NAMA_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: kedaluwarsa,
  });
}

export async function hapusSesi() {
  const toples = await cookies();
  const token = toples.get(NAMA_COOKIE)?.value;
  if (token) await kueri("DELETE FROM sesi WHERE hash_token = $1", [hashToken(token)]);
  toples.delete(NAMA_COOKIE);
}

// Pengguna yang sedang masuk (null kalau belum). cache() supaya dalam satu
// permintaan database cuma ditanya sekali walau dipanggil di banyak komponen.
export const penggunaSaatIni = cache(async (): Promise<Pengguna | null> => {
  const token = (await cookies()).get(NAMA_COOKIE)?.value;
  if (!token) return null;
  const [baris] = await kueri(
    `SELECT p.* FROM sesi s JOIN pengguna p ON p.id = s.pengguna_id
     WHERE s.hash_token = $1 AND s.kedaluwarsa > now()`,
    [hashToken(token)],
  );
  return baris ? barisKePengguna(baris) : null;
});
