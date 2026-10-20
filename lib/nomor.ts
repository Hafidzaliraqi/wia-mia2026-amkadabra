// Dipisah dari lib/data supaya bisa dipakai di komponen client
// tanpa ikut membawa semua data laporan ke browser.

// "tsn 2610 0042" atau "tsn-2610-0042" jadi "TSN-2610-0042"
export function normalisasiNomor(masukan: string): string {
  let teks = masukan;
  try {
    teks = decodeURIComponent(masukan);
  } catch {
    // biarkan apa adanya kalau bukan teks URL yang valid
  }
  const bersih = teks.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const cocok = bersih.match(/^([A-Z]+)(\d{4})(\d{1,4})$/);
  if (!cocok) return bersih;
  return `${cocok[1]}-${cocok[2]}-${cocok[3].padStart(4, "0")}`;
}
