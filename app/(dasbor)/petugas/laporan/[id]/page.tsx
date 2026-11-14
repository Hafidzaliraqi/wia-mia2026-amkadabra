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
import { PenyegarOtomatis } from "@/components/penyegar-otomatis";
import { PanelPetugas } from "@/components/dasbor/aksi-petugas";
import { PanelDemoLaporan } from "@/components/panel-demo-laporan";
import { langkahDemo } from "@/lib/server/langkah-demo";
import Link from "next/link";
import { Percakapan } from "@/components/percakapan";
import { susunPercakapan } from "@/lib/server/percakapan";

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
  if (!laporan || !pengguna) notFound();
  if (laporan.instansiId !== pengguna.instansiId || hitungStatus(laporan) === "terkirim") {
    const tujuan = cariInstansi(laporan.instansiId);
    const menunggu = hitungStatus(laporan) === "terkirim";
    const demo = await langkahDemo(laporan);
    return (
      <div className="mx-auto max-w-xl py-10">
        <p className="kode text-sm font-semibold text-tinta-redup">{laporan.nomor}</p>
        <h1 className="mt-1 text-2xl font-extrabold">{laporan.judul}</h1>
        <p className="mt-3 leading-relaxed text-tinta-redup">
          {menunggu
            ? "Laporan ini masih menunggu verifikasi admin. Setelah diverifikasi, laporan otomatis masuk ke antrean instansi yang berwenang."
            : `Laporan ini ditangani ${tujuan.nama}. Akunmu adalah petugas ${pengguna.instansiId ? cariInstansi(pengguna.instansiId).nama : "instansi lain"}, jadi laporan ini tidak ada di antreanmu.`}
        </p>
        <div className="mt-6 space-y-3">
          {demo && <PanelDemoLaporan langkah={demo} />}
          <Link href="/petugas" className="inline-flex items-center gap-1.5 text-sm font-semibold text-rambu hover:text-rambu-tua">
            Kembali ke antrean instansi
          </Link>
        </div>
      </div>
    );
  }

  const status = hitungStatus(laporan);
  const tenggat = hitungTenggat(laporan);
  const instansi = cariInstansi(laporan.instansiId);
  const sudahPerpanjang = tenggat !== null && laporan.riwayat.some((k) => k.jenis === "perpanjangan" && k.waktu >= tenggat.mulai);

  return (
    <>
    <PenyegarOtomatis label={false} />
    <DetailLaporanDasbor
      laporan={laporan}
      kembali={{ href: "/petugas", label: "Laporan instansi" }}
      tambahan={
        <Percakapan
          nomor={laporan.nomor}
          pesan={susunPercakapan(laporan, pengguna.id, "petugas")}
          sebagai="petugas"
          bisaKirim={["diteruskan", "diproses", "menunggu_konfirmasi"].includes(status)}
          keteranganTutup="Percakapan ditutup karena laporan sudah selesai."
        />
      }
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
    </>
  );
}
