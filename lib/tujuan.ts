// Alamat tujuan setelah masuk/daftar, misalnya ?lanjut=/lapor
// Hanya izinkan alamat di dalam situs sendiri supaya tidak bisa
// dipakai untuk mengarahkan orang ke situs lain.
export function tujuanAman(lanjut: string | null, cadangan = "/") {
  if (!lanjut || !lanjut.startsWith("/") || lanjut.startsWith("//")) return cadangan;
  return lanjut;
}
