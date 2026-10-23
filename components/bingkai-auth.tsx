import { BellRing, ShieldCheck, ThumbsUp } from "lucide-react";

const manfaat = [
  { ikon: BellRing, teks: "Dapat kabar setiap kali laporanmu berpindah tahap." },
  { ikon: ThumbsUp, teks: "Dukung laporan warga lain yang juga kamu alami." },
  { ikon: ShieldCheck, teks: "Kamu yang menentukan laporan benar-benar selesai." },
];

// Tata letak bersama halaman masuk, daftar, dan lupa kata sandi
export function BingkaiAuth({
  judul,
  deskripsi,
  children,
}: {
  judul: string;
  deskripsi: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_440px] lg:items-start lg:gap-16 lg:py-16">
      <div className="hidden lg:block lg:pt-6">
        <p className="max-w-md text-3xl leading-tight font-extrabold tracking-tight text-balance">
          Satu akun untuk melapor, memantau, dan memastikan masalahmu benar-benar tuntas.
        </p>
        <ul className="mt-8 space-y-5">
          {manfaat.map(({ ikon: Ikon, teks }) => (
            <li key={teks} className="flex max-w-md gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-rambu-muda text-rambu-tua">
                <Ikon className="size-4" aria-hidden="true" />
              </span>
              <span className="pt-1.5 leading-relaxed text-tinta-redup">{teks}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-garis bg-white p-6 sm:p-8">
        <h1 className="text-2xl font-extrabold tracking-tight">{judul}</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-tinta-redup">{deskripsi}</p>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

// Kerangka abu-abu selama formulir dimuat
export function KerangkaForm() {
  return (
    <div className="animate-pulse space-y-4 motion-reduce:animate-none" aria-label="Memuat formulir">
      <div className="h-12 rounded-xl bg-kertas" />
      <div className="h-12 rounded-xl bg-kertas" />
      <div className="h-12 rounded-xl bg-garis" />
    </div>
  );
}
