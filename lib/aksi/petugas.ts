"use server";

import { after } from "next/server";
import { refresh } from "next/cache";
import { transaksi } from "@/lib/server/db";
import { ambilLaporan } from "@/lib/server/laporan";
import { beritahu, kirimEmailTertunda } from "@/lib/server/notifikasi";
import { cariInstansi, daftarInstansi } from "@/lib/data/referensi";
import { hitungStatus, hitungTenggat } from "@/lib/sla";
import { tambahHariKerja } from "@/lib/waktu";
import { gagal, nomorValid, teks, wajibMasuk, type HasilAksi } from "@/lib/aksi/bantu";
import type { Pengguna } from "@/lib/server/sesi";

const TIPE_FOTO = ["image/jpeg", "image/png", "image/webp"];

// Pastikan yang menjalankan aksi adalah petugas dari instansi yang menangani laporan
async function siapkan(nomor: string, statusBoleh: string[]) {
  const pengguna = await wajibMasuk(["petugas"]);
  if ("ok" in pengguna) return pengguna;
  if (!nomorValid(nomor)) return gagal("Laporan tidak ditemukan.");
  const laporan = await ambilLaporan(nomor);
  if (!laporan || laporan.instansiId !== pengguna.instansiId) return gagal("Laporan ini bukan tanggung jawab instansimu.");
  const status = hitungStatus(laporan);
  if (!statusBoleh.includes(status)) return gagal("Status laporan sudah berubah. Muat ulang halaman.");
  return { pengguna: pengguna as Pengguna, laporan, instansi: cariInstansi(laporan.instansiId) };
}

export async function terimaLaporan(nomor: string, catatan: string): Promise<HasilAksi> {
  const siap = await siapkan(nomor, ["diteruskan"]);
  if ("ok" in siap) return siap;
  const isi = catatan.trim() || "Laporan diterima dan petugas dijadwalkan menangani.";
  await transaksi(async (k) => {
    await k("INSERT INTO kejadian (nomor, jenis, aktor, aktor_id, catatan) VALUES ($1, 'diproses', $2, $3, $4)", [
      nomor, siap.instansi.nama, siap.pengguna.id, isi,
    ]);
    await beritahu(k, nomor, { judul: "Laporan mulai dikerjakan", isi: `${siap.instansi.nama}: ${isi}` }, { warga: true });
  });
  refresh();
  return { ok: true };
}

export async function kirimBalasan(nomor: string, catatan: string): Promise<HasilAksi> {
  const siap = await siapkan(nomor, ["diteruskan", "diproses", "menunggu_konfirmasi"]);
  if ("ok" in siap) return siap;
  if (catatan.trim().length < 2) return gagal("Pesan masih kosong.");
  if (catatan.trim().length > 1000) return gagal("Pesan maksimal 1000 karakter.");
  await transaksi(async (k) => {
    await k("INSERT INTO kejadian (nomor, jenis, aktor, aktor_id, catatan) VALUES ($1, 'balasan', $2, $3, $4)", [
      nomor, siap.instansi.nama, siap.pengguna.id, catatan.trim(),
    ]);
    await beritahu(k, nomor, { judul: `Pesan dari ${siap.instansi.singkatan}`, isi: catatan.trim().slice(0, 140) }, { warga: true });
  });
  refresh();
  return { ok: true };
}

export async function mintaPerpanjangan(nomor: string, hari: number, alasan: string): Promise<HasilAksi> {
  const siap = await siapkan(nomor, ["diproses"]);
  if ("ok" in siap) return siap;
  if (!Number.isInteger(hari) || hari < 1 || hari > 30) return gagal("Perpanjangan 1 sampai 30 hari kerja.");
  if (alasan.trim().length < 10) return gagal("Tulis alasan perpanjangan minimal 10 karakter.");
  const tenggat = hitungTenggat(siap.laporan)!;
  if (siap.laporan.riwayat.some((k) => k.jenis === "perpanjangan" && k.waktu >= tenggat.mulai)) {
    return gagal("Perpanjangan hanya bisa diminta sekali untuk setiap putaran pengerjaan.");
  }
  const batasBaru = tambahHariKerja(new Date(tenggat.batas), hari);
  await transaksi(async (k) => {
    await k(
      "INSERT INTO kejadian (nomor, jenis, aktor, aktor_id, catatan, batas_baru) VALUES ($1, 'perpanjangan', $2, $3, $4, $5)",
      [nomor, siap.instansi.nama, siap.pengguna.id, alasan.trim(), batasBaru],
    );
    await beritahu(k, nomor, { judul: "Batas waktu diperpanjang", isi: `Alasan: ${alasan.trim().slice(0, 120)}` }, { warga: true });
  });
  refresh();
  return { ok: true };
}

export async function alihkanLaporan(nomor: string, instansiIdBaru: string, alasan: string): Promise<HasilAksi> {
  const siap = await siapkan(nomor, ["diteruskan", "diproses"]);
  if ("ok" in siap) return siap;
  const baru = daftarInstansi.find((i) => i.id === instansiIdBaru);
  if (!baru || baru.id === siap.instansi.id || baru.kotaId !== siap.instansi.kotaId) {
    return gagal("Pilih instansi lain di wilayah yang sama.");
  }
  if (alasan.trim().length < 10) return gagal("Tulis alasan pengalihan minimal 10 karakter.");
  await transaksi(async (k) => {
    await k("UPDATE laporan SET instansi_id = $2 WHERE nomor = $1", [nomor, baru.id]);
    await k("INSERT INTO kejadian (nomor, jenis, aktor, aktor_id, catatan) VALUES ($1, 'dialihkan', $2, $3, $4)", [
      nomor, siap.instansi.nama, siap.pengguna.id, `${alasan.trim()} Laporan dialihkan ke ${baru.nama}.`,
    ]);
    await beritahu(k, nomor, { judul: "Laporan dialihkan", isi: `Sekarang ditangani ${baru.nama}.` }, { warga: true, petugas: true });
  });
  refresh();
  return { ok: true };
}

export async function tandaiSelesai(form: FormData): Promise<HasilAksi> {
  const nomor = teks(form.get("nomor"));
  const siap = await siapkan(nomor, ["diproses"]);
  if ("ok" in siap) return siap;
  const catatan = teks(form.get("catatan"));
  if (catatan.length < 10) return gagal("Jelaskan pekerjaan yang sudah dilakukan, minimal 10 karakter.");
  const berkas = form.getAll("foto").filter((f): f is File => f instanceof File && f.size > 0);
  if (berkas.length === 0) return gagal("Lampirkan minimal satu foto sesudah pekerjaan.");
  if (berkas.length > 3) return gagal("Maksimal 3 foto.");
  for (const f of berkas) {
    if (!TIPE_FOTO.includes(f.type) || f.size > 3 * 1024 * 1024) return gagal("Foto harus JPG/PNG/WEBP dan tidak terlalu besar.");
  }
  const isiFoto = await Promise.all(berkas.map(async (f) => new Uint8Array(await f.arrayBuffer())));

  const email = await transaksi(async (k) => {
    for (let i = 0; i < berkas.length; i++) {
      await k("INSERT INTO foto (nomor, jenis, tipe, data) VALUES ($1, 'sesudah', $2, $3)", [nomor, berkas[i].type, isiFoto[i]]);
    }
    await k("INSERT INTO kejadian (nomor, jenis, aktor, aktor_id, catatan) VALUES ($1, 'ditandai_selesai', $2, $3, $4)", [
      nomor, siap.instansi.nama, siap.pengguna.id, catatan,
    ]);
    return beritahu(
      k,
      nomor,
      {
        judul: "Masalahnya sudah beres? Konfirmasi kamu dibutuhkan",
        isi: `${siap.instansi.nama} menandai laporan ${nomor} selesai. Cek lokasinya, lalu konfirmasi dalam 10 hari.`,
      },
      { warga: true, email: true },
    );
  });
  after(() => kirimEmailTertunda(email));
  refresh();
  return { ok: true };
}
