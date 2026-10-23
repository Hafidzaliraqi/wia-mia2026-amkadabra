import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { penggunaSaatIni } from "@/lib/server/sesi";
import { ambilNotifikasi } from "@/lib/server/notifikasi";
import { DaftarNotifikasi } from "@/components/daftar-notifikasi";

export const metadata: Metadata = { title: "Notifikasi" };

export default function HalamanNotifikasi() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:py-10">
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Notifikasi</h1>
      <div className="mt-8">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-white motion-reduce:animate-none" />}>
          <IsiNotifikasi />
        </Suspense>
      </div>
    </div>
  );
}

async function IsiNotifikasi() {
  await connection();
  const pengguna = await penggunaSaatIni();
  if (!pengguna) {
    return (
      <div className="rounded-2xl border border-garis bg-white p-6 text-center">
        <p className="font-semibold">Masuk untuk melihat notifikasimu</p>
        <Link href="/masuk?lanjut=%2Fnotifikasi" className="mt-5 inline-block rounded-xl bg-rambu px-6 py-3 font-semibold text-white hover:bg-rambu-tua">
          Masuk
        </Link>
      </div>
    );
  }
  const { terbaru } = await ambilNotifikasi(pengguna.id, 50);
  return <DaftarNotifikasi daftar={terbaru} />;
}
