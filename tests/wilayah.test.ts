import { describe, expect, it } from "vitest";
import { cocokkanWilayah, wilayahTerdekat } from "@/lib/wilayah";
import { normalisasiNomor } from "@/lib/nomor";

describe("deteksi daerah dari alamat peta", () => {
  it("mengenali Palmerah, Jakarta Barat", () => {
    const hasil = cocokkanWilayah(["Jalan Haji Suit", "Kemanggisan", "Palmerah", "Jakarta Barat", "Daerah Khusus Ibukota Jakarta"]);
    expect(hasil?.kota.id).toBe("jakbar");
    expect(hasil?.kecamatan.nama).toBe("Palmerah");
  });
  it("membedakan Kota Bogor dan Kabupaten Bogor dari nama kecamatan", () => {
    expect(cocokkanWilayah(["Bogor Tengah", "Kota Bogor", "Jawa Barat"])?.kota.id).toBe("kota-bogor");
  });
  it("mengembalikan null untuk daerah di luar layanan", () => {
    expect(cocokkanWilayah(["Ubud", "Gianyar", "Bali"])).toBeNull();
  });
  it("menebak kecamatan terdekat dari koordinat GPS", () => {
    expect(wilayahTerdekat({ lat: -6.2264, lng: 106.8559 })?.kecamatan.nama).toBe("Tebet");
  });
});

describe("nomor laporan", () => {
  it("menerima penulisan bebas dari pengguna", () => {
    expect(normalisasiNomor("tsn 2610 0042")).toBe("TSN-2610-0042");
    expect(normalisasiNomor("tsn-2610-0042")).toBe("TSN-2610-0042");
  });
});
