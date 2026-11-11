import Link from "next/link";
import { ThumbsUp } from "lucide-react";
import type { RingkasanLaporan } from "@/lib/types";
import { KategoriIkon } from "@/components/kategori-ikon";
import { IlustrasiKelompok } from "@/components/ilustrasi-kelompok";
import { StatusBadge, TerlambatBadge } from "@/components/status-badge";
import { warnaKelompok } from "@/lib/warna-kelompok";

// Kartu laporan bergambar untuk tampilan grid
export function KartuLaporan({ laporan, jarakKm }: { laporan: RingkasanLaporan; jarakKm?: number | null }) {
  return (
    <li>
      <Link
        href={`/laporan/${laporan.nomor}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-garis bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-tinta/10"
      >
        <div className="relative aspect-[16/9] overflow-hidden">
          <IlustrasiKelompok kelompok={laporan.kelompok} className="size-full transition duration-500 group-hover:scale-105" />
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <StatusBadge status={laporan.status} />
            {laporan.terlambat && <TerlambatBadge />}
          </div>
          <span className="kode absolute right-3 bottom-3 rounded-md bg-white/90 px-2 py-0.5 text-[11px] font-semibold">{laporan.nomor}</span>
        </div>
        <div className="flex flex-1 flex-col p-4">
          <p className={`flex items-center gap-1.5 text-xs font-bold ${warnaKelompok[laporan.kelompok].teks}`}>
            <KategoriIkon id={laporan.kategoriId} className="size-3.5" />
            {laporan.kategoriNama}
          </p>
          <p className="mt-1.5 leading-snug font-semibold group-hover:text-rambu-tua">{laporan.judul}</p>
          <p className="mt-1 text-sm text-tinta-redup">
            {laporan.kecamatan}, {laporan.kotaNama}
          </p>
          <div className="mt-auto flex items-center justify-between gap-3 pt-4 text-sm text-tinta-redup">
            <span>
              {laporan.dibuatTeks}
              {jarakKm != null && (
                <span className="font-medium text-rambu-tua"> · {jarakKm < 1 ? `${Math.round(jarakKm * 1000)} m` : `${jarakKm.toFixed(1)} km`}</span>
              )}
            </span>
            <span className="angka inline-flex items-center gap-1" title="Dukungan warga">
              <ThumbsUp className="size-4" aria-hidden="true" />
              {laporan.dukungan}
              <span className="sr-only">dukungan</span>
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}
