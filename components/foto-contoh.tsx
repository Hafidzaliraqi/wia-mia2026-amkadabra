import { ImageIcon } from "lucide-react";
import type { FotoLaporan, KategoriId } from "@/lib/types";
import { KategoriIkon } from "@/components/kategori-ikon";
import { IlustrasiKelompok } from "@/components/ilustrasi-kelompok";
import { cariKategori } from "@/lib/data/referensi";
import { formatTanggalJam } from "@/lib/waktu";

// Foto asli dari database, atau tempat foto untuk data contoh
export function FotoLaporanTampil({
  foto,
  contoh,
  label,
  kategoriId,
}: {
  foto: FotoLaporan[];
  contoh: boolean;
  label: string;
  kategoriId?: KategoriId;
}) {
  if (foto.length > 0) {
    return (
      <div className={`grid gap-3 ${foto.length > 1 ? "grid-cols-2" : ""}`}>
        {foto.map((f, i) => (
          <figure key={f.id} className={foto.length === 3 && i === 0 ? "col-span-2" : ""}>
            <a href={`/api/foto/${f.id}`} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl border border-garis">
              {/* eslint-disable-next-line @next/next/no-img-element -- foto dilayani dari database lewat route sendiri */}
              <img src={`/api/foto/${f.id}`} alt={`${label} ${i + 1}`} loading="lazy" className="aspect-[4/3] w-full object-cover transition hover:scale-[1.02]" />
            </a>
            {f.diambilPada && <figcaption className="angka mt-1.5 text-xs text-tinta-redup">Diambil {formatTanggalJam(f.diambilPada)}</figcaption>}
          </figure>
        ))}
        <p className="col-span-full text-sm text-tinta-redup">{label}</p>
      </div>
    );
  }
  if (contoh && kategoriId) {
    return (
      <figure>
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-garis">
          <IlustrasiKelompok kelompok={cariKategori(kategoriId).kelompok} className="size-full" />
          <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-tinta-redup">
            <KategoriIkon id={kategoriId} className="size-3.5" />
            Ilustrasi, data simulasi
          </span>
        </div>
        <figcaption className="mt-2 text-sm text-tinta-redup">{label}</figcaption>
      </figure>
    );
  }
  return (
    <figure>
      <div
        className={`flex aspect-[4/3] items-center justify-center rounded-xl border border-garis ${
          contoh ? "bg-gradient-to-br from-rambu-muda via-white to-kertas text-rambu/70" : "bg-kertas text-tinta-redup"
        }`}
      >
        <span className="flex flex-col items-center gap-2 px-4 text-center text-sm">
          {contoh && kategoriId ? <KategoriIkon id={kategoriId} className="size-12" /> : <ImageIcon className="size-6" aria-hidden="true" />}
          <span className="text-tinta-redup">{contoh ? "Ilustrasi (data simulasi)" : "Tidak ada foto"}</span>
        </span>
      </div>
      <figcaption className="mt-2 text-sm text-tinta-redup">{label}</figcaption>
    </figure>
  );
}
