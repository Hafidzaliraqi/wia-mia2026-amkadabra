"use client";

import Link from "next/link";
import { useState } from "react";
import type { RingkasanLaporan } from "@/lib/types";
import { BarisLaporan } from "@/components/baris-laporan";

export function TabRiwayat({ dibuat, didukung }: { dibuat: RingkasanLaporan[]; didukung: RingkasanLaporan[] }) {
  const [tab, setTab] = useState<"dibuat" | "didukung">("dibuat");
  const daftar = tab === "dibuat" ? dibuat : didukung;
  return (
    <div className="space-y-4">
      <div role="tablist" aria-label="Jenis riwayat" className="inline-flex rounded-xl border border-garis bg-white p-1">
        {(
          [
            ["dibuat", `Laporan saya (${dibuat.length})`],
            ["didukung", `Saya dukung (${didukung.length})`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`tab-${id}`}
            aria-selected={tab === id}
            aria-controls="panel-riwayat"
            onClick={() => setTab(id)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${tab === id ? "bg-rambu-muda text-rambu-tua" : "text-tinta-redup hover:text-tinta"}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id="panel-riwayat" aria-labelledby={`tab-${tab}`}>
        {daftar.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-garis bg-white px-6 py-12 text-center motion-safe:animate-muncul">
            <p className="font-semibold">{tab === "dibuat" ? "Kamu belum pernah membuat laporan." : "Kamu belum mendukung laporan siapa pun."}</p>
            <Link href={tab === "dibuat" ? "/lapor" : "/laporan"} className="mt-3 inline-block text-sm font-semibold text-rambu hover:text-rambu-tua">
              {tab === "dibuat" ? "Buat laporan" : "Jelajah laporan"}
            </Link>
          </div>
        ) : (
          <ul key={tab} className="divide-y divide-garis overflow-hidden rounded-2xl border border-garis bg-white motion-safe:animate-muncul">
            {daftar.map((l) => (
              <BarisLaporan key={l.nomor} laporan={l} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
