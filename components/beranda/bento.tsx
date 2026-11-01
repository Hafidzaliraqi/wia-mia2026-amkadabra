import { BadgeCheck, Building2, MessagesSquare, Radar, Timer, TrendingUp } from "lucide-react";
import { JamTenggat } from "@/components/beranda/jam-tenggat";
import { Muncul } from "@/components/muncul";
import { daftarInstansi, daftarKategori } from "@/lib/data/referensi";
import { daftarKota } from "@/lib/wilayah";

const rute = [
  ["Jalan rusak · Tebet", "Bina Marga"],
  ["Sampah · Palmerah", "Lingkungan Hidup"],
  ["Lampu mati · Depok", "Perhubungan"],
  ["Banjir · Bogor Tengah", "Sumber Daya Air"],
  ["Pungli · Garut Kota", "Inspektorat"],
];

function Kartu({ className = "", gelap = false, children }: { className?: string; gelap?: boolean; children: React.ReactNode }) {
  return (
    <div
      className={`group relative h-full overflow-hidden rounded-3xl border p-6 transition duration-300 hover:-translate-y-1 hover:shadow-2xl ${
        gelap ? "border-white/10 bg-malam text-white hover:shadow-malam/30" : "border-garis bg-white hover:shadow-tinta/10"
      } ${className}`}
    >
      {children}
    </div>
  );
}

function Judul({ ikon: Ikon, judul, isi, gelap = false }: { ikon: typeof Timer; judul: string; isi: string; gelap?: boolean }) {
  return (
    <>
      <span className={`flex size-10 items-center justify-center rounded-xl ${gelap ? "bg-white/10 text-sinyal" : "bg-rambu-muda text-rambu"}`}>
        <Ikon className="size-5" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-xl font-bold">{judul}</h3>
      <p className={`mt-1.5 text-sm leading-relaxed ${gelap ? "text-white/65" : "text-tinta-redup"}`}>{isi}</p>
    </>
  );
}

// Grid fitur pembeda, masing-masing dengan visual kecil yang hidup
export function BentoFitur() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
      <Muncul className="md:col-span-4 md:row-span-2">
        <Kartu>
          <Judul ikon={Building2} judul="Diteruskan otomatis ke instansi yang tepat" isi="Warga cukup memilih jenis masalah dan titik lokasi. Sistem yang mencarikan dinas berwenang di daerahnya, tanpa salah alamat." />
          <ul className="mt-8 space-y-3" aria-hidden="true">
            {rute.map(([asal, tujuan], i) => (
              <li key={asal} className="flex items-center gap-2 text-sm font-semibold sm:gap-3">
                <span className="min-w-0 truncate rounded-xl bg-kertas px-3 py-2">{asal}</span>
                <svg className="h-2 min-w-6 flex-1" preserveAspectRatio="none" viewBox="0 0 100 4">
                  <line x1="0" y1="2" x2="100" y2="2" stroke="var(--color-rambu)" strokeWidth="2" strokeDasharray="6 4" className="motion-safe:animate-alir" style={{ animationDelay: `${i * -0.3}s` }} vectorEffect="non-scaling-stroke" />
                </svg>
                <span className="flex max-w-[48%] shrink-0 items-center gap-1.5 rounded-xl bg-rambu px-3 py-2 text-white">
                  <Building2 className="size-4 shrink-0" />
                  <span className="truncate">{tujuan}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-8 grid grid-cols-3 gap-3 border-t border-garis pt-6 text-center">
            {[
              [daftarKategori.length, "jenis masalah"],
              [daftarInstansi.length, "instansi terpetakan"],
              [daftarKota.length, "kota dan kabupaten"],
            ].map(([angka, label]) => (
              <div key={String(label)}>
                <p className="font-display text-3xl font-extrabold text-rambu">{angka}</p>
                <p className="mt-1 text-xs text-tinta-redup">{label}</p>
              </div>
            ))}
          </div>
        </Kartu>
      </Muncul>
      <Muncul className="md:col-span-2" tunda={80}>
        <Kartu gelap>
          <Judul gelap ikon={Timer} judul="Tenggat terbuka untuk publik" isi="Setiap tahap punya batas waktu yang bisa dilihat siapa saja." />
          <div className="mt-5">
            <JamTenggat />
            <div className="mt-2 h-1.5 rounded-full bg-white/10">
              <div className="h-full w-[62%] rounded-full bg-sinyal" />
            </div>
          </div>
        </Kartu>
      </Muncul>
      <Muncul className="md:col-span-2" tunda={160}>
        <Kartu>
          <Judul ikon={BadgeCheck} judul="Kamu yang menutup laporan" isi="Petugas wajib memberi foto bukti. Laporan selesai setelah warga mengonfirmasi." />
          <div className="mt-5 flex justify-center">
            <span className="-rotate-6 rounded-xl border-4 border-tuntas px-4 py-1 text-tuntas transition duration-500 group-hover:scale-110 group-hover:-rotate-3">
              <span className="block text-lg font-extrabold tracking-[0.2em]">SELESAI</span>
              <span className="block text-center text-[10px] font-bold">DIKONFIRMASI WARGA</span>
            </span>
          </div>
        </Kartu>
      </Muncul>
      <Muncul className="md:col-span-2">
        <Kartu>
          <Judul ikon={Radar} judul="Laporan serupa dicek otomatis" isi="Dalam radius 500 meter. Warga cukup mendukung, tidak perlu melapor ulang." />
          <div className="relative mx-auto mt-5 size-28" aria-hidden="true">
            {[0, 0.8, 1.6].map((tunda) => (
              <span key={tunda} className="absolute inset-0 rounded-full border-2 border-rambu/40 motion-safe:animate-radar" style={{ animationDelay: `${tunda}s` }} />
            ))}
            <span className="absolute inset-[42%] rounded-full bg-rambu" />
            <span className="absolute top-5 left-6 size-2.5 rounded-full bg-sinyal ring-2 ring-white" />
            <span className="absolute right-5 bottom-7 size-2.5 rounded-full bg-sinyal ring-2 ring-white" />
          </div>
        </Kartu>
      </Muncul>
      <Muncul className="md:col-span-2" tunda={80}>
        <Kartu>
          <Judul ikon={MessagesSquare} judul="Ngobrol langsung dengan petugas" isi="Kabar perkembangan dan pertanyaan dalam satu percakapan di halaman laporan." />
          <div className="mt-5 space-y-2 text-sm" aria-hidden="true">
            <p className="w-fit max-w-[90%] rounded-2xl rounded-bl-md bg-rambu-muda px-3.5 py-2">Tim survei datang besok pagi.</p>
            <p className="ml-auto w-fit max-w-[90%] rounded-2xl rounded-br-md bg-rambu px-3.5 py-2 text-white">Siap, terima kasih!</p>
          </div>
        </Kartu>
      </Muncul>
      <Muncul className="md:col-span-2" tunda={160}>
        <Kartu>
          <Judul ikon={TrendingUp} judul="Rapor instansi terbuka" isi="Kecepatan dan ketepatan waktu tiap dinas dihitung otomatis dan dipublikasikan." />
          <div className="mt-5 flex h-20 items-end gap-2" aria-hidden="true">
            {[45, 70, 38, 88, 60, 95].map((t, i) => (
              <span key={i} className={`flex-1 rounded-t-lg transition-all duration-500 group-hover:opacity-100 ${i === 5 ? "bg-tuntas" : "bg-rambu/25 group-hover:bg-rambu/40"}`} style={{ height: `${t}%` }} />
            ))}
          </div>
        </Kartu>
      </Muncul>
    </div>
  );
}
