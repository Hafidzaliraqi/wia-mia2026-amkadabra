import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, MapPin } from "lucide-react";
import { ambilLaporanPublik, ambilLaporanPublikByNomor, namaPelaporTampil } from "@/lib/data";
import { BATAS_KONFIRMASI_HARI, cariInstansi, cariKategori } from "@/lib/data/referensi";
import { apakahTerlambat, hitungStatus, hitungTenggat } from "@/lib/sla";
import { formatHariTanggalJam, formatTanggal, formatTanggalJam, tambahHari } from "@/lib/waktu";
import { AksiWarga } from "@/components/aksi-warga";
import { FotoContoh } from "@/components/foto-contoh";
import { KategoriIkon } from "@/components/kategori-ikon";
import { LangkahStatus } from "@/components/langkah-status";
import { PanelKonfirmasi } from "@/components/panel-konfirmasi";
import { RiwayatLaporan } from "@/components/riwayat-laporan";
import { StatusBadge, TerlambatBadge } from "@/components/status-badge";
import { StempelSelesai } from "@/components/stempel-selesai";
import { InfoTenggat } from "@/components/tenggat";

// Semua laporan publik dibuat jadi halaman statis saat build
export function generateStaticParams() {
  return ambilLaporanPublik().map((l) => ({ id: l.nomor }));
}

export async function generateMetadata({ params }: PageProps<"/laporan/[id]">): Promise<Metadata> {
  const { id } = await params;
  const laporan = ambilLaporanPublikByNomor(id);
  return { title: laporan ? `${laporan.judul} (${laporan.nomor})` : "Laporan tidak ditemukan" };
}

export default async function DetailLaporan({ params }: PageProps<"/laporan/[id]">) {
  const { id } = await params;
  const laporan = ambilLaporanPublikByNomor(id);
  if (!laporan) notFound();

  const status = hitungStatus(laporan);
  const tenggat = hitungTenggat(laporan);
  const terlambat = apakahTerlambat(laporan);
  const kategori = cariKategori(laporan.kategoriId);
  const instansi = cariInstansi(laporan.instansiId);
  const namaPelapor = namaPelaporTampil(laporan);

  const konfirmasi = laporan.riwayat.findLast((k) => k.jenis === "dikonfirmasi_beres");
  const ditandaiSelesai = laporan.riwayat.findLast((k) => k.jenis === "ditandai_selesai");
  const ditutupOtomatis = laporan.riwayat.findLast((k) => k.jenis === "ditutup_otomatis");

  const masihBerjalan = ["terkirim", "diteruskan", "diproses", "menunggu_konfirmasi"].includes(status);
  const adaInfoAtas =
    (status === "menunggu_konfirmasi" && tenggat !== null) ||
    (tenggat !== null && tenggat.tanggungJawabPetugas) ||
    (status === "ditutup_otomatis" && ditutupOtomatis !== undefined);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
      <Link
        href="/laporan"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-tinta-redup hover:text-tinta"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Semua laporan
      </Link>

      <header className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="angka mr-1 text-sm font-semibold text-tinta-redup">{laporan.nomor}</span>
            <StatusBadge status={status} />
            {terlambat && <TerlambatBadge />}
          </div>
          <h1 className="mt-3 max-w-2xl text-2xl leading-tight font-extrabold tracking-tight text-balance sm:text-3xl">
            {laporan.judul}
          </h1>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-tinta-redup">
            <span className="inline-flex items-center gap-1.5">
              <KategoriIkon id={laporan.kategoriId} className="size-4" />
              {kategori.nama}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4" aria-hidden="true" />
              {laporan.kecamatan}
            </span>
            <span className="angka inline-flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden="true" />
              Dilaporkan {formatTanggalJam(laporan.dibuatPada)}
            </span>
          </div>
        </div>
        {status === "selesai" && konfirmasi && (
          <div className="shrink-0 sm:pt-2 sm:pr-2">
            <StempelSelesai waktu={konfirmasi.waktu} />
          </div>
        )}
      </header>

      <section className="mt-8 rounded-2xl border border-garis bg-white p-5 sm:p-6">
        <h2 className="sr-only">Tahap laporan</h2>
        <LangkahStatus status={status} />
      </section>

      {/* Urutan di HP: info penting dulu, isi laporan, lalu instansi dan dukungan.
          Di layar lebar: isi laporan di kiri, semua info di kolom kanan. */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:grid-rows-[auto_1fr] lg:items-start lg:gap-8">
        {adaInfoAtas && (
          <div className="space-y-6 lg:col-start-2 lg:row-start-1">
            {status === "menunggu_konfirmasi" && tenggat && (
              <PanelKonfirmasi
                instansiNama={instansi.nama}
                batasTeks={`pada ${formatHariTanggalJam(tenggat.batas)} WIB`}
              />
            )}

            {tenggat && tenggat.tanggungJawabPetugas && (
              <section className="rounded-2xl border border-garis bg-white p-5">
                <h2 className="font-bold">Tenggat saat ini</h2>
                <div className="mt-4">
                  <InfoTenggat tenggat={tenggat} />
                </div>
                {terlambat && (
                  <p className="mt-4 text-sm leading-relaxed text-bahaya">
                    Batas waktu sudah lewat. Laporan ini otomatis dieskalasi ke pengawas instansi.
                  </p>
                )}
              </section>
            )}

            {status === "ditutup_otomatis" && ditutupOtomatis && (
              <section className="rounded-2xl border border-garis bg-white p-5 text-sm leading-relaxed">
                <h2 className="font-bold">Ditutup tanpa konfirmasi</h2>
                <p className="mt-2 text-tinta-redup">
                  Tidak ada jawaban dari pelapor dan pendukung dalam {BATAS_KONFIRMASI_HARI} hari. Kalau
                  masalahnya ternyata belum beres, laporan masih bisa dibuka ulang sampai{" "}
                  {formatTanggal(tambahHari(new Date(ditutupOtomatis.waktu), 30))}.
                </p>
              </section>
            )}
          </div>
        )}

        <div className="min-w-0 space-y-6 lg:col-start-1 lg:row-span-2 lg:row-start-1">
          <section className="rounded-2xl border border-garis bg-white p-5 sm:p-6">
            <h2 className="font-bold">Isi laporan</h2>
            <p className="mt-1 text-sm text-tinta-redup">
              {laporan.visibilitas === "publik"
                ? `Dilaporkan oleh ${namaPelapor}`
                : "Identitas pelapor disembunyikan atas permintaan pelapor"}
            </p>
            <p className="mt-4 max-w-prose leading-relaxed">{laporan.deskripsi}</p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <FotoContoh label="Foto dari pelapor" kosong={!laporan.adaFotoAwal} />
              <div>
                <h3 className="text-sm font-semibold">Lokasi</h3>
                <p className="mt-1 flex gap-2 text-sm leading-relaxed">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-rambu" aria-hidden="true" />
                  <span>
                    {laporan.alamat}
                    <br />
                    Kecamatan {laporan.kecamatan}
                  </span>
                </p>
              </div>
            </div>
          </section>

          {ditandaiSelesai && (
            <section className="rounded-2xl border border-garis bg-white p-5 sm:p-6">
              <h2 className="font-bold">Bukti penyelesaian</h2>
              <p className="mt-1 text-sm text-tinta-redup">
                Petugas wajib melampirkan foto sesudah pekerjaan sebelum menandai laporan selesai.
              </p>
              <div className="mt-5 grid gap-6 sm:grid-cols-2">
                <FotoContoh label="Sebelum, dari pelapor" kosong={!laporan.adaFotoAwal} />
                <FotoContoh
                  label={`Sesudah, dari ${ditandaiSelesai.aktor}, ${formatTanggal(ditandaiSelesai.waktu)}`}
                />
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-garis bg-white p-5 sm:p-6">
            <h2 className="font-bold">Riwayat penanganan</h2>
            <p className="mt-1 text-sm text-tinta-redup">
              Setiap perubahan tercatat permanen dan bisa dilihat semua orang.
            </p>
            <div className="mt-6">
              <RiwayatLaporan laporan={laporan} tenggat={tenggat} namaPelapor={namaPelapor} />
            </div>
          </section>
        </div>

        <aside className={`space-y-6 lg:col-start-2 ${adaInfoAtas ? "lg:row-start-2" : "lg:row-start-1"}`}>
          <section className="rounded-2xl border border-garis bg-white p-5">
            <h2 className="text-sm text-tinta-redup">Ditangani oleh</h2>
            <p className="mt-1 font-bold">{instansi.nama}</p>
            <p className="mt-2 text-sm leading-relaxed text-tinta-redup">
              Batas penyelesaian kategori {kategori.nama.toLowerCase()} adalah {kategori.slaHariKerja} hari
              kerja sejak mulai dikerjakan.
            </p>
          </section>

          <section className="rounded-2xl border border-garis bg-white p-5">
            <h2 className="sr-only">Dukungan warga</h2>
            <AksiWarga dukunganAwal={laporan.dukungan} bisaDidukung={masihBerjalan} />
          </section>
        </aside>
      </div>
    </div>
  );
}
