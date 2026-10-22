"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const kelasInput =
  "w-full rounded-xl border bg-white px-4 py-3 text-base focus:border-rambu focus:outline-none aria-[invalid=true]:border-bahaya";

// Kolom isian dengan label, petunjuk, dan pesan galat yang terhubung ke pembaca layar
export function KolomIsian({
  label,
  galat,
  petunjuk,
  sandi = false,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  galat?: string | null;
  petunjuk?: string;
  sandi?: boolean;
}) {
  const id = useId();
  const [tampilSandi, setTampilSandi] = useState(false);
  const idPetunjuk = petunjuk && !galat ? `${id}-petunjuk` : undefined;
  const idGalat = galat ? `${id}-galat` : undefined;

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          {...props}
          type={sandi ? (tampilSandi ? "text" : "password") : props.type}
          aria-invalid={galat ? true : undefined}
          aria-describedby={[idPetunjuk, idGalat].filter(Boolean).join(" ") || undefined}
          className={`${kelasInput} border-garis ${sandi ? "pr-12" : ""} ${className}`}
        />
        {sandi && (
          <button
            type="button"
            onClick={() => setTampilSandi((v) => !v)}
            className="absolute top-1/2 right-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-tinta-redup hover:text-tinta"
          >
            {tampilSandi ? <EyeOff className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />}
            <span className="sr-only">{tampilSandi ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}</span>
          </button>
        )}
      </div>
      {petunjuk && !galat && (
        <p id={idPetunjuk} className="mt-1.5 text-sm text-tinta-redup">
          {petunjuk}
        </p>
      )}
      {galat && (
        <p id={idGalat} className="mt-1.5 text-sm text-bahaya">
          {galat}
        </p>
      )}
    </div>
  );
}
