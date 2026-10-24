// Waktu acuan untuk data simulasi.
// Semua data dummy dihitung relatif terhadap waktu ini supaya tampilan
// selalu sama (enak buat screenshot dan demo).
// Nanti kalau sudah pakai database asli, fungsi sekarang() diganti
// supaya membaca waktu sebenarnya.
export const WAKTU_DEMO = new Date("2026-10-30T10:00:00+07:00");

export function sekarang(): Date {
  return WAKTU_DEMO;
}

export const JAM = 60 * 60 * 1000;
export const HARI = 24 * JAM;
const OFFSET_WIB = 7 * JAM;
const ZONA = "Asia/Jakarta";

// 0 = Minggu, 6 = Sabtu (dihitung di zona WIB)
function hariDalamSeminggu(tanggal: Date): number {
  return new Date(tanggal.getTime() + OFFSET_WIB).getUTCDay();
}

export function adalahHariKerja(tanggal: Date): boolean {
  const hari = hariDalamSeminggu(tanggal);
  return hari !== 0 && hari !== 6;
}

// Libur nasional belum dihitung, cukup Sabtu dan Minggu.
export function tambahHariKerja(mulai: Date, jumlah: number): Date {
  let hasil = new Date(mulai.getTime());
  let sisa = jumlah;
  while (sisa > 0) {
    hasil = new Date(hasil.getTime() + HARI);
    if (adalahHariKerja(hasil)) sisa--;
  }
  return hasil;
}

export function tambahHari(mulai: Date, jumlah: number): Date {
  return new Date(mulai.getTime() + jumlah * HARI);
}

export function tambahJam(mulai: Date, jumlah: number): Date {
  return new Date(mulai.getTime() + jumlah * JAM);
}

const fmtTanggal = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: ZONA,
});

const fmtTanggalJam = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: ZONA,
});

const fmtHariTanggalJam = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: ZONA,
});

const fmtBulan = new Intl.DateTimeFormat("id-ID", {
  month: "long",
  year: "numeric",
  timeZone: ZONA,
});

export function formatTanggal(tanggal: Date | string): string {
  return fmtTanggal.format(new Date(tanggal));
}

export function formatTanggalJam(tanggal: Date | string): string {
  return fmtTanggalJam.format(new Date(tanggal));
}

export function formatHariTanggalJam(tanggal: Date | string): string {
  return fmtHariTanggalJam.format(new Date(tanggal));
}

export function formatBulan(tanggal: Date | string): string {
  return fmtBulan.format(new Date(tanggal));
}

// "baru saja", "3 jam lalu", "2 hari lalu", lalu tanggal biasa
export function formatRelatif(tanggal: Date | string): string {
  const selisih = sekarang().getTime() - new Date(tanggal).getTime();
  if (selisih < JAM) return "baru saja";
  if (selisih < HARI) return `${Math.floor(selisih / JAM)} jam lalu`;
  if (selisih < 7 * HARI) return `${Math.floor(selisih / HARI)} hari lalu`;
  return formatTanggal(tanggal);
}

// "Sisa 2 hari 4 jam" atau "Lewat 1 hari"
export function formatSisaWaktu(batas: Date | string): {
  teks: string;
  lewat: boolean;
} {
  const selisih = new Date(batas).getTime() - sekarang().getTime();
  const lewat = selisih < 0;
  const mutlak = Math.abs(selisih);
  const hari = Math.floor(mutlak / HARI);
  const jam = Math.floor((mutlak % HARI) / JAM);

  let durasi: string;
  if (hari === 0) durasi = `${Math.max(jam, 1)} jam`;
  else if (jam === 0 || hari >= 7) durasi = `${hari} hari`;
  else durasi = `${hari} hari ${jam} jam`;

  return { teks: lewat ? `Lewat ${durasi}` : `Sisa ${durasi}`, lewat };
}
