import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { ArrowLeft, Clock, ExternalLink, LayoutDashboard, MapPin } from "lucide-react";
import { ambilLaporan, bolehDilihat, namaPelaporTampil, nomorDidukung } from "@/lib/server/laporan";
import { penggunaSaatIni } from "@/lib/server/sesi";
import { BATAS_BUKA_ULANG_HARI, BATAS_KONFIRMASI_HARI, cariInstansi, cariKategori } from "@/lib/data/referensi";
import { apakahTerlambat, hitungStatus, hitungTenggat } from "@/lib/sla";
import { namaKota } from "@/lib/wilayah";
import { normalisasiNomor } from "@/lib/nomor";
import { HARI, formatHariTanggalJam, formatTanggal, formatTanggalJam, sekarang, tambahHari } from "@/lib/waktu";
import { AksiWarga } from "@/components/aksi-warga";
import { Percakapan } from "@/components/percakapan";
import { PenyegarOtomatis } from "@/components/penyegar-otomatis";
import { TombolBagikan } from "@/components/tombol-bagikan";
import { susunPercakapan } from "@/lib/server/percakapan";
import { FotoLaporanTampil } from "@/components/foto-contoh";
import { KategoriIkon } from "@/components/kategori-ikon";
import { LangkahStatus } from "@/components/langkah-status";
import { PanelKonfirmasi, TombolBukaUlang } from "@/components/panel-konfirmasi";
import { RiwayatLaporan } from "@/components/riwayat-laporan";
import { StatusBadge, TerlambatBadge } from "@/components/status-badge";
import { StempelSelesai } from "@/components/stempel-selesai";
import { InfoTenggat } from "@/components/tenggat";

export async function generateMetadata({ params }: PageProps<"/laporan/[id]">): Promise<Metadata> {
  await connection();
  const { id } = await params;
  const laporan = await ambilLaporan(normalisasiNomor(id));
  return { title: laporan && laporan.visibilitas !== "privat" ? `${laporan.judul} (${laporan.nomor})` : "Laporan" };
}

export default function DetailLaporan({ params }: PageProps<"/laporan/[id]">) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
      <Link href="/laporan" className="inline-flex items-center gap-1.5 text-sm font-semibold text-tinta-redup hover:text-tinta">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Semua laporan
      </Link>
      <Suspense fallback={<KerangkaDetail />}>
        <IsiDetail params={params} />
      </Suspense>
    </div>
  );
}

function KerangkaDetail() {
  return (
    <div className="animate-pulse motion-reduce:animate-none" aria-label="Memuat laporan">
      <div className="mt-6 h-5 w-48 rounded-full bg-garis" />
      <div className="mt-4 h-8 w-full max-w-xl rounded-lg bg-garis" />
      <div className="mt-8 h-20 rounded-2xl border border-garis bg-white" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
        <div className="h-80 rounded-2xl border border-garis bg-white" />
        <div className="h-48 rounded-2xl border border-garis bg-white" />
      </div>
    </div>
  );
}

async function IsiDetail({ params }: Pick<PageProps<"/laporan/[id]">, "params">) {
  await connection();
  const { id } = await params;
  const nomor = normalisasiNomor(id);
  const [laporan, pengguna] = await Promise.all([ambilLaporan(nomor), penggunaSaatIni()]);
  if (!laporan || !bolehDilihat(laporan, pengguna?.id ?? null, pengguna?.peran ?? null)) notFound();

  const status = hitungStatus(laporan);
  const tenggat = hitungTenggat(laporan);
  const terlambat = apakahTerlambat(laporan);
  const kategori = cariKategori(laporan.kategoriId);
  const instansi = cariInstansi(laporan.instansiId);
  const namaPelapor = namaPelaporTampil(laporan);
  const laporanSendiri = pengguna !== null && laporan.pelaporId === pengguna.id;
  const didukung = pengguna ? (await nomorDidukung(pengguna.id)).has(laporan.nomor) : false;
  const berhak = laporanSendiri || didukung;

  const konfirmasi = laporan.riwayat.findLast((k) => k.jenis === "dikonfirmasi_beres");
  const ditandaiSelesai = laporan.riwayat.findLast((k) => k.jenis === "ditandai_selesai");
  const ditutupOtomatis = laporan.riwayat.findLast((k) => k.jenis === "ditutup_otomatis");
  const masihBisaBukaUlang =
    ditutupOtomatis && sekarang().getTime() - new Date(ditutupOtomatis.waktu).getTime() < BATAS_BUKA_ULANG_HARI * HARI;
  const masihBerjalan = ["terkirim", "diteruskan", "diproses", "menunggu_konfirmasi"].includes(status);
  const fotoAwal = laporan.foto.filter((f) => f.jenis === "awal");
  const fotoSesudah = laporan.foto.filter((f) => f.jenis === "sesudah");
  const bisaKelola =
    pengguna?.peran === "admin" || (pengguna?.peran === "petugas" && pengguna.instansiId === laporan.instansiId);

  const adaInfoAtas =
    (status === "menunggu_konfirmasi" && tenggat !== null) ||
    (tenggat !== null && tenggat.tanggungJawabPetugas) ||
    (status === "ditutup_otomatis" && ditutupOtomatis !== undefined) ||
    bisaKelola;

  return (
    <>
      <header className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="angka mr-1 text-sm font-semibold text-tinta-redup">{laporan.nomor}</span>
            <StatusBadge status={status} />
            {terlambat && <TerlambatBadge />}
            {laporanSendiri && (
              <span className="rounded-full bg-tinta px-2.5 py-1 text-xs font-semibold text-white">Laporanmu</span>
            )}
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
              {laporan.kecamatan}, {namaKota(laporan.kotaId)}
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

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:grid-rows-[auto_1fr] lg:items-start lg:gap-8">
        {adaInfoAtas && (
          <div className="space-y-6 lg:col-start-2 lg:row-start-1">
            {bisaKelola && (
              <Link
                href={`/${pengguna!.peran}/laporan/${laporan.nomor}`}
                className="flex items-center gap-2 rounded-2xl bg-tinta px-5 py-4 font-semibold text-white transition hover:bg-tinta/90"
              >
                <LayoutDashboard className="size-5" aria-hidden="true" />
                Kelola di dasbor {pengguna!.peran === "admin" ? "admin" : "petugas"}
              </Link>
            )}
            {status === "menunggu_konfirmasi" && tenggat && (
              <PanelKonfirmasi
                nomor={laporan.nomor}
                instansiNama={instansi.nama}
                batasTeks={`pada ${formatHariTanggalJam(tenggat.batas)} WIB`}
                sudahMasuk={pengguna !== null}
                berhak={berhak && pengguna?.peran === "warga"}
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
                  Tidak ada jawaban dari pelapor dan pendukung dalam {BATAS_KONFIRMASI_HARI} hari.
                  {masihBisaBukaUlang
                    ? ` Kalau masalahnya belum beres, laporan masih bisa dibuka ulang sampai ${formatTanggal(tambahHari(new Date(ditutupOtomatis.waktu), BATAS_BUKA_ULANG_HARI))}.`
                    : " Batas untuk membuka ulang sudah lewat."}
                </p>
                {masihBisaBukaUlang && berhak && pengguna?.peran === "warga" && <TombolBukaUlang nomor={laporan.nomor} />}
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
                : laporan.visibilitas === "privat"
                  ? "Laporan privat: hanya pelapor, admin, dan instansi yang bisa melihat"
                  : "Identitas pelapor disembunyikan atas permintaan pelapor"}
            </p>
            <p className="mt-4 max-w-prose leading-relaxed whitespace-pre-line">{laporan.deskripsi}</p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <FotoLaporanTampil foto={fotoAwal} kategoriId={laporan.kategoriId} contoh={laporan.adaFotoContoh} label="Foto dari pelapor" />
              <div>
                <h3 className="text-sm font-semibold">Lokasi</h3>
                <p className="mt-1 flex gap-2 text-sm leading-relaxed">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-rambu" aria-hidden="true" />
                  <span>
                    {laporan.alamat}
                    <br />
                    Kecamatan {laporan.kecamatan}, {namaKota(laporan.kotaId)}
                  </span>
                </p>
                {laporan.lat !== null && laporan.lng !== null && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${laporan.lat},${laporan.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-rambu hover:text-rambu-tua"
                  >
                    Buka di Google Maps
                    <ExternalLink className="size-3.5" aria-hidden="true" />
                    <span className="sr-only">(tab baru)</span>
                  </a>
                )}
                <p className="angka mt-3 text-sm text-tinta-redup">Kejadian: {formatTanggal(laporan.tanggalKejadian)}</p>
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
                <FotoLaporanTampil foto={fotoAwal} kategoriId={laporan.kategoriId} contoh={laporan.adaFotoContoh} label="Sebelum, dari pelapor" />
                <FotoLaporanTampil
                  foto={fotoSesudah}
                  kategoriId={laporan.kategoriId} contoh={fotoSesudah.length === 0}
                  label={`Sesudah, dari ${ditandaiSelesai.aktor}, ${formatTanggal(ditandaiSelesai.waktu)}`}
                />
              </div>
            </section>
          )}

          <Percakapan
            nomor={laporan.nomor}
            pesan={susunPercakapan(laporan, pengguna?.id ?? null, "warga")}
            sebagai="warga"
            bisaKirim={pengguna?.peran === "warga" && berhak && masihBerjalan}
            keteranganTutup={
              !masihBerjalan
                ? "Percakapan ditutup karena laporan sudah selesai."
                : !pengguna
                  ? "Masuk sebagai pelapor atau pendukung untuk ikut berdiskusi dengan petugas."
                  : pengguna.peran !== "warga"
                    ? "Petugas membalas lewat dasbor."
                    : "Dukung laporan ini untuk ikut berdiskusi dengan petugas."
            }
          />

          <section className="rounded-2xl border border-garis bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-bold">Riwayat penanganan</h2>
              {masihBerjalan && <PenyegarOtomatis />}
            </div>
            <p className="mt-1 text-sm text-tinta-redup">Setiap perubahan tercatat permanen dan bisa dilihat semua orang.</p>
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
              Batas penyelesaian kategori {kategori.nama.toLowerCase()} adalah {kategori.slaHariKerja} hari kerja sejak
              mulai dikerjakan.
            </p>
          </section>
          <TombolBagikan nomor={laporan.nomor} judul={laporan.judul} />
          <section className="rounded-2xl border border-garis bg-white p-5">
            <h2 className="sr-only">Dukungan warga</h2>
            <AksiWarga
              nomor={laporan.nomor}
              jumlah={laporan.dukungan}
              didukung={didukung}
              bisaDidukung={masihBerjalan && laporan.visibilitas !== "privat"}
              laporanSendiri={laporanSendiri}
              sudahMasuk={pengguna !== null}
              peranWarga={pengguna?.peran === "warga"}
            />
          </section>
        </aside>
      </div>
    </>
  );
}
