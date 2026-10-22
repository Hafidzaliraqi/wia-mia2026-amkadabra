"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound } from "lucide-react";
import { KolomIsian } from "@/components/kolom-isian";
import { Tombol } from "@/components/dialog";
import { useToast } from "@/components/toast";
import { masuk } from "@/lib/aksi/akun";
import { tujuanAman } from "@/lib/tujuan";

// Akun contoh untuk juri (dibuat otomatis bersama data contoh)
const akunDemo = [
  { label: "Warga", email: "warga@demo.id" },
  { label: "Petugas DPU Jakarta Selatan", email: "petugas.dpu@demo.id" },
  { label: "Admin verifikator", email: "admin@demo.id" },
];
const SANDI_DEMO = "demo1234";

export function FormMasuk() {
  const router = useRouter();
  const toast = useToast();
  const lanjut = useSearchParams().get("lanjut");
  const [akun, setAkun] = useState("");
  const [sandi, setSandi] = useState("");
  const [galat, setGalat] = useState<string | null>(null);
  const [memproses, mulai] = useTransition();

  function kirim(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!akun.trim() || !sandi) return setGalat("Isi email/nomor HP dan kata sandi.");
    setGalat(null);
    mulai(async () => {
      const hasil = await masuk(akun, sandi, lanjut);
      if (!hasil.ok) return setGalat(hasil.pesan);
      toast("sukses", `Selamat datang, ${hasil.nama.split(" ")[0]}!`);
      router.push(hasil.tujuan);
      router.refresh();
    });
  }

  return (
    <>
      <form onSubmit={kirim} className="space-y-5" noValidate>
        {galat && (
          <p role="alert" className="rounded-xl bg-bahaya-muda px-4 py-3 text-sm text-bahaya motion-safe:animate-muncul">
            {galat}
          </p>
        )}
        <KolomIsian label="Email atau nomor HP" name="akun" autoComplete="username" value={akun} onChange={(e) => setAkun(e.target.value)} />
        <div>
          <KolomIsian label="Kata sandi" name="sandi" sandi autoComplete="current-password" value={sandi} onChange={(e) => setSandi(e.target.value)} />
          <Link href="/lupa-sandi" className="mt-2 inline-block text-sm font-semibold text-rambu hover:text-rambu-tua">
            Lupa kata sandi?
          </Link>
        </div>
        <Tombol type="submit" memproses={memproses} className="w-full py-3 text-base">
          {memproses ? "Memeriksa…" : "Masuk"}
        </Tombol>
      </form>

      <p className="mt-6 text-center text-sm text-tinta-redup">
        Belum punya akun?{" "}
        <Link href={lanjut ? `/daftar?lanjut=${encodeURIComponent(tujuanAman(lanjut))}` : "/daftar"} className="font-semibold text-rambu hover:text-rambu-tua">
          Daftar
        </Link>
      </p>

      <div className="mt-6 rounded-xl border border-dashed border-garis p-4 text-sm">
        <p className="flex items-center gap-2 font-semibold">
          <KeyRound className="size-4 text-rambu" aria-hidden="true" />
          Akun demo untuk juri
        </p>
        <p className="mt-1 text-tinta-redup">
          Semua kata sandi: <span className="font-semibold text-tinta">{SANDI_DEMO}</span>
        </p>
        <ul className="mt-2 space-y-1.5">
          {akunDemo.map((a) => (
            <li key={a.email} className="flex flex-wrap items-center justify-between gap-2">
              <span>
                <span className="font-semibold">{a.label}</span>
                <span className="block text-xs text-tinta-redup">{a.email}</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setAkun(a.email);
                  setSandi(SANDI_DEMO);
                  setGalat(null);
                }}
                className="rounded-lg px-2.5 py-1 font-semibold text-rambu ring-1 ring-rambu/30 ring-inset hover:bg-rambu-muda"
              >
                Pakai
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
