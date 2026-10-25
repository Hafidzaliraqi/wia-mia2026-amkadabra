"use client";

import { useEffect, useOptimistic, useRef, useState, useTransition } from "react";
import { MessagesSquare, Send } from "lucide-react";
import { useToast } from "@/components/toast";
import { kirimTanggapan } from "@/lib/aksi/laporan";
import { kirimBalasan } from "@/lib/aksi/petugas";

export interface PesanPercakapan {
  kunci: string;
  dari: "petugas" | "warga";
  nama: string;
  isi: string;
  waktuTeks: string;
  milikSaya: boolean;
  terkirim?: boolean; // false = masih dikirim
}

// Percakapan dua arah antara petugas instansi dan warga (pelapor/pendukung)
export function Percakapan({
  nomor,
  pesan,
  sebagai,
  bisaKirim,
  keteranganTutup,
}: {
  nomor: string;
  pesan: PesanPercakapan[];
  sebagai: "warga" | "petugas" | "admin";
  bisaKirim: boolean;
  keteranganTutup?: string;
}) {
  const toast = useToast();
  const [isi, setIsi] = useState("");
  const [memproses, mulai] = useTransition();
  const [daftar, tambahOptimis] = useOptimistic(pesan, (lama, baru: PesanPercakapan) => [...lama, baru]);
  const wadah = useRef<HTMLDivElement>(null);

  useEffect(() => {
    wadah.current?.scrollTo({ top: wadah.current.scrollHeight, behavior: "smooth" });
  }, [daftar.length]);

  function kirim() {
    const teks = isi.trim();
    if (!teks || memproses) return;
    mulai(async () => {
      tambahOptimis({ kunci: `baru-${Date.now()}`, dari: sebagai === "petugas" ? "petugas" : "warga", nama: "Kamu", isi: teks, waktuTeks: "mengirim…", milikSaya: true, terkirim: false });
      setIsi("");
      const hasil = sebagai === "petugas" ? await kirimBalasan(nomor, teks) : await kirimTanggapan(nomor, teks);
      if (!hasil.ok) {
        setIsi(teks);
        toast("galat", hasil.pesan);
      } else {
        toast("sukses", sebagai === "petugas" ? "Pesan terkirim. Pelapor dan pendukung mendapat notifikasi." : "Pesan terkirim ke petugas.");
      }
    });
  }

  return (
    <section className="rounded-2xl border border-garis bg-white p-5 sm:p-6" aria-labelledby={`judul-percakapan-${nomor}`}>
      <div className="flex items-center gap-2">
        <MessagesSquare className="size-5 text-rambu" aria-hidden="true" />
        <h2 id={`judul-percakapan-${nomor}`} className="font-bold">
          Percakapan dengan {sebagai === "warga" ? "petugas" : "warga"}
        </h2>
        <span className="angka ml-auto rounded-full bg-kertas px-2 py-0.5 text-xs font-semibold text-tinta-redup">{daftar.length}</span>
      </div>

      <div ref={wadah} className="mt-4 max-h-96 space-y-3 overflow-y-auto pr-1" aria-live="polite">
        {daftar.length === 0 ? (
          <p className="rounded-xl bg-kertas px-4 py-6 text-center text-sm text-tinta-redup">
            {sebagai === "petugas"
              ? "Belum ada percakapan. Kirim kabar perkembangan supaya warga tahu laporannya ditangani."
              : "Belum ada percakapan. Kabar dari petugas akan muncul di sini."}
          </p>
        ) : (
          daftar.map((p) => (
            <div key={p.kunci} className={`flex flex-col motion-safe:animate-muncul ${p.milikSaya ? "items-end" : "items-start"}`}>
              <p className="mb-1 px-1 text-xs text-tinta-redup">
                <span className="font-semibold text-tinta">{p.milikSaya && sebagai !== "admin" ? "Kamu" : p.nama}</span> · {p.waktuTeks}
              </p>
              <p
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                  p.milikSaya && sebagai !== "admin"
                    ? `rounded-br-md bg-rambu text-white ${p.terkirim === false ? "opacity-70" : ""}`
                    : p.dari === "petugas"
                      ? "rounded-bl-md bg-rambu-muda text-tinta"
                      : "rounded-bl-md bg-kertas text-tinta"
                }`}
              >
                {p.isi}
              </p>
            </div>
          ))
        )}
      </div>

      {bisaKirim ? (
        <form
          className="mt-4 flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            kirim();
          }}
        >
          <label htmlFor={`isi-pesan-${nomor}`} className="sr-only">
            Tulis pesan
          </label>
          <textarea
            id={`isi-pesan-${nomor}`}
            rows={2}
            value={isi}
            maxLength={1000}
            onChange={(e) => setIsi(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) kirim();
            }}
            placeholder={sebagai === "petugas" ? "Tulis kabar untuk warga, misal jadwal pengerjaan" : "Tulis pesan untuk petugas, misal info tambahan lokasi"}
            className="min-h-11 flex-1 resize-none rounded-xl border border-garis bg-white px-3.5 py-2.5 text-sm focus:border-rambu focus:outline-none"
          />
          <button
            type="submit"
            disabled={!isi.trim() || memproses}
            className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-rambu text-white transition hover:bg-rambu-tua active:scale-95 disabled:opacity-50"
          >
            <Send className="size-4" aria-hidden="true" />
            <span className="sr-only">Kirim pesan</span>
          </button>
        </form>
      ) : (
        keteranganTutup && <p className="mt-4 rounded-xl bg-kertas px-3.5 py-2.5 text-sm text-tinta-redup">{keteranganTutup}</p>
      )}
    </section>
  );
}
