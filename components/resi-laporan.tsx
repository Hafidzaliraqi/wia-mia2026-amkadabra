import Link from "next/link";
import type { Laporan } from "@/lib/types";
import { cariInstansi } from "@/lib/data/referensi";
import { hitungStatus, hitungTenggat } from "@/lib/sla";
import { KategoriIkon } from "@/components/kategori-ikon";
import { LangkahStatus } from "@/components/langkah-status";
import { StatusBadge } from "@/components/status-badge";
import { InfoTenggat } from "@/components/tenggat";

// Kartu bergaya resi paket: nunjukin perjalanan satu laporan
export function ResiLaporan({ laporan }: { laporan: Laporan }) {
  const status = hitungStatus(laporan);
  const tenggat = hitungTenggat(laporan);
  const instansi = cariInstansi(laporan.instansiId);

  return (
    <article className="relative overflow-hidden rounded-2xl border border-garis bg-white">
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-tinta-redup">Nomor laporan</p>
            <p className="angka text-2xl font-extrabold tracking-wide whitespace-nowrap">{laporan.nomor}</p>
          </div>
          <StatusBadge status={status} />
        </div>
        <div className="mt-5 flex gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-kertas">
            <KategoriIkon id={laporan.kategoriId} />
          </span>
          <div>
            <h2 className="leading-snug font-bold">{laporan.judul}</h2>
            <p className="mt-0.5 text-sm text-tinta-redup">
              {laporan.alamat}, {laporan.kecamatan}
            </p>
          </div>
        </div>
      </div>

      {/* Garis sobekan ala tiket */}
      <div className="relative h-6" aria-hidden="true">
        <div className="absolute inset-x-6 top-1/2 border-t-2 border-dashed border-garis" />
        <span className="absolute top-0 -left-3 size-6 rounded-full border border-garis bg-kertas" />
        <span className="absolute top-0 -right-3 size-6 rounded-full border border-garis bg-kertas" />
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <LangkahStatus status={status} />
        {tenggat && <InfoTenggat tenggat={tenggat} />}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-garis pt-4 text-sm">
          <p className="text-tinta-redup">
            Ditangani <span className="font-semibold text-tinta">{instansi.nama}</span>
          </p>
          <Link href={`/laporan/${laporan.nomor}`} className="font-semibold text-rambu hover:text-rambu-tua">
            Lihat perjalanan laporan
          </Link>
        </div>
      </div>
    </article>
  );
}
