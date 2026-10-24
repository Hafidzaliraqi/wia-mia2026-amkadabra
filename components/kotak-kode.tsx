"use client";

import { useRef } from "react";

const PANJANG = 6;

// Kode OTP dalam 6 kotak terpisah: pindah otomatis ke kotak berikutnya,
// Backspace mundur, dan bisa tempel (paste) kode sekaligus.
export function KotakKode({
  nilai,
  onUbah,
  onLengkap,
  galat,
  idGalat,
}: {
  nilai: string;
  onUbah: (kode: string) => void;
  onLengkap?: (kode: string) => void;
  galat?: boolean;
  idGalat?: string;
}) {
  const kotak = useRef<(HTMLInputElement | null)[]>([]);
  const digit = Array.from({ length: PANJANG }, (_, i) => nilai[i] ?? "");

  function setel(baru: string, fokusKe?: number) {
    const bersih = baru.replace(/\D/g, "").slice(0, PANJANG);
    onUbah(bersih);
    if (fokusKe !== undefined) kotak.current[Math.min(fokusKe, PANJANG - 1)]?.focus();
    if (bersih.length === PANJANG) onLengkap?.(bersih);
  }

  return (
    <div role="group" aria-label="Kode verifikasi 6 digit" className="flex justify-between gap-2 sm:gap-3">
      {digit.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            kotak.current[i] = el;
          }}
          value={d}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${i + 1} dari ${PANJANG}`}
          aria-invalid={galat || undefined}
          aria-describedby={galat ? idGalat : undefined}
          maxLength={i === 0 ? PANJANG : 1}
          onFocus={(e) => e.target.select()}
          onChange={(e) => {
            const masuk = e.target.value.replace(/\D/g, "");
            if (!masuk) return setel(nilai.slice(0, i) + nilai.slice(i + 1));
            if (masuk.length > 1) return setel(nilai.slice(0, i) + masuk, i + masuk.length);
            const daftar = digit.slice();
            daftar[i] = masuk;
            setel(daftar.join(""), i + 1);
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !d && i > 0) {
              e.preventDefault();
              setel(nilai.slice(0, i - 1) + nilai.slice(i), i - 1);
            } else if (e.key === "ArrowLeft" && i > 0) kotak.current[i - 1]?.focus();
            else if (e.key === "ArrowRight" && i < PANJANG - 1) kotak.current[i + 1]?.focus();
          }}
          onPaste={(e) => {
            e.preventDefault();
            const tempel = e.clipboardData.getData("text").replace(/\D/g, "");
            if (tempel) setel(tempel, tempel.length);
          }}
          className={`angka size-12 min-w-0 rounded-xl border-2 bg-white text-center text-2xl font-bold transition-colors focus:border-rambu focus:outline-none sm:size-14 ${
            galat ? "border-bahaya" : d ? "border-rambu/60" : "border-garis"
          }`}
        />
      ))}
    </div>
  );
}
