import { labelStatus } from "@/lib/status";
import type { StatusLaporan } from "@/lib/types";

const gaya: Record<StatusLaporan, string> = {
  terkirim: "bg-white text-tinta-redup ring-garis",
  diteruskan: "bg-rambu-muda text-rambu-tua ring-rambu/20",
  diproses: "bg-rambu-muda text-rambu-tua ring-rambu/20",
  menunggu_konfirmasi: "bg-waspada-muda text-waspada ring-waspada/20",
  selesai: "bg-tuntas-muda text-tuntas ring-tuntas/20",
  ditutup_otomatis: "bg-kertas text-tinta-redup ring-garis",
  ditolak: "bg-bahaya-muda text-bahaya ring-bahaya/20",
};

const dasar = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset whitespace-nowrap";

export function StatusBadge({ status }: { status: StatusLaporan }) {
  return <span className={`${dasar} ${gaya[status]}`}>{labelStatus[status]}</span>;
}

export function TerlambatBadge() {
  return (
    <span className={`${dasar} bg-bahaya text-white ring-bahaya`}>
      Lewat batas waktu
    </span>
  );
}
