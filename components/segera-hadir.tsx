import Link from "next/link";
import { Construction } from "lucide-react";

// Penanda halaman yang belum dibangun
export function SegeraHadir({ judul, isi }: { judul: string; isi: string }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
      <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-rambu-muda text-rambu-tua">
        <Construction className="size-6" aria-hidden="true" />
      </span>
      <h1 className="mt-6 text-2xl font-extrabold tracking-tight sm:text-3xl">{judul}</h1>
      <p className="mt-3 leading-relaxed text-tinta-redup">{isi}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="rounded-xl bg-rambu px-5 py-2.5 font-semibold text-white hover:bg-rambu-tua">
          Ke beranda
        </Link>
        <Link href="/laporan" className="rounded-xl border border-garis bg-white px-5 py-2.5 font-semibold hover:bg-kertas">
          Jelajah laporan
        </Link>
      </div>
    </div>
  );
}
