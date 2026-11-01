import type { Metadata } from "next";
import Link from "next/link";
import {
  BellRing,
  Building2,
  Check,
  ChevronDown,
  ClipboardCheck,
  Clock,
  Copy,
  MapPinned,
  Route,
  ShieldCheck,
  ThumbsUp,
  UserRound,
  X,
} from "lucide-react";
import { daftarKota } from "@/lib/wilayah";
import { situs } from "@/lib/site";

export const metadata: Metadata = {
  title: "Tentang & FAQ",
  description: "Cara kerja Tuntasin, perbedaannya dengan kanal pengaduan lain, dan jawaban atas pertanyaan yang sering diajukan.",
};

const masalah = [
  { ikon: Route, judul: "Bingung lapor ke mana", isi: "Warga harus tahu dulu dinas mana yang berwenang. Salah alamat, laporan berpindah-pindah atau berhenti." },
  { ikon: Clock, judul: "Menunggu tanpa kepastian", isi: "Tidak ada batas waktu yang bisa dilihat. Pelapor tidak tahu laporannya sedang dikerjakan atau dilupakan." },
  { ikon: ClipboardCheck, judul: "Ditutup sepihak", isi: "Laporan ditandai selesai oleh instansi, padahal di lapangan masalahnya belum beres." },
];

const langkah = [
  { judul: "Lapor", isi: "Tandai lokasi di peta, pilih jenis masalah, ceritakan, dan lampirkan foto." },
  { judul: "Diverifikasi", isi: "Admin memeriksa laporan palsu, spam, dan duplikat. Maksimal 3 hari kerja." },
  { judul: "Diteruskan otomatis", isi: "Sistem memilih instansi berwenang berdasarkan jenis masalah dan daerah." },
  { judul: "Dikerjakan dengan tenggat", isi: "Instansi merespons maksimal 5 hari kerja, lalu menyelesaikan sesuai standar waktu kategorinya." },
  { judul: "Kamu yang menutup", isi: "Petugas wajib melampirkan foto sesudah. Laporan baru selesai setelah pelapor atau pendukung mengonfirmasi." },
];

const perbandingan = [
  { aspek: "Menentukan instansi tujuan", umum: "Pelapor memilih sendiri atau menunggu disposisi", tuntasin: "Otomatis dari jenis masalah dan lokasi" },
  { aspek: "Batas waktu penanganan", umum: "Jarang terlihat oleh pelapor", tuntasin: "Tampil publik di setiap tahap, dengan hitung mundur" },
  { aspek: "Kalau lewat batas waktu", umum: "Tidak ada tanda yang terlihat", tuntasin: "Ditandai, dieskalasi otomatis, dan masuk rapor instansi" },
  { aspek: "Menutup laporan", umum: "Instansi menutup sendiri", tuntasin: "Wajib foto bukti, lalu dikonfirmasi warga" },
  { aspek: "Laporan yang sama berulang", umum: "Menumpuk sebagai laporan terpisah", tuntasin: "Dicek dalam radius 500 meter, warga cukup mendukung" },
  { aspek: "Komunikasi dengan petugas", umum: "Satu arah", tuntasin: "Percakapan dua arah di halaman laporan" },
];

const peran = [
  { ikon: UserRound, judul: "Warga", isi: "Membuat laporan, mendukung laporan orang lain, berdiskusi dengan petugas, dan mengonfirmasi penyelesaian." },
  { ikon: ShieldCheck, judul: "Admin verifikator", isi: "Menyaring laporan palsu, meneruskan ke instansi, memantau tenggat, dan menegur instansi yang terlambat." },
  { ikon: Building2, judul: "Petugas instansi", isi: "Menerima laporan wilayahnya, mengirim kabar, mengerjakan, dan melampirkan bukti penyelesaian." },
];

const inspirasi = [
  { negara: "Korea Selatan", sistem: "e-People", isi: "Satu pintu pengaduan nasional yang meneruskan laporan ke lembaga berwenang.", diambil: "Penerusan otomatis" },
  { negara: "Singapura", sistem: "OneService", isi: "Warga memilih jenis masalah, bukan nama instansi.", diambil: "Kategori berdasarkan masalah" },
  { negara: "Inggris", sistem: "FixMyStreet", isi: "Laporan dengan pin peta yang bisa dilihat publik.", diambil: "Peta dan laporan terbuka" },
  { negara: "Amerika Serikat", sistem: "SeeClickFix", isi: "Warga bisa mendukung laporan tetangganya.", diambil: "Dukungan dan cek laporan serupa" },
  { negara: "Taiwan", sistem: "Join", isi: "Usulan yang mendapat cukup dukungan wajib ditanggapi pemerintah.", diambil: "Dukungan warga sebagai tekanan publik" },
];

const faq = [
  { t: "Apakah Tuntasin gratis?", j: "Ya. Membuat, mendukung, dan memantau laporan tidak dipungut biaya apa pun." },
  {
    t: "Aku tidak tahu dinas mana yang mengurus masalahku. Bagaimana?",
    j: "Tidak perlu tahu. Cukup pilih jenis masalah dan tandai lokasinya. Sistem meneruskan ke instansi yang berwenang di daerah itu. Kalau ternyata bukan kewenangannya, petugas bisa mengalihkan ke instansi lain dan alasannya tercatat di riwayat.",
  },
  {
    t: "Siapa saja yang bisa melihat laporanku?",
    j: "Kamu yang memilih saat melapor: tampil publik dengan nama, tampil publik tanpa nama, atau privat (hanya kamu dan petugas). Nomor HP dan emailmu tidak pernah ditampilkan.",
  },
  {
    t: "Kenapa harus daftar dan verifikasi email?",
    j: "Supaya setiap laporan bisa dipertanggungjawabkan dan laporan palsu berkurang. Email juga dipakai untuk mengirim kabar perkembangan dan permintaan konfirmasi.",
  },
  {
    t: "Kenapa laporan diperiksa admin dulu?",
    j: "Untuk menyaring spam, laporan palsu, dan laporan ganda sebelum sampai ke instansi. Pemeriksaan paling lama 3 hari kerja dan tenggatnya ikut ditampilkan.",
  },
  {
    t: "Bagaimana kalau instansi tidak merespons?",
    j: "Setiap tahap punya batas waktu yang terlihat semua orang. Kalau lewat, laporan diberi tanda Lewat batas waktu, dieskalasi otomatis ke pengawas, dan admin bisa mengirim teguran resmi. Semua tercatat di riwayat dan memengaruhi rapor instansi di halaman Transparansi.",
  },
  {
    t: "Laporanku ditandai selesai, tapi masalahnya belum beres.",
    j: "Pilih Belum beres dan tulis alasannya. Laporan dibuka kembali ke instansi dengan tenggat baru.",
  },
  {
    t: "Bagaimana kalau aku tidak sempat mengonfirmasi?",
    j: "Kamu diingatkan pada hari ke-3 dan ke-7. Tanpa jawaban dalam 10 hari, laporan ditutup otomatis, tapi masih bisa dibuka kembali sampai 30 hari setelahnya.",
  },
  {
    t: "Masalah yang sama sudah dilaporkan orang lain.",
    j: "Saat melapor, Tuntasin menampilkan laporan serupa dalam radius 500 meter. Cukup dukung laporan itu. Pendukung ikut mendapat kabar dan boleh mengonfirmasi penyelesaian.",
  },
  {
    t: "Daerah mana saja yang dilayani?",
    j: `Saat ini: ${daftarKota.map((k) => k.nama).join(", ")}.`,
  },
  {
    t: "Apakah data di website ini resmi?",
    j: "Belum. Tuntasin adalah prototipe untuk Web In Action (WIA) MIA 2026. Laporan, instansi, dan kinerjanya adalah data simulasi.",
  },
];

export default function HalamanTentang() {
  const dataTerstruktur = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.t, acceptedAnswer: { "@type": "Answer", text: f.j } })),
  };

  return (
    <div className="pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dataTerstruktur) }} />

      <section className="border-b border-garis bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
          <p className="text-sm font-semibold text-rambu">Tentang {situs.nama}</p>
          <h1 className="mt-2 max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            Laporan warga yang tidak berhenti di tengah jalan
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-tinta-redup">
            {situs.nama} meneruskan laporan ke instansi yang tepat, menampilkan batas waktu setiap tahap ke publik, dan baru menutup
            laporan setelah warga memastikan masalahnya benar-benar beres.
          </p>
          <nav aria-label="Di halaman ini" className="mt-8 flex flex-wrap gap-2 text-sm">
            {[
              ["#cara-kerja", "Cara kerja"],
              ["#perbedaan", "Yang membedakan"],
              ["#peran", "Siapa terlibat"],
              ["#inspirasi", "Inspirasi"],
              ["#faq", "FAQ"],
            ].map(([href, label]) => (
              <a key={href} href={href} className="rounded-full px-3.5 py-1.5 font-semibold ring-1 ring-garis ring-inset hover:bg-kertas hover:text-rambu">
                {label}
              </a>
            ))}
          </nav>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-16 px-4 pt-12 sm:px-6">
        <section aria-labelledby="judul-masalah">
          <h2 id="judul-masalah" className="text-2xl font-extrabold sm:text-3xl">Masalah yang ingin kami selesaikan</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {masalah.map((m) => (
              <div key={m.judul} className="rounded-2xl border border-garis bg-white p-5">
                <m.ikon className="size-6 text-bahaya" aria-hidden="true" />
                <h3 className="mt-3 font-bold">{m.judul}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-tinta-redup">{m.isi}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-garis bg-white p-5">
              <p className="angka text-3xl font-extrabold">1,1 juta+</p>
              <p className="mt-1 text-sm text-tinta-redup">
                aduan sudah masuk ke SP4N-LAPOR! dari 718 instansi hingga September 2026. Kebutuhan warga untuk melapor itu nyata.
              </p>
              <p className="mt-3 text-xs text-tinta-redup">Sumber: InfoPublik, Kementerian Komunikasi dan Digital, 29 September 2026.</p>
            </div>
            <div className="rounded-2xl border border-garis bg-white p-5">
              <p className="angka text-3xl font-extrabold text-bahaya">45,48%</p>
              <p className="mt-1 text-sm text-tinta-redup">
                tindak lanjut yang tercatat selesai dalam Laporan Tahunan LAPOR! 2024. Menyampaikan laporan bukan masalahnya, menuntaskannya yang sulit.
              </p>
              <p className="mt-3 text-xs text-tinta-redup">Sumber: Indonesian Journal of Digital Business 6(1), 2026.</p>
            </div>
          </div>
        </section>

        <section id="cara-kerja" aria-labelledby="judul-cara" className="scroll-mt-24">
          <h2 id="judul-cara" className="text-2xl font-extrabold sm:text-3xl">Cara kerja</h2>
          <ol className="mt-6 grid gap-6 md:grid-cols-5 md:gap-4">
            {langkah.map((l, i) => (
              <li key={l.judul} className="relative">
                <div className="flex items-center gap-3 md:block">
                  <span className="angka flex size-9 shrink-0 items-center justify-center rounded-full bg-rambu text-sm font-bold text-white">{i + 1}</span>
                  <h3 className="font-bold md:mt-3">{l.judul}</h3>
                </div>
                <p className="mt-1.5 pl-12 text-sm leading-relaxed text-tinta-redup md:pl-0">{l.isi}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm text-tinta-redup">
            Standar waktu lengkap per jenis masalah ada di halaman{" "}
            <Link href="/transparansi" className="font-semibold text-rambu hover:text-rambu-tua">
              Transparansi
            </Link>
            .
          </p>
        </section>

        <section id="perbedaan" aria-labelledby="judul-perbedaan" className="scroll-mt-24">
          <h2 id="judul-perbedaan" className="text-2xl font-extrabold sm:text-3xl">Yang membedakan</h2>
          <div className="mt-5 overflow-x-auto rounded-2xl border border-garis bg-white">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-garis bg-kertas/60">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold text-tinta-redup">Aspek</th>
                  <th scope="col" className="px-5 py-3 font-semibold text-tinta-redup">Kanal pengaduan pada umumnya</th>
                  <th scope="col" className="px-5 py-3 font-semibold text-rambu">{situs.nama}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-garis">
                {perbandingan.map((p) => (
                  <tr key={p.aspek}>
                    <th scope="row" className="px-5 py-3.5 font-semibold">{p.aspek}</th>
                    <td className="px-5 py-3.5 text-tinta-redup">
                      <span className="flex gap-2">
                        <X className="mt-0.5 size-4 shrink-0 text-bahaya" aria-hidden="true" />
                        {p.umum}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="flex gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-tuntas" aria-hidden="true" />
                        {p.tuntasin}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { ikon: MapPinned, teks: "Lokasi dari peta dan GPS, daerah terdeteksi otomatis" },
              { ikon: Copy, teks: "Foto dicek waktu dan lokasinya untuk menyaring laporan palsu" },
              { ikon: BellRing, teks: "Notifikasi dan email di setiap perubahan status" },
            ].map((f) => (
              <p key={f.teks} className="flex gap-3 rounded-xl bg-white p-4 text-sm ring-1 ring-garis ring-inset">
                <f.ikon className="size-5 shrink-0 text-rambu" aria-hidden="true" />
                {f.teks}
              </p>
            ))}
          </div>
        </section>

        <section id="peran" aria-labelledby="judul-peran" className="scroll-mt-24">
          <h2 id="judul-peran" className="text-2xl font-extrabold sm:text-3xl">Siapa yang terlibat</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {peran.map((p) => (
              <div key={p.judul} className="rounded-2xl border border-garis bg-white p-5">
                <span className="flex size-10 items-center justify-center rounded-xl bg-rambu-muda text-rambu">
                  <p.ikon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-3 font-bold">{p.judul}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-tinta-redup">{p.isi}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="inspirasi" aria-labelledby="judul-inspirasi" className="scroll-mt-24">
          <h2 id="judul-inspirasi" className="text-2xl font-extrabold sm:text-3xl">Belajar dari praktik baik dunia</h2>
          <p className="mt-1 text-sm text-tinta-redup">Fitur {situs.nama} diadaptasi dari sistem pelaporan warga yang terbukti berjalan di negara lain.</p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {inspirasi.map((n) => (
              <li key={n.sistem} className="flex flex-col rounded-2xl border border-garis bg-white p-4">
                <p className="text-xs font-semibold text-tinta-redup">{n.negara}</p>
                <p className="mt-0.5 font-bold">{n.sistem}</p>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-tinta-redup">{n.isi}</p>
                <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-tuntas">
                  <ThumbsUp className="size-3.5" aria-hidden="true" />
                  {n.diambil}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section id="faq" aria-labelledby="judul-faq" className="scroll-mt-24">
          <h2 id="judul-faq" className="text-2xl font-extrabold sm:text-3xl">Pertanyaan yang sering diajukan</h2>
          <div className="mt-5 divide-y divide-garis overflow-hidden rounded-2xl border border-garis bg-white">
            {faq.map((f) => (
              <details key={f.t} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold hover:bg-kertas/60 [&::-webkit-details-marker]:hidden">
                  {f.t}
                  <ChevronDown className="size-5 shrink-0 text-tinta-redup transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <p className="px-5 pb-5 leading-relaxed text-tinta-redup motion-safe:animate-muncul">{f.j}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="relative isolate overflow-hidden rounded-[2rem] bg-malam px-6 py-14 text-white sm:px-12">
          <div aria-hidden="true" className="latar-kisi absolute inset-0 -z-10" />
          <div aria-hidden="true" className="absolute -top-32 -right-20 -z-10 size-96 rounded-full bg-rambu/50 blur-[100px]" />
          <h2 className="max-w-xl text-3xl leading-tight font-extrabold sm:text-4xl">Ada masalah di sekitarmu?</h2>
          <p className="mt-3 max-w-xl text-white/70">Laporkan sekarang dan pantau sampai benar-benar tuntas.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/lapor" className="kilau rounded-xl bg-sinyal px-5 py-3.5 font-bold text-tinta transition hover:-translate-y-0.5">
              Buat laporan
            </Link>
            <Link href="/laporan" className="rounded-xl px-5 py-3.5 font-semibold ring-1 ring-white/25 ring-inset transition hover:bg-white/10">
              Lihat laporan warga
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
