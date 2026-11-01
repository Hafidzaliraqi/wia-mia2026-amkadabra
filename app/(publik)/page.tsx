import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { ArrowRight, BadgeCheck, Building2, CircleCheck, Inbox, Plus, Siren, Timer } from "lucide-react";
import { aktivitasTerkini, ambilSemuaLaporan, laporanPublik, ringkas } from "@/lib/server/laporan";
import { ringkasanBeranda, wilayahTerbanyak } from "@/lib/statistik";
import { hitungStatus } from "@/lib/sla";
import { situs } from "@/lib/site";
import { daftarKota } from "@/lib/wilayah";
import { AktivitasTerkini } from "@/components/aktivitas-terkini";
import { AngkaNaik } from "@/components/angka-naik";
import { BarisLaporan } from "@/components/baris-laporan";
import { LacakForm } from "@/components/lacak-form";
import { ResiLaporan } from "@/components/resi-laporan";
import { LatarHero } from "@/components/latar-hero";
import { KartuMiring } from "@/components/kartu-miring";
import { Muncul } from "@/components/muncul";
import { SimulasiAlur } from "@/components/simulasi-alur";
import { MarqueeWilayah } from "@/components/beranda/marquee-wilayah";
import { BentoFitur } from "@/components/beranda/bento";

export default function Beranda() {
  const kata = situs.tagline.split(" ");
  const akhir = kata.pop();

  return (
    <>
      <LatarHero>
        <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-4 pt-14 pb-20 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16 lg:pt-20 lg:pb-28">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 backdrop-blur">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full rounded-full bg-sinyal opacity-70 motion-safe:animate-ping" />
                <span className="relative inline-flex size-2 rounded-full bg-sinyal" />
              </span>
              Melayani {daftarKota.length} kota dan kabupaten
            </p>
            <h1 className="mt-6 text-[2.6rem] leading-[1.02] font-extrabold text-balance sm:text-6xl lg:text-[4.3rem]">
              {kata.map((k, i) => (
                <span key={i}>
                  <span className="inline-block motion-safe:animate-kata" style={{ animationDelay: `${i * 80}ms` }}>
                    {k}
                  </span>{" "}
                </span>
              ))}
              <span className="relative inline-block text-sinyal motion-safe:animate-kata" style={{ animationDelay: `${kata.length * 80}ms` }}>
                {akhir}
                <svg aria-hidden="true" viewBox="0 0 300 24" preserveAspectRatio="none" className="absolute -bottom-2 left-0 h-3 w-full">
                  <path d="M4 17 C 80 5, 190 3, 296 11" fill="none" stroke="currentColor" strokeOpacity="0.55" strokeWidth="6" strokeLinecap="round" strokeDasharray="420" className="motion-safe:animate-gores" />
                </svg>
              </span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-white/70">
              Laporkan jalan rusak, sampah, sampai dugaan pungli. Laporanmu diteruskan otomatis ke instansi yang tepat, punya batas
              waktu yang bisa dipantau semua orang, dan baru selesai setelah kamu mengonfirmasi.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/lapor"
                className="kilau inline-flex items-center gap-2 rounded-xl bg-sinyal px-5 py-3.5 font-bold text-tinta shadow-lg shadow-sinyal/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sinyal/30 active:translate-y-0"
              >
                <Plus className="size-5" aria-hidden="true" />
                Buat laporan
              </Link>
              <Link
                href="/masuk#demo"
                className="group inline-flex items-center gap-2 rounded-xl px-5 py-3.5 font-semibold text-white ring-1 ring-white/25 ring-inset transition hover:bg-white/10"
              >
                Coba demo tanpa daftar
                <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-9 max-w-xl rounded-2xl bg-white p-4 text-tinta shadow-2xl shadow-black/30 sm:p-5">
              <Suspense fallback={<LacakForm contoh={`${situs.kodeLaporan}-0000-0000`} />}>
                <LacakDenganContoh />
              </Suspense>
            </div>
            <div className="mt-3 max-w-xl text-tinta">
              <Suspense fallback={<div className="h-12 rounded-xl bg-white/10" />}>
                <KabarTerbaru />
              </Suspense>
            </div>
          </div>

          <div className="relative">
            <div aria-hidden="true" className="absolute inset-x-6 top-8 -bottom-5 rotate-3 rounded-2xl bg-white/[0.07] ring-1 ring-white/10" />
            <div className="motion-safe:animate-melayang">
              <KartuMiring className="text-tinta">
                <Suspense fallback={<div className="h-[26rem] rounded-2xl bg-white/10" />}>
                  <ResiSorotan />
                </Suspense>
              </KartuMiring>
            </div>
            <div className="absolute top-[38%] -left-8 hidden items-center gap-2 rounded-xl bg-white px-3.5 py-2.5 text-sm font-semibold text-tinta shadow-2xl shadow-black/30 motion-safe:animate-melayang xl:flex" style={{ animationDelay: "-2s" }}>
              <CircleCheck className="size-4 text-tuntas" aria-hidden="true" />
              Dikonfirmasi warga
            </div>
            <div className="absolute -right-5 -bottom-6 hidden items-center gap-2 rounded-xl bg-sinyal px-3.5 py-2.5 text-sm font-bold text-tinta shadow-2xl shadow-black/30 motion-safe:animate-melayang sm:flex" style={{ animationDelay: "-4s" }}>
              <Building2 className="size-4" aria-hidden="true" />
              Diteruskan otomatis
            </div>
          </div>
        </section>
      </LatarHero>

      <MarqueeWilayah />

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
        <JudulBagian
          label="Kenapa Tuntasin"
          judul="Bukan sekadar kotak pengaduan"
          deskripsi="Setiap laporan punya alamat yang jelas, batas waktu yang terbuka, dan baru dianggap selesai setelah warga sendiri yang memastikan."
        />
        <div className="mt-12">
          <BentoFitur />
        </div>
      </section>

      <Muncul>
        <Suspense fallback={<KerangkaData />}>
          <BagianData />
        </Suspense>
      </Muncul>

      <section className="border-y border-garis bg-white">
        <Muncul className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
          <JudulBagian
            label="Cara kerjanya"
            judul="Ikuti perjalanan satu laporan"
            deskripsi="Dari titik di peta sampai cap selesai. Klik setiap tahap untuk melihat apa yang terjadi."
            aksi={
              <Link href="/tentang" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-rambu hover:text-rambu-tua">
                Selengkapnya dan FAQ
                <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            }
          />
          <div className="mt-12">
            <SimulasiAlur />
          </div>
        </Muncul>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:py-24">
        <Muncul className="relative isolate mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-malam px-6 py-14 text-white sm:px-12 sm:py-16">
          <div aria-hidden="true" className="latar-kisi absolute inset-0 -z-10" />
          <div aria-hidden="true" className="absolute -top-32 -right-20 -z-10 size-96 rounded-full bg-rambu/50 blur-[100px]" />
          <div aria-hidden="true" className="absolute -bottom-40 left-10 -z-10 size-80 rounded-full bg-sinyal/20 blur-[100px]" />
          <h2 className="max-w-2xl text-3xl leading-tight font-extrabold sm:text-5xl">Ada jalan rusak atau sampah menumpuk di sekitarmu?</h2>
          <p className="mt-4 max-w-xl text-lg text-white/70">Laporkan dalam dua menit. Gratis, dan namamu bisa disembunyikan dari publik.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/lapor" className="kilau inline-flex items-center gap-2 rounded-xl bg-sinyal px-5 py-3.5 font-bold text-tinta transition hover:-translate-y-0.5">
              <Plus className="size-5" aria-hidden="true" />
              Buat laporan
            </Link>
            <Link href="/laporan" className="inline-flex items-center gap-2 rounded-xl px-5 py-3.5 font-semibold ring-1 ring-white/25 ring-inset transition hover:bg-white/10">
              Lihat laporan warga
            </Link>
          </div>
        </Muncul>
      </section>
    </>
  );
}

function JudulBagian({ label, judul, deskripsi, aksi }: { label: string; judul: string; deskripsi: string; aksi?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div className="max-w-2xl">
        <p className="text-sm font-bold tracking-wide text-rambu uppercase">{label}</p>
        <h2 className="mt-3 text-3xl leading-tight font-extrabold sm:text-[2.6rem]">{judul}</h2>
        <p className="mt-4 text-lg leading-relaxed text-tinta-redup">{deskripsi}</p>
      </div>
      {aksi}
    </div>
  );
}

async function LacakDenganContoh() {
  await connection();
  const sorotan = (await ambilSemuaLaporan()).find((l) => l.sorotan);
  return <LacakForm contoh={sorotan?.nomor ?? `${situs.kodeLaporan}-0000-0000`} />;
}

async function KabarTerbaru() {
  await connection();
  return <AktivitasTerkini daftar={aktivitasTerkini(await ambilSemuaLaporan())} />;
}

async function ResiSorotan() {
  await connection();
  const publik = laporanPublik(await ambilSemuaLaporan());
  const laporan = publik.find((l) => l.sorotan) ?? publik.find((l) => hitungStatus(l) === "diproses") ?? publik[0];
  return laporan ? <ResiLaporan laporan={laporan} /> : null;
}

async function BagianData() {
  await connection();
  const semua = await ambilSemuaLaporan();
  const terbaru = laporanPublik(semua)
    .filter((l) => !["terkirim", "ditolak"].includes(hitungStatus(l)))
    .slice(0, 4)
    .map(ringkas);
  const kinerja = ringkasanBeranda(semua);
  const wilayah = wilayahTerbanyak(semua);
  const wilayahMaks = Math.max(...wilayah.map((w) => w.total), 1);

  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:pb-28">
      <JudulBagian
        label="Data terbuka"
        judul="Kinerja layanan, dihitung dari laporan nyata"
        deskripsi="Semua angka di bawah ini dihitung otomatis setiap kali halaman dibuka. Tidak ada yang diisi manual."
        aksi={
          <Link href="/transparansi" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-rambu hover:text-rambu-tua">
            Rapor semua instansi
            <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        }
      />
      <dl className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KartuAngka ikon={Inbox} label="Laporan masuk" keterangan="30 hari terakhir" nilai={<AngkaNaik nilai={kinerja.masuk30Hari} />} />
        <KartuAngka
          ikon={BadgeCheck}
          label="Dikonfirmasi beres"
          keterangan="oleh pelapor atau pendukung"
          nilai={kinerja.persenDikonfirmasi === null ? "–" : <AngkaNaik nilai={kinerja.persenDikonfirmasi} akhiran="%" />}
          warna="text-tuntas"
        />
        <KartuAngka
          ikon={Timer}
          label="Rata-rata sampai selesai"
          keterangan="sejak laporan dibuat"
          nilai={kinerja.rataHariSelesai === null ? "–" : <AngkaNaik nilai={Math.round(kinerja.rataHariSelesai)} akhiran=" hari" />}
        />
        <KartuAngka
          ikon={Siren}
          label="Lewat batas waktu"
          keterangan="sudah dieskalasi ke pengawas"
          nilai={<AngkaNaik nilai={kinerja.terlambatSekarang} />}
          warna={kinerja.terlambatSekarang > 0 ? "text-bahaya" : ""}
        />
      </dl>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-garis bg-white p-6 sm:p-7">
          <h3 className="text-xl font-bold">Daerah dengan laporan terbanyak</h3>
          <p className="mt-1 text-sm text-tinta-redup">Per kecamatan, 30 hari terakhir.</p>
          <ol className="mt-6 space-y-4">
            {wilayah.map((w, i) => (
              <li key={`${w.kota}-${w.kecamatan}`}>
                <div className="flex justify-between gap-3 text-sm">
                  <span>
                    <span className="font-semibold">{w.kecamatan}</span>
                    <span className="text-tinta-redup">, {w.kota}</span>
                  </span>
                  <span className="angka shrink-0 font-semibold">{w.total}</span>
                </div>
                <div className="mt-1.5 h-2.5 rounded-full bg-kertas">
                  <div
                    className={`h-full origin-left rounded-full motion-safe:animate-[tumbuh_1s_ease-out_both] ${i === 0 ? "bg-rambu" : "bg-rambu/40"}`}
                    style={{ width: `${(w.total / wilayahMaks) * 100}%`, animationDelay: `${i * 90}ms` }}
                  />
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="flex flex-col overflow-hidden rounded-3xl border border-garis bg-white">
          <div className="flex items-baseline justify-between gap-4 px-6 pt-6 sm:px-7">
            <h3 className="text-xl font-bold">Laporan terbaru</h3>
            <Link href="/laporan" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-rambu hover:text-rambu-tua">
              Lihat semua
              <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>
          <ul className="mt-3 divide-y divide-garis border-t border-garis">
            {terbaru.map((l) => (
              <BarisLaporan key={l.nomor} laporan={l} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function KartuAngka({
  ikon: Ikon,
  label,
  keterangan,
  nilai,
  warna = "",
}: {
  ikon: typeof Inbox;
  label: string;
  keterangan: string;
  nilai: React.ReactNode;
  warna?: string;
}) {
  return (
    <div className="rounded-3xl border border-garis bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-tinta/5">
      <Ikon className="size-5 text-tinta-redup" aria-hidden="true" />
      <dd className={`mt-5 font-display text-5xl font-extrabold tracking-tight ${warna}`}>{nilai}</dd>
      <dt className="mt-2">
        <span className="block font-semibold">{label}</span>
        <span className="block text-sm text-tinta-redup">{keterangan}</span>
      </dt>
    </div>
  );
}

function KerangkaData() {
  return (
    <div className="mx-auto grid max-w-6xl animate-pulse gap-4 px-4 pb-20 motion-reduce:animate-none sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-48 rounded-3xl bg-white" />
      ))}
    </div>
  );
}
