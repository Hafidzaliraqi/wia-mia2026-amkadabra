import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { BadgeCheck, ChevronDown, Download, Siren, Timer, Zap } from "lucide-react";
import { ambilSemuaLaporan } from "@/lib/server/laporan";
import {
  BATAS_KONFIRMASI_HARI,
  SLA_RESPONS_HARI_KERJA,
  SLA_VERIFIKASI_HARI_KERJA,
  daftarKategori,
  daftarKelompok,
} from "@/lib/data/referensi";
import { laporanPerBulan, metrikPublik, raporInstansi } from "@/lib/statistik";
import { AngkaNaik } from "@/components/angka-naik";
import { PenyegarOtomatis } from "@/components/penyegar-otomatis";
import { PilihDaerah } from "@/components/transparansi/pilih-daerah";
import { GrafikMingguan } from "@/components/transparansi/grafik-mingguan";
import { TabelRapor } from "@/components/rapor-instansi";
import { PetaSebaranMuat } from "@/components/peta-sebaran-muat";
import type { TitikSebaran } from "@/components/peta-sebaran";
import { apakahTerlambat } from "@/lib/sla";
import { daftarKota } from "@/lib/wilayah";
import { HARI, sekarang } from "@/lib/waktu";
import { KelompokIkon } from "@/components/kategori-ikon";

export const metadata: Metadata = { title: "Transparansi" };

export default function HalamanTransparansi({ searchParams }: PageProps<"/transparansi">) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Transparansi</h1>
          <p className="mt-2 max-w-2xl text-tinta-redup">
            Kinerja setiap instansi dihitung otomatis dari riwayat laporan, tanpa diisi manual.
          </p>
        </div>
        <a
          href="/api/data/laporan"
          download
          className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold ring-1 ring-garis ring-inset transition hover:ring-rambu"
        >
          <Download className="size-4" aria-hidden="true" />
          Unduh data (CSV)
        </a>
      </div>

      <Suspense fallback={<div className="mt-8 h-[36rem] animate-pulse rounded-3xl bg-white motion-reduce:animate-none" />}>
        <BagianKinerja searchParams={searchParams} />
      </Suspense>

      <section className="mt-14">
        <h2 className="text-2xl font-extrabold">Peta sebaran laporan</h2>
        <p className="mt-1 text-sm text-tinta-redup">
          90 hari terakhir. Makin besar lingkaran, makin banyak laporan. Warna menunjukkan porsi laporan yang lewat batas waktu.
        </p>
        <div className="mt-4">
          <Suspense fallback={<div className="h-[420px] animate-pulse rounded-2xl bg-white motion-reduce:animate-none" />}>
            <BagianPeta />
          </Suspense>
        </div>
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-tinta-redup">
          <li className="flex items-center gap-1.5"><span className="size-3 rounded-full bg-tuntas" />Kurang dari 10% lewat batas</li>
          <li className="flex items-center gap-1.5"><span className="size-3 rounded-full bg-waspada-terang" />10–25% lewat batas</li>
          <li className="flex items-center gap-1.5"><span className="size-3 rounded-full bg-bahaya" />Lebih dari 25% lewat batas</li>
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-extrabold">Rapor instansi</h2>
        <div className="mt-4">
          <Suspense fallback={<div className="h-80 animate-pulse rounded-2xl bg-white motion-reduce:animate-none" />}>
            <BagianRapor />
          </Suspense>
        </div>
        <p className="mt-3 text-xs text-tinta-redup">
          Respons awal dihitung sejak laporan diteruskan sampai instansi mulai mengerjakan. Dibuka ulang artinya warga
          menyatakan masalahnya belum beres setelah ditandai selesai.
        </p>
      </section>

      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="text-2xl font-extrabold">Standar waktu layanan</h2>
          <p className="mt-1 text-sm text-tinta-redup">Berlaku untuk semua daerah, dihitung dalam hari kerja.</p>
          <dl className="mt-5 divide-y divide-garis rounded-2xl border border-garis bg-white">
            <BarisStandar label="Verifikasi oleh admin" nilai={`${SLA_VERIFIKASI_HARI_KERJA} hari kerja`} />
            <BarisStandar label="Respons awal instansi" nilai={`${SLA_RESPONS_HARI_KERJA} hari kerja`} />
            <BarisStandar label="Konfirmasi warga sebelum ditutup otomatis" nilai={`${BATAS_KONFIRMASI_HARI} hari`} />
          </dl>
          <p className="mt-6 mb-3 text-sm font-semibold">Batas penyelesaian per jenis masalah</p>
          <div className="space-y-2">
            {daftarKelompok.map((kel) => (
              <details key={kel.id} className="group rounded-2xl border border-garis bg-white">
                <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-3.5 font-semibold [&::-webkit-details-marker]:hidden">
                  <KelompokIkon id={kel.id} className="size-4 text-rambu" />
                  {kel.nama}
                  <ChevronDown className="ml-auto size-4 text-tinta-redup transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <dl className="divide-y divide-garis border-t border-garis">
                  {daftarKategori.filter((k) => k.kelompok === kel.id).map((k) => (
                    <BarisStandar key={k.id} label={k.nama} nilai={`${k.slaHariKerja} hari kerja`} />
                  ))}
                </dl>
              </details>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-extrabold">Laporan per bulan</h2>
          <p className="mt-1 text-sm text-tinta-redup">Jumlah laporan baru dari semua daerah.</p>
          <Suspense fallback={<div className="mt-5 h-48 animate-pulse rounded-2xl bg-white motion-reduce:animate-none" />}>
            <BagianBulanan />
          </Suspense>
        </section>
      </div>
    </div>
  );
}

async function BagianKinerja({ searchParams }: Pick<PageProps<"/transparansi">, "searchParams">) {
  await connection();
  const { kota } = await searchParams;
  const kotaId = typeof kota === "string" && daftarKota.some((k) => k.id === kota) ? kota : undefined;
  const m = metrikPublik(await ambilSemuaLaporan(), kotaId);
  const totalEskalasi = m.eskalasi.reduce((a, b) => a + b, 0);
  const maksEskalasi = Math.max(1, ...m.eskalasi);
  const kartu = [
    { ikon: BadgeCheck, label: "Laporan tuntas", nilai: m.persenTuntas, akhiran: "%", ket: `dari ${m.terverifikasi} laporan terverifikasi`, warna: "text-tuntas" },
    { ikon: Timer, label: "Rata-rata selesai dikerjakan", nilai: m.rataHariSelesai === null ? null : Math.round(m.rataHariSelesai), akhiran: " hari", ket: "sejak laporan dibuat", warna: "" },
    { ikon: Zap, label: "Respons awal instansi", nilai: m.rataJamRespons === null ? null : Math.round(m.rataJamRespons), akhiran: " jam", ket: "sejak laporan diteruskan", warna: "" },
    { ikon: Siren, label: "Tuntas tanpa eskalasi", nilai: m.persenTanpaEskalasi, akhiran: "%", ket: "selesai sebelum batas waktu", warna: "" },
  ];
  const tingkatNama = ["Pimpinan instansi", "Inspektorat", "Kepala daerah"];

  return (
    <section className="mt-8" aria-labelledby="judul-kinerja">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h2 id="judul-kinerja" className="text-2xl font-extrabold">
            Kinerja layanan
          </h2>
          <PenyegarOtomatis detik={30} />
        </div>
        <PilihDaerah nilai={kotaId ?? "semua"} daftar={daftarKota.map((k) => ({ id: k.id, nama: k.nama }))} />
      </div>
      <p className="mt-1 text-sm text-tinta-redup">90 hari terakhir · {m.masuk} laporan masuk</p>

      <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kartu.map(({ ikon: Ikon, label, nilai, akhiran, ket, warna }) => (
          <div key={label} className="rounded-3xl border border-garis bg-white p-6">
            <Ikon className="size-5 text-tinta-redup" aria-hidden="true" />
            <dd className={`mt-4 font-display text-4xl font-extrabold tracking-tight ${warna}`}>
              {nilai === null ? "–" : <AngkaNaik nilai={nilai} akhiran={akhiran} />}
            </dd>
            <dt className="mt-2">
              <span className="block font-semibold">{label}</span>
              <span className="block text-sm text-tinta-redup">{ket}</span>
            </dt>
          </div>
        ))}
      </dl>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-garis bg-white p-6 lg:col-span-2">
          <h3 className="text-lg font-bold">Laporan masuk dan tuntas per minggu</h3>
          <div className="mt-4">
            <GrafikMingguan data={m.mingguan} />
          </div>
        </div>
        <div className="rounded-3xl border border-garis bg-white p-6">
          <h3 className="text-lg font-bold">Eskalasi yang sedang berjalan</h3>
          <p className="mt-1 text-sm text-tinta-redup">
            <span className="font-display text-3xl font-extrabold text-tinta">{totalEskalasi}</span> laporan sudah naik dari petugas
          </p>
          <ul className="mt-5 space-y-4">
            {m.eskalasi.map((n, i) => (
              <li key={i}>
                <div className="flex justify-between text-sm">
                  <span>
                    <span className="font-semibold">Tingkat {i + 1}</span> · {tingkatNama[i]}
                  </span>
                  <span className="angka font-semibold">{n}</span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-kertas">
                  <div className="h-full rounded-full bg-bahaya" style={{ width: `${(n / maksEskalasi) * 100}%`, opacity: 0.45 + i * 0.25 }} />
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-xs leading-relaxed text-tinta-redup">
            Lewat batas waktu naik ke pimpinan instansi, 3 hari kerja kemudian ke inspektorat, lalu 5 hari kerja kemudian ke kepala daerah.
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-garis bg-white p-6">
        <h3 className="text-lg font-bold">Ketuntasan per jenis masalah</h3>
        <ul className="mt-5 grid gap-x-10 gap-y-4 sm:grid-cols-2">
          {m.perKelompok.map((g) => (
            <li key={g.id} className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-rambu-muda text-rambu">
                <KelompokIkon id={g.id} className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-2 text-sm">
                  <span className="truncate font-semibold">{g.nama}</span>
                  <span className="angka shrink-0 text-tinta-redup">
                    {g.persenTuntas === null ? "–" : `${g.persenTuntas}%`} · {g.masuk} laporan
                  </span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-kertas">
                  <div className="h-full rounded-full bg-tuntas" style={{ width: `${g.persenTuntas ?? 0}%` }} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

async function BagianPeta() {
  await connection();
  const batas = sekarang().getTime() - 90 * HARI;
  const semua = (await ambilSemuaLaporan()).filter((l) => new Date(l.dibuatPada).getTime() >= batas);
  const titik: TitikSebaran[] = daftarKota.flatMap((kota) =>
    kota.kecamatan
      .map((kec) => {
        const milik = semua.filter((l) => l.kotaId === kota.id && l.kecamatan === kec.nama);
        return {
          kunci: `${kota.id}-${kec.nama}`,
          nama: `Kec. ${kec.nama}, ${kota.nama}`,
          lat: kec.lat,
          lng: kec.lng,
          total: milik.length,
          terlambat: milik.filter(apakahTerlambat).length,
        };
      })
      .filter((t) => t.total > 0),
  );
  return <PetaSebaranMuat titik={titik} />;
}

async function BagianRapor() {
  await connection();
  return <TabelRapor rapor={raporInstansi(await ambilSemuaLaporan())} />;
}

async function BagianBulanan() {
  await connection();
  const perBulan = laporanPerBulan(await ambilSemuaLaporan(), 3);
  const maks = Math.max(...perBulan.map((b) => b.total), 1);
  return (
    <ol className="mt-5 space-y-5 rounded-2xl border border-garis bg-white p-5">
      {perBulan.map((b) => (
        <li key={b.bulan}>
          <div className="flex justify-between text-sm">
            <span className="font-semibold">{b.bulan}</span>
            <span className="angka text-tinta-redup">{b.total} laporan</span>
          </div>
          <div className="mt-1.5 h-2.5 rounded-full bg-kertas">
            <div className="h-full rounded-full bg-rambu" style={{ width: `${(b.total / maks) * 100}%` }} />
          </div>
        </li>
      ))}
    </ol>
  );
}

function BarisStandar({ label, nilai }: { label: string; nilai: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
      <dt>{label}</dt>
      <dd className="angka shrink-0 font-semibold">{nilai}</dd>
    </div>
  );
}
