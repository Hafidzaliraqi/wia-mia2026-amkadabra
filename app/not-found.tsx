import Link from "next/link";
import { Logo } from "@/components/logo";

export default function TidakDitemukan() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-4 py-16 sm:px-6">
      <Logo />
      <h1 className="mt-10 text-2xl font-extrabold tracking-tight sm:text-3xl">Laporan atau halaman tidak ditemukan</h1>
      <p className="mt-3 leading-relaxed text-tinta-redup">
        Periksa lagi nomor laporannya. Laporan yang dibuat privat oleh pelapor juga tidak bisa dibuka publik.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/" className="rounded-xl bg-rambu px-5 py-3 font-semibold text-white hover:bg-rambu-tua">
          Ke beranda
        </Link>
        <Link href="/laporan" className="rounded-xl px-5 py-3 font-semibold text-tinta ring-1 ring-garis ring-inset hover:bg-white">
          Jelajah laporan
        </Link>
      </div>
    </div>
  );
}
