"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import {
  Bell,
  ChartColumn,
  ChevronDown,
  Compass,
  History,
  House,
  LayoutDashboard,
  LogOut,
  Plus,
  Search,
  UserRound,
  X,
} from "lucide-react";
import type { NotifikasiRingkas, PenggunaRingkas } from "@/lib/types";
import { Logo } from "@/components/logo";
import { KelompokIkon } from "@/components/kategori-ikon";
import { Dialog, Tombol } from "@/components/dialog";
import { useToast } from "@/components/toast";
import { daftarKelompok } from "@/lib/data/referensi";
import { normalisasiNomor } from "@/lib/nomor";
import { keluar } from "@/lib/aksi/akun";
import { tandaiNotifikasiDibaca } from "@/lib/aksi/notifikasi";

export interface DataNotifikasi {
  jumlahBelumDibaca: number;
  terbaru: NotifikasiRingkas[];
}

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

export function inisial(nama: string) {
  return nama
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((kata) => kata[0]?.toUpperCase())
    .join("");
}

// Menutup elemen melayang saat klik di luar atau tekan Esc
function useTutupOtomatis(terbuka: boolean, tutup: () => void) {
  const wadah = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!terbuka) return;
    const klik = (e: MouseEvent) => {
      if (!wadah.current?.contains(e.target as Node)) tutup();
    };
    const tombol = (e: KeyboardEvent) => {
      if (e.key === "Escape") tutup();
    };
    document.addEventListener("mousedown", klik);
    window.addEventListener("keydown", tombol);
    return () => {
      document.removeEventListener("mousedown", klik);
      window.removeEventListener("keydown", tombol);
    };
  }, [terbuka, tutup]);
  return wadah;
}

// pengguna: undefined = sedang dimuat, null = belum masuk
export function NavAtasTampilan({
  pathname,
  pengguna,
  notifikasi,
}: {
  pathname: string | null;
  pengguna: PenggunaRingkas | null | undefined;
  notifikasi: DataNotifikasi | null;
}) {
  const [cariTerbuka, setCariTerbuka] = useState(false);
  const tombolCari = useRef<HTMLButtonElement>(null);
  const [halamanTerakhir, setHalamanTerakhir] = useState(pathname);
  if (pathname !== halamanTerakhir) {
    setHalamanTerakhir(pathname);
    setCariTerbuka(false);
  }
  const tutupCari = useCallback(() => {
    setCariTerbuka(false);
    tombolCari.current?.focus();
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-garis bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        <nav aria-label="Menu utama" className="hidden items-center gap-1 lg:flex">
          {(pengguna && pengguna.peran !== "warga"
            ? [...menuAtas.slice(0, 3), { href: `/${pengguna.peran}`, label: "Dasbor" }]
            : menuAtas
          ).map((item) => {
            const aktif = cocok(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={aktif ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  aktif ? "bg-rambu-muda text-rambu-tua" : "text-tinta-redup hover:bg-kertas hover:text-tinta"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <button
            ref={tombolCari}
            type="button"
            onClick={() => (cariTerbuka ? tutupCari() : setCariTerbuka(true))}
            aria-expanded={cariTerbuka}
            aria-controls="panel-cari"
            className="flex size-10 items-center justify-center rounded-lg text-tinta-redup transition-colors hover:bg-kertas hover:text-tinta"
          >
            {cariTerbuka ? <X className="size-5" aria-hidden="true" /> : <Search className="size-5" aria-hidden="true" />}
            <span className="sr-only">{cariTerbuka ? "Tutup pencarian" : "Cari laporan"}</span>
          </button>

          <Link
            href="/transparansi"
            className="flex size-10 items-center justify-center rounded-lg text-tinta-redup hover:bg-kertas hover:text-tinta lg:hidden"
          >
            <ChartColumn className="size-5" aria-hidden="true" />
            <span className="sr-only">Transparansi</span>
          </Link>

          {pengguna === undefined ? (
            <span className="h-9 w-24 animate-pulse rounded-lg bg-kertas motion-reduce:animate-none" aria-hidden="true" />
          ) : pengguna ? (
            <>
              {notifikasi && <LoncengNotifikasi data={notifikasi} />}
              <div className="hidden items-center gap-1.5 lg:flex">
                <MenuAkun pengguna={pengguna} />
                {pengguna.peran === "warga" && (
                  <Link
                    href="/lapor"
                    className="ml-1 inline-flex items-center gap-1.5 rounded-lg bg-rambu px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rambu-tua active:scale-[0.98]"
                  >
                    <Plus className="size-4" aria-hidden="true" />
                    Buat laporan
                  </Link>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/masuk"
                className="rounded-lg px-3 py-2 text-sm font-semibold text-tinta ring-1 ring-garis ring-inset transition-colors hover:bg-kertas"
              >
                Masuk
              </Link>
              <Link
                href="/daftar"
                className="hidden rounded-lg bg-rambu px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rambu-tua active:scale-[0.98] sm:inline-block"
              >
                Daftar
              </Link>
            </>
          )}
        </div>
      </div>

      {cariTerbuka && <PanelCari onTutup={tutupCari} />}
    </header>
  );
}

function PanelCari({ onTutup }: { onTutup: () => void }) {
  const router = useRouter();
  const [kata, setKata] = useState("");
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    input.current?.focus();
  }, []);
  useEffect(() => {
    const tombol = (e: KeyboardEvent) => {
      if (e.key === "Escape") onTutup();
    };
    window.addEventListener("keydown", tombol);
    return () => window.removeEventListener("keydown", tombol);
  }, [onTutup]);

  function cari(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const bersih = kata.trim();
    if (!bersih) return input.current?.focus();
    const nomor = normalisasiNomor(bersih);
    router.push(/^[A-Z]+-\d{4}-\d{4}$/.test(nomor) ? `/laporan/${nomor}` : `/laporan?cari=${encodeURIComponent(bersih)}`);
    onTutup();
  }

  return (
    <div id="panel-cari" className="border-t border-garis bg-white motion-safe:animate-muncul">
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-6">
        <form onSubmit={cari} role="search" className="flex gap-2">
          <label htmlFor="kata-cari" className="sr-only">
            Cari laporan
          </label>
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-tinta-redup" aria-hidden="true" />
            <input
              ref={input}
              id="kata-cari"
              type="search"
              value={kata}
              onChange={(e) => setKata(e.target.value)}
              placeholder="Nomor laporan, jalan, atau daerah"
              autoComplete="off"
              className="w-full rounded-xl border border-garis bg-white py-3.5 pr-4 pl-12 text-base focus:border-rambu focus:outline-none"
            />
          </div>
          <button type="submit" className="rounded-xl bg-rambu px-5 py-3.5 text-sm font-semibold text-white hover:bg-rambu-tua sm:px-6">
            Cari
          </button>
        </form>
        <p className="mt-4 text-sm text-tinta-redup">Atau telusuri berdasarkan kelompok masalah:</p>
        <ul className="mt-2.5 flex flex-wrap gap-2">
          {daftarKelompok.map((k) => (
            <li key={k.id}>
              <Link
                href={`/laporan?kelompok=${k.id}`}
                onClick={onTutup}
                className="inline-flex items-center gap-1.5 rounded-full border border-garis px-3 py-1.5 text-sm font-medium transition-colors hover:border-rambu hover:text-rambu"
              >
                <KelompokIkon id={k.id} className="size-4" />
                {k.nama}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function LoncengNotifikasi({ data, rataKiri = false }: { data: DataNotifikasi; rataKiri?: boolean }) {
  const router = useRouter();
  const [terbuka, setTerbuka] = useState(false);
  const tutup = useCallback(() => setTerbuka(false), []);
  const wadah = useTutupOtomatis(terbuka, tutup);
  const [, mulai] = useTransition();

  return (
    <div ref={wadah} className="relative">
      <button
        type="button"
        onClick={() => setTerbuka((v) => !v)}
        aria-expanded={terbuka}
        aria-controls="panel-notifikasi"
        className="relative flex size-10 items-center justify-center rounded-lg text-tinta-redup transition-colors hover:bg-kertas hover:text-tinta"
      >
        <Bell className="size-5" aria-hidden="true" />
        {data.jumlahBelumDibaca > 0 && (
          <span className="angka absolute top-1 right-1 flex min-w-4.5 items-center justify-center rounded-full bg-bahaya px-1 text-[10px] leading-4.5 font-bold text-white">
            {data.jumlahBelumDibaca > 9 ? "9+" : data.jumlahBelumDibaca}
          </span>
        )}
        <span className="sr-only">Notifikasi, {data.jumlahBelumDibaca} belum dibaca</span>
      </button>

      {terbuka && (
        <div
          id="panel-notifikasi"
          className={`absolute top-full z-40 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-garis bg-white shadow-lg motion-safe:animate-muncul ${rataKiri ? "left-0" : "right-0"}`}
        >
          <div className="flex items-center justify-between border-b border-garis px-4 py-3">
            <p className="font-semibold">Notifikasi</p>
            {data.jumlahBelumDibaca > 0 && (
              <button
                type="button"
                onClick={() => mulai(async () => void (await tandaiNotifikasiDibaca()))}
                className="text-sm font-semibold text-rambu hover:text-rambu-tua"
              >
                Tandai semua dibaca
              </button>
            )}
          </div>
          {data.terbaru.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-tinta-redup">Belum ada notifikasi.</p>
          ) : (
            <ul className="max-h-96 divide-y divide-garis overflow-y-auto">
              {data.terbaru.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setTerbuka(false);
                      mulai(async () => {
                        if (!n.dibaca) await tandaiNotifikasiDibaca(n.id);
                      });
                      router.push(n.tautan);
                    }}
                    className={`flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-kertas ${n.dibaca ? "" : "bg-rambu-muda/40"}`}
                  >
                    <span className={`mt-1.5 size-2 shrink-0 rounded-full ${n.dibaca ? "bg-transparent" : "bg-rambu"}`} aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{n.judul}</span>
                      <span className="mt-0.5 line-clamp-2 block text-sm text-tinta-redup">{n.isi}</span>
                      <span className="mt-1 block text-xs text-tinta-redup">{n.waktuTeks}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/notifikasi"
            onClick={() => setTerbuka(false)}
            className="block border-t border-garis px-4 py-3 text-center text-sm font-semibold text-rambu hover:bg-kertas"
          >
            Lihat semua notifikasi
          </Link>
        </div>
      )}
    </div>
  );
}

export function useKeluar() {
  const router = useRouter();
  const toast = useToast();
  const [memproses, mulai] = useTransition();
  const jalankan = (setelah?: () => void) =>
    mulai(async () => {
      await keluar();
      setelah?.();
      toast("sukses", "Kamu sudah keluar. Sampai jumpa lagi!");
      router.push("/");
      router.refresh();
    });
  return { memproses, jalankan };
}

function MenuAkun({ pengguna }: { pengguna: PenggunaRingkas }) {
  const [terbuka, setTerbuka] = useState(false);
  const [konfirmasi, setKonfirmasi] = useState(false);
  const tutup = useCallback(() => setTerbuka(false), []);
  const wadah = useTutupOtomatis(terbuka, tutup);
  const { memproses, jalankan } = useKeluar();

  return (
    <div ref={wadah} className="relative">
      <button
        type="button"
        onClick={() => setTerbuka((v) => !v)}
        aria-expanded={terbuka}
        aria-controls="menu-akun"
        className="flex items-center gap-2 rounded-lg py-1.5 pr-2 pl-1.5 text-sm font-semibold transition-colors hover:bg-kertas"
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-rambu-muda text-xs font-bold text-rambu-tua">
          {inisial(pengguna.nama)}
        </span>
        <span className="max-w-32 truncate">{pengguna.nama.split(" ")[0]}</span>
        <ChevronDown className={`size-4 text-tinta-redup transition-transform ${terbuka ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      {terbuka && (
        <div
          id="menu-akun"
          className="absolute top-full right-0 mt-2 w-64 overflow-hidden rounded-xl border border-garis bg-white shadow-lg motion-safe:animate-muncul"
        >
          <div className="border-b border-garis px-4 py-3">
            <p className="truncate font-semibold">{pengguna.nama}</p>
            <p className="truncate text-sm text-tinta-redup">{pengguna.email}</p>
          </div>
          <ul className="py-1 text-sm">
            {pengguna.peran !== "warga" && (
              <li>
                <Link href={`/${pengguna.peran}`} onClick={tutup} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-kertas">
                  <LayoutDashboard className="size-4 text-tinta-redup" aria-hidden="true" />
                  Dasbor {pengguna.peran === "admin" ? "admin" : "petugas"}
                </Link>
              </li>
            )}
            <li>
              <Link href="/akun" onClick={tutup} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-kertas">
                <UserRound className="size-4 text-tinta-redup" aria-hidden="true" />
                Akun saya
              </Link>
            </li>
            {pengguna.peran === "warga" && (
              <li>
                <Link href="/riwayat" onClick={tutup} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-kertas">
                  <History className="size-4 text-tinta-redup" aria-hidden="true" />
                  Riwayat laporan
                </Link>
              </li>
            )}
            <li className="mt-1 border-t border-garis pt-1">
              <button
                type="button"
                onClick={() => {
                  setTerbuka(false);
                  setKonfirmasi(true);
                }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-bahaya hover:bg-bahaya-muda"
              >
                <LogOut className="size-4" aria-hidden="true" />
                Keluar
              </button>
            </li>
          </ul>
        </div>
      )}

      <Dialog
        terbuka={konfirmasi}
        onTutup={() => setKonfirmasi(false)}
        judul="Keluar dari akun?"
        deskripsi="Kamu perlu masuk lagi untuk membuat laporan, mendukung, dan mengonfirmasi penyelesaian."
      >
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

export function NavBawahTampilan({ pathname, peran = null }: { pathname: string | null; peran?: string | null }) {
  const staf = peran === "petugas" || peran === "admin";
  const menu = staf
    ? [
        { href: "/", label: "Beranda", ikon: House },
        { href: "/laporan", label: "Jelajah", ikon: Compass },
        { href: `/${peran}`, label: "Dasbor", ikon: LayoutDashboard },
        { href: "/transparansi", label: "Rapor", ikon: ChartColumn },
        { href: "/akun", label: "Akun", ikon: UserRound },
      ]
    : menuBawah;
  return (
    <nav
      aria-label="Menu bawah"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-garis bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="mx-auto grid h-16 max-w-md grid-cols-5">
        {menu.map((item) => {
          const aktif = cocok(pathname, item.href);
          const Ikon = item.ikon;
          const tengah = item.href === "/lapor" || (staf && item.label === "Dasbor");
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
                  <span className="-mt-6 flex size-12 items-center justify-center rounded-full bg-rambu text-white shadow-md ring-4 ring-white transition-transform active:scale-95">
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

export function NavAtas(props: { pengguna: PenggunaRingkas | null; notifikasi: DataNotifikasi | null }) {
  return <NavAtasTampilan pathname={usePathname()} {...props} />;
}

export function NavBawah({ peran = null }: { peran?: string | null }) {
  return <NavBawahTampilan pathname={usePathname()} peran={peran} />;
}
