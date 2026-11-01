"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Building2, Camera, Check, CircleCheck, MapPin, ThumbsUp, TriangleAlert } from "lucide-react";
import type { StatusLaporan } from "@/lib/types";
import { LangkahStatus } from "@/components/langkah-status";

const DURASI = 5000;

const tahap: { judul: string; isi: string; status: StatusLaporan; label: string; warna: string }[] = [
  { judul: "Laporkan", isi: "Tandai lokasi di peta, pilih jenis masalah, ceritakan, dan tambahkan foto.", status: "terkirim", label: "Terkirim", warna: "bg-kertas text-tinta-redup" },
  { judul: "Diteruskan otomatis", isi: "Setelah diverifikasi admin, sistem memilih instansi yang berwenang di daerahmu.", status: "diteruskan", label: "Diteruskan ke instansi", warna: "bg-rambu-muda text-rambu-tua" },
  { judul: "Dikerjakan dengan tenggat", isi: "Tenggat setiap tahap terbuka untuk publik. Petugas mengabari lewat percakapan.", status: "diproses", label: "Sedang dikerjakan", warna: "bg-rambu-muda text-rambu-tua" },
  { judul: "Kamu yang mengonfirmasi", isi: "Petugas wajib melampirkan foto sesudah. Kamu yang menilai sudah beres atau belum.", status: "menunggu_konfirmasi", label: "Menunggu konfirmasi", warna: "bg-waspada-muda text-waspada" },
  { judul: "Tuntas", isi: "Laporan selesai, dan kecepatan instansi tercatat di rapor publik.", status: "selesai", label: "Selesai", warna: "bg-tuntas-muda text-tuntas" },
];

// Simulasi perjalanan satu laporan: tahap berganti otomatis dan bisa dipilih sendiri
export function SimulasiAlur() {
  const [aktif, setAktif] = useState(0);
  const [jeda, setJeda] = useState(false);

  useEffect(() => {
    if (jeda || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const pewaktu = window.setTimeout(() => setAktif((i) => (i + 1) % tahap.length), DURASI);
    return () => window.clearTimeout(pewaktu);
  }, [aktif, jeda]);

  const t = tahap[aktif];

  return (
    <div
      className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center"
      onMouseEnter={() => setJeda(true)}
      onMouseLeave={() => setJeda(false)}
      onFocus={() => setJeda(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setJeda(false);
      }}
    >
      <div role="tablist" aria-label="Tahap perjalanan laporan" aria-orientation="vertical" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
        {tahap.map((item, i) => {
          const dipilih = i === aktif;
          return (
            <button
              key={item.judul}
              id={`tab-alur-${i}`}
              type="button"
              role="tab"
              aria-selected={dipilih}
              aria-controls="panel-alur"
              tabIndex={dipilih ? 0 : -1}
              onClick={() => setAktif(i)}
              onKeyDown={(e) => {
                const arah = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
                if (!arah) return;
                e.preventDefault();
                const baru = (i + arah + tahap.length) % tahap.length;
                setAktif(baru);
                document.getElementById(`tab-alur-${baru}`)?.focus();
              }}
              className={`relative w-60 shrink-0 overflow-hidden rounded-2xl border px-4 py-3.5 text-left transition-all duration-300 lg:w-auto ${
                dipilih ? "border-rambu/25 bg-white shadow-lg shadow-rambu/5" : "border-transparent hover:bg-white/70"
              }`}
            >
              <span className="flex items-start gap-3">
                <span
                  className={`angka flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors duration-300 ${
                    dipilih ? "bg-rambu text-white" : i < aktif ? "bg-rambu-muda text-rambu-tua" : "bg-white text-tinta-redup ring-1 ring-garis"
                  }`}
                >
                  {i < aktif ? <Check className="size-4" aria-hidden="true" /> : i + 1}
                </span>
                <span className="min-w-0">
                  <span className="block font-bold">{item.judul}</span>
                  <span className={`mt-1 block text-sm leading-relaxed text-tinta-redup ${dipilih ? "" : "line-clamp-2 lg:line-clamp-1"}`}>{item.isi}</span>
                </span>
              </span>
              {dipilih && (
                <span
                  key={`${aktif}-${jeda}`}
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-rambu motion-safe:animate-progres"
                  style={{ animationDuration: `${DURASI}ms`, animationPlayState: jeda ? "paused" : "running" }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div id="panel-alur" role="tabpanel" aria-labelledby={`tab-alur-${aktif}`} className="relative">
        <div aria-hidden="true" className="absolute -inset-2 -z-10 rounded-[2.5rem] sm:-inset-6 bg-gradient-to-br from-rambu/15 via-transparent to-tuntas/15 blur-2xl" />
        <div className="overflow-hidden rounded-3xl border border-garis bg-white shadow-xl shadow-tinta/5">
          <div className="flex items-center gap-1.5 border-b border-garis bg-kertas/70 px-4 py-2.5" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-bahaya/50" />
            <span className="size-2.5 rounded-full bg-waspada-terang/60" />
            <span className="size-2.5 rounded-full bg-tuntas/50" />
            <span className="ml-2 truncate rounded-md bg-white px-2.5 py-0.5 text-xs text-tinta-redup">tuntasin.id/laporan/TSN-2611-0042</span>
          </div>
          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="angka text-sm font-bold">TSN-2611-0042</p>
              <span key={aktif} className={`rounded-full px-2.5 py-0.5 text-xs font-semibold motion-safe:animate-muncul ${t.warna}`}>{t.label}</span>
            </div>
            <p className="mt-1 font-bold">Jalan berlubang di Jl. Tebet Raya</p>
            <div key={`langkah-${aktif}`} className="mt-5">
              <LangkahStatus status={t.status} />
            </div>
            <div key={`isi-${aktif}`} className="mt-5 min-h-[14rem] motion-safe:animate-muncul">
              <Pratinjau indeks={aktif} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Pratinjau({ indeks }: { indeks: number }) {
  if (indeks === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-start gap-3 rounded-xl bg-kertas p-3">
          <MapPin className="mt-0.5 size-4 shrink-0 text-rambu" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold">Jl. Tebet Raya No. 20</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-tuntas">
              <CircleCheck className="size-3.5" aria-hidden="true" />
              Terdeteksi: Kecamatan Tebet, Jakarta Selatan
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full bg-rambu-muda px-2.5 py-1 text-rambu-tua">Jalan rusak</span>
          <span className="flex items-center gap-1 rounded-full bg-kertas px-2.5 py-1 text-tinta-redup">
            <Camera className="size-3.5" aria-hidden="true" />1 foto, diambil hari ini
          </span>
        </div>
        <p className="rounded-xl border border-garis p-3 text-sm leading-relaxed">
          Lubang dalam di depan apotek, sudah dua minggu. Motor sering oleng saat malam.
        </p>
      </div>
    );
  }
  if (indeks === 1) {
    const cek = ["Diverifikasi admin dalam 2 jam", "Tidak ada laporan serupa dalam radius 500 m", "Instansi dipilih otomatis dari jenis masalah dan lokasi"];
    return (
      <div>
        <ul className="space-y-2.5">
          {cek.map((teks, j) => (
            <li key={teks} className="flex items-center gap-2 text-sm motion-safe:animate-muncul" style={{ animationDelay: `${j * 300}ms`, animationFillMode: "both" }}>
              <CircleCheck className="size-4 shrink-0 text-tuntas" aria-hidden="true" />
              {teks}
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-wrap items-center gap-2 rounded-xl bg-rambu-muda/60 p-3 text-sm motion-safe:animate-muncul" style={{ animationDelay: "950ms", animationFillMode: "both" }}>
          <span className="rounded-lg bg-white px-2.5 py-1 font-semibold">Jalan rusak · Tebet</span>
          <ArrowRight className="size-4 shrink-0 text-rambu" aria-hidden="true" />
          <span className="flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 font-semibold">
            <Building2 className="size-4 text-rambu" aria-hidden="true" />
            DPU Jakarta Selatan
          </span>
        </div>
      </div>
    );
  }
  if (indeks === 2) {
    return (
      <div>
        <div className="rounded-xl bg-kertas p-3">
          <div className="flex justify-between gap-2 text-sm">
            <span className="text-tinta-redup">Batas penyelesaian</span>
            <span className="font-bold text-waspada">Sisa 9 hari</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-white">
            <div className="h-full w-[36%] origin-left rounded-full bg-waspada-terang motion-safe:animate-[tumbuh_0.9s_ease-out]" />
          </div>
        </div>
        <PercakapanContoh />
      </div>
    );
  }
  if (indeks === 3) {
    return (
      <div>
        <div className="grid grid-cols-2 gap-3">
          <figure>
            <div className="flex aspect-[5/3] items-center justify-center rounded-xl bg-kertas text-tinta-redup">
              <TriangleAlert className="size-7" aria-hidden="true" />
            </div>
            <figcaption className="mt-1.5 text-xs text-tinta-redup">Sebelum, dari pelapor</figcaption>
          </figure>
          <figure>
            <div className="flex aspect-[5/3] items-center justify-center rounded-xl bg-tuntas-muda text-tuntas">
              <CircleCheck className="size-7" aria-hidden="true" />
            </div>
            <figcaption className="mt-1.5 text-xs text-tinta-redup">Sesudah, dari petugas</figcaption>
          </figure>
        </div>
        <p className="mt-4 text-sm font-semibold">Masalahnya sudah beres?</p>
        <div className="mt-2 grid grid-cols-2 gap-2 text-sm font-semibold" aria-hidden="true">
          <span className="relative rounded-xl bg-tuntas px-3 py-2.5 text-center text-white">
            Sudah beres
            <span className="absolute inset-0 rounded-xl ring-2 ring-tuntas motion-safe:animate-ping" style={{ animationDuration: "1.6s" }} />
          </span>
          <span className="rounded-xl px-3 py-2.5 text-center ring-1 ring-garis ring-inset">Belum beres</span>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center py-3 text-center">
      <div className="rounded-xl border-4 border-tuntas px-6 py-2 text-tuntas motion-safe:animate-cap">
        <p className="text-2xl font-extrabold tracking-[0.2em]">SELESAI</p>
        <p className="text-xs font-semibold">Dikonfirmasi warga</p>
      </div>
      <p className="mt-6 text-sm text-tinta-redup">
        Diselesaikan dalam <span className="font-bold text-tinta">6 hari kerja</span>, 8 hari lebih cepat dari tenggat.
      </p>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-tinta-redup">
        <ThumbsUp className="size-3.5" aria-hidden="true" />
        24 warga ikut mendukung laporan ini
      </p>
    </div>
  );
}

// Petugas "mengetik", lalu pesan dan balasan warga muncul bergantian
function PercakapanContoh() {
  const [langkah, setLangkah] = useState(0);
  useEffect(() => {
    const a = window.setTimeout(() => setLangkah(1), 1200);
    const b = window.setTimeout(() => setLangkah(2), 2600);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, []);

  return (
    <div className="mt-4 space-y-2.5">
      <p className="text-xs text-tinta-redup">
        <span className="font-semibold text-tinta">DPU Jakarta Selatan</span> · baru saja
      </p>
      {langkah === 0 ? (
        <span className="inline-flex gap-1 rounded-2xl rounded-bl-md bg-rambu-muda px-4 py-3" aria-label="Petugas sedang mengetik">
          {[0, 1, 2].map((n) => (
            <span key={n} className="size-1.5 rounded-full bg-rambu motion-safe:animate-ketik" style={{ animationDelay: `${n * 160}ms` }} />
          ))}
        </span>
      ) : (
        <p className="max-w-[85%] rounded-2xl rounded-bl-md bg-rambu-muda px-4 py-2.5 text-sm motion-safe:animate-muncul">
          Tim survei datang besok pagi. Material aspal sudah kami siapkan.
        </p>
      )}
      {langkah === 2 && (
        <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-rambu px-4 py-2.5 text-sm text-white motion-safe:animate-muncul">
          Siap, terima kasih kabarnya!
        </p>
      )}
    </div>
  );
}
