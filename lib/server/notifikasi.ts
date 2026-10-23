import "server-only";
import type { NotifikasiRingkas } from "@/lib/types";
import { kueri as kueriDb, type Kueri } from "@/lib/server/db";
import { formatRelatif } from "@/lib/waktu";
import { emailPemberitahuan, kirimEmail } from "@/lib/server/email";

interface Pesan {
  judul: string;
  isi: string;
}

export interface EmailTertunda {
  email: string;
  nama: string;
  judul: string;
  isi: string;
  tautan: string;
}

// Kirim notifikasi di dalam aplikasi ke pihak yang terkait dengan laporan.
// warga = pelapor dan semua pendukung, petugas = petugas instansi penanganan.
// Mengembalikan daftar email yang perlu dikirim (dikirim setelah respons selesai).
export async function beritahu(
  kueri: Kueri,
  nomor: string,
  pesan: Pesan,
  opsi: { warga?: boolean; petugas?: boolean; kecuali?: string | null; email?: boolean },
): Promise<EmailTertunda[]> {
  const penerima: { id: string; nama: string; email: string; notif_email: boolean; tautan: string }[] = [];

  if (opsi.warga) {
    const baris = await kueri<{ id: string; nama: string; email: string; notif_email: boolean }>(
      `SELECT p.id, p.nama, p.email, p.notif_email FROM pengguna p
       WHERE p.id IN (
         SELECT pelapor_id FROM laporan WHERE nomor = $1 AND pelapor_id IS NOT NULL
         UNION SELECT pengguna_id FROM dukungan WHERE nomor = $1
       )`,
      [nomor],
    );
    penerima.push(...baris.map((b) => ({ ...b, tautan: `/laporan/${nomor}` })));
  }
  if (opsi.petugas) {
    const baris = await kueri<{ id: string; nama: string; email: string; notif_email: boolean }>(
      `SELECT p.id, p.nama, p.email, p.notif_email FROM pengguna p
       JOIN laporan l ON l.instansi_id = p.instansi_id
       WHERE l.nomor = $1 AND p.peran = 'petugas'`,
      [nomor],
    );
    penerima.push(...baris.map((b) => ({ ...b, tautan: `/petugas/laporan/${nomor}` })));
  }

  const unik = penerima.filter((p, i, semua) => p.id !== opsi.kecuali && semua.findIndex((q) => q.id === p.id) === i);
  for (const p of unik) {
    await kueri("INSERT INTO notifikasi (pengguna_id, judul, isi, tautan) VALUES ($1, $2, $3, $4)", [
      p.id,
      pesan.judul,
      pesan.isi,
      p.tautan,
    ]);
  }

  return opsi.email
    ? unik.filter((p) => p.notif_email).map((p) => ({ email: p.email, nama: p.nama, ...pesan, tautan: p.tautan }))
    : [];
}

export async function kirimEmailTertunda(daftar: EmailTertunda[]) {
  for (const e of daftar) {
    try {
      const { teks, html } = emailPemberitahuan(e.nama, e.judul, e.isi, e.tautan);
      await kirimEmail(e.email, e.judul, teks, html);
    } catch (galat) {
      console.error("Gagal mengirim email pemberitahuan:", galat);
    }
  }
}

export async function ambilNotifikasi(penggunaId: string, batas = 6): Promise<{
  jumlahBelumDibaca: number;
  terbaru: NotifikasiRingkas[];
}> {
  const [daftar, [{ jumlah }]] = await Promise.all([
    kueriDb<{ id: number; judul: string; isi: string; tautan: string; dibaca: boolean; dibuat_pada: Date }>(
      "SELECT id, judul, isi, tautan, dibaca, dibuat_pada FROM notifikasi WHERE pengguna_id = $1 ORDER BY dibuat_pada DESC, id DESC LIMIT $2",
      [penggunaId, batas],
    ),
    kueriDb<{ jumlah: number }>("SELECT count(*)::int AS jumlah FROM notifikasi WHERE pengguna_id = $1 AND NOT dibaca", [penggunaId]),
  ]);
  return {
    jumlahBelumDibaca: jumlah,
    terbaru: daftar.map((n) => ({
      id: Number(n.id),
      judul: n.judul,
      isi: n.isi,
      tautan: n.tautan,
      dibaca: n.dibaca,
      waktuTeks: formatRelatif(n.dibuat_pada),
    })),
  };
}
