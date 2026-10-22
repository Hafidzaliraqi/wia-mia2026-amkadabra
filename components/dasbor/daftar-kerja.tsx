"use client";

import Link from "next/link";
import { useState } from "react";
import { ThumbsUp } from "lucide-react";
import type { KategoriId, StatusLaporan } from "@/lib/types";
import type { Risiko } from "@/lib/server/risiko";
import { KategoriIkon } from "@/components/kategori-ikon";
import { StatusBadge, TerlambatBadge } from "@/components/status-badge";

export interface ItemKerja {
  nomor: string;
  judul: string;
  kategoriId: KategoriId;
  daerah: string;
  status: StatusLaporan;
  terlambat: boolean;
  tenggatTeks: string | null;
  tenggatMs: number | null;
  dukungan: number;
  dibuatTeks: string;
  risiko?: Risiko[];
  tab: string[];
}

const warnaRisiko = {
  tinggi: "bg-bahaya-muda text-bahaya",
  sedang: "bg-waspada-muda text-waspada",
  info: "bg-kertas text-tinta-redup",
};

// Daftar antrean kerja di dasbor, diurutkan dari tenggat paling dekat
export function DaftarKerja({
  item,
  tab,
  dasarTautan,
  kosong,
}: {
  item: ItemKerja[];
  tab: { id: string; label: string }[];
  dasarTautan: string;
  kosong: string;
}) {
  const [aktif, setAktif] = useState(tab[0].id);
  const daftar = item
    .filter((i) => i.tab.includes(aktif))
    .sort((a, b) => (a.tenggatMs ?? Infinity) - (b.tenggatMs ?? Infinity));

  return (
    <div>
      <div role="tablist" aria-label="Kelompok laporan" className="flex gap-1 overflow-x-auto rounded-xl border border-garis bg-white p-1">
        {tab.map((t) => {
          const jumlah = item.filter((i) => i.tab.includes(t.id)).length;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={aktif === t.id}
              onClick={() => setAktif(t.id)}
              className={`shrink-0 rounded-lg px-3.5 py-2 text-sm font-semibold whitespace-nowrap transition-colors ${aktif === t.id ? "bg-rambu-muda text-rambu-tua" : "text-tinta-redup hover:text-tinta"}`}
            >
              {t.label} <span className="angka">({jumlah})</span>
            </button>
          );
        })}
      </div>

      {daftar.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-garis bg-white px-6 py-12 text-center text-tinta-redup motion-safe:animate-muncul">{kosong}</p>
      ) : (
        <ul key={aktif} className="mt-4 divide-y divide-garis overflow-hidden rounded-2xl border border-garis bg-white motion-safe:animate-muncul">
          {daftar.map((i) => (
            <li key={i.nomor}>
              <Link href={`${dasarTautan}/${i.nomor}`} className="group flex gap-4 px-4 py-4 transition-colors hover:bg-kertas/70 sm:px-5">
                <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-kertas group-hover:bg-rambu-muda group-hover:text-rambu-tua">
                  <KategoriIkon id={i.kategoriId} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={i.status} />
                    {i.terlambat && <TerlambatBadge />}
                    <span className="angka text-xs text-tinta-redup">{i.nomor}</span>
                  </div>
                  <p className="mt-2 leading-snug font-semibold group-hover:text-rambu-tua">{i.judul}</p>
                  <p className="mt-1 flex flex-wrap gap-x-3 text-sm text-tinta-redup">
                    <span>{i.daerah}</span>
                    <span>{i.dibuatTeks}</span>
                  </p>
                  {i.risiko && i.risiko.length > 0 && (
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {i.risiko.map((r) => (
                        <li key={r.label} className={`rounded-full px-2 py-0.5 text-xs font-semibold ${warnaRisiko[r.tingkat]}`}>
                          {r.label}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end justify-between gap-2 text-right">
                  {i.tenggatTeks && (
                    <span className={`angka text-sm font-bold ${i.terlambat ? "text-bahaya" : "text-tinta"}`}>{i.tenggatTeks}</span>
                  )}
                  <span className="angka inline-flex items-center gap-1 text-sm text-tinta-redup">
                    <ThumbsUp className="size-4" aria-hidden="true" />
                    {i.dukungan}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function KartuRingkas({ data }: { data: { label: string; nilai: number; bahaya?: boolean }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {data.map((d) => (
        <div key={d.label} className="rounded-2xl border border-garis bg-white p-4">
          <dt className="text-sm text-tinta-redup">{d.label}</dt>
          <dd className={`angka mt-1 text-2xl font-extrabold ${d.bahaya && d.nilai > 0 ? "text-bahaya" : ""}`}>{d.nilai}</dd>
        </div>
      ))}
    </dl>
  );
}
