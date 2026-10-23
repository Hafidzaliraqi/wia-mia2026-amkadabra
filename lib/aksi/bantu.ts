import "server-only";
import type { Peran } from "@/lib/types";
import { penggunaSaatIni, type Pengguna } from "@/lib/server/sesi";

export type HasilAksi<T = object> = ({ ok: true } & T) | { ok: false; pesan: string; galat?: Record<string, string> };

export function gagal(pesan: string, galat?: Record<string, string>): { ok: false; pesan: string; galat?: Record<string, string> } {
  return { ok: false, pesan, galat };
}

export async function wajibMasuk(peran?: Peran[]): Promise<Pengguna | { ok: false; pesan: string }> {
  const pengguna = await penggunaSaatIni();
  if (!pengguna) return gagal("Sesi kamu sudah berakhir. Silakan masuk lagi.");
  if (peran && !peran.includes(pengguna.peran)) return gagal("Kamu tidak punya akses untuk tindakan ini.");
  return pengguna;
}

export function nomorValid(nomor: unknown): nomor is string {
  return typeof nomor === "string" && /^[A-Z]+-\d{4}-\d{4}$/.test(nomor);
}

export function teks(nilai: FormDataEntryValue | null | undefined): string {
  return typeof nilai === "string" ? nilai.trim() : "";
}
