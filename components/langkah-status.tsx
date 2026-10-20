import type { StatusLaporan } from "@/lib/types";

const langkah = ["Terkirim", "Diteruskan", "Dikerjakan", "Konfirmasi", "Selesai"];

const posisi: Record<StatusLaporan, number> = {
  terkirim: 0,
  diteruskan: 1,
  diproses: 2,
  menunggu_konfirmasi: 3,
  selesai: 4,
  ditutup_otomatis: 4,
  ditolak: -1,
};

export function LangkahStatus({ status }: { status: StatusLaporan }) {
  if (status === "ditolak") {
    return (
      <p className="rounded-lg bg-bahaya-muda px-3 py-2 text-sm font-semibold text-bahaya">
        Laporan ditolak saat verifikasi
      </p>
    );
  }

  const sekarang = posisi[status];
  const tuntas = status === "selesai";

  return (
    <ol className="grid grid-cols-5" aria-label="Tahap laporan">
      {langkah.map((nama, i) => {
        const lewat = i < sekarang || (i === sekarang && i === 4);
        const aktif = i === sekarang && i !== 4;
        const label = i === 4 && status === "ditutup_otomatis" ? "Ditutup" : nama;
        return (
          <li key={nama} className="relative flex flex-col items-center gap-2 text-center">
            {i > 0 && (
              <span
                aria-hidden="true"
                className={`absolute top-[7px] right-1/2 h-0.5 w-full ${
                  i <= sekarang ? (tuntas ? "bg-tuntas" : "bg-rambu") : "bg-garis"
                }`}
              />
            )}
            <span
              aria-hidden="true"
              className={`relative z-10 flex size-4 items-center justify-center rounded-full ${
                lewat
                  ? tuntas
                    ? "bg-tuntas"
                    : "bg-rambu"
                  : aktif
                    ? "bg-white ring-4 ring-rambu"
                    : "bg-white ring-2 ring-garis"
              }`}
            >
              {aktif && <span className="size-1.5 rounded-full bg-rambu motion-safe:animate-pulse" />}
            </span>
            <span
              className={`text-[11px] leading-tight sm:text-xs ${
                aktif ? "font-bold text-tinta" : "font-medium text-tinta-redup"
              }`}
            >
              {label}
              {aktif && <span className="sr-only"> (tahap saat ini)</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
