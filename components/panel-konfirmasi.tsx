"use client";

import { useState } from "react";

type Tahap = "tanya" | "beres" | "isi_alasan" | "dibuka_ulang";

// Simulasi konfirmasi pelapor. Nanti tombolnya cuma muncul untuk pelapor
// dan pendukung yang sudah login, dan hasilnya disimpan ke database.
export function PanelKonfirmasi({
  instansiNama,
  batasTeks,
}: {
  instansiNama: string;
  batasTeks: string;
}) {
  const [tahap, setTahap] = useState<Tahap>("tanya");
  const [alasan, setAlasan] = useState("");
  const [galat, setGalat] = useState<string | null>(null);

  function kirimAlasan(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (alasan.trim().length < 10) {
      setGalat("Tulis minimal 10 karakter supaya petugas tahu bagian mana yang belum beres.");
      return;
    }
    setGalat(null);
    setTahap("dibuka_ulang");
  }

  return (
    <section
      aria-labelledby="judul-konfirmasi"
      className="rounded-2xl border-2 border-waspada/30 bg-waspada-muda p-5"
    >
      <h2 id="judul-konfirmasi" className="font-bold">
        Masalahnya sudah beres?
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-tinta-redup">
        {instansiNama} menandai laporan ini selesai. Laporan ditutup otomatis {batasTeks} kalau tidak
        ada jawaban dari pelapor atau pendukung.
      </p>

      {tahap === "tanya" && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setTahap("beres")}
            className="rounded-xl bg-tuntas px-3 py-2.5 text-sm font-semibold text-white hover:bg-tuntas/90"
          >
            Sudah beres
          </button>
          <button
            type="button"
            onClick={() => setTahap("isi_alasan")}
            className="rounded-xl bg-white px-3 py-2.5 text-sm font-semibold text-bahaya ring-1 ring-bahaya/30 ring-inset hover:bg-bahaya-muda"
          >
            Belum beres
          </button>
        </div>
      )}

      {tahap === "isi_alasan" && (
        <form onSubmit={kirimAlasan} className="mt-4 space-y-3" noValidate>
          <label htmlFor="alasan" className="block text-sm font-semibold">
            Apa yang belum beres?
          </label>
          <textarea
            id="alasan"
            value={alasan}
            onChange={(e) => setAlasan(e.target.value)}
            rows={3}
            aria-invalid={galat ? true : undefined}
            aria-describedby={galat ? "galat-alasan" : undefined}
            placeholder="Contoh: baru sebagian yang diperbaiki, lubang di dekat halte masih ada."
            className="w-full rounded-xl border border-garis bg-white px-3.5 py-2.5 text-sm focus:border-rambu focus:outline-none"
          />
          {galat && (
            <p id="galat-alasan" className="text-sm text-bahaya">
              {galat}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-xl bg-tinta px-4 py-2.5 text-sm font-semibold text-white hover:bg-tinta/90"
            >
              Buka ulang laporan
            </button>
            <button
              type="button"
              onClick={() => setTahap("tanya")}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-tinta-redup hover:text-tinta"
            >
              Batal
            </button>
          </div>
        </form>
      )}

      {tahap === "beres" && (
        <p className="mt-4 rounded-xl bg-white px-3.5 py-2.5 text-sm" role="status">
          Laporan ditutup dan tercatat selesai dengan konfirmasi pelapor.
        </p>
      )}

      {tahap === "dibuka_ulang" && (
        <p className="mt-4 rounded-xl bg-white px-3.5 py-2.5 text-sm" role="status">
          Laporan dibuka ulang dan dikembalikan ke {instansiNama} dengan batas waktu baru.
        </p>
      )}

      <p className="mt-4 text-xs text-tinta-redup">
        Mode demo: yang bisa mengonfirmasi hanya pelapor dan pendukung yang sudah masuk.
      </p>
    </section>
  );
}
