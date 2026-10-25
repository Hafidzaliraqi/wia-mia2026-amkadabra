"use client";

import { useEffect, useState } from "react";

function format(selisih: number) {
  const lewat = selisih < 0;
  const mutlak = Math.abs(selisih);
  const hari = Math.floor(mutlak / 86_400_000);
  const jam = Math.floor((mutlak % 86_400_000) / 3_600_000);
  const menit = Math.floor((mutlak % 3_600_000) / 60_000);
  const detik = Math.floor((mutlak % 60_000) / 1000);
  const jamTeks = [jam, menit, detik].map((n) => String(n).padStart(2, "0")).join(":");
  return `${lewat ? "Lewat" : "Sisa"} ${hari > 0 ? `${hari} hari ` : ""}${jamTeks}`;
}

// Hitung mundur yang berdetak tiap detik. Teks awal dari server dipakai
// sampai halaman siap, supaya tidak ada perbedaan tampilan saat dimuat.
export function HitungMundur({ batas, awal }: { batas: string; awal: string }) {
  const [teks, setTeks] = useState(awal);
  useEffect(() => {
    const target = new Date(batas).getTime();
    const detak = () => setTeks(format(target - Date.now()));
    const pertama = window.setTimeout(detak, 0);
    const pewaktu = window.setInterval(detak, 1000);
    return () => {
      window.clearTimeout(pertama);
      window.clearInterval(pewaktu);
    };
  }, [batas]);
  return (
    <span className="angka" aria-live="off">
      {teks}
    </span>
  );
}
