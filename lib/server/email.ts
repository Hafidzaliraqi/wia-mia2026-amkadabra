import "server-only";
import { situs } from "@/lib/site";

// ================================================================
// PENGIRIMAN EMAIL
// Isi variabel ini di .env.local supaya email benar-benar terkirim:
//   SMTP_HOST=smtp.gmail.com
//   SMTP_PORT=465
//   SMTP_USER=akunproyek@gmail.com
//   SMTP_PASS=sandi-aplikasi-16-huruf   (App Password Gmail, bukan sandi biasa)
// Kalau belum diisi dan sedang `npm run dev`, isi email dicetak di terminal.
// ================================================================

export function emailSiap(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export async function kirimEmail(tujuan: string, subjek: string, isiTeks: string, isiHtml: string) {
  if (!emailSiap()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Pengiriman email belum dikonfigurasi (SMTP_HOST, SMTP_USER, SMTP_PASS).");
    }
    console.log(`\n────────── EMAIL (mode pengembangan) ──────────\nKe     : ${tujuan}\nSubjek : ${subjek}\n\n${isiTeks}\n────────────────────────────────────────────────\n`);
    return;
  }

  const { createTransport } = await import("nodemailer");
  const port = Number(process.env.SMTP_PORT ?? 465);
  const pengirim = createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  await pengirim.sendMail({
    from: `"${situs.nama}" <${process.env.EMAIL_PENGIRIM ?? process.env.SMTP_USER}>`,
    to: tujuan,
    subject: subjek,
    text: isiTeks,
    html: isiHtml,
  });
}

// Supaya teks dari pengguna (nama, catatan) tidak bisa menyisipkan HTML ke email
function aman(teks: string) {
  return teks.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function bingkai(judul: string, isi: string) {
  return `<!doctype html><html><body style="margin:0;background:#f3f5f7;font-family:Arial,sans-serif;color:#13233d">
<div style="max-width:480px;margin:24px auto;background:#fff;border:1px solid #d8dee6;border-radius:16px;padding:28px">
<p style="margin:0 0 16px;font-weight:800;font-size:18px">${situs.nama}</p>
<h1 style="margin:0 0 12px;font-size:20px">${aman(judul)}</h1>${isi}
<p style="margin:24px 0 0;font-size:12px;color:#4a5a72">Email ini dikirim otomatis. Jangan bagikan kode atau tautan di email ini kepada siapa pun, termasuk yang mengaku petugas.</p>
</div></body></html>`;
}

export function emailKodeOtp(nama: string, kode: string, keperluan: string) {
  const teks = `Halo ${nama},\n\nKode ${keperluan} kamu: ${kode}\n\nKode berlaku 10 menit.`;
  const html = bingkai(
    `Kode ${keperluan}`,
    `<p style="margin:0 0 16px;line-height:1.6">Halo ${aman(nama)}, masukkan kode ini untuk melanjutkan:</p>
<p style="margin:0;font-size:32px;font-weight:800;letter-spacing:8px">${kode}</p>
<p style="margin:16px 0 0;color:#4a5a72">Kode berlaku 10 menit.</p>`,
  );
  return { teks, html };
}

export function emailPemberitahuan(nama: string, judul: string, isi: string, tautan: string) {
  const alamat = `${process.env.ALAMAT_SITUS ?? "http://localhost:3000"}${tautan}`;
  const teks = `Halo ${nama},\n\n${isi}\n\nLihat laporan: ${alamat}`;
  const html = bingkai(
    judul,
    `<p style="margin:0 0 20px;line-height:1.6">Halo ${aman(nama)}, ${aman(isi)}</p>
<a href="${alamat}" style="display:inline-block;background:#1f4fa8;color:#fff;text-decoration:none;padding:12px 20px;border-radius:12px;font-weight:700">Lihat laporan</a>`,
  );
  return { teks, html };
}
