import type { Metadata } from "next";
import { Suspense } from "react";
import { BingkaiAuth, KerangkaForm } from "@/components/bingkai-auth";
import { FormDaftar } from "@/components/form-daftar";
import { GerbangTamu } from "@/components/gerbang-tamu";

export const metadata: Metadata = { title: "Daftar" };

export default function HalamanDaftar() {
  return (
    <BingkaiAuth
      judul="Buat akun"
      deskripsi="Email diverifikasi dengan kode sekali pakai supaya setiap laporan bisa dipertanggungjawabkan."
    >
      <Suspense fallback={<KerangkaForm />}>
        <GerbangTamu>
          <FormDaftar />
        </GerbangTamu>
      </Suspense>
    </BingkaiAuth>
  );
}
