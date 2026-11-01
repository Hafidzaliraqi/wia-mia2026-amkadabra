"use client";

import { useEffect, useRef } from "react";

// Membungkus bagian halaman supaya muncul halus saat di-scroll.
// Bagian yang sudah terlihat saat halaman dibuka tidak disembunyikan,
// jadi tidak ada konten yang berkedip atau bergeser.
export function Muncul({ children, tunda = 0, className }: { children: React.ReactNode; tunda?: number; className?: string }) {
  const elemen = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = elemen.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
    el.dataset.muncul = "tersembunyi";
    const pengamat = new IntersectionObserver(
      ([masuk]) => {
        if (!masuk.isIntersecting) return;
        el.dataset.muncul = "tampil";
        pengamat.disconnect();
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    pengamat.observe(el);
    return () => pengamat.disconnect();
  }, []);

  return (
    <div ref={elemen} className={className} style={{ "--tunda": `${tunda}ms` } as React.CSSProperties}>
      {children}
    </div>
  );
}
