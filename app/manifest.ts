import type { MetadataRoute } from "next";
import { situs } from "@/lib/site";

// Supaya bisa "Tambahkan ke layar utama" di HP dan terbuka seperti aplikasi
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: situs.nama,
    short_name: situs.nama,
    description: situs.deskripsi,
    start_url: "/",
    display: "standalone",
    background_color: "#f3f5f7",
    theme_color: "#1f4fa8",
    lang: "id",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
