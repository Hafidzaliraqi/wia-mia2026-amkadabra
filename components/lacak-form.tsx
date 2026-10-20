"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { normalisasiNomor } from "@/lib/nomor";

export function LacakForm({ contoh }: { contoh: string }) {
  const router = useRouter();
  const [nomor, setNomor] = useState("");
  const [pesan, setPesan] = useState<string | null>(null);

  function lacak(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const bersih = normalisasiNomor(nomor.trim());
    if (!bersih) {
      setPesan(`Masukkan nomor laporan, misalnya ${contoh}.`);
      return;
    }
    setPesan(null);
    router.push(`/laporan/${bersih}`);
  }

  return (
    <form onSubmit={lacak} className="w-full max-w-lg" noValidate>
      <label htmlFor="nomor-laporan" className="mb-2 block text-sm font-semibold">
        Lacak laporan
      </label>
      <div className="flex gap-2">
        <input
          id="nomor-laporan"
          name="nomor"
          value={nomor}
          onChange={(e) => setNomor(e.target.value)}
          placeholder={contoh}
          autoComplete="off"
          spellCheck={false}
          aria-describedby="petunjuk-lacak"
          className="angka min-w-0 flex-1 rounded-xl border border-garis bg-white px-4 py-3 text-base uppercase placeholder:normal-case placeholder:text-tinta-redup/70 focus:border-rambu focus:outline-none focus-visible:outline-2"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-xl bg-tinta px-4 py-3 text-sm font-semibold text-white hover:bg-tinta/90 sm:px-5"
        >
          <Search className="size-4" aria-hidden="true" />
          Lacak
        </button>
      </div>
      <p id="petunjuk-lacak" className={`mt-2 text-sm ${pesan ? "text-bahaya" : "text-tinta-redup"}`}>
        {pesan ?? (
          <>
            Nomor laporan ada di email konfirmasi, contoh:{" "}
            <span className="angka whitespace-nowrap">{contoh}</span>
          </>
        )}
      </p>
    </form>
  );
}
