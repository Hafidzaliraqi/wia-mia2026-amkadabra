import Link from "next/link";
import { connection } from "next/server";
import { penggunaSaatIni } from "@/lib/server/sesi";

// Di halaman masuk/daftar: kalau sudah masuk, tampilkan info, bukan formulir
export async function GerbangTamu({ children }: { children: React.ReactNode }) {
  await connection();
  const pengguna = await penggunaSaatIni();
  if (!pengguna) return children;
  const tujuan = pengguna.peran === "warga" ? "/" : `/${pengguna.peran}`;
  return (
    <div className="space-y-4">
      <p className="rounded-xl bg-kertas px-4 py-3 text-sm leading-relaxed">
        Kamu sudah masuk sebagai <span className="font-semibold">{pengguna.nama}</span>.
      </p>
      <Link href={tujuan} className="inline-block rounded-xl bg-rambu px-5 py-3 text-sm font-semibold text-white hover:bg-rambu-tua">
        {pengguna.peran === "warga" ? "Ke beranda" : "Ke dasbor"}
      </Link>
    </div>
  );
}
