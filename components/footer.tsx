import Link from "next/link";
import { situs } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-garis bg-white">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 text-sm text-tinta-redup sm:px-6 md:grid-cols-[1fr_auto]">
        <div className="max-w-md space-y-2">
          <p className="font-bold text-tinta">{situs.nama}</p>
          <p>{situs.deskripsi}</p>
          <p className="text-xs">
            Prototipe untuk Web In Action (WIA) MIA 2026. Data laporan dan kinerja instansi yang ditampilkan adalah data
            simulasi, bukan data resmi pemerintah daerah.
          </p>
        </div>
        <nav aria-label="Tautan bawah" className="flex flex-wrap gap-x-6 gap-y-2 md:flex-col">
          <Link href="/laporan" className="hover:text-tinta">Jelajah laporan</Link>
          <Link href="/transparansi" className="hover:text-tinta">Rapor instansi</Link>
          <Link href="/lapor" className="hover:text-tinta">Buat laporan</Link>
          <Link href="/masuk" className="hover:text-tinta">Masuk petugas</Link>
        </nav>
      </div>
    </footer>
  );
}
