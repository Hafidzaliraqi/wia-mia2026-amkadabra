import Link from "next/link";
import { Logo } from "@/components/logo";
import { situs } from "@/lib/site";

const kolom = [
  { judul: "Jelajahi", tautan: [["/laporan", "Jelajah laporan"], ["/transparansi", "Rapor instansi"], ["/tentang", "Tentang & FAQ"]] },
  { judul: "Ikut serta", tautan: [["/lapor", "Buat laporan"], ["/daftar", "Daftar akun"], ["/masuk", "Masuk"]] },
];

export function Footer() {
  return (
    <footer className="bg-malam text-white/65">
      <div className="mx-auto max-w-6xl px-4 pt-14 pb-10 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1fr]">
          <div className="max-w-sm">
            <Logo terang />
            <p className="mt-4 leading-relaxed">{situs.deskripsi}</p>
          </div>
          {kolom.map((k) => (
            <nav key={k.judul} aria-label={k.judul}>
              <p className="font-display font-bold text-white">{k.judul}</p>
              <ul className="mt-4 space-y-2.5">
                {k.tautan.map(([href, label]) => (
                  <li key={href}>
                    <Link href={href} className="transition-colors hover:text-sinyal">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap justify-between gap-3 border-t border-white/10 pt-6 text-xs">
          <p>© 2026 {situs.nama}. Dibuat untuk Web In Action, MIA 2026.</p>
          <p>Data laporan dan kinerja instansi di website ini adalah data simulasi.</p>
        </div>
      </div>
    </footer>
  );
}
