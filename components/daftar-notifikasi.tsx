"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { NotifikasiRingkas } from "@/lib/types";
import { Tombol } from "@/components/dialog";
import { tandaiNotifikasiDibaca } from "@/lib/aksi/notifikasi";

export function DaftarNotifikasi({ daftar }: { daftar: NotifikasiRingkas[] }) {
  const router = useRouter();
  const [memproses, mulai] = useTransition();
  const adaBelumDibaca = daftar.some((n) => !n.dibaca);

  return (
    <div className="space-y-4">
      {adaBelumDibaca && (
        <Tombol varian="garis" memproses={memproses} onClick={() => mulai(async () => void (await tandaiNotifikasiDibaca()))}>
          Tandai semua dibaca
        </Tombol>
      )}
      {daftar.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-garis bg-white px-6 py-12 text-center text-tinta-redup">
          Belum ada notifikasi. Kabar perkembangan laporan yang kamu buat dan dukung akan muncul di sini.
        </p>
      ) : (
        <ul className="divide-y divide-garis overflow-hidden rounded-2xl border border-garis bg-white">
          {daftar.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => {
                  mulai(async () => {
                    if (!n.dibaca) await tandaiNotifikasiDibaca(n.id);
                  });
                  router.push(n.tautan);
                }}
                className={`flex w-full gap-3 px-5 py-4 text-left transition-colors hover:bg-kertas ${n.dibaca ? "" : "bg-rambu-muda/40"}`}
              >
                <span className={`mt-1.5 size-2 shrink-0 rounded-full ${n.dibaca ? "bg-transparent" : "bg-rambu"}`} aria-hidden="true" />
                <span>
                  <span className="block font-semibold">{n.judul}</span>
                  <span className="mt-0.5 block text-sm text-tinta-redup">{n.isi}</span>
                  <span className="mt-1 block text-xs text-tinta-redup">{n.waktuTeks}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
