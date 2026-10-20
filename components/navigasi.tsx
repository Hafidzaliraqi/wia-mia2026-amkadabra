"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartColumn, Compass, History, House, Plus, UserRound } from "lucide-react";
import { Logo } from "@/components/logo";

const menuAtas = [
  { href: "/", label: "Beranda" },
  { href: "/laporan", label: "Jelajah" },
  { href: "/transparansi", label: "Transparansi" },
  { href: "/riwayat", label: "Riwayat" },
];

const menuBawah = [
  { href: "/", label: "Beranda", ikon: House },
  { href: "/laporan", label: "Jelajah", ikon: Compass },
  { href: "/lapor", label: "Lapor", ikon: Plus },
  { href: "/riwayat", label: "Riwayat", ikon: History },
  { href: "/akun", label: "Akun", ikon: UserRound },
];

function cocok(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

// Versi tanpa hook, dipakai juga sebagai fallback saat halaman sedang dimuat
export function NavAtasTampilan({ pathname }: { pathname: string | null }) {
  return (
    <header className="sticky top-0 z-30 border-b border-garis bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <Logo />
        <nav aria-label="Menu utama" className="hidden items-center gap-1 md:flex">
          {menuAtas.map((item) => {
            const aktif = cocok(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={aktif ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  aktif ? "bg-rambu-muda text-rambu-tua" : "text-tinta-redup hover:text-tinta"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/transparansi"
            className="rounded-lg p-2 text-tinta-redup hover:text-tinta md:hidden"
            aria-label="Transparansi"
          >
            <ChartColumn className="size-5" aria-hidden="true" />
          </Link>
          <Link
            href="/akun"
            className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-tinta-redup hover:text-tinta md:block"
          >
            Masuk
          </Link>
          <Link
            href="/lapor"
            className="hidden items-center gap-1.5 rounded-lg bg-rambu px-4 py-2 text-sm font-semibold text-white hover:bg-rambu-tua md:inline-flex"
          >
            <Plus className="size-4" aria-hidden="true" />
            Buat laporan
          </Link>
        </div>
      </div>
    </header>
  );
}

export function NavBawahTampilan({ pathname }: { pathname: string | null }) {
  return (
    <nav
      aria-label="Menu bawah"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-garis bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="mx-auto grid h-16 max-w-md grid-cols-5">
        {menuBawah.map((item) => {
          const aktif = cocok(pathname, item.href);
          const Ikon = item.ikon;
          const tengah = item.href === "/lapor";
          return (
            <li key={item.href} className="flex">
              <Link
                href={item.href}
                aria-current={aktif ? "page" : undefined}
                className={`flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-semibold ${
                  aktif ? "text-rambu" : "text-tinta-redup"
                }`}
              >
                {tengah ? (
                  <span className="-mt-6 flex size-12 items-center justify-center rounded-full bg-rambu text-white shadow-md ring-4 ring-white">
                    <Ikon className="size-6" aria-hidden="true" />
                  </span>
                ) : (
                  <Ikon className="size-5" aria-hidden="true" />
                )}
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function NavAtas() {
  return <NavAtasTampilan pathname={usePathname()} />;
}

export function NavBawah() {
  return <NavBawahTampilan pathname={usePathname()} />;
}
