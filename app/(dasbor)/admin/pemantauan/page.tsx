import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { ambilSemuaLaporan } from "@/lib/server/laporan";
import { keItemKerja } from "@/lib/server/kerja";
import { cariInstansi } from "@/lib/data/referensi";
import { apakahTerlambat, hitungTenggat } from "@/lib/sla";
import { DaftarKerja } from "@/components/dasbor/daftar-kerja";

export const metadata: Metadata = { title: "Pemantauan tenggat" };

export default function HalamanPemantauan() {
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-extrabold tracking-tight">Pemantauan tenggat</h1>
      <p className="mt-1 text-tinta-redup">Laporan yang lewat batas waktu, dikelompokkan per tahap. Buka laporan untuk mengirim teguran.</p>
      <Suspense fallback={<div className="mt-6 h-96 animate-pulse rounded-2xl bg-white motion-reduce:animate-none" />}>
        <IsiPemantauan />
      </Suspense>
    </div>
  );
}

async function IsiPemantauan() {
  await connection();
  const terlambat = (await ambilSemuaLaporan()).filter(apakahTerlambat);
  const perInstansi = new Map<string, number>();
  for (const l of terlambat) perInstansi.set(l.instansiId, (perInstansi.get(l.instansiId) ?? 0) + 1);
  const peringkat = [...perInstansi.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maks = Math.max(...peringkat.map(([, n]) => n), 1);

  const item = terlambat.map((l) => {
    const tahap = hitungTenggat(l)?.tahap ?? "";
    return keItemKerja(l, ["semua", tahap === "Verifikasi laporan" ? "verifikasi" : tahap === "Respons awal instansi" ? "respons" : "penyelesaian"]);
  });

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <DaftarKerja
        item={item}
        dasarTautan="/admin/laporan"
        kosong="Tidak ada laporan yang lewat batas waktu."
        tab={[
          { id: "semua", label: "Semua" },
          { id: "verifikasi", label: "Verifikasi" },
          { id: "respons", label: "Respons awal" },
          { id: "penyelesaian", label: "Penyelesaian" },
        ]}
      />
      <section className="rounded-2xl border border-garis bg-white p-5">
        <h2 className="font-bold">Instansi dengan keterlambatan terbanyak</h2>
        {peringkat.length === 0 ? (
          <p className="mt-3 text-sm text-tinta-redup">Belum ada.</p>
        ) : (
          <ol className="mt-4 space-y-4">
            {peringkat.map(([id, n]) => (
              <li key={id}>
                <div className="flex justify-between gap-3 text-sm">
                  <span className="font-semibold">{cariInstansi(id).nama}</span>
                  <span className="angka shrink-0 text-bahaya">{n}</span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-kertas">
                  <div className="h-full rounded-full bg-bahaya" style={{ width: `${(n / maks) * 100}%` }} />
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
