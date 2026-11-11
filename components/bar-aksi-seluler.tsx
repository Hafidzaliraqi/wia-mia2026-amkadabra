"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { CircleCheck, CircleX, ThumbsUp } from "lucide-react";
import { useToast } from "@/components/toast";
import { alihkanDukungan, konfirmasiPenyelesaian } from "@/lib/aksi/laporan";
import { rayakan } from "@/lib/rayakan";

// Tombol aksi utama yang menempel di bawah layar HP, terjangkau ibu jari
export function BarAksiSeluler({
  nomor,
  mode,
  jumlah,
  didukung,
}: {
  nomor: string;
  mode: "konfirmasi" | "dukung" | "masuk";
  jumlah: number;
  didukung: boolean;
}) {
  const toast = useToast();
  const [memproses, mulai] = useTransition();
  const [dukung, setDukung] = useState({ aktif: didukung, jumlah });

  const kelasBar =
    "fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-30 flex gap-2 rounded-2xl bg-white/95 p-2 shadow-xl ring-1 ring-garis backdrop-blur lg:hidden";

  if (mode === "konfirmasi") {
    return (
      <div className={kelasBar}>
        <button
          type="button"
          disabled={memproses}
          onClick={() =>
            mulai(async () => {
              const hasil = await konfirmasiPenyelesaian(nomor, "beres", "");
              if (!hasil.ok) return toast("galat", hasil.pesan);
              rayakan();
              toast("sukses", "Terima kasih. Laporan tercatat selesai.");
            })
          }
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-tuntas py-3.5 font-bold text-white active:scale-[0.98] disabled:opacity-60"
        >
          <CircleCheck className="size-5" aria-hidden="true" />
          Sudah beres
        </button>
        <a
          href="#konfirmasi"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 font-semibold ring-1 ring-garis ring-inset active:scale-[0.98]"
        >
          <CircleX className="size-5" aria-hidden="true" />
          Belum beres
        </a>
      </div>
    );
  }

  if (mode === "masuk") {
    return (
      <div className={kelasBar}>
        <Link href={`/masuk?lanjut=/laporan/${nomor}`} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rambu py-3.5 font-bold text-white">
          <ThumbsUp className="size-5" aria-hidden="true" />
          Masuk untuk mendukung · {jumlah}
        </Link>
      </div>
    );
  }

  return (
    <div className={kelasBar}>
      <button
        type="button"
        aria-pressed={dukung.aktif}
        disabled={memproses}
        onClick={() =>
          mulai(async () => {
            const sebelum = dukung;
            setDukung({ aktif: !sebelum.aktif, jumlah: sebelum.jumlah + (sebelum.aktif ? -1 : 1) });
            const hasil = await alihkanDukungan(nomor);
            if (!hasil.ok) {
              setDukung(sebelum);
              return toast("galat", hasil.pesan);
            }
            toast("sukses", hasil.didukung ? "Kamu ikut mendukung laporan ini." : "Dukungan dibatalkan.");
          })
        }
        className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 font-bold active:scale-[0.98] disabled:opacity-60 ${
          dukung.aktif ? "bg-rambu-muda text-rambu-tua" : "bg-rambu text-white"
        }`}
      >
        <ThumbsUp className="size-5" aria-hidden="true" />
        {dukung.aktif ? "Kamu mendukung" : "Dukung laporan ini"} · {dukung.jumlah}
      </button>
    </div>
  );
}
