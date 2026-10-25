import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { penggunaSaatIni } from "@/lib/server/sesi";
import { cariInstansi } from "@/lib/data/referensi";
import { ambilNotifikasi } from "@/lib/server/notifikasi";
import { BingkaiDasbor } from "@/components/dasbor/bingkai";

// Hanya peran yang sesuai yang boleh masuk dasbor
export async function PenjagaDasbor({ peran, children }: { peran: "petugas" | "admin"; children: React.ReactNode }) {
  await connection();
  const pengguna = await penggunaSaatIni();
  if (!pengguna) redirect(`/masuk?lanjut=${encodeURIComponent(`/${peran}`)}`);
  if (pengguna.peran !== peran) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-2xl font-extrabold">Kamu tidak punya akses ke halaman ini</h1>
        <p className="mt-2 text-tinta-redup">Halaman ini khusus untuk {peran === "admin" ? "admin" : "petugas instansi"}.</p>
        <Link href="/" className="mt-6 inline-block rounded-xl bg-rambu px-5 py-3 font-semibold text-white hover:bg-rambu-tua">
          Ke beranda
        </Link>
      </div>
    );
  }
  const notifikasi = await ambilNotifikasi(pengguna.id);
  return (
    <BingkaiDasbor
      peran={peran}
      notifikasi={notifikasi}
      nama={pengguna.nama}
      keterangan={pengguna.instansiId ? cariInstansi(pengguna.instansiId).nama : "Semua wilayah layanan"}
    >
      {children}
    </BingkaiDasbor>
  );
}

export function KerangkaDasbor() {
  return (
    <div className="min-h-dvh animate-pulse lg:grid lg:grid-cols-[260px_1fr] motion-reduce:animate-none">
      <div className="hidden border-r border-garis bg-white lg:block" />
      <div className="space-y-4 p-6 lg:p-10">
        <div className="h-8 w-64 rounded-lg bg-garis" />
        <div className="h-28 rounded-2xl bg-white" />
        <div className="h-96 rounded-2xl bg-white" />
      </div>
    </div>
  );
}
