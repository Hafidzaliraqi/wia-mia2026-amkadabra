"use client";

import { useEffect, useState, useTransition } from "react";
import { MailCheck, Terminal } from "lucide-react";
import { KotakKode } from "@/components/kotak-kode";
import { Tombol } from "@/components/dialog";
import { useToast } from "@/components/toast";
import { kirimUlangKode } from "@/lib/aksi/akun";

// Kolom kode OTP + tombol kirim ulang dengan hitung mundur
export function KolomKode({
  idOtp,
  email,
  modeTerminal,
  kode,
  onUbah,
  onLengkap,
  galat,
}: {
  idOtp: string;
  email: string;
  modeTerminal: boolean;
  kode: string;
  onUbah: (kode: string) => void;
  onLengkap?: (kode: string) => void;
  galat?: string | null;
}) {
  const toast = useToast();
  const [jeda, setJeda] = useState(60);
  const [memproses, mulai] = useTransition();

  useEffect(() => {
    if (jeda <= 0) return;
    const pewaktu = window.setTimeout(() => setJeda((d) => d - 1), 1000);
    return () => window.clearTimeout(pewaktu);
  }, [jeda]);

  return (
    <div className="space-y-4">
      <p className="flex gap-3 rounded-xl bg-rambu-muda px-4 py-3 text-sm leading-relaxed text-rambu-tua">
        <MailCheck className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <span>
          Kode 6 digit sudah dikirim ke <span className="font-semibold">{email}</span>. Cek juga folder spam. Kode berlaku 10 menit.
        </span>
      </p>
      {modeTerminal && (
        <p className="flex gap-3 rounded-xl border border-dashed border-garis px-4 py-3 text-sm text-tinta-redup">
          <Terminal className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <span>
            Mode pengembangan: pengiriman email belum diatur, jadi isi email dicetak di terminal tempat <code>npm run dev</code> berjalan.
          </span>
        </p>
      )}
      <div>
        <p className="mb-2 text-sm font-semibold">Kode verifikasi</p>
        <KotakKode nilai={kode} onUbah={onUbah} onLengkap={onLengkap} galat={Boolean(galat)} idGalat="galat-kode" />
        {galat && (
          <p id="galat-kode" role="alert" className="mt-2 text-sm text-bahaya motion-safe:animate-muncul">
            {galat}
          </p>
        )}
      </div>
      <div className="text-sm">
        {jeda > 0 ? (
          <span className="angka text-tinta-redup">Kirim ulang kode dalam {jeda} detik</span>
        ) : (
          <Tombol
            varian="hantu"
            className="-ml-4"
            memproses={memproses}
            onClick={() =>
              mulai(async () => {
                const hasil = await kirimUlangKode(idOtp);
                if (!hasil.ok) return toast("galat", hasil.pesan);
                setJeda(hasil.jeda);
                toast("sukses", "Kode baru sudah dikirim.");
              })
            }
          >
            Kirim ulang kode
          </Tombol>
        )}
      </div>
    </div>
  );
}
