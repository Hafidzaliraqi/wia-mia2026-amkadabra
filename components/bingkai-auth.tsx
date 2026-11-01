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
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_460px] lg:items-stretch lg:gap-10 lg:py-14">
      <div className="relative isolate hidden overflow-hidden rounded-[2rem] bg-malam p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden="true" className="latar-kisi absolute inset-0 -z-10" />
        <div aria-hidden="true" className="absolute -top-32 -right-24 -z-10 size-96 rounded-full bg-rambu/50 blur-[100px]" />
        <div aria-hidden="true" className="absolute -bottom-32 -left-20 -z-10 size-72 rounded-full bg-sinyal/15 blur-[100px]" />
        <div>
          <p className="max-w-md font-display text-4xl leading-[1.1] font-extrabold tracking-tight text-balance">
            Satu akun untuk melapor, memantau, dan memastikan masalahmu <span className="text-sinyal">tuntas.</span>
          </p>
          <ul className="mt-10 space-y-5">
            {manfaat.map(({ ikon: Ikon, teks }) => (
              <li key={teks} className="flex max-w-md gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-sinyal">
                  <Ikon className="size-5" aria-hidden="true" />
                </span>
                <span className="pt-2 leading-relaxed text-white/75">{teks}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-12 max-w-md rounded-2xl bg-white/5 p-5 text-sm leading-relaxed text-white/70 ring-1 ring-white/10">
          Nama pelapor bisa disembunyikan dari publik. Petugas hanya melihat data yang diperlukan untuk menindaklanjuti laporan.
        </p>
      </div>

      <div className="rounded-[2rem] border border-garis bg-white p-6 shadow-xl shadow-tinta/5 sm:p-9">
        <h1 className="text-3xl font-extrabold">{judul}</h1>
        <p className="mt-2 text-sm leading-relaxed text-tinta-redup">{deskripsi}</p>
        <div className="mt-7">{children}</div>
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
