import { ImageIcon } from "lucide-react";
import type { FotoLaporan } from "@/lib/types";
import { formatTanggalJam } from "@/lib/waktu";

// Foto asli dari database, atau tempat foto untuk data contoh
export function FotoLaporanTampil({
  foto,
  contoh,
  label,
}: {
  foto: FotoLaporan[];
  contoh: boolean;
  label: string;
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
  return (
    <figure>
      <div
        className="flex aspect-[4/3] items-center justify-center rounded-xl border border-garis text-tinta-redup"
        style={{ backgroundImage: contoh ? "repeating-linear-gradient(135deg, var(--color-kertas) 0 12px, white 12px 24px)" : undefined }}
      >
        <span className="flex flex-col items-center gap-2 px-4 text-center text-sm">
          <ImageIcon className="size-6" aria-hidden="true" />
          {contoh ? "Foto contoh (data simulasi)" : "Tidak ada foto"}
        </span>
      </div>
      <figcaption className="mt-2 text-sm text-tinta-redup">{label}</figcaption>
    </figure>
  );
}
