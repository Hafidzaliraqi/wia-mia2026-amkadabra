import Link from "next/link";
import { Plus } from "lucide-react";
import { ambilLaporanPublik, ambilLaporanPublikByNomor, ringkas } from "@/lib/data";
import { raporInstansi, ringkasanBeranda, wilayahTerbanyak } from "@/lib/statistik";
import { hitungStatus } from "@/lib/sla";
import { situs } from "@/lib/site";
import { BarisLaporan } from "@/components/baris-laporan";
import { LacakForm } from "@/components/lacak-form";
import { ResiLaporan } from "@/components/resi-laporan";

const NOMOR_CONTOH = `${situs.kodeLaporan}-2610-0042`;

const caraKerja = [
  {
    judul: "Laporkan",
    isi: "Tandai lokasi di peta, pilih jenis masalah, ceritakan kejadiannya, dan tambahkan foto kalau ada.",
  },
  {
    judul: "Diteruskan otomatis",
    isi: "Setelah diverifikasi, laporan langsung dikirim ke instansi yang berwenang. Kamu tidak perlu menebak instansinya.",
  },
  {
    judul: "Dikerjakan dengan batas waktu",
    isi: "Setiap tahap punya tenggat yang bisa dilihat semua orang. Kalau lewat, laporan dieskalasi ke pengawas.",
  },
  {
    judul: "Kamu yang menentukan selesai",
    isi: "Laporan baru ditutup setelah kamu atau warga pendukung mengonfirmasi masalahnya benar-benar beres.",
  },
];

export default function Beranda() {
  const publik = ambilLaporanPublik();
  const unggulan =
    ambilLaporanPublikByNomor(NOMOR_CONTOH) ?? publik.find((l) => hitungStatus(l) === "diproses") ?? publik[0];
  const terbaru = publik.slice(0, 6).map(ringkas);

  const kinerja = ringkasanBeranda();
  const wilayah = wilayahTerbanyak();
  const wilayahMaks = Math.max(...wilayah.map((w) => w.total), 1);

  const rapor = raporInstansi().filter((r) => r.masuk >= 5);
  const tercepat = [...rapor]
    .filter((r) => r.rataJamRespons !== null)
    .sort((a, b) => (a.rataJamRespons ?? 0) - (b.rataJamRespons ?? 0))
    .slice(0, 3);
  const seringTerlambat = [...rapor]
    .filter((r) => r.persenTepatWaktu !== null)
    .sort((a, b) => (a.persenTepatWaktu ?? 0) - (b.persenTepatWaktu ?? 0))
    .slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-10 pb-12 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pt-16 lg:pb-20">
        <div>
          <h1 className="max-w-xl text-4xl leading-[1.05] font-extrabold tracking-tight text-balance sm:text-5xl lg:text-[3.5rem]">
            {situs.tagline}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-tinta-redup">
            Laporkan jalan rusak, lampu mati, sampah, sampai dugaan pungli. Laporanmu diteruskan ke
            instansi yang tepat, punya batas waktu yang jelas, dan baru dianggap selesai setelah kamu
            mengonfirmasi.
          </p>
          <div className="mt-8">
            <LacakForm contoh={NOMOR_CONTOH} />
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              href="/lapor"
              className="inline-flex items-center gap-2 rounded-xl bg-rambu px-5 py-3 font-semibold text-white hover:bg-rambu-tua"
            >
              <Plus className="size-5" aria-hidden="true" />
              Buat laporan
            </Link>
            <Link href="/laporan" className="font-semibold text-rambu hover:text-rambu-tua">
              Jelajah laporan warga
            </Link>
          </div>
        </div>
        {unggulan && <ResiLaporan laporan={unggulan} />}
      </section>

      {/* Kinerja dan wilayah */}
      <section className="border-y border-garis bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <div>
            <h2 className="text-xl font-bold">Kinerja layanan</h2>
            <p className="mt-1 text-sm text-tinta-redup">
              Dihitung otomatis dari semua laporan, diperbarui setiap ada perubahan status.
            </p>
            <dl className="mt-6 divide-y divide-garis border-y border-garis">
              <BarisKinerja
                label="Laporan masuk"
                keterangan="Dalam 30 hari terakhir"
                nilai={String(kinerja.masuk30Hari)}
              />
              <BarisKinerja
                label="Dikonfirmasi beres oleh pelapor"
                keterangan="Dari semua laporan yang sudah ditutup"
                nilai={kinerja.persenDikonfirmasi === null ? "–" : `${kinerja.persenDikonfirmasi}%`}
              />
              <BarisKinerja
                label="Rata-rata sampai selesai dikerjakan"
                keterangan="Sejak laporan dibuat"
                nilai={kinerja.rataHariSelesai === null ? "–" : `${Math.round(kinerja.rataHariSelesai)} hari`}
              />
              <BarisKinerja
                label="Sedang melewati batas waktu"
                keterangan="Sudah dieskalasi ke pengawas"
                nilai={String(kinerja.terlambatSekarang)}
                bahaya={kinerja.terlambatSekarang > 0}
              />
            </dl>
          </div>

          <div>
            <h2 className="text-xl font-bold">Wilayah dengan laporan terbanyak</h2>
            <p className="mt-1 text-sm text-tinta-redup">Per kecamatan, 30 hari terakhir.</p>
            <ol className="mt-6 space-y-4">
              {wilayah.map((w) => (
                <li key={w.kecamatan}>
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold">{w.kecamatan}</span>
                    <span className="angka text-tinta-redup">{w.total} laporan</span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-kertas">
                    <div
                      className="h-full rounded-full bg-tinta"
                      style={{ width: `${(w.total / wilayahMaks) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Rapor singkat instansi */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Siapa yang paling sigap</h2>
            <p className="mt-1 text-sm text-tinta-redup">
              Kinerja instansi terbuka untuk publik, bukan cuma untuk atasan mereka.
            </p>
          </div>
          <Link href="/transparansi" className="text-sm font-semibold text-rambu hover:text-rambu-tua">
            Lihat rapor semua instansi
          </Link>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-garis bg-white p-5">
            <h3 className="font-bold">Respons awal tercepat</h3>
            <ul className="mt-4 space-y-3">
              {tercepat.map((r) => (
                <li key={r.instansi.id} className="flex justify-between gap-4 text-sm">
                  <span>{r.instansi.nama}</span>
                  <span className="angka font-semibold text-tuntas">
                    {Math.round(r.rataJamRespons ?? 0)} jam
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-garis bg-white p-5">
            <h3 className="font-bold">Paling sering lewat batas waktu</h3>
            <ul className="mt-4 space-y-3">
              {seringTerlambat.map((r) => (
                <li key={r.instansi.id} className="flex justify-between gap-4 text-sm">
                  <span>{r.instansi.nama}</span>
                  <span className="angka font-semibold text-bahaya">
                    {r.persenTepatWaktu}% tepat waktu
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Laporan terbaru */}
      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-xl font-bold">Laporan terbaru</h2>
          <Link href="/laporan" className="text-sm font-semibold text-rambu hover:text-rambu-tua">
            Jelajah semua laporan
          </Link>
        </div>
        <ul className="mt-6 divide-y divide-garis overflow-hidden rounded-2xl border border-garis bg-white">
          {terbaru.map((l) => (
            <BarisLaporan key={l.nomor} laporan={l} />
          ))}
        </ul>
      </section>

      {/* Cara kerja */}
      <section className="border-t border-garis bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <h2 className="text-xl font-bold">Cara kerjanya</h2>
          <ol className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {caraKerja.map((langkah, i) => (
              <li key={langkah.judul}>
                <span className="angka flex size-9 items-center justify-center rounded-full bg-rambu-muda text-sm font-bold text-rambu-tua">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-bold">{langkah.judul}</h3>
                <p className="mt-2 text-sm leading-relaxed text-tinta-redup">{langkah.isi}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}

function BarisKinerja({
  label,
  keterangan,
  nilai,
  bahaya = false,
}: {
  label: string;
  keterangan: string;
  nilai: string;
  bahaya?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-4">
      <dt>
        <span className="block font-semibold">{label}</span>
        <span className="mt-0.5 block text-sm text-tinta-redup">{keterangan}</span>
      </dt>
      <dd className={`angka text-2xl font-extrabold tracking-tight whitespace-nowrap ${bahaya ? "text-bahaya" : ""}`}>
        {nilai}
      </dd>
    </div>
  );
}
