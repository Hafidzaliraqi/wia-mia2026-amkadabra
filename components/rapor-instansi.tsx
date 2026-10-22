"use client";

import { useState } from "react";
import type { RaporInstansi } from "@/lib/statistik";
import { daftarKota } from "@/lib/wilayah";

function persen(nilai: number | null) {
  return nilai === null ? "–" : `${nilai}%`;
}

export function TabelRapor({ rapor }: { rapor: RaporInstansi[] }) {
  const [kota, setKota] = useState(daftarKota[0].id);
  const baris = rapor
    .filter((r) => r.instansi.kotaId === kota && r.masuk > 0)
    .sort((a, b) => (b.persenTepatWaktu ?? -1) - (a.persenTepatWaktu ?? -1));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <label htmlFor="kota-rapor" className="mb-1.5 block text-xs font-semibold text-tinta-redup">
            Daerah
          </label>
          <select
            id="kota-rapor"
            value={kota}
            onChange={(e) => setKota(e.target.value)}
            className="rounded-xl border border-garis bg-white px-3 py-2.5 text-sm focus:border-rambu focus:outline-none"
          >
            {daftarKota.map((k) => (
              <option key={k.id} value={k.id}>{k.nama}</option>
            ))}
          </select>
        </div>
        <p className="text-sm text-tinta-redup">Diurutkan dari yang paling sering tepat waktu.</p>
      </div>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-garis bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-garis bg-kertas/60 text-tinta-redup">
            <tr>
              <th scope="col" className="px-5 py-3 font-semibold">Instansi</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">Laporan</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">Respons awal</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">Lama pengerjaan</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">Tepat waktu</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">Dibuka ulang</th>
              <th scope="col" className="px-5 py-3 text-right font-semibold">Lewat batas sekarang</th>
            </tr>
          </thead>
          <tbody className="angka divide-y divide-garis">
            {baris.map((r) => (
              <tr key={r.instansi.id} className="transition-colors hover:bg-kertas/50">
                <th scope="row" className="px-5 py-3.5 font-semibold">{r.instansi.nama}</th>
                <td className="px-4 py-3.5 text-right">{r.masuk}</td>
                <td className="px-4 py-3.5 text-right">{r.rataJamRespons === null ? "–" : `${Math.round(r.rataJamRespons)} jam`}</td>
                <td className="px-4 py-3.5 text-right">{r.rataHariPenyelesaian === null ? "–" : `${r.rataHariPenyelesaian.toFixed(1)} hari`}</td>
                <td className={`px-4 py-3.5 text-right font-semibold ${(r.persenTepatWaktu ?? 100) < 70 ? "text-bahaya" : "text-tuntas"}`}>
                  {persen(r.persenTepatWaktu)}
                </td>
                <td className="px-4 py-3.5 text-right">{persen(r.persenDibukaUlang)}</td>
                <td className={`px-5 py-3.5 text-right ${r.terlambatSekarang > 0 ? "font-semibold text-bahaya" : ""}`}>{r.terlambatSekarang}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {baris.length === 0 && <p className="px-5 py-8 text-center text-sm text-tinta-redup">Belum ada laporan di daerah ini.</p>}
      </div>
    </div>
  );
}
