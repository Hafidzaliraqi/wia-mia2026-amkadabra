"use server";

import { randomUUID } from "node:crypto";
import { kueri, transaksi } from "@/lib/server/db";
import { emailKodeOtp, emailSiap, kirimEmail } from "@/lib/server/email";
import { kirimWa, waSiap } from "@/lib/server/whatsapp";
import { ambilOtp, buatKode, JEDA_KIRIM_ULANG_DETIK, MASA_BERLAKU_MENIT, periksaKode, simpanOtp } from "@/lib/server/otp";
import { cocokSandi, hashSandi, hashToken } from "@/lib/server/sandi";
import { buatSesi, hapusSesi, penggunaSaatIni } from "@/lib/server/sesi";
import { emailValid, hpValid, periksaSandi, rapikanHp } from "@/lib/validasi";
import { tujuanAman } from "@/lib/tujuan";
import { gagal, type HasilAksi } from "@/lib/aksi/bantu";

const MAKS_GAGAL_MASUK = 5;
const KUNCI_MENIT = 10;

function tujuanSetelahMasuk(peran: string, lanjut: string | null) {
  if (peran === "admin") return lanjut?.startsWith("/admin") ? lanjut : "/admin";
  if (peran === "petugas") return lanjut?.startsWith("/petugas") ? lanjut : "/petugas";
  return tujuanAman(lanjut);
}

const samarkanHp = (hp: string) => `${hp.slice(0, 4)}••••${hp.slice(-3)}`;

// Kirim kode lewat semua saluran yang sudah diatur: WhatsApp (Fonnte) dan email (SMTP).
// Mengembalikan keterangan tujuan untuk ditampilkan ke pengguna.
async function kirimKode(email: string, hp: string | null, nama: string, kode: string, keperluan: string): Promise<string> {
  const tujuan: string[] = [];
  const galat: unknown[] = [];
  if (waSiap() && hp) {
    try {
      await kirimWa(hp, `Kode ${keperluan} Tuntasin: *${kode}*\n\nBerlaku 10 menit. Jangan berikan kode ini kepada siapa pun, termasuk yang mengaku petugas.`);
      tujuan.push(`WhatsApp ${samarkanHp(hp)}`);
    } catch (e) {
      galat.push(e);
    }
  }
  if (emailSiap() || process.env.NODE_ENV !== "production") {
    try {
      const { teks, html } = emailKodeOtp(nama, kode, keperluan);
      await kirimEmail(email, `Kode ${keperluan}: ${kode}`, teks, html);
      tujuan.push(email);
    } catch (e) {
      galat.push(e);
    }
  }
  if (tujuan.length === 0) {
    console.error("Kode verifikasi gagal dikirim:", ...galat);
    throw new Error("Belum ada saluran pengiriman kode yang berhasil (atur SMTP_* atau FONNTE_TOKEN).");
  }
  return tujuan.join(" dan ");
}

// ---------------- daftar ----------------

export async function mulaiDaftar(data: {
  nama: string;
  email: string;
  hp: string;
  sandi: string;
}): Promise<HasilAksi<{ idOtp: string; email: string }>> {
  const nama = data.nama.trim();
  const email = data.email.trim().toLowerCase();
  const hp = rapikanHp(data.hp);
  const galat: Record<string, string> = {};
  if (nama.length < 3) galat.nama = "Tulis nama lengkap, minimal 3 huruf.";
  if (!emailValid(email)) galat.email = "Format email belum benar, contoh: nama@gmail.com.";
  if (!hpValid(hp)) galat.hp = "Nomor HP diawali 08, 10 sampai 13 digit.";
  const galatSandi = periksaSandi(data.sandi);
  if (galatSandi) galat.sandi = galatSandi;
  if (Object.keys(galat).length) return gagal("Periksa lagi isian yang ditandai.", galat);

  const [dipakai] = await kueri<{ email: string; hp: string }>(
    "SELECT email, hp FROM pengguna WHERE email = $1 OR hp = $2 LIMIT 1",
    [email, hp],
  );
  if (dipakai?.email === email) return gagal("Email ini sudah terdaftar.", { email: "Email ini sudah terdaftar. Silakan masuk." });
  if (dipakai) return gagal("Nomor HP ini sudah terdaftar.", { hp: "Nomor HP ini sudah terdaftar. Silakan masuk." });

  const kode = buatKode();
  const idOtp = await simpanOtp(
    kueri,
    { tujuan: "daftar", email, data: { nama, email, hp, hashSandi: await hashSandi(data.sandi) } },
    kode,
  );
  let tujuan: string;
  try {
    tujuan = await kirimKode(email, hp, nama, kode, "verifikasi akun");
  } catch (galatKirim) {
    console.error(galatKirim);
    return gagal("Kode verifikasi gagal dikirim. Coba beberapa saat lagi.");
  }
  return { ok: true, idOtp, email: tujuan };
}

export async function verifikasiDaftar(idOtp: string, kode: string, lanjut: string | null): Promise<HasilAksi<{ tujuan: string; nama: string }>> {
  const hasil = await transaksi(async (k) => {
    const otp = await ambilOtp(k, idOtp);
    if (otp && otp.tujuan !== "daftar") return gagal("Kode tidak berlaku.");
    const salah = await periksaKode(k, otp, kode);
    if (salah) return gagal(salah);
    const d = otp!.data!;
    const ada = await k("SELECT 1 FROM pengguna WHERE email = $1 OR hp = $2", [d.email, d.hp]);
    if (ada.length) return gagal("Email atau nomor HP ini sudah terdaftar. Silakan masuk.");
    const [baru] = await k<{ id: string }>(
      "INSERT INTO pengguna (nama, email, hp, hash_sandi) VALUES ($1, $2, $3, $4) RETURNING id",
      [d.nama, d.email, d.hp, d.hashSandi],
    );
    return { ok: true as const, id: baru.id, nama: d.nama };
  });
  if (!hasil.ok) return hasil;
  await buatSesi(hasil.id);
  return { ok: true, tujuan: tujuanAman(lanjut), nama: hasil.nama };
}

export async function kirimUlangKode(idOtp: string): Promise<HasilAksi<{ jeda: number }>> {
  const otp = await ambilOtp(kueri, idOtp);
  if (!otp || otp.dipakai_pada) return gagal("Sesi verifikasi sudah berakhir. Ulangi dari awal.");
  const lewat = (Date.now() - otp.dikirim_pada.getTime()) / 1000;
  if (lewat < JEDA_KIRIM_ULANG_DETIK) {
    return gagal(`Tunggu ${Math.ceil(JEDA_KIRIM_ULANG_DETIK - lewat)} detik lagi sebelum minta kode baru.`);
  }
  const kode = buatKode();
  await kueri(
    `UPDATE kode_otp SET hash_kode = $2, percobaan = 0, dikirim_pada = now(),
     kedaluwarsa = now() + interval '${MASA_BERLAKU_MENIT} minutes' WHERE id = $1`,
    [otp.id, hashToken(kode)],
  );
  const nama = otp.data?.nama ?? "kamu";
  const hp = (otp.data as { hp?: string } | null)?.hp ?? null;
  try {
    await kirimKode(otp.email, hp, nama, kode, otp.tujuan === "daftar" ? "verifikasi akun" : "atur ulang kata sandi");
  } catch {
    return gagal("Kode gagal dikirim. Coba beberapa saat lagi.");
  }
  return { ok: true, jeda: JEDA_KIRIM_ULANG_DETIK };
}

// ---------------- masuk dan keluar ----------------

export async function masuk(akun: string, sandi: string, lanjut: string | null): Promise<HasilAksi<{ tujuan: string; nama: string }>> {
  const masukan = akun.trim().toLowerCase();
  if (!masukan || !sandi) return gagal("Isi email/nomor HP dan kata sandi.");
  const [baris] = await kueri<{
    id: string;
    nama: string;
    peran: string;
    hash_sandi: string;
    gagal_masuk: number;
    terkunci_sampai: Date | null;
  }>("SELECT id, nama, peran, hash_sandi, gagal_masuk, terkunci_sampai FROM pengguna WHERE email = $1 OR hp = $2", [
    masukan,
    rapikanHp(masukan),
  ]);
  if (!baris) return gagal("Email/nomor HP atau kata sandi salah.");

  if (baris.terkunci_sampai && new Date(baris.terkunci_sampai).getTime() > Date.now()) {
    const menit = Math.ceil((new Date(baris.terkunci_sampai).getTime() - Date.now()) / 60000);
    return gagal(`Terlalu banyak percobaan gagal. Coba lagi dalam ${menit} menit atau atur ulang kata sandi.`);
  }

  if (!(await cocokSandi(sandi, baris.hash_sandi))) {
    const gagalBaru = baris.gagal_masuk + 1;
    const dikunci = gagalBaru >= MAKS_GAGAL_MASUK;
    await kueri(
      `UPDATE pengguna SET gagal_masuk = $2,
       terkunci_sampai = CASE WHEN $3 THEN now() + interval '${KUNCI_MENIT} minutes' ELSE NULL END WHERE id = $1`,
      [baris.id, dikunci ? 0 : gagalBaru, dikunci],
    );
    if (dikunci) return gagal(`Terlalu banyak percobaan gagal. Akun dikunci ${KUNCI_MENIT} menit.`);
    return gagal("Email/nomor HP atau kata sandi salah.");
  }

  await kueri("UPDATE pengguna SET gagal_masuk = 0, terkunci_sampai = NULL WHERE id = $1", [baris.id]);
  await buatSesi(baris.id);
  return { ok: true, tujuan: tujuanSetelahMasuk(baris.peran, lanjut), nama: baris.nama };
}

// Masuk sekali klik ke akun demo, supaya juri bisa mencoba tanpa daftar
const AKUN_DEMO = { warga: "warga@demo.id", petugas: "petugas.dpu@demo.id", admin: "admin@demo.id" } as const;

export async function masukDemo(peran: keyof typeof AKUN_DEMO): Promise<HasilAksi<{ tujuan: string; nama: string }>> {
  const email = AKUN_DEMO[peran];
  if (!email) return gagal("Akun demo tidak dikenal.");
  const [baris] = await kueri<{ id: string; nama: string; peran: string }>("SELECT id, nama, peran FROM pengguna WHERE email = $1", [email]);
  if (!baris) return gagal("Akun demo belum tersedia.");
  await kueri("UPDATE pengguna SET gagal_masuk = 0, terkunci_sampai = NULL WHERE id = $1", [baris.id]);
  await buatSesi(baris.id);
  return { ok: true, tujuan: tujuanSetelahMasuk(baris.peran, null), nama: baris.nama };
}

export async function keluar(): Promise<HasilAksi> {
  await hapusSesi();
  return { ok: true };
}

// ---------------- lupa kata sandi ----------------

export async function mintaAturSandi(akun: string): Promise<HasilAksi<{ idOtp: string; tujuan: string }>> {
  const masukan = akun.trim().toLowerCase();
  if (!masukan) return gagal("Isi email atau nomor HP yang terdaftar.");
  const [baris] = await kueri<{ id: string; nama: string; email: string; hp: string }>(
    "SELECT id, nama, email, hp FROM pengguna WHERE email = $1 OR hp = $2",
    [masukan, rapikanHp(masukan)],
  );
  // Jawaban sama walau akun tidak ada, supaya orang tidak bisa menebak email terdaftar
  if (!baris) return { ok: true, idOtp: randomUUID(), tujuan: "email atau WhatsApp yang terdaftar" };

  const kode = buatKode();
  const idOtp = await simpanOtp(kueri, { tujuan: "atur_sandi", email: baris.email, penggunaId: baris.id, data: { nama: baris.nama, hp: baris.hp } }, kode);
  let tujuan: string;
  try {
    tujuan = await kirimKode(baris.email, baris.hp, baris.nama, kode, "atur ulang kata sandi");
  } catch (galatKirim) {
    console.error(galatKirim);
    return gagal("Kode gagal dikirim. Coba beberapa saat lagi.");
  }
  return { ok: true, idOtp, tujuan };
}

export async function aturSandiBaru(idOtp: string, kode: string, sandiBaru: string): Promise<HasilAksi<{ tujuan: string }>> {
  const galatSandi = periksaSandi(sandiBaru);
  if (galatSandi) return gagal(galatSandi, { sandi: galatSandi });
  const hasil = await transaksi(async (k) => {
    const otp = await ambilOtp(k, idOtp);
    if (otp && otp.tujuan !== "atur_sandi") return gagal("Kode tidak berlaku.");
    const salah = await periksaKode(k, otp, kode);
    if (salah) return gagal(salah, { kode: salah });
    await k("UPDATE pengguna SET hash_sandi = $2, gagal_masuk = 0, terkunci_sampai = NULL WHERE id = $1", [
      otp!.pengguna_id,
      await hashSandi(sandiBaru),
    ]);
    // Semua sesi lama dikeluarkan demi keamanan
    await k("DELETE FROM sesi WHERE pengguna_id = $1", [otp!.pengguna_id]);
    const [p] = await k<{ id: string; peran: string }>("SELECT id, peran FROM pengguna WHERE id = $1", [otp!.pengguna_id]);
    return { ok: true as const, id: p.id, peran: p.peran };
  });
  if (!hasil.ok) return hasil;
  await buatSesi(hasil.id);
  return { ok: true, tujuan: tujuanSetelahMasuk(hasil.peran, null) };
}

// ---------------- pengaturan ----------------

export async function ubahNotifEmail(nyala: boolean): Promise<HasilAksi> {
  const pengguna = await penggunaSaatIni();
  if (!pengguna) return gagal("Sesi kamu sudah berakhir. Silakan masuk lagi.");
  await kueri("UPDATE pengguna SET notif_email = $2 WHERE id = $1", [pengguna.id, nyala]);
  return { ok: true };
}
