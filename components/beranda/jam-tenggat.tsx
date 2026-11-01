"use client";

import { useEffect, useState } from "react";

const dua = (n: number) => String(n).padStart(2, "0");

// Contoh hitung mundur tenggat yang berdetak (untuk kartu fitur di beranda)
export function JamTenggat() {
  const [sisa, setSisa] = useState(4 * 86400 + 3 * 3600 + 12 * 60 + 45);
  useEffect(() => {
    const pewaktu = window.setInterval(() => setSisa((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => window.clearInterval(pewaktu);
  }, []);
  const hari = Math.floor(sisa / 86400);
  const jam = Math.floor((sisa % 86400) / 3600);
  const menit = Math.floor((sisa % 3600) / 60);
  return (
    <p className="kode text-[1.65rem] font-bold text-sinyal tabular-nums sm:text-3xl">
      {hari}h {dua(jam)}:{dua(menit)}:{dua(sisa % 60)}
    </p>
  );
}
