import type { Metadata } from "next";
import { Suspense } from "react";
import { KepalaHalaman } from "@/components/kepala-halaman";
import { connection } from "next/server";
import { ambilSemuaLaporan, laporanPublik, ringkas } from "@/lib/server/laporan";
import { JelajahLaporan } from "@/components/jelajah-laporan";

export const metadata: Metadata = { title: "Jelajah laporan" };

export default function HalamanJelajah() {
  return (
    <>
    <KepalaHalaman
      label="Laporan warga"
      judul="Jelajah laporan"
      deskripsi="Laporan dari 10 kota dan kabupaten beserta status dan batas waktunya. Laporan privat tidak ditampilkan."
    />
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
      <div>
        <Suspense fallback={<KerangkaDaftar />}>
          <DaftarLaporan />
        </Suspense>
      </div>
    </div>
    </>
  );
}

async function DaftarLaporan() {
  await connection();
  const laporan = laporanPublik(await ambilSemuaLaporan()).map(ringkas);
  return <JelajahLaporan laporan={laporan} />;
}

function KerangkaDaftar() {
  return (
    <div className="animate-pulse space-y-4 motion-reduce:animate-none" aria-label="Memuat daftar laporan">
      <div className="h-36 rounded-2xl border border-garis bg-white" />
      <div className="h-96 rounded-2xl border border-garis bg-white" />
    </div>
  );
}
