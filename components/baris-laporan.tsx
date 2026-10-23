import Link from "next/link";
import { ThumbsUp } from "lucide-react";
import type { RingkasanLaporan } from "@/lib/types";
import { KategoriIkon } from "@/components/kategori-ikon";
import { StatusBadge, TerlambatBadge } from "@/components/status-badge";

// Satu baris laporan di daftar. Datanya sudah berupa teks,
// jadi aman dipakai di komponen server maupun client.
export function BarisLaporan({ laporan, jarakKm }: { laporan: RingkasanLaporan; jarakKm?: number | null }) {
  return (
    <li>
      <Link
        href={`/laporan/${laporan.nomor}`}
        className="group flex gap-4 px-4 py-4 transition-colors hover:bg-kertas/70 sm:px-5"
      >
        <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-kertas text-tinta transition-colors group-hover:bg-rambu-muda group-hover:text-rambu-tua">
          <KategoriIkon id={laporan.kategoriId} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={laporan.status} />
            {laporan.terlambat && <TerlambatBadge />}
          </div>
          <p className="mt-2 leading-snug font-semibold group-hover:text-rambu-tua">{laporan.judul}</p>
          <p className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-tinta-redup">
            <span>
              {laporan.kecamatan}, {laporan.kotaNama}
            </span>
            <span>{laporan.dibuatTeks}</span>
            {jarakKm != null && (
              <span className="angka font-medium text-rambu-tua">
                {jarakKm < 1 ? `${Math.round(jarakKm * 1000)} m` : `${jarakKm.toFixed(1)} km`} darimu
              </span>
            )}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end justify-between gap-2 text-right">
          <span className="angka text-xs text-tinta-redup">{laporan.nomor}</span>
          <span className="angka inline-flex items-center gap-1 text-sm text-tinta-redup" title="Dukungan warga">
            <ThumbsUp className="size-4" aria-hidden="true" />
            {laporan.dukungan}
            <span className="sr-only">dukungan</span>
          </span>
        </div>
      </Link>
    </li>
  );
}
