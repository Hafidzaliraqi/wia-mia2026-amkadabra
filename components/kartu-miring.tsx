"use client";

import { useRef } from "react";

// Kartu yang sedikit miring mengikuti kursor (efek 3D), dengan pantulan cahaya.
// Hanya untuk mouse; di layar sentuh dan mode kurangi gerakan tetap diam.
export function KartuMiring({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const kartu = useRef<HTMLDivElement>(null);

  function gerak(e: React.PointerEvent<HTMLDivElement>) {
    const el = kartu.current;
    if (!el || e.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const kotak = el.getBoundingClientRect();
    const x = (e.clientX - kotak.left) / kotak.width - 0.5;
    const y = (e.clientY - kotak.top) / kotak.height - 0.5;
    el.style.transform = `rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 9).toFixed(2)}deg)`;
    el.style.setProperty("--cahaya-x", `${((x + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty("--cahaya-y", `${((y + 0.5) * 100).toFixed(1)}%`);
  }

  function lepas() {
    if (kartu.current) kartu.current.style.transform = "";
  }

  return (
    <div className={`group [perspective:1200px] ${className}`} onPointerMove={gerak} onPointerLeave={lepas}>
      <div ref={kartu} className="relative transition-transform duration-300 ease-out [transform-style:preserve-3d]">
        {children}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: "radial-gradient(circle at var(--cahaya-x, 50%) var(--cahaya-y, 50%), rgb(255 255 255 / 0.45), transparent 45%)" }}
        />
      </div>
    </div>
  );
}
