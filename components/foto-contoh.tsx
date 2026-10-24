import { ImageIcon } from "lucide-react";

// Tempat foto sementara. Nanti diganti <Image> dari next/image saat foto asli sudah ada.
export function FotoContoh({ label, kosong = false }: { label: string; kosong?: boolean }) {
  return (
    <figure>
      <div
        className="flex aspect-[4/3] items-center justify-center rounded-xl border border-garis text-tinta-redup"
        style={{
          backgroundImage: kosong
            ? undefined
            : "repeating-linear-gradient(135deg, var(--color-kertas) 0 12px, white 12px 24px)",
        }}
      >
        <span className="flex flex-col items-center gap-2 px-4 text-center text-sm">
          <ImageIcon className="size-6" aria-hidden="true" />
          {kosong ? "Tidak ada foto" : "Foto contoh"}
        </span>
      </div>
      <figcaption className="mt-2 text-sm text-tinta-redup">{label}</figcaption>
    </figure>
  );
}
