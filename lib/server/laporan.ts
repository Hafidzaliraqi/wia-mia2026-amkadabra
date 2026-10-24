import "server-only";
import { cache } from "react";
import type { FotoLaporan, JenisKejadian, Kejadian, KategoriId, Laporan, RingkasanLaporan, Visibilitas } from "@/lib/types";
import { kueri, transaksi } from "@/lib/server/db";
import { beritahu } from "@/lib/server/notifikasi";
import { cariInstansi, cariKategori } from "@/lib/data/referensi";
import { apakahTerlambat, hitungStatus, hitungTenggat } from "@/lib/sla";
import { labelStatus } from "@/lib/status";
import { namaKota } from "@/lib/wilayah";
import { formatRelatif, formatSisaWaktu } from "@/lib/waktu";

function iso(nilai: unknown): string {
  return new Date(nilai as string).toISOString();
}

async function muatLaporan(nomor?: string): Promise<Laporan[]> {
  const syarat = nomor ? "WHERE l.nomor = $1" : "";
  const parameter = nomor ? [nomor] : [];
  const [baris, kejadian, foto] = await Promise.all([
    kueri(
      `SELECT l.*, l.dukungan_awal + (SELECT count(*)::int FROM dukungan d WHERE d.nomor = l.nomor) AS total_dukungan
       FROM laporan l ${syarat} ORDER BY l.dibuat_pada DESC`,
      parameter,
    ),
    kueri(
      `SELECT nomor, jenis, waktu, aktor, aktor_id, catatan, batas_baru FROM kejadian ${nomor ? "WHERE nomor = $1" : ""} ORDER BY waktu, id`,
      parameter,
    ),
    kueri(
      `SELECT id, nomor, jenis, diambil_pada, lat, lng FROM foto ${nomor ? "WHERE nomor = $1" : ""} ORDER BY dibuat_pada`,
      parameter,
    ),
  ]);

  const riwayatPer = new Map<string, Kejadian[]>();
  for (const k of kejadian) {
    const daftar = riwayatPer.get(k.nomor as string) ?? [];
    daftar.push({
      jenis: k.jenis as JenisKejadian,
      waktu: iso(k.waktu),
      aktor: k.aktor as string,
      ...(k.catatan ? { catatan: k.catatan as string } : {}),
      ...(k.batas_baru ? { batasBaru: iso(k.batas_baru) } : {}),
      ...(k.aktor_id ? { aktorId: String(k.aktor_id) } : {}),
    });
    riwayatPer.set(k.nomor as string, daftar);
  }
  const fotoPer = new Map<string, FotoLaporan[]>();
  for (const f of foto) {
    const daftar = fotoPer.get(f.nomor as string) ?? [];
    daftar.push({
      id: f.id as string,
      jenis: f.jenis as FotoLaporan["jenis"],
      diambilPada: f.diambil_pada ? iso(f.diambil_pada) : null,
      lat: (f.lat as number | null) ?? null,
      lng: (f.lng as number | null) ?? null,
    });
    fotoPer.set(f.nomor as string, daftar);
  }

  return baris.map((b) => ({
    nomor: b.nomor as string,
    kategoriId: b.kategori_id as KategoriId,
    judul: b.judul as string,
    deskripsi: b.deskripsi as string,
    alamat: b.alamat as string,
    kotaId: b.kota_id as string,
    kecamatan: b.kecamatan as string,
    lat: (b.lat as number | null) ?? null,
    lng: (b.lng as number | null) ?? null,
    tanggalKejadian: new Date(b.tanggal_kejadian as string).toISOString().slice(0, 10),
    dibuatPada: iso(b.dibuat_pada),
    pelaporId: (b.pelapor_id as string | null) ?? null,
    namaPelapor: b.nama_pelapor as string,
    visibilitas: b.visibilitas as Visibilitas,
    instansiId: b.instansi_id as string,
    dukungan: Number(b.total_dukungan),
    adaFotoContoh: Boolean(b.foto_contoh),
    foto: fotoPer.get(b.nomor as string) ?? [],
    riwayat: riwayatPer.get(b.nomor as string) ?? [],
    sorotan: Boolean(b.sorotan),
  }));
}

// ---------------- tugas otomatis ----------------
// Menutup laporan yang tidak dikonfirmasi 10 hari dan mengeskalasi laporan
// yang lewat batas waktu. Di sistem besar ini dijalankan cron; di sini
// dijalankan saat data dibaca, maksimal sekali per menit.

const penanda = globalThis as unknown as { __tugasTuntasin?: number };

async function jalankanTugasOtomatis() {
  if (Date.now() - (penanda.__tugasTuntasin ?? 0) < 60_000) return;
  penanda.__tugasTuntasin = Date.now();

  const sekarang = new Date();
  const kejadianBaru: { nomor: string; jenis: JenisKejadian; waktu: Date; catatan: string }[] = [];
  for (const l of await muatLaporan()) {
    const tenggat = hitungTenggat(l);
    if (!tenggat || new Date(tenggat.batas) > sekarang) continue;
    if (!tenggat.tanggungJawabPetugas) {
      kejadianBaru.push({
        nomor: l.nomor,
        jenis: "ditutup_otomatis",
        waktu: new Date(tenggat.batas),
        catatan: "Tidak ada konfirmasi dari pelapor dan pendukung dalam 10 hari.",
      });
      continue;
    }
    const sudahEskalasi = l.riwayat.some((k) => k.jenis === "eskalasi" && k.waktu >= tenggat.mulai);
    if (!sudahEskalasi) {
      kejadianBaru.push({
        nomor: l.nomor,
        jenis: "eskalasi",
        waktu: new Date(tenggat.batas),
        catatan: `Melewati batas ${tenggat.tahap.toLowerCase()}. Laporan dieskalasi ke pengawas.`,
      });
    }
  }
  if (kejadianBaru.length === 0) return;

  await transaksi(async (k) => {
    for (const baru of kejadianBaru) {
      await k("INSERT INTO kejadian (nomor, jenis, waktu, aktor, catatan) VALUES ($1, $2, $3, 'Sistem', $4)", [
        baru.nomor,
        baru.jenis,
        baru.waktu,
        baru.catatan,
      ]);
      await beritahu(
        k,
        baru.nomor,
        baru.jenis === "ditutup_otomatis"
          ? { judul: "Laporan ditutup otomatis", isi: "Tidak ada konfirmasi dalam 10 hari. Kamu masih bisa membukanya ulang selama 30 hari." }
          : { judul: "Laporan lewat batas waktu", isi: "Laporan sudah dieskalasi ke pengawas instansi." },
        { warga: true, petugas: baru.jenis === "eskalasi" },
      );
    }
  });
}

// ---------------- akses data ----------------

// Semua laporan termasuk yang privat. cache() = sekali query per permintaan.
export const ambilSemuaLaporan = cache(async (): Promise<Laporan[]> => {
  await jalankanTugasOtomatis();
  return muatLaporan();
});

export const ambilLaporan = cache(async (nomor: string): Promise<Laporan | null> => {
  await jalankanTugasOtomatis();
  const [laporan] = await muatLaporan(nomor);
  return laporan ?? null;
});

export function bolehDilihat(laporan: Laporan, penggunaId: string | null, peran: string | null) {
  if (laporan.visibilitas !== "privat") return true;
  if (peran === "admin") return true;
  if (peran === "petugas") return true;
  return penggunaId !== null && laporan.pelaporId === penggunaId;
}

export function laporanPublik(semua: Laporan[]) {
  return semua.filter((l) => l.visibilitas !== "privat");
}

export function namaPelaporTampil(laporan: Laporan): string {
  return laporan.visibilitas === "publik" ? laporan.namaPelapor : "Nama disembunyikan";
}

export function ringkas(laporan: Laporan): RingkasanLaporan {
  const status = hitungStatus(laporan);
  const tenggat = hitungTenggat(laporan);
  const kategori = cariKategori(laporan.kategoriId);
  return {
    nomor: laporan.nomor,
    judul: laporan.judul,
    kategoriId: laporan.kategoriId,
    kategoriNama: kategori.nama,
    kelompok: kategori.kelompok,
    alamat: laporan.alamat,
    kotaId: laporan.kotaId,
    kotaNama: namaKota(laporan.kotaId),
    kecamatan: laporan.kecamatan,
    lat: laporan.lat,
    lng: laporan.lng,
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

export async function nomorDidukung(penggunaId: string): Promise<Set<string>> {
  const baris = await kueri<{ nomor: string }>("SELECT nomor FROM dukungan WHERE pengguna_id = $1", [penggunaId]);
  return new Set(baris.map((b) => b.nomor));
}

export async function jumlahTandaTidakSesuai(): Promise<Map<string, number>> {
  const baris = await kueri<{ nomor: string; jumlah: number }>(
    "SELECT nomor, count(*)::int AS jumlah FROM tanda_tidak_sesuai GROUP BY nomor",
  );
  return new Map(baris.map((b) => [b.nomor, b.jumlah]));
}

// Kabar terbaru untuk beranda: siapa melakukan apa pada laporan publik
export function aktivitasTerkini(semua: Laporan[], jumlah = 8) {
  const daftar: { teks: string; waktu: string; tautan: string }[] = [];
  for (const l of laporanPublik(semua)) {
    for (const k of l.riwayat) {
      const instansi = cariInstansi(l.instansiId).singkatan;
      const teks =
        k.jenis === "dibuat" ? `Laporan baru: ${l.judul}`
        : k.jenis === "diproses" ? `${instansi} mulai mengerjakan: ${l.judul}`
        : k.jenis === "ditandai_selesai" ? `${instansi} menandai selesai: ${l.judul}`
        : k.jenis === "dikonfirmasi_beres" ? `Warga mengonfirmasi beres: ${l.judul}`
        : k.jenis === "balasan" ? `${instansi} mengirim kabar: ${l.judul}`
        : null;
      if (teks) daftar.push({ teks, waktu: k.waktu, tautan: `/laporan/${l.nomor}` });
    }
  }
  return daftar
    .sort((a, b) => b.waktu.localeCompare(a.waktu))
    .slice(0, jumlah)
    .map((a) => ({ teks: a.teks, waktuTeks: formatRelatif(a.waktu), tautan: a.tautan }));
}
