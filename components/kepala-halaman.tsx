// Kepala halaman gelap yang meneruskan karakter visual beranda ke halaman lain
export function KepalaHalaman({
  label,
  judul,
  deskripsi,
  aksi,
}: {
  label?: string;
  judul: string;
  deskripsi: React.ReactNode;
  aksi?: React.ReactNode;
}) {
  return (
    <div className="relative isolate overflow-hidden bg-malam text-white">
      <div aria-hidden="true" className="latar-kisi absolute inset-0 -z-10" />
      <div aria-hidden="true" className="absolute -top-44 right-[-10%] -z-10 size-[34rem] rounded-full bg-rambu/40 blur-[110px]" />
      <div aria-hidden="true" className="absolute -bottom-56 left-[-12%] -z-10 size-[26rem] rounded-full bg-sinyal/10 blur-[110px]" />
      <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-6 px-4 pt-10 pb-12 sm:px-6 lg:pt-14 lg:pb-16">
        <div className="max-w-2xl">
          {label && <p className="text-sm font-bold tracking-wide text-sinyal uppercase">{label}</p>}
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">{judul}</h1>
          <div className="mt-3 text-lg leading-relaxed text-white/70">{deskripsi}</div>
        </div>
        {aksi && <div className="flex flex-wrap gap-2">{aksi}</div>}
      </div>
    </div>
  );
}

// Tombol untuk dipakai di atas kepala halaman gelap
export const kelasTombolTerang =
  "inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/20 ring-inset backdrop-blur transition hover:bg-white/20";
