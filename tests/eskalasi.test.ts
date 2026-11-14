import { afterEach, describe, expect, it, vi } from "vitest";
import { eskalasiBerikutnya, eskalasiJatuhTempo, tanggaEskalasi, tingkatSaatIni } from "@/lib/eskalasi";
import { hitungTenggat } from "@/lib/sla";
import { k, laporanUji } from "./bantu";

const MULAI = "2026-10-05T02:00:00.000Z";
const dikerjakan = (tambahan: ReturnType<typeof k>[] = [], kotaId = "jaksel") =>
  laporanUji([k("dibuat", MULAI), k("diteruskan", MULAI), k("diproses", MULAI), ...tambahan], { kotaId });

afterEach(() => vi.useRealTimers());

describe("jalur tanggung jawab", () => {
  it("naik dari petugas ke pimpinan, inspektorat, lalu kepala daerah", () => {
    const tangga = tanggaEskalasi(dikerjakan());
    expect(tangga.map((t) => t.peran)).toEqual(["Petugas instansi", "Pimpinan instansi", "Pengawas internal", "Kepala daerah"]);
    expect(tangga[1].nama).toBe("Kepala Dinas Pekerjaan Umum Jakarta Selatan");
    expect(tangga[3].nama).toBe("Wali Kota Jakarta Selatan");
  });
  it("memakai sebutan kepala daerah yang tepat", () => {
    expect(tanggaEskalasi(dikerjakan([], "kab-garut"))[3].nama).toBe("Bupati Garut");
    expect(tanggaEskalasi(dikerjakan([], "kota-bogor"))[3].nama).toBe("Wali Kota Bogor");
  });
});

describe("eskalasi otomatis", () => {
  it("belum ada eskalasi sebelum batas waktu", () => {
    const l = dikerjakan();
    expect(eskalasiJatuhTempo(l, new Date(MULAI))).toEqual([]);
    expect(eskalasiBerikutnya(l)).toMatchObject({ tingkat: 1, waktu: hitungTenggat(l)!.batas });
  });
  it("laporan yang lama terbengkalai naik sampai tingkat tertinggi secara berurutan", () => {
    const l = dikerjakan();
    const hasil = eskalasiJatuhTempo(l, new Date("2027-01-01T00:00:00.000Z"));
    expect(hasil.map((e) => e.tingkat)).toEqual([1, 2, 3]);
    expect(hasil[0].waktu.toISOString()).toBe(hitungTenggat(l)!.batas);
    expect(hasil[1].waktu > hasil[0].waktu && hasil[2].waktu > hasil[1].waktu).toBe(true);
    expect(hasil[2].catatan).toContain("Wali Kota Jakarta Selatan");
  });
  it("tidak naik lagi sebelum jeda 3 hari kerja berikutnya", () => {
    const batas = hitungTenggat(dikerjakan())!.batas;
    const l = dikerjakan([k("eskalasi", batas, { tingkat: 1 })]);
    const sehariKemudian = new Date(Date.parse(batas) + 86_400_000);
    expect(tingkatSaatIni(l)).toBe(1);
    expect(eskalasiJatuhTempo(l, sehariKemudian)).toEqual([]);
  });
  it("teguran manual admin tidak dihitung sebagai tingkat eskalasi", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(MULAI));
    const l = dikerjakan([k("eskalasi", MULAI, { aktor: "Admin pengawas" })]);
    expect(tingkatSaatIni(l)).toBe(0);
  });
});
