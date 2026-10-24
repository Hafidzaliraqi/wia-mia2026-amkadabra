"use client";

import { useState } from "react";
import { Flag, ThumbsUp } from "lucide-react";

// Tombol dukung dan tandai tidak sesuai.
// Masih simulasi: tersimpan di browser selama halaman dibuka, belum ke database.
export function AksiWarga({
  dukunganAwal,
  bisaDidukung,
}: {
  dukunganAwal: number;
  // false untuk laporan yang sudah selesai, ditutup, atau ditolak
  bisaDidukung: boolean;
}) {
  const [didukung, setDidukung] = useState(false);
  const [dilaporkan, setDilaporkan] = useState(false);
  const jumlah = dukunganAwal + (didukung ? 1 : 0);

  if (!bisaDidukung) {
    return (
      <p className="flex items-center gap-2 text-sm text-tinta-redup">
        <ThumbsUp className="size-4 shrink-0" aria-hidden="true" />
        <span>
          <span className="angka font-bold text-tinta">{jumlah} warga</span> mendukung laporan ini.
        </span>
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setDidukung((v) => !v)}
        aria-pressed={didukung}
        className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition-colors ${
          didukung
            ? "bg-rambu-muda text-rambu-tua ring-1 ring-rambu/30 ring-inset"
            : "bg-rambu text-white hover:bg-rambu-tua"
        }`}
      >
        <ThumbsUp className="size-5" aria-hidden="true" />
        {didukung ? "Kamu mendukung laporan ini" : "Dukung laporan ini"}
      </button>
      <p className="text-sm text-tinta-redup">
        <span className="angka font-bold text-tinta">{jumlah} warga</span> ikut terdampak. Pendukung
        dapat kabar perkembangan dan bisa ikut mengonfirmasi penyelesaian.
      </p>

      {dilaporkan ? (
        <p className="rounded-xl bg-kertas px-3.5 py-2.5 text-sm" role="status">
          Terima kasih. Admin akan mengecek ulang laporan ini.
        </p>
      ) : (
        <button
          type="button"
          onClick={() => setDilaporkan(true)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-tinta-redup hover:text-tinta"
        >
          <Flag className="size-4" aria-hidden="true" />
          Laporan ini tidak sesuai
        </button>
      )}
    </div>
  );
}
