"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KolomIsian } from "@/components/kolom-isian";
import { KolomKode } from "@/components/kolom-kode";
import { Tombol } from "@/components/dialog";
import { useToast } from "@/components/toast";
import { mulaiDaftar, verifikasiDaftar } from "@/lib/aksi/akun";
import { emailValid, hpValid, periksaSandi } from "@/lib/validasi";
import { tujuanAman } from "@/lib/tujuan";
import { rayakan } from "@/lib/rayakan";

type Galat = Partial<Record<"nama" | "email" | "hp" | "sandi" | "setuju" | "kode" | "umum", string>>;

export function FormDaftar() {
  const router = useRouter();
  const toast = useToast();
  const lanjut = useSearchParams().get("lanjut");
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState("");
  const [sandi, setSandi] = useState("");
  const [setuju, setSetuju] = useState(false);
  const [galat, setGalat] = useState<Galat>({});
  const [otp, setOtp] = useState<{ id: string; email: string; modeTerminal: boolean } | null>(null);
  const [kode, setKode] = useState("");
  const [memproses, mulai] = useTransition();

  function kirimData(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Cek cepat di browser; server tetap memeriksa ulang
    const g: Galat = {};
    if (nama.trim().length < 3) g.nama = "Tulis nama lengkap, minimal 3 huruf.";
    if (!emailValid(email)) g.email = "Format email belum benar, contoh: nama@gmail.com.";
    if (!hpValid(hp)) g.hp = "Nomor HP diawali 08, 10 sampai 13 digit.";
    const galatSandi = periksaSandi(sandi);
    if (galatSandi) g.sandi = galatSandi;
    if (!setuju) g.setuju = "Centang persetujuan ini untuk melanjutkan.";
    setGalat(g);
    if (Object.keys(g).length) return;

    mulai(async () => {
      const hasil = await mulaiDaftar({ nama, email, hp, sandi });
      if (!hasil.ok) return setGalat({ ...hasil.galat, umum: hasil.galat ? undefined : hasil.pesan });
      setOtp({ id: hasil.idOtp, email: hasil.email, modeTerminal: hasil.modeTerminal });
      setKode("");
      toast("info", "Kode verifikasi sudah dikirim ke emailmu.");
    });
  }

  function verifikasi(kodeMasuk: string) {
    if (!otp || memproses) return;
    mulai(async () => {
      const hasil = await verifikasiDaftar(otp.id, kodeMasuk, lanjut);
      if (!hasil.ok) {
        setKode("");
        return setGalat({ kode: hasil.pesan });
      }
      rayakan();
      toast("sukses", `Akun berhasil dibuat. Selamat datang, ${hasil.nama.split(" ")[0]}!`);
      router.push(lanjut ? hasil.tujuan : "/lapor");
      router.refresh();
    });
  }

  if (otp) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          verifikasi(kode);
        }}
        className="space-y-5 motion-safe:animate-muncul"
        noValidate
      >
        <KolomKode
          idOtp={otp.id}
          email={otp.email}
          modeTerminal={otp.modeTerminal}
          kode={kode}
          onUbah={(k) => {
            setKode(k);
            if (galat.kode) setGalat({});
          }}
          onLengkap={verifikasi}
          galat={galat.kode}
        />
        <Tombol type="submit" memproses={memproses} disabled={kode.length !== 6} className="w-full py-3 text-base">
          Verifikasi dan buat akun
        </Tombol>
        <button
          type="button"
          onClick={() => {
            setOtp(null);
            setGalat({});
          }}
          className="text-sm font-semibold text-tinta-redup hover:text-tinta"
        >
          Ubah data pendaftaran
        </button>
      </form>
    );
  }

  return (
    <>
      <form onSubmit={kirimData} className="space-y-5" noValidate>
        {galat.umum && (
          <p role="alert" className="rounded-xl bg-bahaya-muda px-4 py-3 text-sm text-bahaya">
            {galat.umum}
          </p>
        )}
        <KolomIsian label="Nama lengkap" name="nama" autoComplete="name" value={nama} onChange={(e) => setNama(e.target.value)} galat={galat.nama} petunjuk="Nama bisa disembunyikan dari publik saat membuat laporan." />
        <KolomIsian label="Email" name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} galat={galat.email} petunjuk="Kode verifikasi dikirim ke email ini." />
        <KolomIsian label="Nomor HP" name="hp" type="tel" inputMode="tel" autoComplete="tel" placeholder="08xxxxxxxxxx" value={hp} onChange={(e) => setHp(e.target.value)} galat={galat.hp} />
        <KolomIsian label="Kata sandi" name="sandi" sandi autoComplete="new-password" value={sandi} onChange={(e) => setSandi(e.target.value)} galat={galat.sandi} petunjuk="Minimal 8 karakter, berisi huruf dan angka." />
        <div>
          <label className="flex items-start gap-3 text-sm leading-relaxed">
            <input
              type="checkbox"
              checked={setuju}
              onChange={(e) => setSetuju(e.target.checked)}
              aria-invalid={galat.setuju ? true : undefined}
              aria-describedby={galat.setuju ? "galat-setuju" : undefined}
              className="mt-1 size-4 shrink-0 accent-rambu"
            />
            <span>Saya setuju data saya dipakai untuk memproses laporan dan dihubungi petugas bila perlu.</span>
          </label>
          {galat.setuju && (
            <p id="galat-setuju" className="mt-1.5 text-sm text-bahaya">
              {galat.setuju}
            </p>
          )}
        </div>
        <Tombol type="submit" memproses={memproses} className="w-full py-3 text-base">
          Kirim kode verifikasi
        </Tombol>
      </form>
      <p className="mt-6 text-center text-sm text-tinta-redup">
        Sudah punya akun?{" "}
        <Link href={lanjut ? `/masuk?lanjut=${encodeURIComponent(tujuanAman(lanjut))}` : "/masuk"} className="font-semibold text-rambu hover:text-rambu-tua">
          Masuk
        </Link>
      </p>
    </>
  );
}
