import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { ambilSemuaLaporan, laporanPublik, ringkas } from "@/lib/server/laporan";
import { penggunaSaatIni } from "@/lib/server/sesi";
import { formatHariTanggalJam, sekarang, tambahHariKerja, tanggalWib } from "@/lib/waktu";
import { FormLaporan, type KandidatDuplikat } from "@/components/form-laporan";

export const metadata: Metadata = { title: "Buat laporan" };

export default function HalamanLapor() {
  return (
    <div className="px-4 py-8 sm:px-6 lg:py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Buat laporan</h1>
        <p className="mt-2 text-tinta-redup">Enam langkah singkat. Kamu bisa kembali ke langkah sebelumnya kapan saja.</p>
      </div>
      <div className="mt-8">
        <Suspense fallback={<div className="mx-auto h-96 max-w-3xl animate-pulse rounded-2xl bg-white motion-reduce:animate-none" />}>
          <IsiLapor />
        </Suspense>
      </div>
    </div>
  );
}

async function IsiLapor() {
  await connection();
  const pengguna = await penggunaSaatIni();

  if (!pengguna) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-garis bg-white p-6 text-center sm:p-10">
        <h2 className="text-xl font-bold">Masuk dulu untuk membuat laporan</h2>
        <p className="mx-auto mt-2 max-w-md leading-relaxed text-tinta-redup">
          Akun dibutuhkan supaya kamu dapat kabar perkembangan dan bisa mengonfirmasi saat laporanmu selesai dikerjakan.
          Namamu tetap bisa disembunyikan dari publik.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/masuk?lanjut=%2Flapor" className="rounded-xl bg-rambu px-6 py-3 font-semibold text-white hover:bg-rambu-tua">
            Masuk
          </Link>
          <Link href="/daftar?lanjut=%2Flapor" className="rounded-xl px-6 py-3 font-semibold text-rambu ring-1 ring-rambu/40 ring-inset hover:bg-rambu-muda">
            Daftar
          </Link>
        </div>
      </div>
    );
  }

  if (pengguna.peran !== "warga") {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-garis bg-white p-6 text-center sm:p-10">
        <h2 className="text-xl font-bold">Akun {pengguna.peran} tidak bisa membuat laporan</h2>
        <p className="mx-auto mt-2 max-w-md leading-relaxed text-tinta-redup">
          Supaya tidak ada konflik kepentingan, laporan hanya dibuat dari akun warga.
        </p>
        <Link href={`/${pengguna.peran}`} className="mt-6 inline-block rounded-xl bg-rambu px-6 py-3 font-semibold text-white hover:bg-rambu-tua">
          Ke dasbor
        </Link>
      </div>
    );
  }

  const kandidat: KandidatDuplikat[] = laporanPublik(await ambilSemuaLaporan())
    .map(ringkas)
    .filter((l) => ["terkirim", "diteruskan", "diproses", "menunggu_konfirmasi"].includes(l.status))
    .map((l) => ({
      nomor: l.nomor,
      judul: l.judul,
      kategoriId: l.kategoriId,
      kotaId: l.kotaId,
      kecamatan: l.kecamatan,
      lat: l.lat,
      lng: l.lng,
      status: l.status,
      dukungan: l.dukungan,
      dibuatTeks: l.dibuatTeks,
    }));

  return (
    <FormLaporan
      kandidat={kandidat}
      hariIni={tanggalWib()}
      batasVerifikasiTeks={formatHariTanggalJam(tambahHariKerja(sekarang(), 3))}
      pusatAwal={{ lat: -6.2607, lng: 106.8296 }}
    />
  );
}
