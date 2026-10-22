import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { ChevronDown } from "lucide-react";
import { ambilSemuaLaporan } from "@/lib/server/laporan";
import {
  BATAS_KONFIRMASI_HARI,
  SLA_RESPONS_HARI_KERJA,
  SLA_VERIFIKASI_HARI_KERJA,
  daftarKategori,
  daftarKelompok,
} from "@/lib/data/referensi";
import { laporanPerBulan, raporInstansi } from "@/lib/statistik";
import { TabelRapor } from "@/components/rapor-instansi";
import { KelompokIkon } from "@/components/kategori-ikon";

export const metadata: Metadata = { title: "Transparansi" };

export default function HalamanTransparansi() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Transparansi</h1>
      <p className="mt-2 max-w-2xl text-tinta-redup">
        Kinerja setiap instansi dihitung otomatis dari riwayat laporan, tanpa diisi manual. Siapa pun bisa melihat dan
        membandingkannya.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-bold">Rapor instansi</h2>
        <div className="mt-4">
          <Suspense fallback={<div className="h-80 animate-pulse rounded-2xl bg-white motion-reduce:animate-none" />}>
            <BagianRapor />
          </Suspense>
        </div>
        <p className="mt-3 text-xs text-tinta-redup">
          Respons awal dihitung sejak laporan diteruskan sampai instansi mulai mengerjakan. Dibuka ulang artinya warga
          menyatakan masalahnya belum beres setelah ditandai selesai.
        </p>
      </section>

      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="text-xl font-bold">Standar waktu layanan</h2>
          <p className="mt-1 text-sm text-tinta-redup">Berlaku untuk semua daerah, dihitung dalam hari kerja.</p>
          <dl className="mt-5 divide-y divide-garis rounded-2xl border border-garis bg-white">
            <BarisStandar label="Verifikasi oleh admin" nilai={`${SLA_VERIFIKASI_HARI_KERJA} hari kerja`} />
            <BarisStandar label="Respons awal instansi" nilai={`${SLA_RESPONS_HARI_KERJA} hari kerja`} />
            <BarisStandar label="Konfirmasi warga sebelum ditutup otomatis" nilai={`${BATAS_KONFIRMASI_HARI} hari`} />
          </dl>
          <p className="mt-6 mb-3 text-sm font-semibold">Batas penyelesaian per jenis masalah</p>
          <div className="space-y-2">
            {daftarKelompok.map((kel) => (
              <details key={kel.id} className="group rounded-2xl border border-garis bg-white">
                <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-3.5 font-semibold [&::-webkit-details-marker]:hidden">
                  <KelompokIkon id={kel.id} className="size-4 text-rambu" />
                  {kel.nama}
                  <ChevronDown className="ml-auto size-4 text-tinta-redup transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <dl className="divide-y divide-garis border-t border-garis">
                  {daftarKategori.filter((k) => k.kelompok === kel.id).map((k) => (
                    <BarisStandar key={k.id} label={k.nama} nilai={`${k.slaHariKerja} hari kerja`} />
                  ))}
                </dl>
              </details>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold">Laporan per bulan</h2>
          <p className="mt-1 text-sm text-tinta-redup">Jumlah laporan baru dari semua daerah.</p>
          <Suspense fallback={<div className="mt-5 h-48 animate-pulse rounded-2xl bg-white motion-reduce:animate-none" />}>
            <BagianBulanan />
          </Suspense>
        </section>
      </div>
    </div>
  );
}

async function BagianRapor() {
  await connection();
  return <TabelRapor rapor={raporInstansi(await ambilSemuaLaporan())} />;
}

async function BagianBulanan() {
  await connection();
  const perBulan = laporanPerBulan(await ambilSemuaLaporan(), 3);
  const maks = Math.max(...perBulan.map((b) => b.total), 1);
  return (
    <ol className="mt-5 space-y-5 rounded-2xl border border-garis bg-white p-5">
      {perBulan.map((b) => (
        <li key={b.bulan}>
          <div className="flex justify-between text-sm">
            <span className="font-semibold">{b.bulan}</span>
            <span className="angka text-tinta-redup">{b.total} laporan</span>
          </div>
          <div className="mt-1.5 h-2.5 rounded-full bg-kertas">
            <div className="h-full rounded-full bg-rambu" style={{ width: `${(b.total / maks) * 100}%` }} />
          </div>
        </li>
      ))}
    </ol>
  );
}

function BarisStandar({ label, nilai }: { label: string; nilai: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
      <dt>{label}</dt>
      <dd className="angka shrink-0 font-semibold">{nilai}</dd>
    </div>
  );
}
