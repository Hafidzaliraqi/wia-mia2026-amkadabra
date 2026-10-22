// Pengolahan foto di browser sebelum diunggah:
// 1. Baca waktu pengambilan dan lokasi GPS dari data EXIF (untuk cek laporan palsu)
// 2. Perkecil ukuran supaya cepat diunggah dan hemat penyimpanan

export interface FotoSiap {
  berkas: File;
  pratinjau: string;
  diambilPada: string | null;
  lat: number | null;
  lng: number | null;
}

const SISI_MAKS = 1600;

export async function siapkanFoto(asli: File): Promise<FotoSiap> {
  let diambilPada: string | null = null;
  let lat: number | null = null;
  let lng: number | null = null;
  try {
    const exifr = (await import("exifr")).default;
    const data = await exifr.parse(asli, { pick: ["DateTimeOriginal", "CreateDate", "latitude", "longitude"], gps: true });
    const waktu = data?.DateTimeOriginal ?? data?.CreateDate;
    if (waktu instanceof Date && !Number.isNaN(waktu.getTime())) diambilPada = waktu.toISOString();
    if (typeof data?.latitude === "number" && typeof data?.longitude === "number") {
      lat = data.latitude;
      lng = data.longitude;
    }
  } catch {
    // Foto tanpa EXIF (misal dari WhatsApp) tetap boleh
  }

  const gambar = await createImageBitmap(asli);
  const skala = Math.min(1, SISI_MAKS / Math.max(gambar.width, gambar.height));
  const kanvas = document.createElement("canvas");
  kanvas.width = Math.round(gambar.width * skala);
  kanvas.height = Math.round(gambar.height * skala);
  kanvas.getContext("2d")!.drawImage(gambar, 0, 0, kanvas.width, kanvas.height);
  gambar.close();
  const blob = await new Promise<Blob>((selesai, gagal) =>
    kanvas.toBlob((b) => (b ? selesai(b) : gagal(new Error("Foto tidak bisa diproses"))), "image/jpeg", 0.82),
  );
  const berkas = new File([blob], asli.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  return { berkas, pratinjau: URL.createObjectURL(blob), diambilPada, lat, lng };
}
