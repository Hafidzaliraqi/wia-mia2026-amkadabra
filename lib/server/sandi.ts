import "server-only";
import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";

// Hash kata sandi pakai scrypt bawaan Node (tidak perlu library tambahan)
function scryptAsync(sandi: string, garam: Buffer, panjang: number): Promise<Buffer> {
  return new Promise((selesai, gagal) =>
    scrypt(sandi, garam, panjang, { N: 16384, r: 8, p: 1 }, (galat, hasil) => (galat ? gagal(galat) : selesai(hasil))),
  );
}

export async function hashSandi(sandi: string): Promise<string> {
  const garam = randomBytes(16);
  const hasil = await scryptAsync(sandi, garam, 64);
  return `scrypt$${garam.toString("base64")}$${hasil.toString("base64")}`;
}

export async function cocokSandi(sandi: string, tersimpan: string): Promise<boolean> {
  const [skema, garam, hash] = tersimpan.split("$");
  if (skema !== "scrypt" || !garam || !hash) return false;
  const harapan = Buffer.from(hash, "base64");
  const hasil = await scryptAsync(sandi, Buffer.from(garam, "base64"), harapan.length);
  return hasil.length === harapan.length && timingSafeEqual(hasil, harapan);
}

// Hash cepat untuk token sesi dan kode OTP (nilainya acak, jadi aman pakai SHA-256)
export function hashToken(teks: string): string {
  const rahasia = process.env.RAHASIA_APLIKASI;
  if (!rahasia && process.env.NODE_ENV === "production") {
    throw new Error("RAHASIA_APLIKASI wajib diisi di environment variable saat website di-deploy.");
  }
  return createHash("sha256").update(`${rahasia ?? "rahasia-pengembangan"}:${teks}`).digest("hex");
}

export function tokenAcak(): string {
  return randomBytes(32).toString("base64url");
}
