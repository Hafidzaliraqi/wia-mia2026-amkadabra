"use client";

import Link from "next/link";

// Ditampilkan kalau terjadi kesalahan tak terduga (misal database sedang tidak bisa dihubungi)
export default function Galat({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Maaf, ada yang tidak beres</h1>
      <p className="mt-3 leading-relaxed text-tinta-redup">
        Halaman ini gagal dimuat. Coba lagi beberapa saat. Kalau masih terjadi, kembali ke beranda.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="rounded-xl bg-rambu px-5 py-3 font-semibold text-white hover:bg-rambu-tua">
          Coba lagi
        </button>
        <Link href="/" className="rounded-xl px-5 py-3 font-semibold text-tinta ring-1 ring-garis ring-inset hover:bg-white">
          Ke beranda
        </Link>
      </div>
    </div>
  );
}
