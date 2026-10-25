import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { ambilLaporan, jumlahTandaTidakSesuai } from "@/lib/server/laporan";
import { hitungRisiko } from "@/lib/server/risiko";
import { kueri } from "@/lib/server/db";
import { daftarInstansi, instansiTujuan } from "@/lib/data/referensi";
import { apakahTerlambat, hitungStatus } from "@/lib/sla";
import { normalisasiNomor } from "@/lib/nomor";
import { formatRelatif } from "@/lib/waktu";
import { DetailLaporanDasbor } from "@/components/dasbor/detail-laporan";
import { PenyegarOtomatis } from "@/components/penyegar-otomatis";
import { PanelAdmin } from "@/components/dasbor/aksi-admin";
import { Percakapan } from "@/components/percakapan";
import { susunPercakapan } from "@/lib/server/percakapan";

export const metadata: Metadata = { title: "Periksa laporan" };

export default function PeriksaLaporan({ params }: PageProps<"/admin/laporan/[id]">) {
  return (
    <Suspense fallback={<div className="mx-auto h-96 max-w-6xl animate-pulse rounded-2xl bg-white motion-reduce:animate-none" />}>
      <IsiPeriksa params={params} />
    </Suspense>
  );
}

async function IsiPeriksa({ params }: Pick<PageProps<"/admin/laporan/[id]">, "params">) {
  await connection();
  const { id } = await params;
  const laporan = await ambilLaporan(normalisasiNomor(id));
  if (!laporan) notFound();

  const status = hitungStatus(laporan);
  const risiko = (await hitungRisiko([laporan], await jumlahTandaTidakSesuai())).get(laporan.nomor) ?? [];
  const tanda = await kueri<{ alasan: string; dibuat_pada: Date }>(
    "SELECT alasan, dibuat_pada FROM tanda_tidak_sesuai WHERE nomor = $1 ORDER BY dibuat_pada DESC",
    [laporan.nomor],
  );

  return (
    <>
    <PenyegarOtomatis label={false} />
    <DetailLaporanDasbor
      laporan={laporan}
      kembali={{ href: "/admin", label: "Antrean verifikasi" }}
      tambahan={
        <>
        <Percakapan nomor={laporan.nomor} pesan={susunPercakapan(laporan, null, "petugas")} sebagai="admin" bisaKirim={false} keteranganTutup="Admin memantau percakapan petugas dan warga." />
        {tanda.length > 0 && (
          <section className="rounded-2xl border border-garis bg-white p-5 sm:p-6">
            <h2 className="font-bold">Ditandai tidak sesuai oleh warga</h2>
            <ul className="mt-3 space-y-2">
              {tanda.map((t, i) => (
                <li key={i} className="rounded-xl bg-kertas px-3.5 py-2.5 text-sm">
                  {t.alasan}
                  <span className="mt-1 block text-xs text-tinta-redup">{formatRelatif(t.dibuat_pada)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
        </>
      }
      panel={
        <PanelAdmin
          nomor={laporan.nomor}
          menungguVerifikasi={status === "terkirim"}
          terlambat={apakahTerlambat(laporan)}
          instansiDefault={instansiTujuan(laporan.kategoriId, laporan.kotaId).id}
          instansiWilayah={daftarInstansi.filter((i) => i.kotaId === laporan.kotaId).map((i) => ({ id: i.id, nama: i.nama }))}
          risiko={risiko}
          jumlahTanda={tanda.length}
          aktif={["terkirim", "diteruskan", "diproses", "menunggu_konfirmasi"].includes(status)}
          teguranTerakhir={(() => {
            const t = laporan.riwayat.findLast((k) => k.jenis === "eskalasi" && k.aktor === "Admin pengawas");
            return t ? formatRelatif(t.waktu) : null;
          })()}
        />
      }
    />
    </>
  );
}
