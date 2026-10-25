import { Suspense } from "react";
import { NavAtas, NavAtasTampilan, NavBawah, NavBawahTampilan } from "@/components/navigasi";
import { Footer } from "@/components/footer";
import { connection } from "next/server";
import { penggunaSaatIni } from "@/lib/server/sesi";
import { ambilNotifikasi } from "@/lib/server/notifikasi";

// Kerangka halaman publik: navbar, isi, footer, dan menu bawah (HP)
export default function TataLetakPublik({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0">
      {/* Navbar butuh data sesi, jadi dimuat terpisah tanpa menahan isi halaman */}
      <Suspense fallback={<NavAtasTampilan pathname={null} pengguna={undefined} notifikasi={null} />}>
        <NavAtasDenganSesi />
      </Suspense>
      <main className="flex-1">{children}</main>
      <Footer />
      <Suspense fallback={<NavBawahTampilan pathname={null} />}>
        <NavBawahDenganSesi />
      </Suspense>
    </div>
  );
}

async function NavAtasDenganSesi() {
  await connection();
  const pengguna = await penggunaSaatIni();
  const notifikasi = pengguna ? await ambilNotifikasi(pengguna.id) : null;
  return (
    <NavAtas
      pengguna={pengguna ? { nama: pengguna.nama, email: pengguna.email, peran: pengguna.peran } : null}
      notifikasi={notifikasi}
    />
  );
}

async function NavBawahDenganSesi() {
  await connection();
  const pengguna = await penggunaSaatIni();
  return <NavBawah peran={pengguna?.peran ?? null} />;
}
