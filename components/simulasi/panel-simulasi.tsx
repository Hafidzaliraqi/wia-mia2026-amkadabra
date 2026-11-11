"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Check, Play, RotateCcw, Siren } from "lucide-react";
import type { StatusLaporan } from "@/lib/types";
import { useToast } from "@/components/toast";
import { eskalasiSimulasi, majukanSimulasi, mulaiSimulasi } from "@/lib/aksi/simulasi";
import { rayakan } from "@/lib/rayakan";

const tahap = [
  { judul: "Warga mengirim laporan", isi: "Lokasi, jenis masalah, cerita, dan foto." },
  { judul: "Diverifikasi dan diteruskan", isi: "Admin memeriksa, sistem memilih dinas berwenang." },
  { judul: "Dikerjakan petugas", isi: "Petugas menerima dan mengabari warga lewat percakapan." },
  { judul: "Ditandai selesai", isi: "Petugas melampirkan bukti, warga diminta konfirmasi." },
  { judul: "Dikonfirmasi warga", isi: "Laporan tuntas dan masuk rapor instansi." },
];
const selesaiSampai: Record<string, number> = { terkirim: 1, diteruskan: 2, diproses: 3, menunggu_konfirmasi: 4, selesai: 5 };
const aksiBerikut: Record<string, string> = {
  terkirim: "Admin memverifikasi",
  diteruskan: "Petugas menerima laporan",
  diproses: "Petugas menandai selesai",
  menunggu_konfirmasi: "Warga mengonfirmasi beres",
};

export function PanelSimulasi({ nomor, status, tingkat }: { nomor: string | null; status: StatusLaporan | null; tingkat: number }) {
  const router = useRouter();
  const toast = useToast();
  const [memproses, mulai] = useTransition();
  const posisi = status ? (selesaiSampai[status] ?? 0) : 0;
  const tamat = status === "selesai";

  const baru = () =>
    mulai(async () => {
      const hasil = await mulaiSimulasi();
      if (!hasil.ok) return toast("galat", hasil.pesan);
      toast("sukses", `Laporan ${hasil.nomor} dikirim warga.`);
      router.push(`/demo?nomor=${hasil.nomor}`, { scroll: false });
    });

  const maju = () =>
    mulai(async () => {
      if (!nomor) return;
      const hasil = await majukanSimulasi(nomor);
      if (!hasil.ok) return toast("galat", hasil.pesan);
      if (status === "menunggu_konfirmasi") rayakan();
      router.refresh();
    });

  const eskalasi = () =>
    mulai(async () => {
      if (!nomor) return;
      const hasil = await eskalasiSimulasi(nomor);
      if (!hasil.ok) return toast("galat", hasil.pesan);
      toast("info", "Batas waktu dianggap terlewati. Laporan naik satu tingkat.");
      router.refresh();
    });

  return (
    <section className="rounded-3xl border border-garis bg-white p-6 lg:sticky lg:top-24" aria-labelledby="judul-panel-simulasi">
      <h2 id="judul-panel-simulasi" className="text-xl font-bold">
        Tahapan
      </h2>
      <ol className="mt-5">
        {tahap.map((t, i) => {
          const lewat = i < posisi;
          const berikut = i === posisi;
          return (
            <li key={t.judul} className="relative flex gap-3 pb-5 last:pb-0">
              {i < tahap.length - 1 && <span aria-hidden="true" className={`absolute top-8 bottom-0 left-[15px] w-0.5 ${lewat ? "bg-rambu" : "bg-garis"}`} />}
              <span
                className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition ${
                  lewat ? "bg-rambu text-white" : berikut ? "bg-white text-rambu ring-2 ring-rambu" : "bg-kertas text-tinta-redup"
                }`}
              >
                {lewat ? <Check className="size-4" aria-hidden="true" /> : i + 1}
              </span>
              <div className="pt-1">
                <p className={`font-semibold ${!lewat && !berikut ? "text-tinta-redup" : ""}`}>{t.judul}</p>
                <p className="text-sm text-tinta-redup">{t.isi}</p>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 space-y-2">
        {!nomor || tamat ? (
          <button type="button" onClick={baru} disabled={memproses} className="kilau flex w-full items-center justify-center gap-2 rounded-xl bg-rambu py-3.5 font-bold text-white transition hover:bg-rambu-tua disabled:opacity-60">
            <Play className="size-4" aria-hidden="true" />
            {tamat ? "Mulai simulasi baru" : "Mulai: warga mengirim laporan"}
          </button>
        ) : (
          <button type="button" onClick={maju} disabled={memproses} className="kilau flex w-full items-center justify-center gap-2 rounded-xl bg-rambu py-3.5 font-bold text-white transition hover:bg-rambu-tua disabled:opacity-60">
            <Play className="size-4" aria-hidden="true" />
            {memproses ? "Memproses…" : `Lanjut: ${aksiBerikut[status ?? ""] ?? "tahap berikutnya"}`}
          </button>
        )}
        {nomor && (status === "diteruskan" || status === "diproses") && tingkat < 3 && (
          <button type="button" onClick={eskalasi} disabled={memproses} className="flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold text-bahaya ring-1 ring-bahaya/30 ring-inset transition hover:bg-bahaya-muda disabled:opacity-60">
            <Siren className="size-4" aria-hidden="true" />
            Simulasikan lewat batas waktu
          </button>
        )}
        {nomor && !tamat && (
          <button type="button" onClick={baru} disabled={memproses} className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-tinta-redup transition hover:bg-kertas disabled:opacity-60">
            <RotateCcw className="size-4" aria-hidden="true" />
            Mulai ulang
          </button>
        )}
      </div>
      {nomor && (
        <div className="mt-5 grid grid-cols-2 gap-2 border-t border-garis pt-5 text-sm font-semibold">
          <Link href={`/laporan/${nomor}`} target="_blank" className="flex items-center justify-center gap-1.5 rounded-xl bg-kertas py-2.5 hover:text-rambu">
            Halaman publik
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
          <Link href="/masuk#demo" target="_blank" className="flex items-center justify-center gap-1.5 rounded-xl bg-kertas py-2.5 hover:text-rambu">
            Masuk sebagai peran
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      )}
    </section>
  );
}
