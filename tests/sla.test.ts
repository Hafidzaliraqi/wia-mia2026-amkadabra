import { afterEach, describe, expect, it, vi } from "vitest";
import { apakahTerlambat, hitungStatus, hitungTenggat } from "@/lib/sla";
import { k, laporanUji, selisihHari } from "./bantu";

const SENIN = "2026-10-05T02:00:00.000Z";
const JUMAT = "2026-10-09T02:00:00.000Z";

afterEach(() => vi.useRealTimers());

describe("status laporan dihitung dari riwayat", () => {
  it("laporan baru berstatus terkirim", () => {
    expect(hitungStatus(laporanUji([k("dibuat", SENIN)]))).toBe("terkirim");
  });
  it("mengikuti kejadian terakhir yang mengubah tahap", () => {
    const l = laporanUji([k("dibuat", SENIN), k("diverifikasi", SENIN), k("diteruskan", SENIN), k("diproses", "2026-10-06T02:00:00.000Z")]);
    expect(hitungStatus(l)).toBe("diproses");
  });
  it("konfirmasi warga menutup laporan", () => {
    const l = laporanUji([k("dibuat", SENIN), k("diteruskan", SENIN), k("diproses", SENIN), k("ditandai_selesai", SENIN), k("dikonfirmasi_beres", SENIN)]);
    expect(hitungStatus(l)).toBe("selesai");
    expect(hitungTenggat(l)).toBeNull();
  });
});

describe("tenggat memakai hari kerja", () => {
  it("verifikasi 3 hari kerja dari Senin jatuh di Kamis", () => {
    const t = hitungTenggat(laporanUji([k("dibuat", SENIN)]))!;
    expect(t.tahap).toBe("Verifikasi laporan");
    expect(selisihHari(t.mulai, t.batas)).toBe(3);
  });
  it("verifikasi dari Jumat melewati akhir pekan", () => {
    const t = hitungTenggat(laporanUji([k("dibuat", JUMAT)]))!;
    expect(selisihHari(t.mulai, t.batas)).toBe(5);
    expect([0, 6]).not.toContain(new Date(t.batas).getUTCDay());
  });
  it("konfirmasi warga tidak dihitung sebagai keterlambatan instansi", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2027-01-01T00:00:00.000Z"));
    const l = laporanUji([k("dibuat", SENIN), k("diteruskan", SENIN), k("diproses", SENIN), k("ditandai_selesai", SENIN)]);
    expect(hitungTenggat(l)!.tanggungJawabPetugas).toBe(false);
    expect(apakahTerlambat(l)).toBe(false);
  });
  it("laporan yang lewat batas penyelesaian ditandai terlambat", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2027-01-01T00:00:00.000Z"));
    const l = laporanUji([k("dibuat", SENIN), k("diteruskan", SENIN), k("diproses", SENIN)]);
    expect(apakahTerlambat(l)).toBe(true);
  });
  it("perpanjangan menggeser batas penyelesaian", () => {
    const batasBaru = "2026-11-30T02:00:00.000Z";
    const l = laporanUji([k("dibuat", SENIN), k("diteruskan", SENIN), k("diproses", SENIN), k("perpanjangan", "2026-10-07T02:00:00.000Z", { batasBaru })]);
    expect(hitungTenggat(l)!.batas).toBe(batasBaru);
  });
});
