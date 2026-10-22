"use client";

import { useEffect, useRef } from "react";
import { LoaderCircle } from "lucide-react";

// Dialog bawaan browser (<dialog>): fokus otomatis terkunci di dalam dialog
// dan bisa ditutup dengan tombol Esc.
export function Dialog({
  terbuka,
  onTutup,
  judul,
  deskripsi,
  children,
}: {
  terbuka: boolean;
  onTutup: () => void;
  judul: string;
  deskripsi?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (terbuka && !dialog.open) dialog.showModal();
    if (!terbuka && dialog.open) dialog.close();
  }, [terbuka]);

  return (
    <dialog
      ref={ref}
      onClose={onTutup}
      aria-labelledby="judul-dialog"
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-garis bg-white p-0 text-tinta shadow-xl open:motion-safe:animate-muncul"
    >
      <div className="p-6">
        <h2 id="judul-dialog" className="text-lg font-bold">
          {judul}
        </h2>
        {deskripsi && <p className="mt-1.5 text-sm leading-relaxed text-tinta-redup">{deskripsi}</p>}
        <div className="mt-5">{children}</div>
      </div>
    </dialog>
  );
}

export function Tombol({
  memproses = false,
  varian = "utama",
  className = "",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  memproses?: boolean;
  varian?: "utama" | "garis" | "bahaya" | "hantu" | "gelap" | "tuntas";
}) {
  const gaya = {
    utama: "bg-rambu text-white hover:bg-rambu-tua",
    garis: "text-rambu ring-1 ring-rambu/40 ring-inset hover:bg-rambu-muda",
    bahaya: "bg-bahaya text-white hover:bg-bahaya/90",
    hantu: "text-tinta-redup hover:bg-kertas hover:text-tinta",
    gelap: "bg-tinta text-white hover:bg-tinta/90",
    tuntas: "bg-tuntas text-white hover:bg-tuntas/90",
  }[varian];
  return (
    <button
      type="button"
      {...props}
      disabled={memproses || props.disabled}
      aria-busy={memproses || undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${gaya} ${className}`}
    >
      {memproses && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
