import "server-only";
import { randomInt } from "node:crypto";
import type { Kueri } from "@/lib/server/db";
import { hashToken } from "@/lib/server/sandi";

export const MASA_BERLAKU_MENIT = 10;
export const JEDA_KIRIM_ULANG_DETIK = 60;
export const MAKS_PERCOBAAN = 5;

export function buatKode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export interface BarisOtp {
  id: string;
  tujuan: "daftar" | "atur_sandi";
  email: string;
  pengguna_id: string | null;
  data: Record<string, string> | null;
  hash_kode: string;
  percobaan: number;
  dikirim_pada: Date;
  kedaluwarsa: Date;
  dipakai_pada: Date | null;
}

export async function simpanOtp(
  kueri: Kueri,
  isi: { tujuan: BarisOtp["tujuan"]; email: string; penggunaId?: string | null; data?: Record<string, string> },
  kode: string,
): Promise<string> {
  // Kode lama untuk email dan keperluan yang sama tidak berlaku lagi
  await kueri("DELETE FROM kode_otp WHERE email = $1 AND tujuan = $2 AND dipakai_pada IS NULL", [isi.email, isi.tujuan]);
  const [baris] = await kueri<{ id: string }>(
    `INSERT INTO kode_otp (tujuan, email, pengguna_id, data, hash_kode, kedaluwarsa)
     VALUES ($1, $2, $3, $4, $5, now() + interval '${MASA_BERLAKU_MENIT} minutes') RETURNING id`,
    [isi.tujuan, isi.email, isi.penggunaId ?? null, isi.data ? JSON.stringify(isi.data) : null, hashToken(kode)],
  );
  return baris.id;
}

export async function ambilOtp(kueri: Kueri, id: string): Promise<BarisOtp | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [baris] = await kueri<BarisOtp & Record<string, unknown>>("SELECT * FROM kode_otp WHERE id = $1", [id]);
  if (!baris) return null;
  const data = typeof baris.data === "string" ? JSON.parse(baris.data) : baris.data;
  return { ...baris, data, dikirim_pada: new Date(baris.dikirim_pada), kedaluwarsa: new Date(baris.kedaluwarsa) };
}

// Periksa kode. Mengembalikan pesan galat, atau null kalau benar.
export async function periksaKode(kueri: Kueri, otp: BarisOtp | null, kode: string): Promise<string | null> {
  if (!otp || otp.dipakai_pada) return "Kode tidak berlaku. Minta kode baru.";
  if (otp.kedaluwarsa.getTime() < Date.now()) return "Kode sudah kedaluwarsa. Minta kode baru.";
  if (otp.percobaan >= MAKS_PERCOBAAN) return "Terlalu banyak percobaan. Minta kode baru.";
  if (hashToken(kode.trim()) !== otp.hash_kode) {
    await kueri("UPDATE kode_otp SET percobaan = percobaan + 1 WHERE id = $1", [otp.id]);
    const sisa = MAKS_PERCOBAAN - otp.percobaan - 1;
    return sisa > 0 ? `Kode salah. Sisa ${sisa} kali percobaan.` : "Terlalu banyak percobaan. Minta kode baru.";
  }
  await kueri("UPDATE kode_otp SET dipakai_pada = now() WHERE id = $1", [otp.id]);
  return null;
}
