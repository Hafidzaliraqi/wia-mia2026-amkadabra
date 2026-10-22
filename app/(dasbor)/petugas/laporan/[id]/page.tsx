import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { ambilLaporan } from "@/lib/server/laporan";
import { penggunaSaatIni } from "@/lib/server/sesi";
import { cariInstansi, daftarInstansi } from "@/lib/data/referensi";
import { hitungStatus, hitungTenggat } from "@/lib/sla";
import { normalisasiNomor } from "@/lib/nomor";
import { DetailLaporanDasbor } from "@/components/dasbor/detail-laporan";
import { PanelPetugas } from "@/components/dasbor/aksi-petugas";

export const metadata: Metadata = { title: "Kelola laporan" };

export default function KelolaLaporanPetugas({ params }: PageProps<"/petugas/laporan/[id]">) {
  return (
    <Suspense fallback={<div className="mx-auto h-96 max-w-6xl animate-pulse rounded-2xl bg-white motion-reduce:animate-none" />}>
      <IsiKelola params={params} />
    </Suspense>
  );
}

async function IsiKelola({ params }: Pick<PageProps<"/petugas/laporan/[id]">, "params">) {
  await connection();
  const { id } = await params;
  const [laporan, pengguna] = await Promise.all([ambilLaporan(normalisasiNomor(id)), penggunaSaatIni()]);
  if (!laporan || !pengguna || laporan.instansiId !== pengguna.instansiId) notFound();

  const status = hitungStatus(laporan);
  const tenggat = hitungTenggat(laporan);
  const instansi = cariInstansi(laporan.instansiId);
  const sudahPerpanjang = tenggat !== null && laporan.riwayat.some((k) => k.jenis === "perpanjangan" && k.waktu >= tenggat.mulai);

  return (
    <DetailLaporanDasbor
      laporan={laporan}
      kembali={{ href: "/petugas", label: "Laporan instansi" }}
      panel={
        <PanelPetugas
          nomor={laporan.nomor}
          status={status}
          bisaPerpanjang={status === "diproses" && !sudahPerpanjang}
          instansiLain={daftarInstansi
            .filter((i) => i.kotaId === instansi.kotaId && i.id !== instansi.id)
            .map((i) => ({ id: i.id, nama: i.nama }))}
        />
      }
    />
  );
}
