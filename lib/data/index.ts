import type { KategoriId, Laporan, StatusLaporan } from "@/lib/types";
import { situs } from "@/lib/site";
import { normalisasiNomor } from "@/lib/nomor";
import { cariInstansi, cariKategori } from "@/lib/data/referensi";
import { laporanUnggulan } from "@/lib/data/laporan-unggulan";
import { laporanAcak } from "@/lib/data/laporan-acak";
import { apakahTerlambat, hitungStatus, hitungTenggat } from "@/lib/sla";
import { labelStatus } from "@/lib/status";
import { formatRelatif, formatSisaWaktu, JAM } from "@/lib/waktu";

// ================================================================
// SATU PINTU UNTUK AMBIL DATA
// Halaman-halaman cuma boleh ambil data lewat fungsi di file ini.
// Nanti kalau database sudah siap, cukup isi fungsi-fungsi ini
// yang diganti jadi query ke database. Halamannya tidak perlu diubah.
// ================================================================

function buatNomor(dibuatPada: string, urut: number): string {
  const wib = new Date(new Date(dibuatPada).getTime() + 7 * JAM);
  const tahun = String(wib.getUTCFullYear() % 100).padStart(2, "0");
  const bulan = String(wib.getUTCMonth() + 1).padStart(2, "0");
  return `${situs.kodeLaporan}-${tahun}${bulan}-${String(urut).padStart(4, "0")}`;
}

function susunSemuaLaporan(): Laporan[] {
  const unggulan = laporanUnggulan.map(({ urut, ...isi }) => ({
    ...isi,
    nomor: buatNomor(isi.dibuatPada, urut),
  }));

  // Laporan acak diberi nomor urut mulai 101 per bulan biar tidak bentrok
  const urutPerBulan = new Map<string, number>();
  const acak = [...laporanAcak]
    .sort((a, b) => a.dibuatPada.localeCompare(b.dibuatPada))
    .map((isi) => {
      const kunci = buatNomor(isi.dibuatPada, 0).slice(0, -4);
      const urut = (urutPerBulan.get(kunci) ?? 100) + 1;
      urutPerBulan.set(kunci, urut);
      return { ...isi, nomor: buatNomor(isi.dibuatPada, urut) };
    });

  return [...unggulan, ...acak].sort((a, b) => b.dibuatPada.localeCompare(a.dibuatPada));
}

const semuaLaporan = susunSemuaLaporan();

// Semua laporan termasuk yang privat (buat statistik)
export function ambilSemuaLaporan(): Laporan[] {
  return semuaLaporan;
}

// Laporan yang boleh dilihat publik, urut dari yang terbaru
export function ambilLaporanPublik(): Laporan[] {
  return semuaLaporan.filter((l) => l.visibilitas !== "privat");
}

export function ambilLaporanPublikByNomor(nomor: string): Laporan | undefined {
  const dicari = normalisasiNomor(nomor);
  return ambilLaporanPublik().find((l) => l.nomor === dicari);
}

export function namaPelaporTampil(laporan: Laporan): string {
  return laporan.visibilitas === "publik" ? laporan.namaPelapor : "Nama disembunyikan";
}

// Versi ringkas yang aman dikirim ke komponen client (semua sudah berupa teks)
export interface RingkasanLaporan {
  nomor: string;
  judul: string;
  kategoriId: KategoriId;
  kategoriNama: string;
  alamat: string;
  kecamatan: string;
  status: StatusLaporan;
  labelStatus: string;
  terlambat: boolean;
  dukungan: number;
  dibuatPada: string;
  dibuatTeks: string;
  instansiNama: string;
  tenggatTeks: string | null;
}

export function ringkas(laporan: Laporan): RingkasanLaporan {
  const status = hitungStatus(laporan);
  const tenggat = hitungTenggat(laporan);
  return {
    nomor: laporan.nomor,
    judul: laporan.judul,
    kategoriId: laporan.kategoriId,
    kategoriNama: cariKategori(laporan.kategoriId).nama,
    alamat: laporan.alamat,
    kecamatan: laporan.kecamatan,
    status,
    labelStatus: labelStatus[status],
    terlambat: apakahTerlambat(laporan),
    dukungan: laporan.dukungan,
    dibuatPada: laporan.dibuatPada,
    dibuatTeks: formatRelatif(laporan.dibuatPada),
    instansiNama: cariInstansi(laporan.instansiId).nama,
    tenggatTeks: tenggat ? formatSisaWaktu(tenggat.batas).teks : null,
  };
}
