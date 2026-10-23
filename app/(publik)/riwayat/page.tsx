import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { BellRing } from "lucide-react";
import { ambilSemuaLaporan, nomorDidukung, ringkas } from "@/lib/server/laporan";
import { penggunaSaatIni } from "@/lib/server/sesi";
import { TabRiwayat } from "@/components/tab-riwayat";

export const metadata: Metadata = { title: "Riwayat" };

export default function HalamanRiwayat() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-10">
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Riwayat laporan</h1>
      <p className="mt-2 max-w-2xl text-tinta-redup">Laporan yang kamu buat dan laporan warga lain yang kamu dukung.</p>
      <div className="mt-8">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-white motion-reduce:animate-none" />}>
          <IsiRiwayat />
        </Suspense>
      </div>
    </div>
  );
}

async function IsiRiwayat() {
  await connection();
  const pengguna = await penggunaSaatIni();
  if (!pengguna || pengguna.peran !== "warga") {
    return (
      <div className="rounded-2xl border border-garis bg-white p-6 text-center sm:p-8">
        <p className="font-semibold">{pengguna ? "Riwayat laporan hanya untuk akun warga" : "Masuk untuk melihat riwayat laporanmu"}</p>
        {!pengguna && (
          <Link href="/masuk?lanjut=%2Friwayat" className="mt-5 inline-block rounded-xl bg-rambu px-6 py-3 font-semibold text-white hover:bg-rambu-tua">
            Masuk
          </Link>
        )}
      </div>
    );
  }

  const [semua, didukungSet] = await Promise.all([ambilSemuaLaporan(), nomorDidukung(pengguna.id)]);
  const dibuat = semua.filter((l) => l.pelaporId === pengguna.id).map(ringkas);
  const didukung = semua.filter((l) => didukungSet.has(l.nomor)).map(ringkas);
  const butuhKonfirmasi = [...dibuat, ...didukung].filter((l) => l.status === "menunggu_konfirmasi");

  return (
    <div className="space-y-6">
      {butuhKonfirmasi.length > 0 && (
        <div className="flex gap-3 rounded-2xl border-2 border-waspada/30 bg-waspada-muda p-5 motion-safe:animate-muncul">
          <BellRing className="mt-0.5 size-5 shrink-0 text-waspada" aria-hidden="true" />
          <div>
            <p className="font-semibold">{butuhKonfirmasi.length} laporan menunggu konfirmasimu</p>
            <p className="mt-1 text-sm text-tinta-redup">Petugas menandai pekerjaannya selesai. Cek apakah masalahnya benar-benar beres.</p>
            <ul className="mt-2 space-y-1">
              {butuhKonfirmasi.map((l) => (
                <li key={l.nomor}>
                  <Link href={`/laporan/${l.nomor}`} className="text-sm font-semibold text-rambu hover:text-rambu-tua">
                    {l.judul}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <TabRiwayat dibuat={dibuat} didukung={didukung} />
    </div>
  );
}
