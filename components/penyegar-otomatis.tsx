"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Memuat ulang data halaman tiap beberapa detik (hanya saat tab sedang dibuka),
// supaya perubahan dari petugas/warga lain langsung terlihat tanpa refresh.
export function PenyegarOtomatis({ detik = 15, label = true }: { detik?: number; label?: boolean }) {
  const router = useRouter();
  useEffect(() => {
    const pewaktu = window.setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, detik * 1000);
    return () => window.clearInterval(pewaktu);
  }, [router, detik]);

  if (!label) return null;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-tuntas">
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full rounded-full bg-tuntas opacity-60 motion-safe:animate-ping" />
        <span className="relative inline-flex size-2 rounded-full bg-tuntas" />
      </span>
      Diperbarui otomatis
    </span>
  );
}
