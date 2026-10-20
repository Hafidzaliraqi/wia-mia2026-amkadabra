import {
  ArrowRightLeft,
  BadgeCheck,
  Building2,
  CalendarClock,
  CircleCheck,
  CircleX,
  Clock,
  Hourglass,
  Megaphone,
  MessageSquare,
  RotateCcw,
  ShieldCheck,
  Siren,
  Timer,
  type LucideIcon,
} from "lucide-react";
import type { JenisKejadian, Laporan } from "@/lib/types";
import type { Tenggat } from "@/lib/sla";
import { formatHariTanggalJam, formatTanggalJam } from "@/lib/waktu";

type Nada = "netral" | "rambu" | "tuntas" | "waspada" | "bahaya";

const tampilan: Record<JenisKejadian, { judul: string; ikon: LucideIcon; nada: Nada }> = {
  dibuat: { judul: "Laporan dibuat", ikon: Megaphone, nada: "netral" },
  diverifikasi: { judul: "Diverifikasi admin", ikon: BadgeCheck, nada: "rambu" },
  diteruskan: { judul: "Diteruskan ke instansi", ikon: Building2, nada: "rambu" },
  dialihkan: { judul: "Dialihkan ke instansi lain", ikon: ArrowRightLeft, nada: "waspada" },
  diproses: { judul: "Mulai dikerjakan", ikon: Timer, nada: "rambu" },
  balasan: { judul: "Kabar dari petugas", ikon: MessageSquare, nada: "netral" },
  perpanjangan: { judul: "Perpanjangan waktu", ikon: CalendarClock, nada: "waspada" },
  eskalasi: { judul: "Dieskalasi ke pengawas", ikon: Siren, nada: "bahaya" },
  ditandai_selesai: { judul: "Ditandai selesai oleh petugas", ikon: CircleCheck, nada: "rambu" },
  dikonfirmasi_beres: { judul: "Pelapor mengonfirmasi sudah beres", ikon: ShieldCheck, nada: "tuntas" },
  dibuka_ulang: { judul: "Dibuka ulang oleh pelapor", ikon: RotateCcw, nada: "waspada" },
  ditutup_otomatis: { judul: "Ditutup otomatis", ikon: Clock, nada: "netral" },
  ditolak: { judul: "Ditolak saat verifikasi", ikon: CircleX, nada: "bahaya" },
};

const warnaIkon: Record<Nada, string> = {
  netral: "bg-kertas text-tinta-redup ring-garis",
  rambu: "bg-rambu-muda text-rambu-tua ring-rambu/20",
  tuntas: "bg-tuntas-muda text-tuntas ring-tuntas/20",
  waspada: "bg-waspada-muda text-waspada ring-waspada/20",
  bahaya: "bg-bahaya-muda text-bahaya ring-bahaya/20",
};

// Riwayat penanganan, terbaru di atas (seperti lacak resi)
export function RiwayatLaporan({
  laporan,
  tenggat,
  namaPelapor,
}: {
  laporan: Laporan;
  tenggat: Tenggat | null;
  namaPelapor: string;
}) {
  const kejadian = [...laporan.riwayat].reverse();

  return (
    <ol className="relative">
      {tenggat && (
        <li className="relative flex gap-4 pb-6">
          <GarisPenghubung />
          <span className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-garis bg-white text-tinta-redup">
            <Hourglass className="size-4" aria-hidden="true" />
          </span>
          <div className="pt-1.5">
            <p className="font-semibold">
              {tenggat.tanggungJawabPetugas
                ? `Menunggu ${tenggat.tahap.toLowerCase()}`
                : "Menunggu konfirmasi pelapor"}
            </p>
            <p className="angka mt-0.5 text-sm text-tinta-redup">
              {tenggat.tanggungJawabPetugas ? "Paling lambat " : "Ditutup otomatis "}
              {formatHariTanggalJam(tenggat.batas)} WIB
            </p>
          </div>
        </li>
      )}
      {kejadian.map((k, i) => {
        const info = tampilan[k.jenis];
        const Ikon = info.ikon;
        const aktor = k.aktor === "Pelapor" ? namaPelapor : k.aktor;
        const terakhir = i === kejadian.length - 1;
        return (
          <li key={`${k.jenis}-${k.waktu}-${i}`} className="relative flex gap-4 pb-6 last:pb-0">
            {!terakhir && <GarisPenghubung />}
            <span
              className={`relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full ring-1 ring-inset ${warnaIkon[info.nada]}`}
            >
              <Ikon className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 pt-1.5">
              <p className="font-semibold">{info.judul}</p>
              <p className="angka mt-0.5 text-sm text-tinta-redup">
                {formatTanggalJam(k.waktu)} oleh {aktor}
              </p>
              {k.catatan && (
                <p className="mt-2 max-w-prose rounded-xl bg-kertas px-3.5 py-2.5 text-sm leading-relaxed">
                  {k.catatan}
                </p>
              )}
              {k.batasBaru && (
                <p className="angka mt-2 text-sm font-semibold text-waspada">
                  Batas baru: {formatHariTanggalJam(k.batasBaru)} WIB
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function GarisPenghubung() {
  return <span aria-hidden="true" className="absolute top-9 bottom-0 left-[17px] w-0.5 bg-garis" />;
}
