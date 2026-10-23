import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { ambilSemuaLaporan, jumlahTandaTidakSesuai } from "@/lib/server/laporan";
import { hitungRisiko } from "@/lib/server/risiko";
import { keItemKerja } from "@/lib/server/kerja";
import { apakahTerlambat, hitungStatus } from "@/lib/sla";
import { DaftarKerja, KartuRingkas } from "@/components/dasbor/daftar-kerja";

export const metadata: Metadata = { title: "Dasbor admin" };

export default function HalamanAdmin() {
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-extrabold tracking-tight">Antrean verifikasi</h1>
      <p className="mt-1 text-tinta-redup">
        Periksa laporan baru sebelum diteruskan ke instansi. Tanda merah dan kuning membantu menyaring laporan palsu.
      </p>
      <Suspense fallback={<div className="mt-6 h-96 animate-pulse rounded-2xl bg-white motion-reduce:animate-none" />}>
        <IsiAdmin />
      </Suspense>
    </div>
  );
}

async function IsiAdmin() {
  await connection();
  const [semua, tanda] = await Promise.all([ambilSemuaLaporan(), jumlahTandaTidakSesuai()]);
  const menunggu = semua.filter((l) => hitungStatus(l) === "terkirim");
  const risiko = await hitungRisiko(menunggu, tanda);

  const item = semua
    .map((l) => {
      const tab: string[] = [];
      const status = hitungStatus(l);
      if (status === "terkirim") tab.push("verifikasi");
      if (apakahTerlambat(l)) tab.push("terlambat");
      if ((tanda.get(l.nomor) ?? 0) > 0 && !["ditolak", "selesai"].includes(status)) tab.push("ditandai");
      return tab.length ? keItemKerja(l, tab, risiko.get(l.nomor)) : null;
    })
    .filter((i) => i !== null);

  const aktif = semua.filter((l) => ["terkirim", "diteruskan", "diproses", "menunggu_konfirmasi"].includes(hitungStatus(l))).length;
  const hitung = (tab: string) => item.filter((i) => i.tab.includes(tab)).length;

  return (
    <div className="mt-6 space-y-6">
      <KartuRingkas
        data={[
          { label: "Menunggu verifikasi", nilai: hitung("verifikasi") },
          { label: "Lewat batas waktu", nilai: hitung("terlambat"), bahaya: true },
          { label: "Ditandai tidak sesuai", nilai: hitung("ditandai") },
          { label: "Laporan aktif", nilai: aktif },
        ]}
      />
      <DaftarKerja
        item={item}
        dasarTautan="/admin/laporan"
        kosong="Tidak ada laporan di kelompok ini."
        tab={[
          { id: "verifikasi", label: "Menunggu verifikasi" },
          { id: "terlambat", label: "Lewat batas waktu" },
          { id: "ditandai", label: "Ditandai warga" },
        ]}
      />
    </div>
  );
}
