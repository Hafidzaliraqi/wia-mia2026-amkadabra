import type { Metadata } from "next";
import { Braces, Download, ShieldCheck } from "lucide-react";
import { KepalaHalaman } from "@/components/kepala-halaman";
import { daftarKelompok } from "@/lib/data/referensi";
import { daftarKota } from "@/lib/wilayah";

export const metadata: Metadata = { title: "Data terbuka" };

const kamus = [
  ["nomor", "Nomor laporan", "TSN-2610-0042"],
  ["judul", "Judul singkat masalah", "Jalan berlubang di Jl. Prof. Dr. Soepomo"],
  ["jenis_masalah, kelompok", "Jenis masalah dan kelompoknya", "Jalan rusak, Jalan & transportasi"],
  ["kota, kecamatan", "Lokasi sampai tingkat kecamatan", "Jakarta Selatan, Tebet"],
  ["instansi", "Instansi yang menangani sekarang", "Dinas Pekerjaan Umum Jakarta Selatan"],
  ["status", "Tahap saat ini", "terkirim, diteruskan, diproses, menunggu_konfirmasi, selesai, ditutup_otomatis, ditolak"],
  ["dibuat, ditandai_selesai", "Waktu laporan dibuat dan ditandai selesai petugas (ISO 8601)", "2026-10-13T08:42:00Z"],
  ["lewat_batas", "Apakah tahap sekarang sudah lewat batas waktu", "ya / tidak"],
  ["tingkat_eskalasi", "0 petugas, 1 pimpinan instansi, 2 inspektorat, 3 kepala daerah", "2"],
  ["dukungan", "Jumlah warga yang mendukung", "36"],
];

const contoh = `{
  "sumber": "Tuntasin",
  "jumlah": 1,
  "data": [{
    "nomor": "TSN-2610-0042",
    "jenis_masalah": "Jalan rusak",
    "kota": "Jakarta Selatan",
    "kecamatan": "Tebet",
    "status": "diproses",
    "lewat_batas": false,
    "tingkat_eskalasi": 0,
    "dukungan": 36
  }]
}`;

export default function HalamanDataTerbuka() {
  return (
    <>
    <KepalaHalaman
      label="Untuk pemda, peneliti, dan media"
      judul="Data terbuka"
      deskripsi="Data laporan publik bisa diunduh dan dipakai ulang siapa saja. Selalu terbaru setiap kali diminta."
    />
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-3xl border border-garis bg-white p-6" aria-labelledby="judul-csv">
          <span className="flex size-10 items-center justify-center rounded-xl bg-rambu-muda text-rambu">
            <Download className="size-5" aria-hidden="true" />
          </span>
          <h2 id="judul-csv" className="mt-4 text-xl font-bold">
            Unduh CSV
          </h2>
          <p className="mt-1 text-sm text-tinta-redup">Bisa langsung dibuka di Excel atau Google Sheets.</p>
          <a href="/api/data/laporan" download className="kilau mt-5 inline-flex items-center gap-2 rounded-xl bg-rambu px-5 py-3 font-bold text-white transition hover:bg-rambu-tua">
            <Download className="size-4" aria-hidden="true" />
            Unduh semua laporan publik
          </a>
        </section>
        <section className="rounded-3xl border border-garis bg-white p-6" aria-labelledby="judul-api">
          <span className="flex size-10 items-center justify-center rounded-xl bg-rambu-muda text-rambu">
            <Braces className="size-5" aria-hidden="true" />
          </span>
          <h2 id="judul-api" className="mt-4 text-xl font-bold">
            API JSON
          </h2>
          <p className="mt-1 text-sm text-tinta-redup">Untuk aplikasi dan dasbor lain. Terbuka tanpa kunci.</p>
          <code className="kode mt-5 block rounded-xl bg-kertas px-4 py-3 text-sm break-all">
            GET /api/data/laporan?format=json&amp;kota=jaksel&amp;status=diproses
          </code>
          <p className="mt-3 text-sm text-tinta-redup">
            Filter opsional: <span className="kode">kota</span>, <span className="kode">status</span>, dan{" "}
            <span className="kode">kelompok</span>.
          </p>
        </section>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <section className="min-w-0 rounded-3xl border border-garis bg-white p-6" aria-labelledby="judul-kamus">
          <h2 id="judul-kamus" className="text-xl font-bold">
            Kamus data
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="text-tinta-redup">
                <tr className="border-b border-garis">
                  <th scope="col" className="py-2.5 pr-4 font-semibold">Kolom</th>
                  <th scope="col" className="py-2.5 pr-4 font-semibold">Arti</th>
                  <th scope="col" className="py-2.5 font-semibold">Contoh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-garis">
                {kamus.map(([kolom, arti, nilai]) => (
                  <tr key={kolom}>
                    <th scope="row" className="kode py-2.5 pr-4 align-top font-semibold">{kolom}</th>
                    <td className="py-2.5 pr-4 align-top">{arti}</td>
                    <td className="py-2.5 align-top text-tinta-redup">{nilai}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <div className="min-w-0 space-y-4">
          <section className="rounded-3xl border border-garis bg-white p-6" aria-labelledby="judul-contoh">
            <h2 id="judul-contoh" className="text-xl font-bold">
              Contoh respons
            </h2>
            <pre className="kode mt-4 overflow-x-auto rounded-xl bg-malam p-4 text-xs leading-relaxed text-white/85">{contoh}</pre>
          </section>
          <section className="rounded-3xl border border-garis bg-white p-6" aria-labelledby="judul-privasi">
            <h2 id="judul-privasi" className="flex items-center gap-2 text-xl font-bold">
              <ShieldCheck className="size-5 text-tuntas" aria-hidden="true" />
              Privasi
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-tinta-redup">
              Tanpa nama, kontak, foto, atau titik koordinat pelapor. Laporan yang dibuat privat tidak disertakan. Boleh dipakai ulang
              dengan menyebut Tuntasin sebagai sumber.
            </p>
          </section>
        </div>
      </div>

      <section className="mt-4 rounded-3xl border border-garis bg-white p-6" aria-labelledby="judul-kode">
        <h2 id="judul-kode" className="text-xl font-bold">
          Kode filter
        </h2>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold">kota</p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {daftarKota.map((k) => (
                <li key={k.id} className="rounded-lg bg-kertas px-2.5 py-1 text-xs">
                  <span className="kode font-semibold">{k.id}</span> {k.nama}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold">kelompok</p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {daftarKelompok.map((k) => (
                <li key={k.id} className="rounded-lg bg-kertas px-2.5 py-1 text-xs">
                  <span className="kode font-semibold">{k.id}</span> {k.nama}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
