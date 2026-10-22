import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { ambilSemuaLaporan, laporanPublik, ringkas } from "@/lib/server/laporan";
import { JelajahLaporan } from "@/components/jelajah-laporan";

export const metadata: Metadata = { title: "Jelajah laporan" };

export default function HalamanJelajah() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Jelajah laporan</h1>
      <p className="mt-2 max-w-2xl text-tinta-redup">
        Laporan warga dari berbagai daerah beserta status dan batas waktunya. Laporan yang dibuat privat oleh pelapor
        tidak ditampilkan.
      </p>
      <div className="mt-8">
        <Suspense fallback={<KerangkaDaftar />}>
          <DaftarLaporan />
        </Suspense>
      </div>
    </div>
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
