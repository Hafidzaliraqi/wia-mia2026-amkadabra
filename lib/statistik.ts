import type { Instansi, Laporan } from "@/lib/types";
import { cariKategori, daftarInstansi, daftarKelompok } from "@/lib/data/referensi";
import { tingkatSaatIni } from "@/lib/eskalasi";
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

// ================================================================
// METRIK PUBLIK untuk halaman Transparansi (bisa difilter per daerah)
// ================================================================
export function metrikPublik(semua: Laporan[], kotaId?: string) {
  const kini = sekarang().getTime();
  const wilayah = kotaId ? semua.filter((l) => l.kotaId === kotaId) : semua;
  const jendela = wilayah.filter((l) => kini - Date.parse(l.dibuatPada) <= 90 * HARI);
  const pertama = (l: Laporan, jenis: string) => l.riwayat.find((k) => k.jenis === jenis)?.waktu;
  const terakhirJenis = (l: Laporan, jenis: string[]) => [...l.riwayat].reverse().find((k) => jenis.includes(k.jenis))?.waktu;
  const rata = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

  const terverifikasi = jendela.filter((l) => pertama(l, "diteruskan"));
  const tuntas = terverifikasi.filter((l) => ["selesai", "ditutup_otomatis"].includes(hitungStatus(l)));
  const dikonfirmasi = tuntas.filter((l) => hitungStatus(l) === "selesai");
  const hariSelesai = tuntas
    .map((l) => terakhirJenis(l, ["ditandai_selesai"]))
    .map((w, i) => (w ? (Date.parse(w) - Date.parse(tuntas[i].dibuatPada)) / HARI : null))
    .filter((x): x is number => x !== null);
  const jamRespons = terverifikasi
    .map((l) => {
      const a = pertama(l, "diteruskan");
      const b = pertama(l, "diproses");
      return a && b ? (Date.parse(b) - Date.parse(a)) / 3_600_000 : null;
    })
    .filter((x): x is number => x !== null);
  const tanpaEskalasi = tuntas.filter((l) => !l.riwayat.some((k) => k.jenis === "eskalasi" && k.aktor === "Sistem"));

  const aktif = wilayah.filter((l) => ["terkirim", "diteruskan", "diproses"].includes(hitungStatus(l)));
  const eskalasi = [1, 2, 3].map((t) => aktif.filter((l) => tingkatSaatIni(l) === t).length);

  const MINGGU = 7 * HARI;
  const mingguan = Array.from({ length: 12 }, (_, i) => {
    const awal = kini - (12 - i) * MINGGU;
    const akhir = awal + MINGGU;
    const dalam = (w?: string) => !!w && Date.parse(w) >= awal && Date.parse(w) < akhir;
    return {
      awal: new Date(awal).toISOString(),
      masuk: wilayah.filter((l) => dalam(l.dibuatPada)).length,
      tuntas: wilayah.filter((l) => dalam(terakhirJenis(l, ["dikonfirmasi_beres", "ditutup_otomatis"]))).length,
    };
  });

  const perKelompok = daftarKelompok.map((g) => {
    const milik = terverifikasi.filter((l) => cariKategori(l.kategoriId).kelompok === g.id);
    const selesai = milik.filter((l) => ["selesai", "ditutup_otomatis"].includes(hitungStatus(l))).length;
    return { id: g.id, nama: g.nama, masuk: milik.length, persenTuntas: milik.length ? Math.round((selesai / milik.length) * 100) : null };
  });

  return {
    masuk: jendela.length,
    terverifikasi: terverifikasi.length,
    persenTuntas: terverifikasi.length ? Math.round((tuntas.length / terverifikasi.length) * 100) : null,
    persenDikonfirmasi: tuntas.length ? Math.round((dikonfirmasi.length / tuntas.length) * 100) : null,
    rataHariSelesai: rata(hariSelesai),
    rataJamRespons: rata(jamRespons),
    persenTanpaEskalasi: tuntas.length ? Math.round((tanpaEskalasi.length / tuntas.length) * 100) : null,
    eskalasi,
    mingguan,
    perKelompok,
  };
}
