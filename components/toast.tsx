"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CircleAlert, CircleCheck, Info, X } from "lucide-react";

type Jenis = "sukses" | "galat" | "info";
interface Toast {
  id: number;
  jenis: Jenis;
  pesan: string;
}

const KonteksToast = createContext<(jenis: Jenis, pesan: string) => void>(() => {});
let urutan = 0;

const gaya: Record<Jenis, { kelas: string; ikon: typeof Info }> = {
  sukses: { kelas: "border-tuntas/30 text-tuntas", ikon: CircleCheck },
  galat: { kelas: "border-bahaya/30 text-bahaya", ikon: CircleAlert },
  info: { kelas: "border-rambu/30 text-rambu-tua", ikon: Info },
};

// Pesan singkat yang muncul sebentar di atas layar (berhasil, gagal, info)
export function PenyediaToast({ children }: { children: React.ReactNode }) {
  const [daftar, setDaftar] = useState<Toast[]>([]);

  const tutup = useCallback((id: number) => setDaftar((d) => d.filter((t) => t.id !== id)), []);
  const tampilkan = useCallback(
    (jenis: Jenis, pesan: string) => {
      const id = ++urutan;
      setDaftar((d) => [...d.slice(-2), { id, jenis, pesan }]);
      window.setTimeout(() => tutup(id), jenis === "galat" ? 6000 : 4000);
    },
    [tutup],
  );

  return (
    <KonteksToast value={tampilkan}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-20 z-50 flex flex-col items-center gap-2 px-4" aria-live="polite">
        {daftar.map((t) => {
          const { kelas, ikon: Ikon } = gaya[t.jenis];
          return (
            <div
              key={t.id}
              role={t.jenis === "galat" ? "alert" : "status"}
              className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-xl border bg-white px-4 py-3 shadow-lg motion-safe:animate-toast ${kelas}`}
            >
              <Ikon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
              <p className="flex-1 text-sm font-semibold text-tinta">{t.pesan}</p>
              <button
                type="button"
                onClick={() => tutup(t.id)}
                className="-m-1 rounded-md p-1 text-tinta-redup hover:text-tinta"
              >
                <X className="size-4" aria-hidden="true" />
                <span className="sr-only">Tutup pesan</span>
              </button>
            </div>
          );
        })}
      </div>
    </KonteksToast>
  );
}

export function useToast() {
  return useContext(KonteksToast);
}
