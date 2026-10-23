"use client";

import { useState, useTransition } from "react";
import { LogOut } from "lucide-react";
import { Dialog, Tombol } from "@/components/dialog";
import { useKeluar } from "@/components/navigasi";
import { useToast } from "@/components/toast";
import { ubahNotifEmail } from "@/lib/aksi/akun";

export function TombolKeluar() {
  const [konfirmasi, setKonfirmasi] = useState(false);
  const { memproses, jalankan } = useKeluar();
  return (
    <>
      <Tombol varian="hantu" onClick={() => setKonfirmasi(true)} className="text-bahaya ring-1 ring-bahaya/30 ring-inset hover:bg-bahaya-muda hover:text-bahaya">
        <LogOut className="size-4" aria-hidden="true" />
        Keluar
      </Tombol>
      <Dialog terbuka={konfirmasi} onTutup={() => setKonfirmasi(false)} judul="Keluar dari akun?" deskripsi="Kamu perlu masuk lagi untuk membuat laporan, mendukung, dan mengonfirmasi penyelesaian.">
        <div className="flex justify-end gap-2">
          <Tombol varian="hantu" onClick={() => setKonfirmasi(false)} disabled={memproses}>
            Batal
          </Tombol>
          <Tombol varian="bahaya" memproses={memproses} onClick={() => jalankan(() => setKonfirmasi(false))}>
            Keluar
          </Tombol>
        </div>
      </Dialog>
    </>
  );
}

export function SaklarNotifEmail({ awal }: { awal: boolean }) {
  const toast = useToast();
  const [nyala, setNyala] = useState(awal);
  const [memproses, mulai] = useTransition();
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="text-sm">
        Kirim juga lewat email
        <span className="block text-xs text-tinta-redup">Terutama saat laporanmu butuh konfirmasi.</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={nyala}
        aria-label="Kirim notifikasi lewat email"
        disabled={memproses}
        onClick={() => {
          const baru = !nyala;
          setNyala(baru);
          mulai(async () => {
            const hasil = await ubahNotifEmail(baru);
            if (!hasil.ok) {
              setNyala(!baru);
              toast("galat", hasil.pesan);
            } else toast("sukses", baru ? "Notifikasi email dinyalakan." : "Notifikasi email dimatikan.");
          });
        }}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${nyala ? "bg-rambu" : "bg-garis"}`}
      >
        <span className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform ${nyala ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );
}
