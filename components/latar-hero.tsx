"use client";

import { useRef } from "react";

// Latar gelap bagian atas beranda: kisi tipis, cahaya biru dan kuning,
// serta sorotan lembut yang mengikuti kursor.
export function LatarHero({ children }: { children: React.ReactNode }) {
  const wadah = useRef<HTMLDivElement>(null);

  function gerak(e: React.PointerEvent<HTMLDivElement>) {
    const el = wadah.current;
    if (!el || e.pointerType !== "mouse") return;
    const kotak = el.getBoundingClientRect();
    el.style.setProperty("--sorot-x", `${e.clientX - kotak.left}px`);
    el.style.setProperty("--sorot-y", `${e.clientY - kotak.top}px`);
  }

  return (
    <div ref={wadah} onPointerMove={gerak} className="relative isolate overflow-hidden bg-malam text-white">
      <div aria-hidden="true" className="latar-kisi absolute inset-0 -z-10" />
      <div aria-hidden="true" className="absolute -top-48 right-[-12%] -z-10 size-[44rem] rounded-full bg-rambu/45 blur-[120px]" />
      <div aria-hidden="true" className="absolute bottom-[-20rem] left-[-12rem] -z-10 size-[34rem] rounded-full bg-sinyal/15 blur-[120px]" />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 hidden [@media(hover:hover)]:block motion-reduce:hidden"
        style={{ background: "radial-gradient(560px circle at var(--sorot-x, 70%) var(--sorot-y, 30%), rgb(255 255 255 / 0.07), transparent 70%)" }}
      />
      {children}
    </div>
  );
}
