import "server-only";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { SKEMA } from "@/lib/server/skema";

// ================================================================
// KONEKSI DATABASE
// - Kalau DATABASE_URL diisi (misal dari Neon atau Supabase), pakai
//   PostgreSQL online. Ini yang dipakai saat website di-deploy.
// - Kalau kosong, pakai PGlite: PostgreSQL yang berjalan di dalam Node
//   dan menyimpan data di folder .data/ (tidak perlu install apa pun).
// Keduanya PostgreSQL asli, jadi SQL-nya sama persis.
// ================================================================

export type Baris = Record<string, unknown>;
export type Kueri = <T extends Baris = Baris>(sql: string, parameter?: unknown[]) => Promise<T[]>;

interface Koneksi {
  kueri: Kueri;
  transaksi: <T>(isi: (kueri: Kueri) => Promise<T>) => Promise<T>;
}

async function buatKoneksi(): Promise<Koneksi> {
  const url = process.env.DATABASE_URL;

  if (url) {
    const { default: postgres } = await import("postgres");
    // prepare: false supaya cocok dengan connection pooler Neon/Supabase
    const sql = postgres(url, { prepare: false, max: 5, idle_timeout: 20, onnotice: () => {} });
    const bungkus =
      (klien: { unsafe: (q: string, p?: never[]) => Promise<unknown> }): Kueri =>
      async <T extends Baris>(q: string, p: unknown[] = []) =>
        (await klien.unsafe(q, p as never[])) as T[];
    return {
      kueri: bungkus(sql),
      transaksi: async <T,>(isi: (kueri: Kueri) => Promise<T>) =>
        (await sql.begin((tx) => isi(bungkus(tx as never)))) as T,
    };
  }

  const { PGlite } = await import("@electric-sql/pglite");
  const folder = path.join(process.cwd(), ".data", "pglite");
  mkdirSync(folder, { recursive: true });
  const db = await PGlite.create(folder);
  const bungkus =
    (klien: { query: (q: string, p?: unknown[]) => Promise<{ rows: unknown[] }> }): Kueri =>
    async <T extends Baris>(q: string, p: unknown[] = []) =>
      (await klien.query(q, p)).rows as T[];
  return {
    kueri: bungkus(db),
    transaksi: (isi) => db.transaction((tx) => isi(bungkus(tx))),
  };
}

async function siapkan(): Promise<Koneksi> {
  const koneksi = await buatKoneksi();
  for (const perintah of SKEMA.split(";").map((s) => s.trim()).filter(Boolean)) {
    await koneksi.kueri(perintah);
  }
  const [{ jumlah }] = await koneksi.kueri<{ jumlah: number }>("SELECT count(*)::int AS jumlah FROM laporan");
  if (jumlah === 0) {
    const { isiDataContoh } = await import("@/lib/server/benih");
    await koneksi.transaksi((kueri) => isiDataContoh(kueri));
  }
  return koneksi;
}

// Satu koneksi untuk seluruh server (disimpan di globalThis supaya
// tidak dibuat ulang setiap file disimpan saat npm run dev)
const global = globalThis as unknown as { __koneksiTuntasin?: Promise<Koneksi> };

function koneksi(): Promise<Koneksi> {
  if (!global.__koneksiTuntasin) {
    global.__koneksiTuntasin = siapkan().catch((galat) => {
      global.__koneksiTuntasin = undefined;
      throw galat;
    });
  }
  return global.__koneksiTuntasin;
}

export const kueri: Kueri = async (sql, parameter) => (await koneksi()).kueri(sql, parameter);

export async function transaksi<T>(isi: (kueri: Kueri) => Promise<T>): Promise<T> {
  return (await koneksi()).transaksi(isi);
}
