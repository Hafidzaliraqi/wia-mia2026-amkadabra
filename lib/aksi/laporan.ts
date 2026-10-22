"use server";

import { refresh } from "next/cache";
import type { Visibilitas } from "@/lib/types";
import { kueri, transaksi } from "@/lib/server/db";
import { ambilLaporan } from "@/lib/server/laporan";
import { beritahu } from "@/lib/server/notifikasi";
import { BATAS_BUKA_ULANG_HARI, cariKategori, instansiTujuan, kategoriValid } from "@/lib/data/referensi";
import { hitungStatus } from "@/lib/sla";
import { situs } from "@/lib/site";
import { cariKota, kecamatanValid } from "@/lib/wilayah";
import { HARI, JAM, tanggalWib } from "@/lib/waktu";
import { gagal, nomorValid, teks, wajibMasuk, type HasilAksi } from "@/lib/aksi/bantu";

const TIPE_FOTO = ["image/jpeg", "image/png", "image/webp"];
const MAKS_FOTO = 3;
const MAKS_BYTE_FOTO = 3 * 1024 * 1024;
const STATUS_AKTIF = ["terkirim", "diteruskan", "diproses", "menunggu_konfirmasi"];

function angkaAtauNull(nilai: FormDataEntryValue | undefined): number | null {
  const n = Number(nilai);
  return typeof nilai === "string" && nilai !== "" && Number.isFinite(n) ? n : null;
}

// ---------------- buat laporan ----------------

export async function buatLaporan(form: FormData): Promise<HasilAksi<{ nomor: string }>> {
  const pengguna = await wajibMasuk(["warga"]);
  if ("ok" in pengguna) return pengguna;

  const lat = Number(form.get("lat"));
  const lng = Number(form.get("lng"));
  const alamat = teks(form.get("alamat"));
  const kotaId = teks(form.get("kotaId"));
  const kecamatan = teks(form.get("kecamatan"));
  const kategoriId = teks(form.get("kategoriId"));
  const cerita = teks(form.get("cerita"));
  const tanggal = teks(form.get("tanggal"));
  const visibilitas = teks(form.get("visibilitas")) as Visibilitas;

  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -11.5 || lat > 6.5 || lng < 94 || lng > 141.5) {
    return gagal("Titik lokasi tidak valid. Tandai ulang di peta.");
  }
  if (alamat.length < 5 || alamat.length > 200) return gagal("Alamat atau patokan harus 5 sampai 200 karakter.");
  if (!cariKota(kotaId) || !kecamatanValid(kotaId, kecamatan)) return gagal("Pilih kota/kabupaten dan kecamatan yang tersedia.");
  if (!kategoriValid(kategoriId)) return gagal("Pilih jenis masalah.");
  if (cerita.length < 20 || cerita.length > 5000) return gagal("Cerita kejadian harus 20 sampai 5000 karakter.");
  const hariIni = tanggalWib();
  const batasLama = tanggalWib(new Date(Date.now() - 365 * HARI));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal) || tanggal > hariIni || tanggal < batasLama) {
    return gagal("Tanggal kejadian harus dalam satu tahun terakhir dan tidak lebih dari hari ini.");
  }
  if (!["publik", "sembunyikan_nama", "privat"].includes(visibilitas)) return gagal("Pilih siapa yang boleh melihat laporan.");

  const berkas = form.getAll("foto").filter((f): f is File => f instanceof File && f.size > 0);
  if (berkas.length > MAKS_FOTO) return gagal(`Maksimal ${MAKS_FOTO} foto.`);
  for (const f of berkas) {
    if (!TIPE_FOTO.includes(f.type)) return gagal("Foto harus berformat JPG, PNG, atau WEBP.");
    if (f.size > MAKS_BYTE_FOTO) return gagal("Ukuran foto terlalu besar.");
  }
  const waktuFoto = form.getAll("fotoWaktu");
  const latFoto = form.getAll("fotoLat");
  const lngFoto = form.getAll("fotoLng");
  const isiFoto = await Promise.all(berkas.map(async (f) => new Uint8Array(await f.arrayBuffer())));

  const kategori = cariKategori(kategoriId);
  const instansi = instansiTujuan(kategoriId, kotaId);
  const wib = new Date(Date.now() + 7 * JAM);
  const awalan = `${situs.kodeLaporan}-${String(wib.getUTCFullYear() % 100).padStart(2, "0")}${String(wib.getUTCMonth() + 1).padStart(2, "0")}-`;
  const judul = `${kategori.nama} di ${alamat.split(",")[0].trim()}`.slice(0, 120);

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
           tanggal_kejadian, pelapor_id, nama_pelapor, visibilitas, instansi_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
          [nomorBaru, kategoriId, judul, cerita, alamat, kotaId, kecamatan, lat, lng, tanggal, pengguna.id, pengguna.nama, visibilitas, instansi.id],
        );
        await k("INSERT INTO kejadian (nomor, jenis, aktor, aktor_id) VALUES ($1, 'dibuat', 'Pelapor', $2)", [nomorBaru, pengguna.id]);
        for (let i = 0; i < berkas.length; i++) {
          const waktu = teks(waktuFoto[i]);
          await k(
            "INSERT INTO foto (nomor, jenis, tipe, data, diambil_pada, lat, lng) VALUES ($1, 'awal', $2, $3, $4, $5, $6)",
            [nomorBaru, berkas[i].type, isiFoto[i], waktu && !Number.isNaN(Date.parse(waktu)) ? new Date(waktu) : null, angkaAtauNull(latFoto[i]), angkaAtauNull(lngFoto[i])],
          );
        }
        return nomorBaru;
      });
      return { ok: true, nomor };
    } catch (galat) {
      // Nomor bentrok karena dua laporan dikirim bersamaan: coba lagi
      if (String((galat as Error).message).includes("duplicate key") && percobaan < 2) continue;
      console.error(galat);
      return gagal("Laporan gagal disimpan. Coba kirim lagi.");
    }
  }
  return gagal("Laporan gagal disimpan. Coba kirim lagi.");
}

// ---------------- dukungan ----------------

export async function alihkanDukungan(nomor: string): Promise<HasilAksi<{ didukung: boolean }>> {
  const pengguna = await wajibMasuk(["warga"]);
  if ("ok" in pengguna) return pengguna;
  if (!nomorValid(nomor)) return gagal("Laporan tidak ditemukan.");
  const laporan = await ambilLaporan(nomor);
  if (!laporan || laporan.visibilitas === "privat") return gagal("Laporan tidak ditemukan.");
  if (laporan.pelaporId === pengguna.id) return gagal("Ini laporanmu sendiri, jadi kamu otomatis mengikuti perkembangannya.");
  if (!STATUS_AKTIF.includes(hitungStatus(laporan))) return gagal("Laporan ini sudah selesai, jadi tidak bisa didukung lagi.");

  const dihapus = await kueri("DELETE FROM dukungan WHERE pengguna_id = $1 AND nomor = $2 RETURNING nomor", [pengguna.id, nomor]);
  if (dihapus.length === 0) {
    await kueri("INSERT INTO dukungan (pengguna_id, nomor) VALUES ($1, $2) ON CONFLICT DO NOTHING", [pengguna.id, nomor]);
  }
  refresh();
  return { ok: true, didukung: dihapus.length === 0 };
}

// ---------------- konfirmasi penyelesaian ----------------

async function pihakBerhak(nomor: string, penggunaId: string, pelaporId: string | null) {
  if (pelaporId === penggunaId) return "Pelapor";
  const [ada] = await kueri("SELECT 1 FROM dukungan WHERE pengguna_id = $1 AND nomor = $2", [penggunaId, nomor]);
  return ada ? "Warga pendukung" : null;
}

export async function konfirmasiPenyelesaian(nomor: string, hasil: "beres" | "belum", alasan: string): Promise<HasilAksi> {
  const pengguna = await wajibMasuk(["warga"]);
  if ("ok" in pengguna) return pengguna;
  if (!nomorValid(nomor)) return gagal("Laporan tidak ditemukan.");
  const laporan = await ambilLaporan(nomor);
  if (!laporan) return gagal("Laporan tidak ditemukan.");
  if (hitungStatus(laporan) !== "menunggu_konfirmasi") return gagal("Laporan ini sedang tidak menunggu konfirmasi.");
  const aktor = await pihakBerhak(nomor, pengguna.id, laporan.pelaporId);
  if (!aktor) return gagal("Hanya pelapor dan warga pendukung yang bisa mengonfirmasi. Dukung laporan ini dulu.");
  const catatan = alasan.trim();
  if (hasil === "belum" && catatan.length < 10) return gagal("Tulis minimal 10 karakter tentang bagian yang belum beres.");

  await transaksi(async (k) => {
    await k("INSERT INTO kejadian (nomor, jenis, aktor, aktor_id, catatan) VALUES ($1, $2, $3, $4, $5)", [
      nomor,
      hasil === "beres" ? "dikonfirmasi_beres" : "dibuka_ulang",
      aktor,
      pengguna.id,
      catatan || null,
    ]);
    await beritahu(
      k,
      nomor,
      hasil === "beres"
        ? { judul: "Laporan dikonfirmasi selesai", isi: `${aktor} menyatakan masalahnya sudah beres.` }
        : { judul: "Laporan dibuka ulang", isi: `${aktor}: "${catatan.slice(0, 120)}"` },
      { warga: true, petugas: true, kecuali: pengguna.id },
    );
  });
  refresh();
  return { ok: true };
}

export async function bukaUlangLaporan(nomor: string, alasan: string): Promise<HasilAksi> {
  const pengguna = await wajibMasuk(["warga"]);
  if ("ok" in pengguna) return pengguna;
  if (!nomorValid(nomor)) return gagal("Laporan tidak ditemukan.");
  const laporan = await ambilLaporan(nomor);
  if (!laporan || hitungStatus(laporan) !== "ditutup_otomatis") return gagal("Laporan ini tidak bisa dibuka ulang.");
  const ditutup = laporan.riwayat.findLast((k) => k.jenis === "ditutup_otomatis");
  if (!ditutup || Date.now() - new Date(ditutup.waktu).getTime() > BATAS_BUKA_ULANG_HARI * HARI) {
    return gagal(`Batas ${BATAS_BUKA_ULANG_HARI} hari untuk membuka ulang sudah lewat. Silakan buat laporan baru.`);
  }
  const aktor = await pihakBerhak(nomor, pengguna.id, laporan.pelaporId);
  if (!aktor) return gagal("Hanya pelapor dan warga pendukung yang bisa membuka ulang laporan ini.");
  if (alasan.trim().length < 10) return gagal("Tulis minimal 10 karakter tentang bagian yang belum beres.");

  await transaksi(async (k) => {
    await k("INSERT INTO kejadian (nomor, jenis, aktor, aktor_id, catatan) VALUES ($1, 'dibuka_ulang', $2, $3, $4)", [
      nomor,
      aktor,
      pengguna.id,
      alasan.trim(),
    ]);
    await beritahu(k, nomor, { judul: "Laporan dibuka ulang", isi: `${aktor}: "${alasan.trim().slice(0, 120)}"` }, {
      warga: true,
      petugas: true,
      kecuali: pengguna.id,
    });
  });
  refresh();
  return { ok: true };
}

export async function tandaiTidakSesuai(nomor: string, alasan: string): Promise<HasilAksi> {
  const pengguna = await wajibMasuk(["warga"]);
  if ("ok" in pengguna) return pengguna;
  if (!nomorValid(nomor)) return gagal("Laporan tidak ditemukan.");
  if (alasan.trim().length < 5) return gagal("Tulis alasan singkatnya.");
  await kueri(
    "INSERT INTO tanda_tidak_sesuai (pengguna_id, nomor, alasan) VALUES ($1, $2, $3) ON CONFLICT (pengguna_id, nomor) DO UPDATE SET alasan = $3",
    [pengguna.id, nomor, alasan.trim().slice(0, 300)],
  );
  return { ok: true };
}
