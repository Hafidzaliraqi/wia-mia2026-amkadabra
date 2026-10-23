// Aturan isian yang dipakai di formulir (client) dan diperiksa ulang di server.

export function emailValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

// "+62 812-3456-7890" atau "0812 3456 7890" jadi "081234567890"
export function rapikanHp(hp: string): string {
  const angka = hp.replace(/\D/g, "");
  return angka.startsWith("62") ? `0${angka.slice(2)}` : angka;
}

export function hpValid(hp: string): boolean {
  return /^08\d{8,11}$/.test(rapikanHp(hp));
}

export const SANDI_MINIMAL = 8;

export function periksaSandi(sandi: string): string | null {
  if (sandi.length < SANDI_MINIMAL) return `Kata sandi minimal ${SANDI_MINIMAL} karakter.`;
  if (!/[A-Za-z]/.test(sandi) || !/\d/.test(sandi)) return "Kata sandi harus berisi huruf dan angka.";
  return null;
}
