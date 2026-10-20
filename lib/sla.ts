import type { Kejadian, Laporan, StatusLaporan } from "@/lib/types";
import {
  BATAS_KONFIRMASI_HARI,
  SLA_RESPONS_HARI_KERJA,
  SLA_VERIFIKASI_HARI_KERJA,
  cariKategori,
} from "@/lib/data/referensi";
import { sekarang, tambahHari, tambahHariKerja } from "@/lib/waktu";

// Status dihitung dari kejadian terakhir yang mengubah status.
// "balasan", "eskalasi", dan "perpanjangan" tidak mengubah status.
const statusSetelah: Partial<Record<Kejadian["jenis"], StatusLaporan>> = {
  dibuat: "terkirim",
  diverifikasi: "diteruskan",
  diteruskan: "diteruskan",
  dialihkan: "diteruskan",
  diproses: "diproses",
  dibuka_ulang: "diproses",
  ditandai_selesai: "menunggu_konfirmasi",
  dikonfirmasi_beres: "selesai",
  ditutup_otomatis: "ditutup_otomatis",
  ditolak: "ditolak",
};

export function hitungStatus(laporan: Laporan): StatusLaporan {
  let status: StatusLaporan = "terkirim";
  for (const kejadian of laporan.riwayat) {
    status = statusSetelah[kejadian.jenis] ?? status;
  }
  return status;
}

export interface Tenggat {
  tahap: string;
  mulai: string; // ISO
  batas: string; // ISO
  // true = yang ditunggu instansi/admin (bisa terlambat).
  // false = yang ditunggu pelapor (konfirmasi), tidak dihitung terlambat.
  tanggungJawabPetugas: boolean;
}

function terakhir(laporan: Laporan, jenis: Kejadian["jenis"][]): Kejadian | undefined {
  for (let i = laporan.riwayat.length - 1; i >= 0; i--) {
    if (jenis.includes(laporan.riwayat[i].jenis)) return laporan.riwayat[i];
  }
  return undefined;
}

// Batas waktu tahap yang sedang berjalan. null kalau laporan sudah selesai/ditolak.
export function hitungTenggat(laporan: Laporan): Tenggat | null {
  const status = hitungStatus(laporan);

  if (status === "terkirim") {
    const mulai = new Date(laporan.dibuatPada);
    return {
      tahap: "Verifikasi laporan",
      mulai: mulai.toISOString(),
      batas: tambahHariKerja(mulai, SLA_VERIFIKASI_HARI_KERJA).toISOString(),
      tanggungJawabPetugas: true,
    };
  }

  if (status === "diteruskan") {
    const acuan = terakhir(laporan, ["diteruskan", "dialihkan"]);
    const mulai = new Date(acuan?.waktu ?? laporan.dibuatPada);
    return {
      tahap: "Respons awal instansi",
      mulai: mulai.toISOString(),
      batas: tambahHariKerja(mulai, SLA_RESPONS_HARI_KERJA).toISOString(),
      tanggungJawabPetugas: true,
    };
  }

  if (status === "diproses") {
    const acuan = terakhir(laporan, ["diproses", "dibuka_ulang"]);
    const mulai = new Date(acuan?.waktu ?? laporan.dibuatPada);
    const kategori = cariKategori(laporan.kategoriId);
    let batas = tambahHariKerja(mulai, kategori.slaHariKerja);

    const perpanjangan = terakhir(laporan, ["perpanjangan"]);
    if (perpanjangan?.batasBaru && new Date(perpanjangan.waktu) > mulai) {
      batas = new Date(perpanjangan.batasBaru);
    }
    return {
      tahap: "Penyelesaian",
      mulai: mulai.toISOString(),
      batas: batas.toISOString(),
      tanggungJawabPetugas: true,
    };
  }

  if (status === "menunggu_konfirmasi") {
    const acuan = terakhir(laporan, ["ditandai_selesai"]);
    const mulai = new Date(acuan?.waktu ?? laporan.dibuatPada);
    return {
      tahap: "Konfirmasi pelapor",
      mulai: mulai.toISOString(),
      batas: tambahHari(mulai, BATAS_KONFIRMASI_HARI).toISOString(),
      tanggungJawabPetugas: false,
    };
  }

  return null;
}

export function apakahTerlambat(laporan: Laporan): boolean {
  const tenggat = hitungTenggat(laporan);
  if (!tenggat || !tenggat.tanggungJawabPetugas) return false;
  return new Date(tenggat.batas) < sekarang();
}

// 0–1, seberapa banyak waktu tahap ini yang sudah terpakai
export function porsiWaktuTerpakai(tenggat: Tenggat): number {
  const mulai = new Date(tenggat.mulai).getTime();
  const batas = new Date(tenggat.batas).getTime();
  const total = batas - mulai;
  if (total <= 0) return 1;
  return Math.min(1, Math.max(0, (sekarang().getTime() - mulai) / total));
}
