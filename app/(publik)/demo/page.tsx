import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { ArrowUpRight } from "lucide-react";
import { kueri } from "@/lib/server/db";
import { ambilLaporan } from "@/lib/server/laporan";
import { hitungStatus } from "@/lib/sla";
import { tingkatSaatIni } from "@/lib/eskalasi";
import { normalisasiNomor } from "@/lib/nomor";
import { namaKota } from "@/lib/wilayah";
import { LangkahStatus } from "@/components/langkah-status";
import { StatusBadge } from "@/components/status-badge";
import { TanggaEskalasi } from "@/components/tangga-eskalasi";
import { PanelSimulasi } from "@/components/simulasi/panel-simulasi";
import { LogIntegrasi } from "@/components/simulasi/log-integrasi";
import { KepalaHalaman } from "@/components/kepala-halaman";

export const metadata: Metadata = { title: "Simulasi alur" };

export default function HalamanSimulasi({ searchParams }: PageProps<"/demo">) {
  return (
    <>
    <KepalaHalaman
      label="Mode presentasi"
      judul="Simulasi alur lengkap"
      deskripsi="Jalankan perjalanan satu laporan dari warga sampai tuntas, satu klik per tahap. Setiap perubahan langsung tampil di halaman publik dan tercatat di log integrasi."
    />
    <div className="mx-auto max-w-6xl px-4 pb-8 sm:px-6 lg:pb-12">
      <Suspense fallback={<div className="mt-8 h-96 animate-pulse rounded-3xl bg-white motion-reduce:animate-none" />}>
        <IsiSimulasi searchParams={searchParams} />
      </Suspense>
    </div>
    </>
  );
}

async function IsiSimulasi({ searchParams }: Pick<PageProps<"/demo">, "searchParams">) {
  await connection();
  const { nomor } = await searchParams;
  let laporan = null;
  if (typeof nomor === "string") {
    const n = normalisasiNomor(nomor);
    const [baris] = await kueri<{ simulasi: boolean }>("SELECT simulasi FROM laporan WHERE nomor = $1", [n]);
    if (baris?.simulasi) laporan = await ambilLaporan(n);
  }
  const status = laporan ? hitungStatus(laporan) : null;

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start">
      <PanelSimulasi nomor={laporan?.nomor ?? null} status={status} tingkat={laporan ? tingkatSaatIni(laporan) : 0} />
      {laporan && status ? (
        <div className="space-y-6">
          <section className="rounded-3xl border border-garis bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="kode text-lg font-bold">{laporan.nomor}</p>
              <StatusBadge status={status} />
            </div>
            <h2 className="mt-2 text-xl font-bold">{laporan.judul}</h2>
            <p className="mt-1 text-sm text-tinta-redup">
              Kec. {laporan.kecamatan}, {namaKota(laporan.kotaId)}
            </p>
            <div className="mt-6">
              <LangkahStatus status={status} />
            </div>
            <Link href={`/laporan/${laporan.nomor}`} target="_blank" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-rambu hover:text-rambu-tua">
              Lihat di halaman publik
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </section>
          <TanggaEskalasi laporan={laporan} />
          <LogIntegrasi laporan={laporan} />
        </div>
      ) : (
        <div className="flex min-h-80 items-center justify-center rounded-3xl border border-dashed border-garis p-8 text-center text-tinta-redup">
          Tekan &ldquo;Mulai&rdquo; untuk membuat laporan simulasi. Laporannya, jalur tanggung jawab, dan log integrasinya akan tampil di sini.
        </div>
      )}
    </div>
  );
}
