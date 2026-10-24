"use client";

import { Share2 } from "lucide-react";
import { useToast } from "@/components/toast";

// Bagikan laporan supaya warga lain ikut mendukung
export function TombolBagikan({ nomor, judul }: { nomor: string; judul: string }) {
  const toast = useToast();
  async function bagikan() {
    const url = `${window.location.origin}/laporan/${nomor}`;
    const teks = `Dukung laporan ini supaya cepat ditangani: ${judul}`;
    try {
      if (navigator.share) await navigator.share({ title: judul, text: teks, url });
      else {
        await navigator.clipboard.writeText(`${teks} ${url}`);
        toast("sukses", "Tautan laporan disalin. Tempel di WhatsApp atau media sosial.");
      }
    } catch {
      // dibatalkan pengguna
    }
  }
  return (
    <button
      type="button"
      onClick={bagikan}
      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-garis bg-white px-5 py-3.5 text-sm font-semibold transition-colors hover:border-rambu hover:text-rambu"
    >
      <Share2 className="size-4" aria-hidden="true" />
      Bagikan laporan
    </button>
  );
}
