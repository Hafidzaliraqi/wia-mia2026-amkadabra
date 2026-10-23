import Link from "next/link";
import { ArrowLeft, ExternalLink, MapPin } from "lucide-react";
import type { Laporan } from "@/lib/types";
import { cariInstansi, cariKategori } from "@/lib/data/referensi";
import { apakahTerlambat, hitungStatus, hitungTenggat } from "@/lib/sla";
import { namaKota } from "@/lib/wilayah";
import { formatTanggal, formatTanggalJam } from "@/lib/waktu";
import { FotoLaporanTampil } from "@/components/foto-contoh";
import { KategoriIkon } from "@/components/kategori-ikon";
import { LangkahStatus } from "@/components/langkah-status";
import { RiwayatLaporan } from "@/components/riwayat-laporan";
import { StatusBadge, TerlambatBadge } from "@/components/status-badge";
import { InfoTenggat } from "@/components/tenggat";

// Tampilan laporan di dasbor: isi lengkap di kiri, panel tindakan di kanan
export function DetailLaporanDasbor({
  laporan,
  kembali,
  panel,
  tambahan,
}: {
  laporan: Laporan;
  kembali: { href: string; label: string };
  panel: React.ReactNode;
  tambahan?: React.ReactNode;
}) {
  const status = hitungStatus(laporan);
  const tenggat = hitungTenggat(laporan);
  const kategori = cariKategori(laporan.kategoriId);
  const fotoAwal = laporan.foto.filter((f) => f.jenis === "awal");
  const fotoSesudah = laporan.foto.filter((f) => f.jenis === "sesudah");

  return (
    <div className="mx-auto max-w-6xl">
      <Link href={kembali.href} className="inline-flex items-center gap-1.5 text-sm font-semibold text-tinta-redup hover:text-tinta">
        <ArrowLeft className="size-4" aria-hidden="true" />
        {kembali.label}
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="angka mr-1 text-sm font-semibold text-tinta-redup">{laporan.nomor}</span>
        <StatusBadge status={status} />
        {apakahTerlambat(laporan) && <TerlambatBadge />}
      </div>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-balance">{laporan.judul}</h1>
      <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-tinta-redup">
        <span className="inline-flex items-center gap-1.5">
          <KategoriIkon id={laporan.kategoriId} className="size-4" />
          {kategori.nama}
        </span>
        <span>Ditangani {cariInstansi(laporan.instansiId).nama}</span>
        <span className="angka">Masuk {formatTanggalJam(laporan.dibuatPada)}</span>
      </p>

      <div className="mt-6 rounded-2xl border border-garis bg-white p-5">
        <LangkahStatus status={status} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="min-w-0 space-y-6">
          <section className="rounded-2xl border border-garis bg-white p-5 sm:p-6">
            <h2 className="font-bold">Isi laporan</h2>
            <p className="mt-1 text-sm text-tinta-redup">
              Pelapor: {laporan.namaPelapor}
              {laporan.visibilitas !== "publik" && " (disembunyikan dari publik)"}
            </p>
            <p className="mt-4 max-w-prose leading-relaxed whitespace-pre-line">{laporan.deskripsi}</p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <FotoLaporanTampil foto={fotoAwal} contoh={laporan.adaFotoContoh} label="Foto dari pelapor" />
              <div className="text-sm">
                <h3 className="font-semibold">Lokasi</h3>
                <p className="mt-1 flex gap-2 leading-relaxed">
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
                    className="mt-3 inline-flex items-center gap-1.5 font-semibold text-rambu hover:text-rambu-tua"
                  >
                    Buka di Google Maps
                    <ExternalLink className="size-3.5" aria-hidden="true" />
                  </a>
                )}
                <p className="angka mt-3 text-tinta-redup">Kejadian: {formatTanggal(laporan.tanggalKejadian)}</p>
                <p className="angka text-tinta-redup">Dukungan warga: {laporan.dukungan}</p>
              </div>
            </div>
            {fotoSesudah.length > 0 && (
              <div className="mt-6">
                <FotoLaporanTampil foto={fotoSesudah} contoh={false} label="Foto sesudah dari petugas" />
              </div>
            )}
          </section>
          {tambahan}
          <section className="rounded-2xl border border-garis bg-white p-5 sm:p-6">
            <h2 className="font-bold">Riwayat penanganan</h2>
            <div className="mt-6">
              <RiwayatLaporan laporan={laporan} tenggat={tenggat} namaPelapor={laporan.namaPelapor} />
            </div>
          </section>
        </div>
        <aside className="space-y-6 lg:sticky lg:top-6">
          {tenggat && (
            <section className="rounded-2xl border border-garis bg-white p-5">
              <h2 className="font-bold">Tenggat saat ini</h2>
              <div className="mt-4">
                <InfoTenggat tenggat={tenggat} />
              </div>
            </section>
          )}
          {panel}
        </aside>
      </div>
    </div>
  );
}
