import type { Instansi, Laporan } from "@/lib/types";
import { ambilSemuaLaporan } from "@/lib/data";
import { cariKategori, daftarInstansi } from "@/lib/data/referensi";
import { apakahTerlambat, hitungStatus } from "@/lib/sla";
import { HARI, JAM, formatBulan, sekarang, tambahHariKerja } from "@/lib/waktu";

function waktuPertama(laporan: Laporan, jenis: string): Date | null {
  const kejadian = laporan.riwayat.find((k) => k.jenis === jenis);
  return kejadian ? new Date(kejadian.waktu) : null;
}

function rataRata(angka: number[]): number | null {
  if (angka.length === 0) return null;
  return angka.reduce((a, b) => a + b, 0) / angka.length;
}

function persen(bagian: number, total: number): number | null {
  return total === 0 ? null : Math.round((bagian / total) * 100);
}

// Apakah putaran pertama pengerjaan selesai sebelum batas waktunya
function selesaiTepatWaktu(laporan: Laporan): boolean | null {
  const mulai = waktuPertama(laporan, "diproses");
  const selesai = waktuPertama(laporan, "ditandai_selesai");
  if (!mulai || !selesai) return null;
  let batas = tambahHariKerja(mulai, cariKategori(laporan.kategoriId).slaHariKerja);
  const perpanjangan = laporan.riwayat.find(
    (k) => k.jenis === "perpanjangan" && new Date(k.waktu) < selesai,
  );
  if (perpanjangan?.batasBaru) batas = new Date(perpanjangan.batasBaru);
  return selesai <= batas;
}

export function ringkasanBeranda() {
  const semua = ambilSemuaLaporan();
  const batas30Hari = sekarang().getTime() - 30 * HARI;
  const masuk30Hari = semua.filter((l) => new Date(l.dibuatPada).getTime() >= batas30Hari);

  const ditutup = semua.filter((l) => {
    const status = hitungStatus(l);
    return status === "selesai" || status === "ditutup_otomatis";
  });
  const dikonfirmasi = ditutup.filter((l) => hitungStatus(l) === "selesai");

  const lamaSelesai = semua
    .map((l) => {
      const selesai = waktuPertama(l, "ditandai_selesai");
      return selesai ? (selesai.getTime() - new Date(l.dibuatPada).getTime()) / HARI : null;
    })
    .filter((n): n is number => n !== null);

  return {
    masuk30Hari: masuk30Hari.length,
    persenDikonfirmasi: persen(dikonfirmasi.length, ditutup.length),
    rataHariSelesai: rataRata(lamaSelesai),
    terlambatSekarang: semua.filter(apakahTerlambat).length,
  };
}

export function wilayahTerbanyak(jumlah = 5) {
  const batas30Hari = sekarang().getTime() - 30 * HARI;
  const hitungan = new Map<string, number>();
  for (const l of ambilSemuaLaporan()) {
    if (new Date(l.dibuatPada).getTime() < batas30Hari) continue;
    hitungan.set(l.kecamatan, (hitungan.get(l.kecamatan) ?? 0) + 1);
  }
  return [...hitungan.entries()]
    .map(([kecamatan, total]) => ({ kecamatan, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, jumlah);
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

export function raporInstansi(): RaporInstansi[] {
  const semua = ambilSemuaLaporan().filter((l) => hitungStatus(l) !== "ditolak");

  return daftarInstansi.map((instansi) => {
    const milik = semua.filter((l) => l.instansiId === instansi.id);

    const selesai = milik.filter((l) => {
      const status = hitungStatus(l);
      return status === "selesai" || status === "ditutup_otomatis";
    });

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
    const dibukaUlang = sudahDitandai.filter((l) => l.riwayat.some((k) => k.jenis === "dibuka_ulang"));

    return {
      instansi,
      masuk: milik.length,
      persenSelesai: persen(selesai.length, milik.length),
      rataJamRespons: rataRata(jamRespons),
      rataHariPenyelesaian: rataRata(hariPenyelesaian),
      persenTepatWaktu: persen(ketepatan.filter(Boolean).length, ketepatan.length),
      persenDibukaUlang: persen(dibukaUlang.length, sudahDitandai.length),
      terlambatSekarang: milik.filter(apakahTerlambat).length,
    };
  });
}

export function laporanPerBulan(jumlahBulan = 3) {
  const hasil: { bulan: string; total: number }[] = [];
  const acuan = new Date(sekarang().getTime() + 7 * JAM);
  for (let i = jumlahBulan - 1; i >= 0; i--) {
    const tahun = acuan.getUTCFullYear();
    const bulan = acuan.getUTCMonth() - i;
    const awal = Date.UTC(tahun, bulan, 1) - 7 * JAM;
    const akhir = Date.UTC(tahun, bulan + 1, 1) - 7 * JAM;
    const total = ambilSemuaLaporan().filter((l) => {
      const t = new Date(l.dibuatPada).getTime();
      return t >= awal && t < akhir;
    }).length;
    hasil.push({ bulan: formatBulan(new Date(awal + 7 * JAM)), total });
  }
  return hasil;
}
