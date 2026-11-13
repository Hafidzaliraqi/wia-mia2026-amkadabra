// Setelah masuk, keluar, atau pindah akun, halaman dimuat ulang penuh.
// Next.js menyimpan halaman yang barusan dibuka secara tersembunyi; tanpa muat ulang,
// tampilan milik akun sebelumnya bisa muncul lagi (misalnya chat yang belum terbaru).
export const KUNCI_PESAN_TOAST = "tuntasin:pesan-toast";

export function pindahHalamanPenuh(tujuan: string, pesan?: string) {
  try {
    if (pesan) sessionStorage.setItem(KUNCI_PESAN_TOAST, pesan);
  } catch {
    // sessionStorage tidak tersedia, pesan dilewati
  }
  window.location.assign(tujuan);
}
