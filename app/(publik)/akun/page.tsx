import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { Bell, History, LayoutDashboard, Plus } from "lucide-react";
import { penggunaSaatIni } from "@/lib/server/sesi";
import { kueri } from "@/lib/server/db";
import { cariInstansi } from "@/lib/data/referensi";
import { formatTanggal } from "@/lib/waktu";
import { SaklarNotifEmail, TombolKeluar } from "@/components/akun-klien";

export const metadata: Metadata = { title: "Akun" };

const labelPeran = { warga: "Warga", petugas: "Petugas instansi", admin: "Admin" } as const;

export default function Akun() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:py-12">
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-white motion-reduce:animate-none" />}>
        <IsiAkun />
      </Suspense>
    </div>
  );
}

async function IsiAkun() {
  await connection();
  const pengguna = await penggunaSaatIni();
  if (!pengguna) {
    return (
      <div className="rounded-2xl border border-garis bg-white p-6 text-center sm:p-8">
        <h1 className="text-2xl font-extrabold tracking-tight">Masuk atau daftar</h1>
        <p className="mx-auto mt-2 max-w-md leading-relaxed text-tinta-redup">
          Kamu bisa menjelajah laporan tanpa akun. Untuk membuat laporan, mendukung, dan mengonfirmasi penyelesaian, masuk dulu.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/masuk" className="rounded-xl px-6 py-3 font-semibold text-tinta ring-1 ring-garis ring-inset hover:bg-kertas">
            Masuk
          </Link>
          <Link href="/daftar" className="rounded-xl bg-rambu px-6 py-3 font-semibold text-white hover:bg-rambu-tua">
            Daftar
          </Link>
        </div>
      </div>
    );
  }

  const [{ dibuat, didukung }] = await kueri<{ dibuat: number; didukung: number }>(
    `SELECT (SELECT count(*)::int FROM laporan WHERE pelapor_id = $1) AS dibuat,
            (SELECT count(*)::int FROM dukungan WHERE pengguna_id = $1) AS didukung`,
    [pengguna.id],
  );

  return (
    <div className="space-y-6">
      <section className="flex items-center gap-4 rounded-2xl border border-garis bg-white p-6">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-rambu-muda text-lg font-bold text-rambu-tua">
          {pengguna.nama.split(" ").slice(0, 2).map((k) => k[0]).join("").toUpperCase()}
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-extrabold tracking-tight">{pengguna.nama}</h1>
          <p className="truncate text-sm text-tinta-redup">{pengguna.email}</p>
          <p className="angka text-sm text-tinta-redup">{pengguna.hp}</p>
        </div>
        <span className="ml-auto hidden rounded-full bg-kertas px-3 py-1 text-xs font-semibold text-tinta-redup sm:inline">
          {labelPeran[pengguna.peran]}
        </span>
      </section>

      {pengguna.peran === "warga" ? (
        <section className="grid gap-3 sm:grid-cols-3">
          <KartuAngka label="Laporan dibuat" nilai={dibuat} />
          <KartuAngka label="Laporan didukung" nilai={didukung} />
          <p className="flex items-center rounded-2xl border border-garis bg-white p-5 text-sm text-tinta-redup">
            Bergabung {formatTanggal(pengguna.dibuatPada)}
          </p>
        </section>
      ) : (
        <Link href={`/${pengguna.peran}`} className="flex items-center gap-3 rounded-2xl bg-tinta p-5 font-semibold text-white hover:bg-tinta/90">
          <LayoutDashboard className="size-5" aria-hidden="true" />
          Buka dasbor {pengguna.peran}
          {pengguna.instansiId && <span className="ml-auto text-sm font-normal text-white/80">{cariInstansi(pengguna.instansiId).nama}</span>}
        </Link>
      )}

      {pengguna.peran === "warga" && (
        <section className="grid gap-3 sm:grid-cols-3">
          <Pintasan href="/riwayat" ikon={History} label="Riwayat laporan" />
          <Pintasan href="/notifikasi" ikon={Bell} label="Notifikasi" />
          <Pintasan href="/lapor" ikon={Plus} label="Buat laporan baru" />
        </section>
      )}

      <section className="rounded-2xl border border-garis bg-white p-6">
        <h2 className="font-bold">Pemberitahuan</h2>
        <p className="mt-1 text-sm text-tinta-redup">Notifikasi di aplikasi selalu aktif.</p>
        <div className="mt-2 divide-y divide-garis">
          <SaklarNotifEmail awal={pengguna.notifEmail} />
        </div>
      </section>

      <TombolKeluar />
    </div>
  );
}

function KartuAngka({ label, nilai }: { label: string; nilai: number }) {
  return (
    <div className="rounded-2xl border border-garis bg-white p-5">
      <p className="angka text-2xl font-extrabold">{nilai}</p>
      <p className="text-sm text-tinta-redup">{label}</p>
    </div>
  );
}

function Pintasan({ href, ikon: Ikon, label }: { href: string; ikon: typeof Bell; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-2xl border border-garis bg-white p-5 font-semibold transition-colors hover:border-rambu">
      <Ikon className="size-5 text-rambu" aria-hidden="true" />
      {label}
    </Link>
  );
}
