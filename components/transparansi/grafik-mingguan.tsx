import { formatTanggal } from "@/lib/waktu";

// Grafik batang: laporan masuk vs tuntas per minggu (12 minggu terakhir)
export function GrafikMingguan({ data }: { data: { awal: string; masuk: number; tuntas: number }[] }) {
  const W = 640, H = 240, kiri = 32, bawah = 28, atas = 12;
  const maks = Math.max(4, ...data.map((d) => Math.max(d.masuk, d.tuntas)));
  const langkah = Math.ceil(maks / 4);
  const puncak = langkah * 4;
  const lebarGrup = (W - kiri) / data.length;
  const lebarBatang = Math.min(14, (lebarGrup - 10) / 2);
  const y = (n: number) => H - bawah - (n / puncak) * (H - bawah - atas);
  const label = (iso: string) => formatTanggal(iso).split(" ").slice(0, 2).join(" ");

  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Laporan masuk dan tuntas per minggu, 12 minggu terakhir" className="h-auto w-full">
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <line x1={kiri} x2={W} y1={y(i * langkah)} y2={y(i * langkah)} className="stroke-garis" strokeWidth="1" />
            <text x={kiri - 8} y={y(i * langkah) + 4} textAnchor="end" className="fill-tinta-redup text-[11px]">
              {i * langkah}
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const x = kiri + i * lebarGrup + (lebarGrup - lebarBatang * 2 - 3) / 2;
          return (
            <g key={d.awal}>
              <rect
                x={x}
                y={y(d.masuk)}
                width={lebarBatang}
                height={H - bawah - y(d.masuk)}
                rx="3"
                className="fill-rambu/30 motion-safe:animate-naik"
                style={{ transformBox: "fill-box", transformOrigin: "bottom", animationDelay: `${i * 40}ms` }}
              >
                <title>{`Minggu ${label(d.awal)}: ${d.masuk} masuk`}</title>
              </rect>
              <rect
                x={x + lebarBatang + 3}
                y={y(d.tuntas)}
                width={lebarBatang}
                height={H - bawah - y(d.tuntas)}
                rx="3"
                className="fill-tuntas motion-safe:animate-naik"
                style={{ transformBox: "fill-box", transformOrigin: "bottom", animationDelay: `${i * 40 + 20}ms` }}
              >
                <title>{`Minggu ${label(d.awal)}: ${d.tuntas} tuntas`}</title>
              </rect>
              {i % 2 === 0 && (
                <text x={kiri + i * lebarGrup + lebarGrup / 2} y={H - 8} textAnchor="middle" className="fill-tinta-redup text-[11px]">
                  {label(d.awal)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-3 flex flex-wrap gap-4 text-xs text-tinta-redup">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-rambu/30" />
          Laporan masuk
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-tuntas" />
          Tuntas
        </span>
      </figcaption>
      <table className="sr-only">
        <caption>Laporan per minggu</caption>
        <thead>
          <tr>
            <th scope="col">Minggu mulai</th>
            <th scope="col">Masuk</th>
            <th scope="col">Tuntas</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.awal}>
              <th scope="row">{label(d.awal)}</th>
              <td>{d.masuk}</td>
              <td>{d.tuntas}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
