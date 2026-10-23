import type { Metadata } from "next";
import { BingkaiAuth } from "@/components/bingkai-auth";
import { FormLupaSandi } from "@/components/form-lupa-sandi";

export const metadata: Metadata = { title: "Lupa kata sandi" };

export default function HalamanLupaSandi() {
  return (
    <BingkaiAuth judul="Lupa kata sandi" deskripsi="Kami kirim kode ke email akunmu. Setelah itu kamu bisa membuat kata sandi baru.">
      <FormLupaSandi />
    </BingkaiAuth>
  );
}
