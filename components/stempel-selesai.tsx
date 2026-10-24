import { formatTanggal } from "@/lib/waktu";

// Cap "selesai" yang hanya muncul kalau pelapor sudah mengonfirmasi
export function StempelSelesai({ waktu }: { waktu: string }) {
  return (
    <div
      className="inline-flex -rotate-6 flex-col items-center rounded-lg border-[3px] border-tuntas px-4 py-1.5 text-tuntas"
      role="img"
      aria-label={`Selesai, dikonfirmasi pelapor pada ${formatTanggal(waktu)}`}
    >
      <span className="text-lg leading-tight font-extrabold tracking-[0.2em] uppercase">Selesai</span>
      <span className="angka text-[11px] font-semibold">Dikonfirmasi pelapor {formatTanggal(waktu)}</span>
    </div>
  );
}
