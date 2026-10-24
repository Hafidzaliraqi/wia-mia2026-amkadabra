"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { bukaUlangLaporan, konfirmasiPenyelesaian } from "@/lib/aksi/laporan";
import { Tombol } from "@/components/dialog";
import { useToast } from "@/components/toast";
import { rayakan } from "@/lib/rayakan";

export function PanelKonfirmasi({
  nomor,
  instansiNama,
  batasTeks,
  sudahMasuk,
  berhak,
}: {
  nomor: string;
  instansiNama: string;
  batasTeks: string;
  sudahMasuk: boolean;
  berhak: boolean;
}) {
  const toast = useToast();
  const [isiAlasan, setIsiAlasan] = useState(false);
  const [alasan, setAlasan] = useState("");
  const [memproses, mulai] = useTransition();

  function kirim(hasil: "beres" | "belum") {
    mulai(async () => {
      const r = await konfirmasiPenyelesaian(nomor, hasil, alasan);
      if (!r.ok) return toast("galat", r.pesan);
      if (hasil === "beres") rayakan();
      toast(
        "sukses",
        hasil === "beres" ? "Terima kasih! Laporan tercatat selesai." : "Laporan dibuka ulang dan dikembalikan ke petugas.",
      );
    });
  }

  return (
    <section aria-labelledby="judul-konfirmasi" className="rounded-2xl border-2 border-waspada/30 bg-waspada-muda p-5">
      <h2 id="judul-konfirmasi" className="font-bold">
        Masalahnya sudah beres?
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-tinta-redup">
        {instansiNama} menandai laporan ini selesai. Laporan ditutup otomatis {batasTeks} kalau tidak ada jawaban.
      </p>

      {!sudahMasuk ? (
        <Link
          href={`/masuk?lanjut=${encodeURIComponent(`/laporan/${nomor}`)}`}
          className="mt-4 block rounded-xl bg-tinta px-3 py-2.5 text-center text-sm font-semibold text-white hover:bg-tinta/90"
        >
          Masuk untuk mengonfirmasi
        </Link>
      ) : !berhak ? (
        <p className="mt-4 rounded-xl bg-white px-3.5 py-2.5 text-sm">
          Yang bisa mengonfirmasi hanya pelapor dan warga pendukung. Kalau kamu juga terdampak, dukung laporan ini dulu
          lewat tombol Dukung di halaman ini.
        </p>
      ) : !isiAlasan ? (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Tombol varian="tuntas" memproses={memproses} onClick={() => kirim("beres")}>
            Sudah beres
          </Tombol>
          <Tombol
            onClick={() => setIsiAlasan(true)}
            disabled={memproses}
            className="bg-white text-bahaya ring-1 ring-bahaya/30 ring-inset hover:bg-bahaya-muda"
            varian="hantu"
          >
            Belum beres
          </Tombol>
        </div>
      ) : (
        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            kirim("belum");
          }}
        >
          <label htmlFor="alasan" className="block text-sm font-semibold">
            Apa yang belum beres?
          </label>
          <textarea
            id="alasan"
            value={alasan}
            onChange={(e) => setAlasan(e.target.value)}
            rows={3}
            placeholder="Contoh: baru sebagian yang diperbaiki, lubang di dekat halte masih ada."
            className="w-full rounded-xl border border-garis bg-white px-3.5 py-2.5 text-sm focus:border-rambu focus:outline-none"
          />
          <div className="flex gap-2">
            <Tombol type="submit" varian="gelap" memproses={memproses}>
              Buka ulang laporan
            </Tombol>
            <Tombol varian="hantu" onClick={() => setIsiAlasan(false)} disabled={memproses}>
              Batal
            </Tombol>
          </div>
        </form>
      )}
    </section>
  );
}

export function TombolBukaUlang({ nomor }: { nomor: string }) {
  const toast = useToast();
  const [terbuka, setTerbuka] = useState(false);
  const [alasan, setAlasan] = useState("");
  const [memproses, mulai] = useTransition();

  if (!terbuka) {
    return (
      <Tombol varian="garis" className="mt-3" onClick={() => setTerbuka(true)}>
        Buka ulang laporan
      </Tombol>
    );
  }
  return (
    <form
      className="mt-3 space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        mulai(async () => {
          const r = await bukaUlangLaporan(nomor, alasan);
          if (!r.ok) return toast("galat", r.pesan);
          toast("sukses", "Laporan dibuka ulang dan dikembalikan ke petugas.");
        });
      }}
    >
      <label htmlFor="alasan-buka" className="block text-sm font-semibold">
        Apa yang belum beres?
      </label>
      <textarea
        id="alasan-buka"
        rows={3}
        value={alasan}
        onChange={(e) => setAlasan(e.target.value)}
        className="w-full rounded-xl border border-garis px-3.5 py-2.5 text-sm focus:border-rambu focus:outline-none"
      />
      <div className="flex gap-2">
        <Tombol type="submit" varian="gelap" memproses={memproses}>
          Kirim
        </Tombol>
        <Tombol varian="hantu" onClick={() => setTerbuka(false)} disabled={memproses}>
          Batal
        </Tombol>
      </div>
    </form>
  );
}
