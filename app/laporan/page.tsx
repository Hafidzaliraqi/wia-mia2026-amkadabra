import type { Metadata } from "next";
import { ambilLaporanPublik, ringkas } from "@/lib/data";
import { daftarKategori, daftarKecamatan } from "@/lib/data/referensi";
import { JelajahLaporan } from "@/components/jelajah-laporan";

export const metadata: Metadata = { title: "Jelajah laporan" };

export default function HalamanJelajah() {
  const laporan = ambilLaporanPublik().map(ringkas);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Jelajah laporan</h1>
      <p className="mt-2 max-w-2xl text-tinta-redup">
        Semua laporan warga beserta status dan batas waktunya. Laporan yang dibuat privat oleh
        pelapor tidak ditampilkan di sini.
      </p>
      <div className="mt-8">
        <JelajahLaporan
          laporan={laporan}
          kategori={daftarKategori.map(({ id, nama }) => ({ id, nama }))}
          kecamatan={daftarKecamatan}
        />
      </div>
    </div>
  );
}
