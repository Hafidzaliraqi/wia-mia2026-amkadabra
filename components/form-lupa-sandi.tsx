"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { KolomIsian } from "@/components/kolom-isian";
import { KolomKode } from "@/components/kolom-kode";
import { Tombol } from "@/components/dialog";
import { useToast } from "@/components/toast";
import { aturSandiBaru, mintaAturSandi } from "@/lib/aksi/akun";
import { periksaSandi } from "@/lib/validasi";

export function FormLupaSandi() {
  const router = useRouter();
  const toast = useToast();
  const [akun, setAkun] = useState("");
  const [otp, setOtp] = useState<{ id: string; modeTerminal: boolean } | null>(null);
  const [kode, setKode] = useState("");
  const [sandi, setSandi] = useState("");
  const [galat, setGalat] = useState<{ akun?: string; kode?: string; sandi?: string }>({});
  const [memproses, mulai] = useTransition();

  function minta(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!akun.trim()) return setGalat({ akun: "Isi email atau nomor HP yang terdaftar." });
    mulai(async () => {
      const hasil = await mintaAturSandi(akun);
      if (!hasil.ok) return setGalat({ akun: hasil.pesan });
      setGalat({});
      setOtp({ id: hasil.idOtp, modeTerminal: hasil.modeTerminal });
    });
  }

  function simpan(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const galatSandi = periksaSandi(sandi);
    if (galatSandi) return setGalat({ sandi: galatSandi });
    mulai(async () => {
      const hasil = await aturSandiBaru(otp!.id, kode, sandi);
      if (!hasil.ok) return setGalat({ kode: hasil.galat?.kode ?? (hasil.galat?.sandi ? undefined : hasil.pesan), sandi: hasil.galat?.sandi });
      toast("sukses", "Kata sandi baru tersimpan. Kamu sudah masuk.");
      router.push(hasil.tujuan);
      router.refresh();
    });
  }

  if (otp) {
    return (
      <form onSubmit={simpan} className="space-y-5 motion-safe:animate-muncul" noValidate>
        <KolomKode idOtp={otp.id} email={akun.includes("@") ? akun.trim() : "email yang terdaftar"} modeTerminal={otp.modeTerminal} kode={kode} onUbah={setKode} galat={galat.kode} />
        <KolomIsian label="Kata sandi baru" name="sandi" sandi autoComplete="new-password" value={sandi} onChange={(e) => setSandi(e.target.value)} galat={galat.sandi} petunjuk="Minimal 8 karakter, berisi huruf dan angka." />
        <Tombol type="submit" memproses={memproses} disabled={kode.length !== 6} className="w-full py-3 text-base">
          Simpan kata sandi baru
        </Tombol>
      </form>
    );
  }

  return (
    <form onSubmit={minta} className="space-y-5" noValidate>
      <KolomIsian label="Email atau nomor HP" name="akun" autoComplete="username" value={akun} onChange={(e) => setAkun(e.target.value)} galat={galat.akun} />
      <Tombol type="submit" memproses={memproses} className="w-full py-3 text-base">
        Kirim kode
      </Tombol>
      <Link href="/masuk" className="block text-center text-sm font-semibold text-tinta-redup hover:text-tinta">
        Kembali ke halaman masuk
      </Link>
    </form>
  );
}
