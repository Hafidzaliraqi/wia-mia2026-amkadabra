import type { Tenggat } from "@/lib/sla";
import { porsiWaktuTerpakai } from "@/lib/sla";
import { formatHariTanggalJam, formatSisaWaktu } from "@/lib/waktu";

function nada(tenggat: Tenggat) {
  const { lewat } = formatSisaWaktu(tenggat.batas);
  const porsi = porsiWaktuTerpakai(tenggat);
  if (lewat && tenggat.tanggungJawabPetugas) return { teks: "text-bahaya", bar: "bg-bahaya" };
  if (porsi >= 0.75) return { teks: "text-waspada", bar: "bg-waspada-terang" };
  return { teks: "text-rambu-tua", bar: "bg-rambu" };
}

// Ringkasan tenggat: tahap, sisa waktu, bar progres, dan tanggal batas
export function InfoTenggat({ tenggat }: { tenggat: Tenggat }) {
  const sisa = formatSisaWaktu(tenggat.batas);
  const porsi = porsiWaktuTerpakai(tenggat);
  const warna = nada(tenggat);
  const judul = tenggat.tanggungJawabPetugas
    ? `Batas ${tenggat.tahap.toLowerCase()}`
    : "Ditutup otomatis jika tidak dikonfirmasi";

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="text-tinta-redup">{judul}</span>
        <span className={`angka font-bold whitespace-nowrap ${warna.teks}`}>{sisa.teks}</span>
      </div>
      <div
        className="mt-2 h-2 overflow-hidden rounded-full bg-kertas"
        role="progressbar"
        aria-label="Waktu yang sudah terpakai"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(porsi * 100)}
      >
        <div className={`h-full rounded-full ${warna.bar}`} style={{ width: `${Math.max(porsi * 100, 4)}%` }} />
      </div>
      <p className="angka mt-2 text-xs text-tinta-redup">{formatHariTanggalJam(tenggat.batas)} WIB</p>
    </div>
  );
}
