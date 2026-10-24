"use server";

import { refresh } from "next/cache";
import { kueri, transaksi } from "@/lib/server/db";
import { ambilLaporan } from "@/lib/server/laporan";
import { beritahu } from "@/lib/server/notifikasi";
import { hashSandi } from "@/lib/server/sandi";
import { daftarInstansi } from "@/lib/data/referensi";
import { apakahTerlambat, hitungStatus } from "@/lib/sla";
import { emailValid, hpValid, periksaSandi, rapikanHp } from "@/lib/validasi";
import { gagal, nomorValid, wajibMasuk, type HasilAksi } from "@/lib/aksi/bantu";

async function siapkanAdmin(nomor: string) {
  const admin = await wajibMasuk(["admin"]);
  if ("ok" in admin) return admin;
  if (!nomorValid(nomor)) return gagal("Laporan tidak ditemukan.");
  const laporan = await ambilLaporan(nomor);
  if (!laporan) return gagal("Laporan tidak ditemukan.");
  return { admin, laporan };
}

export async function verifikasiLaporan(nomor: string, instansiId: string): Promise<HasilAksi> {
  const siap = await siapkanAdmin(nomor);
  if ("ok" in siap) return siap;
  if (hitungStatus(siap.laporan) !== "terkirim") return gagal("Laporan ini sudah diverifikasi atau ditolak.");
  const instansi = daftarInstansi.find((i) => i.id === instansiId);
  if (!instansi || instansi.kotaId !== siap.laporan.kotaId) return gagal("Pilih instansi di wilayah laporan.");
  const diubah = instansi.id !== siap.laporan.instansiId;

  await transaksi(async (k) => {
    await k("UPDATE laporan SET instansi_id = $2 WHERE nomor = $1", [nomor, instansi.id]);
    await k("INSERT INTO kejadian (nomor, jenis, aktor, aktor_id) VALUES ($1, 'diverifikasi', 'Admin verifikator', $2)", [nomor, siap.admin.id]);
    await k("INSERT INTO kejadian (nomor, jenis, aktor, aktor_id, catatan) VALUES ($1, 'diteruskan', $2, $3, $4)", [
      nomor,
      diubah ? "Admin verifikator" : "Sistem",
      diubah ? siap.admin.id : null,
      diubah
        ? `Diteruskan ke ${instansi.nama} oleh admin.`
        : `Diteruskan otomatis ke ${instansi.nama} berdasarkan kategori dan lokasi.`,
    ]);
    await beritahu(k, nomor, { judul: "Laporan diverifikasi", isi: `Diteruskan ke ${instansi.nama}.` }, { warga: true, petugas: true });
  });
  refresh();
  return { ok: true };
}

export async function tolakLaporan(nomor: string, alasan: string, palsu: boolean): Promise<HasilAksi> {
  const siap = await siapkanAdmin(nomor);
  if ("ok" in siap) return siap;
  if (hitungStatus(siap.laporan) !== "terkirim") return gagal("Laporan ini sudah diverifikasi atau ditolak.");
  if (alasan.trim().length < 10) return gagal("Tulis alasan penolakan minimal 10 karakter supaya pelapor paham.");
  await transaksi(async (k) => {
    await k("INSERT INTO kejadian (nomor, jenis, aktor, aktor_id, catatan) VALUES ($1, 'ditolak', 'Admin verifikator', $2, $3)", [
      nomor, siap.admin.id, alasan.trim(),
    ]);
    if (palsu && siap.laporan.pelaporId) {
      await k("UPDATE pengguna SET laporan_palsu = laporan_palsu + 1 WHERE id = $1", [siap.laporan.pelaporId]);
    }
    await beritahu(k, nomor, { judul: "Laporan ditolak", isi: alasan.trim().slice(0, 140) }, { warga: true });
  });
  refresh();
  return { ok: true };
}

export async function tegurInstansi(nomor: string, catatan: string): Promise<HasilAksi> {
  const siap = await siapkanAdmin(nomor);
  if ("ok" in siap) return siap;
  if (!apakahTerlambat(siap.laporan)) return gagal("Laporan ini belum melewati batas waktu.");
  if (catatan.trim().length < 5) return gagal("Tulis isi teguran minimal 5 karakter.");
  const teguranTerakhir = siap.laporan.riwayat.findLast((k) => k.jenis === "eskalasi" && k.aktor === "Admin pengawas");
  if (teguranTerakhir && Date.now() - new Date(teguranTerakhir.waktu).getTime() < 24 * 60 * 60 * 1000) {
    return gagal("Instansi sudah ditegur dalam 24 jam terakhir. Beri waktu untuk merespons.");
  }
  await transaksi(async (k) => {
    await k("INSERT INTO kejadian (nomor, jenis, aktor, aktor_id, catatan) VALUES ($1, 'eskalasi', 'Admin pengawas', $2, $3)", [
      nomor, siap.admin.id, catatan.trim(),
    ]);
    await beritahu(k, nomor, { judul: "Teguran dari pengawas", isi: catatan.trim().slice(0, 140) }, { petugas: true });
  });
  refresh();
  return { ok: true };
}

export async function buatAkunPetugas(data: {
  nama: string;
  email: string;
  hp: string;
  instansiId: string;
  sandi: string;
}): Promise<HasilAksi> {
  const admin = await wajibMasuk(["admin"]);
  if ("ok" in admin) return admin;
  const galat: Record<string, string> = {};
  const email = data.email.trim().toLowerCase();
  const hp = rapikanHp(data.hp);
  if (data.nama.trim().length < 3) galat.nama = "Tulis nama lengkap.";
  if (!emailValid(email)) galat.email = "Format email belum benar.";
  if (!hpValid(hp)) galat.hp = "Nomor HP diawali 08, 10 sampai 13 digit.";
  if (!daftarInstansi.some((i) => i.id === data.instansiId)) galat.instansiId = "Pilih instansi.";
  const galatSandi = periksaSandi(data.sandi);
  if (galatSandi) galat.sandi = galatSandi;
  if (Object.keys(galat).length) return gagal("Periksa lagi isian yang ditandai.", galat);

  const ada = await kueri("SELECT 1 FROM pengguna WHERE email = $1 OR hp = $2", [email, hp]);
  if (ada.length) return gagal("Email atau nomor HP sudah dipakai akun lain.", { email: "Sudah dipakai akun lain." });
  await kueri(
    "INSERT INTO pengguna (nama, email, hp, hash_sandi, peran, instansi_id) VALUES ($1, $2, $3, $4, 'petugas', $5)",
    [data.nama.trim(), email, hp, await hashSandi(data.sandi), data.instansiId],
  );
  refresh();
  return { ok: true };
}

// ---------------- laporan yang ditandai warga ----------------

export async function abaikanTanda(nomor: string): Promise<HasilAksi> {
  const siap = await siapkanAdmin(nomor);
  if ("ok" in siap) return siap;
  await kueri("DELETE FROM tanda_tidak_sesuai WHERE nomor = $1", [nomor]);
  refresh();
  return { ok: true };
}

export async function tutupTidakValid(nomor: string, alasan: string): Promise<HasilAksi> {
  const siap = await siapkanAdmin(nomor);
  if ("ok" in siap) return siap;
  if (!["terkirim", "diteruskan", "diproses", "menunggu_konfirmasi"].includes(hitungStatus(siap.laporan))) {
    return gagal("Laporan ini sudah ditutup.");
  }
  if (alasan.trim().length < 10) return gagal("Tulis alasan minimal 10 karakter. Alasan ditampilkan ke publik.");
  await transaksi(async (k) => {
    await k("INSERT INTO kejadian (nomor, jenis, aktor, aktor_id, catatan) VALUES ($1, 'ditolak', 'Admin verifikator', $2, $3)", [
      nomor, siap.admin.id, `Ditutup karena tidak valid: ${alasan.trim()}`,
    ]);
    await k("DELETE FROM tanda_tidak_sesuai WHERE nomor = $1", [nomor]);
    await beritahu(k, nomor, { judul: "Laporan ditutup admin", isi: alasan.trim().slice(0, 140) }, { warga: true, petugas: true });
  });
  refresh();
  return { ok: true };
}
