import type { Instansi, Laporan } from "@/lib/types";
import { cariKategori, daftarInstansi } from "@/lib/data/referensi";
import { apakahTerlambat, hitungStatus } from "@/lib/sla";
import { namaKota } from "@/lib/wilayah";
import { HARI, JAM, formatBulan, sekarang, tambahHariKerja } from "@/lib/waktu";

// Semua perhitungan statistik menerima daftar laporan dari database,
// jadi angkanya selalu mengikuti data terbaru.

function waktuPertama(laporan: Laporan, jenis: string): Date | null {
  const kejadian = laporan.riwayat.find((k) => k.jenis === jenis);
  return kejadian ? new Date(kejadian.waktu) : null;
}

function rataRata(angka: number[]): number | null {
  return angka.length === 0 ? null : angka.reduce((a, b) => a + b, 0) / angka.length;
}

function persen(bagian: number, total: number): number | null {
  return total === 0 ? null : Math.round((bagian / total) * 100);
}

function selesaiTepatWaktu(laporan: Laporan): boolean | null {
  const mulai = waktuPertama(laporan, "diproses");
  const selesai = waktuPertama(laporan, "ditandai_selesai");
  if (!mulai || !selesai) return null;
  let batas = tambahHariKerja(mulai, cariKategori(laporan.kategoriId).slaHariKerja);
  const perpanjangan = laporan.riwayat.find((k) => k.jenis === "perpanjangan" && new Date(k.waktu) < selesai);
  if (perpanjangan?.batasBaru) batas = new Date(perpanjangan.batasBaru);
  return selesai <= batas;
}

export function ringkasanBeranda(semua: Laporan[]) {
  const batas30Hari = sekarang().getTime() - 30 * HARI;
  const ditutup = semua.filter((l) => ["selesai", "ditutup_otomatis"].includes(hitungStatus(l)));
  const lamaSelesai = semua
    .map((l) => {
      const selesai = waktuPertama(l, "ditandai_selesai");
      return selesai ? (selesai.getTime() - new Date(l.dibuatPada).getTime()) / HARI : null;
    })
    .filter((n): n is number => n !== null);

  return {
    masuk30Hari: semua.filter((l) => new Date(l.dibuatPada).getTime() >= batas30Hari).length,
    persenDikonfirmasi: persen(ditutup.filter((l) => hitungStatus(l) === "selesai").length, ditutup.length),
    rataHariSelesai: rataRata(lamaSelesai),
    terlambatSekarang: semua.filter(apakahTerlambat).length,
  };
}

export function wilayahTerbanyak(semua: Laporan[], jumlah = 5) {
  const batas30Hari = sekarang().getTime() - 30 * HARI;
  const hitungan = new Map<string, { kecamatan: string; kota: string; total: number }>();
  for (const l of semua) {
    if (new Date(l.dibuatPada).getTime() < batas30Hari) continue;
    const kunci = `${l.kotaId}|${l.kecamatan}`;
    const lama = hitungan.get(kunci) ?? { kecamatan: l.kecamatan, kota: namaKota(l.kotaId), total: 0 };
    lama.total++;
    hitungan.set(kunci, lama);
  }
  return [...hitungan.values()].sort((a, b) => b.total - a.total).slice(0, jumlah);
}

export interface RaporInstansi {
  instansi: Instansi;
  masuk: number;
  persenSelesai: number | null;
  rataJamRespons: number | null;
  rataHariPenyelesaian: number | null;
  persenTepatWaktu: number | null;
  persenDibukaUlang: number | null;
  terlambatSekarang: number;
}

export function raporInstansi(semua: Laporan[]): RaporInstansi[] {
  const aktif = semua.filter((l) => hitungStatus(l) !== "ditolak");
  return daftarInstansi.map((instansi) => {
    const milik = aktif.filter((l) => l.instansiId === instansi.id);
    const selesai = milik.filter((l) => ["selesai", "ditutup_otomatis"].includes(hitungStatus(l)));
    const jamRespons = milik
      .map((l) => {
        const diteruskan = waktuPertama(l, "diteruskan");
        const diproses = waktuPertama(l, "diproses");
        return diteruskan && diproses ? (diproses.getTime() - diteruskan.getTime()) / JAM : null;
      })
      .filter((n): n is number => n !== null);
    const hariPenyelesaian = milik
      .map((l) => {
        const diproses = waktuPertama(l, "diproses");
        const ditandai = waktuPertama(l, "ditandai_selesai");
        return diproses && ditandai ? (ditandai.getTime() - diproses.getTime()) / HARI : null;
      })
      .filter((n): n is number => n !== null);
    const ketepatan = milik.map(selesaiTepatWaktu).filter((n): n is boolean => n !== null);
    const sudahDitandai = milik.filter((l) => waktuPertama(l, "ditandai_selesai"));

    return {
      instansi,
      masuk: milik.length,
      persenSelesai: persen(selesai.length, milik.length),
      rataJamRespons: rataRata(jamRespons),
      rataHariPenyelesaian: rataRata(hariPenyelesaian),
      persenTepatWaktu: persen(ketepatan.filter(Boolean).length, ketepatan.length),
      persenDibukaUlang: persen(
        sudahDitandai.filter((l) => l.riwayat.some((k) => k.jenis === "dibuka_ulang")).length,
        sudahDitandai.length,
      ),
      terlambatSekarang: milik.filter(apakahTerlambat).length,
    };
  });
}

export function laporanPerBulan(semua: Laporan[], jumlahBulan = 3) {
  const hasil: { bulan: string; total: number }[] = [];
  const acuan = new Date(sekarang().getTime() + 7 * JAM);
  for (let i = jumlahBulan - 1; i >= 0; i--) {
    const awal = Date.UTC(acuan.getUTCFullYear(), acuan.getUTCMonth() - i, 1) - 7 * JAM;
    const akhir = Date.UTC(acuan.getUTCFullYear(), acuan.getUTCMonth() - i + 1, 1) - 7 * JAM;
    const total = semua.filter((l) => {
      const t = new Date(l.dibuatPada).getTime();
      return t >= awal && t < akhir;
    }).length;
    hasil.push({ bulan: formatBulan(new Date(awal + 7 * JAM)), total });
  }
  return hasil;
}
