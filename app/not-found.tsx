import Link from "next/link";
import { situs } from "@/lib/site";
import { LacakForm } from "@/components/lacak-form";

export default function TidakDitemukan() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Laporan atau halaman tidak ditemukan</h1>
      <p className="mt-3 leading-relaxed text-tinta-redup">
        Periksa lagi nomor laporannya. Laporan yang dibuat privat oleh pelapor juga tidak bisa dibuka
        publik.
      </p>
      <div className="mt-8">
        <LacakForm contoh={`${situs.kodeLaporan}-2610-0042`} />
      </div>
      <Link href="/laporan" className="mt-8 inline-block font-semibold text-rambu hover:text-rambu-tua">
        Jelajah semua laporan
      </Link>
    </div>
  );
}
