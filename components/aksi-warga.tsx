"use client";

import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { Flag, ThumbsUp } from "lucide-react";
import { alihkanDukungan, tandaiTidakSesuai } from "@/lib/aksi/laporan";
import { Dialog, Tombol } from "@/components/dialog";
import { useToast } from "@/components/toast";

export function AksiWarga({
  nomor,
  jumlah,
  didukung,
  bisaDidukung,
  laporanSendiri,
  sudahMasuk,
  peranWarga,
}: {
  nomor: string;
  jumlah: number;
  didukung: boolean;
  bisaDidukung: boolean;
  laporanSendiri: boolean;
  sudahMasuk: boolean;
  peranWarga: boolean;
}) {
  const toast = useToast();
  const [memproses, mulai] = useTransition();
  // Tampilan langsung berubah saat diklik, lalu disesuaikan dengan hasil server
  const [optimis, setOptimis] = useOptimistic({ didukung, jumlah });
  const [dialogTandai, setDialogTandai] = useState(false);
  const [alasan, setAlasan] = useState("");
  const [memprosesTandai, mulaiTandai] = useTransition();
  const lanjut = `/masuk?lanjut=${encodeURIComponent(`/laporan/${nomor}`)}`;

  function dukung() {
    mulai(async () => {
      setOptimis((v) => ({ didukung: !v.didukung, jumlah: v.jumlah + (v.didukung ? -1 : 1) }));
      const hasil = await alihkanDukungan(nomor);
      if (!hasil.ok) toast("galat", hasil.pesan);
      else if (hasil.didukung) toast("sukses", "Kamu mendukung laporan ini. Kabar perkembangannya akan muncul di notifikasimu.");
      else toast("info", "Dukungan dibatalkan.");
    });
  }

  if (laporanSendiri) {
    return (
      <p className="text-sm leading-relaxed text-tinta-redup">
        <span className="font-semibold text-tinta">Ini laporanmu.</span> Kamu otomatis dapat kabar setiap ada perkembangan.
        <span className="angka mt-2 block font-semibold text-tinta">{jumlah} warga ikut mendukung</span>
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {!bisaDidukung ? (
        <p className="flex items-center gap-2 text-sm text-tinta-redup">
          <ThumbsUp className="size-4 shrink-0" aria-hidden="true" />
          <span>
            <span className="angka font-bold text-tinta">{jumlah} warga</span> mendukung laporan ini.
          </span>
        </p>
      ) : !sudahMasuk ? (
        <Link
          href={lanjut}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-rambu px-4 py-3 font-semibold text-white transition hover:bg-rambu-tua active:scale-[0.98]"
        >
          <ThumbsUp className="size-5" aria-hidden="true" />
          Masuk untuk mendukung
        </Link>
      ) : peranWarga ? (
        <button
          type="button"
          onClick={dukung}
          disabled={memproses}
          aria-pressed={optimis.didukung}
          className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition active:scale-[0.98] disabled:opacity-80 ${
            optimis.didukung ? "bg-rambu-muda text-rambu-tua ring-1 ring-rambu/30 ring-inset" : "bg-rambu text-white hover:bg-rambu-tua"
          }`}
        >
          <ThumbsUp className={`size-5 ${optimis.didukung ? "fill-current motion-safe:animate-letup" : ""}`} aria-hidden="true" />
          {optimis.didukung ? "Kamu mendukung laporan ini" : "Dukung laporan ini"}
        </button>
      ) : null}

      {bisaDidukung && (
        <p className="text-sm text-tinta-redup">
          <span key={optimis.jumlah} className="angka inline-block font-bold text-tinta motion-safe:animate-letup">
            {optimis.jumlah} warga
          </span>{" "}
          ikut terdampak. Pendukung dapat kabar perkembangan dan bisa ikut mengonfirmasi penyelesaian.
        </p>
      )}

      {sudahMasuk && peranWarga && (
        <button
          type="button"
          onClick={() => setDialogTandai(true)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-tinta-redup hover:text-tinta"
        >
          <Flag className="size-4" aria-hidden="true" />
          Laporan ini tidak sesuai
        </button>
      )}

      <Dialog
        terbuka={dialogTandai}
        onTutup={() => setDialogTandai(false)}
        judul="Tandai laporan tidak sesuai"
        deskripsi="Admin akan memeriksa ulang laporan ini. Identitasmu tidak ditampilkan ke pelapor."
      >
        <label htmlFor="alasan-tandai" className="mb-1.5 block text-sm font-semibold">
          Apa yang tidak sesuai?
        </label>
        <textarea
          id="alasan-tandai"
          rows={3}
          value={alasan}
          onChange={(e) => setAlasan(e.target.value)}
          placeholder="Contoh: lokasinya salah, masalahnya sudah tidak ada sejak lama."
          className="w-full rounded-xl border border-garis px-3.5 py-2.5 text-sm focus:border-rambu focus:outline-none"
        />
        <div className="mt-4 flex justify-end gap-2">
          <Tombol varian="hantu" onClick={() => setDialogTandai(false)}>
            Batal
          </Tombol>
          <Tombol
            varian="gelap"
            memproses={memprosesTandai}
            onClick={() =>
              mulaiTandai(async () => {
                const hasil = await tandaiTidakSesuai(nomor, alasan);
                if (!hasil.ok) return toast("galat", hasil.pesan);
                setDialogTandai(false);
                setAlasan("");
                toast("sukses", "Terima kasih. Admin akan memeriksa ulang laporan ini.");
              })
            }
          >
            Kirim
          </Tombol>
        </div>
      </Dialog>
    </div>
  );
}
