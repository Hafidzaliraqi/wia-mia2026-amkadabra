import type { Metadata } from "next";
import { Suspense } from "react";
import { BingkaiAuth, KerangkaForm } from "@/components/bingkai-auth";
import { FormMasuk } from "@/components/form-masuk";
import { GerbangTamu } from "@/components/gerbang-tamu";

export const metadata: Metadata = { title: "Masuk" };

export default function HalamanMasuk() {
  return (
    <BingkaiAuth judul="Masuk" deskripsi="Untuk warga, petugas instansi, dan admin. Kamu diarahkan ke halaman yang sesuai setelah masuk.">
      <Suspense fallback={<KerangkaForm />}>
        <GerbangTamu>
          <FormMasuk />
        </GerbangTamu>
      </Suspense>
    </BingkaiAuth>
  );
}
