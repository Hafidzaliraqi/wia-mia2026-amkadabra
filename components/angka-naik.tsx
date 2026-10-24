"use client";

import { useEffect, useRef, useState } from "react";

// Angka yang naik dari 0 saat pertama kali terlihat di layar
export function AngkaNaik({ nilai, akhiran = "" }: { nilai: number; akhiran?: string }) {
  const [tampil, setTampil] = useState(nilai);
  const elemen = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = elemen.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let bingkai = 0;
    const pengamat = new IntersectionObserver(
      ([masuk]) => {
        if (!masuk.isIntersecting) return;
        pengamat.disconnect();
        const mulai = performance.now();
        const jalan = (t: number) => {
          const p = Math.min(1, (t - mulai) / 1100);
          setTampil(Math.round(nilai * (1 - Math.pow(1 - p, 3))));
          if (p < 1) bingkai = requestAnimationFrame(jalan);
        };
        setTampil(0);
        bingkai = requestAnimationFrame(jalan);
      },
      { threshold: 0.4 },
    );
    pengamat.observe(el);
    return () => {
      pengamat.disconnect();
      cancelAnimationFrame(bingkai);
    };
  }, [nilai]);

  return (
    <span ref={elemen} className="angka">
      {tampil}
      {akhiran}
    </span>
  );
}
