"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ClipboardCheck, ExternalLink, Inbox, LogOut, Menu, Siren, Users, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { Dialog, Tombol } from "@/components/dialog";
import { inisial, LoncengNotifikasi, useKeluar, type DataNotifikasi } from "@/components/navigasi";

const menu = {
  petugas: [{ href: "/petugas", label: "Laporan instansi", ikon: Inbox }],
  admin: [
    { href: "/admin", label: "Antrean verifikasi", ikon: ClipboardCheck },
    { href: "/admin/pemantauan", label: "Pemantauan tenggat", ikon: Siren },
    { href: "/admin/petugas", label: "Akun petugas", ikon: Users },
  ],
};

export function BingkaiDasbor({
  peran,
  nama,
  keterangan,
  notifikasi,
  children,
}: {
  peran: "petugas" | "admin";
  nama: string;
  keterangan: string;
  notifikasi: DataNotifikasi;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [menuTerbuka, setMenuTerbuka] = useState(false);
  const [konfirmasi, setKonfirmasi] = useState(false);
  const { memproses, jalankan } = useKeluar();

  const isiSamping = (
    <>
      <div className="rounded-xl bg-kertas p-3">
        <p className="text-xs font-semibold text-tinta-redup">{peran === "admin" ? "Admin verifikator" : "Petugas"}</p>
        <p className="mt-0.5 text-sm leading-snug font-bold">{keterangan}</p>
      </div>
      <nav aria-label="Menu dasbor" className="mt-4 space-y-1">
        {menu[peran].map(({ href, label, ikon: Ikon }) => {
          const aktif = pathname === href || (href !== `/${peran}` && pathname.startsWith(href)) || (href === `/${peran}` && pathname.startsWith(`/${peran}/laporan`));
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuTerbuka(false)}
              aria-current={aktif ? "page" : undefined}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${aktif ? "bg-rambu-muda text-rambu-tua" : "text-tinta-redup hover:bg-kertas hover:text-tinta"}`}
            >
              <Ikon className="size-4" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
        <Link href="/" className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-tinta-redup hover:bg-kertas hover:text-tinta">
          <ExternalLink className="size-4" aria-hidden="true" />
          Situs publik
        </Link>
      </nav>
      <div className="mt-auto flex items-center gap-3 border-t border-garis pt-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-rambu-muda text-xs font-bold text-rambu-tua">{inisial(nama)}</span>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold">{nama}</span>
        <button type="button" onClick={() => setKonfirmasi(true)} className="rounded-lg p-2 text-tinta-redup hover:bg-bahaya-muda hover:text-bahaya">
          <LogOut className="size-4" aria-hidden="true" />
          <span className="sr-only">Keluar</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-garis bg-white p-4 lg:flex">
        <div className="mb-6 flex items-center justify-between px-1">
          <Logo />
          <LoncengNotifikasi data={notifikasi} rataKiri />
        </div>
        {isiSamping}
      </aside>

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-garis bg-white px-4 lg:hidden">
        <Logo />
        <div className="flex items-center gap-1">
        <LoncengNotifikasi data={notifikasi} />
        <button
          type="button"
          onClick={() => setMenuTerbuka((v) => !v)}
          aria-expanded={menuTerbuka}
          aria-controls="menu-dasbor-hp"
          className="flex size-10 items-center justify-center rounded-lg text-tinta-redup hover:bg-kertas"
        >
          {menuTerbuka ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          <span className="sr-only">Menu</span>
        </button>
        </div>
      </header>
      {menuTerbuka && (
        <div id="menu-dasbor-hp" className="flex flex-col border-b border-garis bg-white p-4 motion-safe:animate-muncul lg:hidden">
          {isiSamping}
        </div>
      )}

      <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</main>

      <Dialog terbuka={konfirmasi} onTutup={() => setKonfirmasi(false)} judul="Keluar dari akun?" deskripsi="Kamu perlu masuk lagi untuk membuka dasbor.">
        <div className="flex justify-end gap-2">
          <Tombol varian="hantu" onClick={() => setKonfirmasi(false)} disabled={memproses}>
            Batal
          </Tombol>
          <Tombol varian="bahaya" memproses={memproses} onClick={() => jalankan(() => setKonfirmasi(false))}>
            Keluar
          </Tombol>
        </div>
      </Dialog>
    </div>
  );
}
