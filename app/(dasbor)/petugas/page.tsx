import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { ambilSemuaLaporan } from "@/lib/server/laporan";
import { penggunaSaatIni } from "@/lib/server/sesi";
import { keItemKerja } from "@/lib/server/kerja";
import { cariInstansi } from "@/lib/data/referensi";
import { apakahTerlambat, hitungStatus } from "@/lib/sla";
import { DaftarKerja, KartuRingkas } from "@/components/dasbor/daftar-kerja";

export const metadata: Metadata = { title: "Dasbor petugas" };

export default function HalamanPetugas() {
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-extrabold tracking-tight">Laporan instansi</h1>
      <p className="mt-1 text-tinta-redup">Diurutkan dari tenggat paling dekat. Kerjakan yang paling mendesak dulu.</p>
      <Suspense fallback={<div className="mt-6 h-96 animate-pulse rounded-2xl bg-white motion-reduce:animate-none" />}>
        <IsiPetugas />
      </Suspense>
    </div>
  );
}

async function IsiPetugas() {
  await connection();
  const pengguna = await penggunaSaatIni();
  if (!pengguna?.instansiId) return null;
  const milik = (await ambilSemuaLaporan()).filter((l) => l.instansiId === pengguna.instansiId);

  const item = milik.map((l) => {
    const status = hitungStatus(l);
    const tab: string[] = [];
    if (status === "diteruskan") tab.push("baru");
    if (status === "diproses") tab.push("dikerjakan");
    if (status === "menunggu_konfirmasi") tab.push("konfirmasi");
    if (apakahTerlambat(l)) tab.push("terlambat");
    if (["selesai", "ditutup_otomatis"].includes(status)) tab.push("selesai");
    return keItemKerja(l, tab);
  });
  const hitung = (tab: string) => item.filter((i) => i.tab.includes(tab)).length;

  return (
    <div className="mt-6 space-y-6">
      <p className="text-sm text-tinta-redup">
        Instansi: <span className="font-semibold text-tinta">{cariInstansi(pengguna.instansiId).nama}</span>
      </p>
      <KartuRingkas
        data={[
          { label: "Perlu respons awal", nilai: hitung("baru") },
          { label: "Sedang dikerjakan", nilai: hitung("dikerjakan") },
          { label: "Lewat batas waktu", nilai: hitung("terlambat"), bahaya: true },
          { label: "Menunggu konfirmasi warga", nilai: hitung("konfirmasi") },
        ]}
      />
      <DaftarKerja
        item={item}
        dasarTautan="/petugas/laporan"
        kosong="Tidak ada laporan di kelompok ini."
        tab={[
          { id: "baru", label: "Perlu respons" },
          { id: "dikerjakan", label: "Dikerjakan" },
          { id: "terlambat", label: "Lewat batas" },
          { id: "konfirmasi", label: "Menunggu konfirmasi" },
          { id: "selesai", label: "Selesai" },
        ]}
      />
    </div>
  );
}
