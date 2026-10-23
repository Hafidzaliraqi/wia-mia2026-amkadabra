"use client";

import { useState, useTransition } from "react";
import { UserPlus } from "lucide-react";
import { KolomIsian } from "@/components/kolom-isian";
import { Tombol } from "@/components/dialog";
import { useToast } from "@/components/toast";
import { buatAkunPetugas } from "@/lib/aksi/admin";
import { daftarInstansi } from "@/lib/data/referensi";
import { daftarKota } from "@/lib/wilayah";

export function FormAkunPetugas() {
  const toast = useToast();
  const kosong = { nama: "", email: "", hp: "", instansiId: "", sandi: "" };
  const [data, setData] = useState(kosong);
  const [galat, setGalat] = useState<Record<string, string>>({});
  const [memproses, mulai] = useTransition();
  const ubah = (kunci: keyof typeof kosong) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setData((d) => ({ ...d, [kunci]: e.target.value }));

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        mulai(async () => {
          const hasil = await buatAkunPetugas(data);
          if (!hasil.ok) {
            setGalat(hasil.galat ?? {});
            return toast("galat", hasil.pesan);
          }
          setGalat({});
          setData(kosong);
          toast("sukses", "Akun petugas dibuat. Berikan email dan kata sandi awalnya ke petugas.");
        });
      }}
    >
      <KolomIsian label="Nama petugas" value={data.nama} onChange={ubah("nama")} galat={galat.nama} />
      <KolomIsian label="Email dinas" type="email" value={data.email} onChange={ubah("email")} galat={galat.email} />
      <KolomIsian label="Nomor HP" type="tel" value={data.hp} onChange={ubah("hp")} galat={galat.hp} />
      <div>
        <label htmlFor="instansi-petugas" className="mb-1.5 block text-sm font-semibold">
          Instansi
        </label>
        <select
          id="instansi-petugas"
          value={data.instansiId}
          onChange={ubah("instansiId")}
          aria-invalid={galat.instansiId ? true : undefined}
          className="w-full rounded-xl border border-garis bg-white px-3 py-3 text-base focus:border-rambu focus:outline-none"
        >
          <option value="">Pilih instansi</option>
          {daftarKota.map((k) => (
            <optgroup key={k.id} label={k.nama}>
              {daftarInstansi.filter((i) => i.kotaId === k.id).map((i) => (
                <option key={i.id} value={i.id}>{i.nama}</option>
              ))}
            </optgroup>
          ))}
        </select>
        {galat.instansiId && <p className="mt-1.5 text-sm text-bahaya">{galat.instansiId}</p>}
      </div>
      <KolomIsian label="Kata sandi awal" sandi autoComplete="new-password" value={data.sandi} onChange={ubah("sandi")} galat={galat.sandi} petunjuk="Minimal 8 karakter, huruf dan angka." />
      <Tombol type="submit" memproses={memproses} className="w-full py-3">
        <UserPlus className="size-4" aria-hidden="true" />
        Buat akun petugas
      </Tombol>
    </form>
  );
}
