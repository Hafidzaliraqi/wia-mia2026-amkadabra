"use client";

import { pindahHalamanPenuh } from "@/lib/pindah-akun";
import { useId, useTransition } from "react";

import { ArrowRight, FlaskConical } from "lucide-react";
import { useToast } from "@/components/toast";
import { masukDemo } from "@/lib/aksi/akun";

export type LangkahDemo = { peran: "admin" | "petugas" | "warga"; label: string; tujuan: string; instansiId?: string; keterangan: string };

// Kotak "Mode demo": lanjutkan alur laporan dari sisi peran berikutnya dengan satu klik
export function PanelDemoLaporan({ langkah }: { langkah: LangkahDemo }) {
  const toast = useToast();
  const [memproses, mulai] = useTransition();
  const idJudul = useId();
  return (
    <section className="rounded-2xl border border-dashed border-rambu/40 bg-rambu-muda/40 p-4" aria-labelledby={idJudul} data-mode-demo="">
      <p id={idJudul} className="flex items-center gap-2 text-sm font-bold text-rambu-tua">
        <FlaskConical className="size-4" aria-hidden="true" />
        Mode demo
      </p>
      <p className="mt-1 text-sm leading-relaxed text-tinta-redup">{langkah.keterangan}</p>
      <button
        type="button"
        disabled={memproses}
        onClick={() =>
          mulai(async () => {
            const hasil = await masukDemo(langkah.peran, langkah.instansiId);
            if (!hasil.ok) return toast("galat", hasil.pesan);
            pindahHalamanPenuh(langkah.tujuan, `Masuk sebagai ${hasil.nama}.`);
          })
        }
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-rambu px-4 py-3 text-sm font-bold text-white transition hover:bg-rambu-tua disabled:opacity-60"
      >
        {memproses ? "Pindah akun…" : langkah.label}
        <ArrowRight className="size-4" aria-hidden="true" />
      </button>
    </section>
  );
}
