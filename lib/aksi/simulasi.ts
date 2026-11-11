"use server";

import { refresh } from "next/cache";
import { kueri, transaksi } from "@/lib/server/db";
import { ambilLaporan } from "@/lib/server/laporan";
import { beritahu } from "@/lib/server/notifikasi";
import { cariInstansi, instansiTujuan } from "@/lib/data/referensi";
import { tanggaEskalasi, tingkatSaatIni } from "@/lib/eskalasi";
import { hitungStatus } from "@/lib/sla";
import { situs } from "@/lib/site";
import { JAM, tanggalWib } from "@/lib/waktu";
import { gagal, nomorValid, type HasilAksi } from "@/lib/aksi/bantu";

// ================================================================
// SIMULASI ALUR untuk presentasi: satu klik per tahap.
// Hanya bisa mengubah laporan yang dibuat sebagai simulasi.
// ================================================================

async function akun(email: string) {
  const [baris] = await kueri<{ id: string; nama: string }>("SELECT id, nama FROM pengguna WHERE email = $1", [email]);
  return baris ?? null;
}

async function laporanSimulasi(nomor: string) {
  if (!nomorValid(nomor)) return null;
  const [baris] = await kueri<{ simulasi: boolean }>("SELECT simulasi FROM laporan WHERE nomor = $1", [nomor]);
  if (!baris?.simulasi) return null;
  return ambilLaporan(nomor);
}

export async function mulaiSimulasi(): Promise<HasilAksi<{ nomor: string }>> {
  const [{ jumlah }] = await kueri<{ jumlah: number }>(
    "SELECT count(*)::int AS jumlah FROM laporan WHERE simulasi AND dibuat_pada > now() - interval '1 hour'",
  );
  if (jumlah >= 30) return gagal("Terlalu banyak simulasi dalam 1 jam terakhir. Coba lagi nanti.");
  const warga = await akun("warga@demo.id");
  if (!warga) return gagal("Akun demo belum tersedia.");
  const instansi = instansiTujuan("jalan-rusak", "jaksel");
  const wib = new Date(Date.now() + 7 * JAM);
  const awalan = `${situs.kodeLaporan}-${String(wib.getUTCFullYear() % 100).padStart(2, "0")}${String(wib.getUTCMonth() + 1).padStart(2, "0")}-`;

  for (let percobaan = 0; percobaan < 3; percobaan++) {
    try {
      const nomor = await transaksi(async (k) => {
        const [{ terakhir }] = await k<{ terakhir: number }>(
          "SELECT coalesce(max(right(nomor, 4)::int), 100) AS terakhir FROM laporan WHERE nomor LIKE $1",
          [`${awalan}%`],
        );
        const nomorBaru = `${awalan}${String(Number(terakhir) + 1).padStart(4, "0")}`;
        await k(
          `INSERT INTO laporan (nomor, kategori_id, judul, deskripsi, alamat, kota_id, kecamatan, lat, lng,
           tanggal_kejadian, pelapor_id, nama_pelapor, visibilitas, instansi_id, simulasi)
           VALUES ($1, 'jalan-rusak', 'Jalan berlubang di Jl. Tebet Raya', $2, 'Jl. Tebet Raya No. 20, depan apotek', 'jaksel', 'Tebet',
           -6.2264, 106.8559, $3, $4, $5, 'publik', $6, true)`,
          [
            nomorBaru,
            "Lubang dalam di lajur kiri depan apotek, sudah dua minggu. Motor sering oleng saat malam karena tidak ada penerangan.",
            tanggalWib(new Date()),
            warga.id,
            warga.nama,
            instansi.id,
          ],
        );
        await k("INSERT INTO kejadian (nomor, jenis, aktor, aktor_id) VALUES ($1, 'dibuat', 'Pelapor', $2)", [nomorBaru, warga.id]);
        return nomorBaru;
      });
      return { ok: true, nomor };
    } catch (galat) {
      if (String((galat as Error).message).includes("duplicate key") && percobaan < 2) continue;
      console.error(galat);
      return gagal("Simulasi gagal dimulai.");
    }
  }
  return gagal("Simulasi gagal dimulai.");
}

export async function majukanSimulasi(nomor: string): Promise<HasilAksi> {
  const laporan = await laporanSimulasi(nomor);
  if (!laporan) return gagal("Laporan simulasi tidak ditemukan.");
  const status = hitungStatus(laporan);
  const instansi = cariInstansi(laporan.instansiId);
  const [admin, warga] = await Promise.all([akun("admin@demo.id"), akun("warga@demo.id")]);
  const [petugas] = await kueri<{ id: string }>("SELECT id FROM pengguna WHERE peran = 'petugas' AND instansi_id = $1 LIMIT 1", [instansi.id]);

  await transaksi(async (k) => {
    if (status === "terkirim") {
      await k("INSERT INTO kejadian (nomor, jenis, aktor, aktor_id) VALUES ($1, 'diverifikasi', 'Admin verifikator', $2)", [nomor, admin?.id ?? null]);
      await k("INSERT INTO kejadian (nomor, jenis, aktor, catatan) VALUES ($1, 'diteruskan', 'Sistem', $2)", [
        nomor,
        `Diteruskan otomatis ke ${instansi.nama} berdasarkan kategori dan lokasi.`,
      ]);
      await beritahu(k, nomor, { judul: "Laporan diverifikasi", isi: `Diteruskan ke ${instansi.nama}.` }, { warga: true, petugas: true });
    } else if (status === "diteruskan") {
      await k("INSERT INTO kejadian (nomor, jenis, aktor, aktor_id, catatan) VALUES ($1, 'diproses', $2, $3, $4)", [
        nomor, instansi.nama, petugas?.id ?? null, "Laporan diterima dan tim survei dijadwalkan.",
      ]);
      await k("INSERT INTO kejadian (nomor, jenis, aktor, aktor_id, catatan) VALUES ($1, 'balasan', $2, $3, $4)", [
        nomor, instansi.nama, petugas?.id ?? null, "Tim survei datang besok pagi. Material aspal sudah kami siapkan.",
      ]);
      await beritahu(k, nomor, { judul: "Laporan mulai dikerjakan", isi: `${instansi.nama} mulai menangani laporanmu.` }, { warga: true });
    } else if (status === "diproses") {
      await k("INSERT INTO kejadian (nomor, jenis, aktor, aktor_id, catatan) VALUES ($1, 'ditandai_selesai', $2, $3, $4)", [
        nomor, instansi.nama, petugas?.id ?? null, "Lubang sudah ditambal dan diratakan dengan aspal baru.",
      ]);
      await beritahu(k, nomor, { judul: "Masalahnya sudah beres? Konfirmasi kamu dibutuhkan", isi: `${instansi.nama} menandai laporan selesai.` }, { warga: true });
    } else if (status === "menunggu_konfirmasi") {
      await k("INSERT INTO kejadian (nomor, jenis, aktor, aktor_id) VALUES ($1, 'dikonfirmasi_beres', 'Pelapor', $2)", [nomor, warga?.id ?? null]);
      await beritahu(k, nomor, { judul: "Laporan dikonfirmasi selesai", isi: "Pelapor menyatakan masalahnya sudah beres." }, { petugas: true });
    }
  });
  if (!["terkirim", "diteruskan", "diproses", "menunggu_konfirmasi"].includes(status)) return gagal("Simulasi sudah selesai. Mulai simulasi baru.");
  refresh();
  return { ok: true };
}

export async function eskalasiSimulasi(nomor: string): Promise<HasilAksi> {
  const laporan = await laporanSimulasi(nomor);
  if (!laporan) return gagal("Laporan simulasi tidak ditemukan.");
  if (!["diteruskan", "diproses"].includes(hitungStatus(laporan))) return gagal("Eskalasi bisa disimulasikan saat laporan menunggu respons atau sedang dikerjakan.");
  const tingkat = tingkatSaatIni(laporan) + 1;
  if (tingkat > 3) return gagal("Laporan sudah sampai tingkat tertinggi.");
  const tujuan = tanggaEskalasi(laporan)[tingkat].nama;
  const isi = `Simulasi lewat batas waktu. Dieskalasi ke ${tujuan}.`;
  await transaksi(async (k) => {
    await k("INSERT INTO kejadian (nomor, jenis, aktor, catatan, tingkat) VALUES ($1, 'eskalasi', 'Sistem', $2, $3)", [nomor, isi, tingkat]);
    await beritahu(k, nomor, { judul: "Laporan dieskalasi", isi }, { warga: true, petugas: true });
  });
  refresh();
  return { ok: true };
}
