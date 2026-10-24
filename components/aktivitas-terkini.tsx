"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export interface Aktivitas {
  teks: string;
  waktuTeks: string;
  tautan: string;
}

// Kabar terbaru yang berganti otomatis, menunjukkan laporan benar-benar ditangani
export function AktivitasTerkini({ daftar }: { daftar: Aktivitas[] }) {
  const [indeks, setIndeks] = useState(0);
  const [jeda, setJeda] = useState(false);

  useEffect(() => {
    if (jeda || daftar.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const pewaktu = window.setInterval(() => setIndeks((i) => (i + 1) % daftar.length), 4000);
    return () => window.clearInterval(pewaktu);
  }, [jeda, daftar.length]);

  if (daftar.length === 0) return null;
  const a = daftar[indeks];
  return (
    <div
      className="flex items-center gap-3 rounded-xl border border-garis bg-white px-4 py-3 text-sm"
      onMouseEnter={() => setJeda(true)}
      onMouseLeave={() => setJeda(false)}
      onFocus={() => setJeda(true)}
      onBlur={() => setJeda(false)}
    >
      <span className="flex shrink-0 items-center gap-1.5 text-xs font-bold text-tuntas">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full rounded-full bg-tuntas opacity-60 motion-safe:animate-ping" />
          <span className="relative inline-flex size-2 rounded-full bg-tuntas" />
        </span>
        Terbaru
      </span>
      <Link key={indeks} href={a.tautan} className="min-w-0 flex-1 truncate hover:text-rambu motion-safe:animate-muncul">
        {a.teks}
      </Link>
      <span className="shrink-0 text-xs text-tinta-redup">{a.waktuTeks}</span>
    </div>
  );
}
