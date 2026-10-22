"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LoaderCircle, LocateFixed, MapPin, Search, X } from "lucide-react";
import type { KelompokId, RingkasanLaporan, StatusLaporan } from "@/lib/types";
import { daftarKategori, daftarKelompok } from "@/lib/data/referensi";
import { labelStatus } from "@/lib/status";
import { daftarKota, jarakKm, wilayahTerdekat } from "@/lib/wilayah";
import { BarisLaporan } from "@/components/baris-laporan";

type Urutan = "terbaru" | "dukungan" | "terlambat" | "terdekat";
const PER_HALAMAN = 20;
const RADIUS_LAYANAN_KM = 25;

// Membaca ?cari=, ?kota=, ?kelompok= dari alamat (misal dari panel pencarian)
export function JelajahLaporan({ laporan }: { laporan: RingkasanLaporan[] }) {
  const parameter = useSearchParams();
  const kelompok = parameter.get("kelompok");
  const kategori = parameter.get("kategori");
  return (
    <IsiJelajah
      key={parameter.toString()}
      laporan={laporan}
      awal={{
        cari: parameter.get("cari") ?? "",
        kota: daftarKota.some((k) => k.id === parameter.get("kota")) ? parameter.get("kota")! : "semua",
        masalah: daftarKelompok.some((k) => k.id === kelompok)
          ? `kelompok:${kelompok}`
          : daftarKategori.some((k) => k.id === kategori)
            ? kategori!
            : "semua",
      }}
    />
  );
}

function IsiJelajah({ laporan, awal }: { laporan: RingkasanLaporan[]; awal: { cari: string; kota: string; masalah: string } }) {
  const [kataKunci, setKataKunci] = useState(awal.cari);
  const [kota, setKota] = useState(awal.kota);
  const [kecamatan, setKecamatan] = useState("semua");
  const [masalah, setMasalah] = useState(awal.masalah);
  const [status, setStatus] = useState<StatusLaporan | "semua">("semua");
  const [urutan, setUrutan] = useState<Urutan>("terbaru");
  const [jumlahTampil, setJumlahTampil] = useState(PER_HALAMAN);
  const [lokasi, setLokasi] = useState<{ lat: number; lng: number } | null>(null);
  const [infoLokasi, setInfoLokasi] = useState<string | null>(null);
  const [statusGps, setStatusGps] = useState<"diam" | "mencari" | "gagal">("diam");

  const kotaTerpilih = daftarKota.find((k) => k.id === kota);

  function ubah<T>(setter: (nilai: T) => void) {
    return (nilai: T) => {
      setter(nilai);
      setJumlahTampil(PER_HALAMAN);
    };
  }

  // Minta lokasi hanya saat tombol diklik, lalu tebak kecamatan terdekat
  function pakaiLokasi() {
    if (!("geolocation" in navigator)) return setStatusGps("gagal");
    setStatusGps("mencari");
    navigator.geolocation.getCurrentPosition(
      (posisi) => {
        const titik = { lat: posisi.coords.latitude, lng: posisi.coords.longitude };
        const terdekat = wilayahTerdekat(titik);
        setStatusGps("diam");
        setLokasi(titik);
        setUrutan("terdekat");
        setJumlahTampil(PER_HALAMAN);
        if (terdekat && terdekat.jarak <= RADIUS_LAYANAN_KM) {
          setKota(terdekat.kota.id);
          setKecamatan("semua");
          setInfoLokasi(`Kamu di sekitar Kecamatan ${terdekat.kecamatan.nama}, ${terdekat.kota.nama}.`);
        } else {
          setKota("semua");
          setKecamatan("semua");
          setInfoLokasi(
            terdekat
              ? `Daerahmu belum masuk wilayah layanan. Laporan diurutkan dari yang terdekat, mulai dari ${terdekat.kota.nama}.`
              : "Laporan diurutkan dari yang terdekat.",
          );
        }
      },
      () => setStatusGps("gagal"),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }

  const hasil = useMemo(() => {
    const kunci = kataKunci.trim().toLowerCase();
    const daftar = laporan
      .filter((l) => {
        if (kota !== "semua" && l.kotaId !== kota) return false;
        if (kecamatan !== "semua" && l.kecamatan !== kecamatan) return false;
        if (masalah.startsWith("kelompok:") && l.kelompok !== masalah.slice(9)) return false;
        if (masalah !== "semua" && !masalah.startsWith("kelompok:") && l.kategoriId !== masalah) return false;
        if (status !== "semua" && l.status !== status) return false;
        if (urutan === "terlambat" && !l.terlambat) return false;
        if (!kunci) return true;
        return [l.judul, l.alamat, l.nomor, l.kecamatan, l.kotaNama, l.kategoriNama].some((t) => t.toLowerCase().includes(kunci));
      })
      .map((l) => ({ l, jarak: lokasi && l.lat !== null && l.lng !== null ? jarakKm(lokasi, { lat: l.lat, lng: l.lng }) : null }));

    return daftar.sort((a, b) => {
      if (urutan === "dukungan") return b.l.dukungan - a.l.dukungan;
      if (urutan === "terdekat") return (a.jarak ?? Infinity) - (b.jarak ?? Infinity);
      return b.l.dibuatPada.localeCompare(a.l.dibuatPada);
    });
  }, [laporan, kataKunci, kota, kecamatan, masalah, status, urutan, lokasi]);

  const adaFilter = kota !== "semua" || kecamatan !== "semua" || masalah !== "semua" || status !== "semua" || kataKunci !== "";
  const kelasPilihan = "w-full rounded-xl border border-garis bg-white px-3 py-2.5 text-sm focus:border-rambu focus:outline-none";

  return (
    <div>
      <div className="rounded-2xl border border-garis bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <label htmlFor="cari" className="sr-only">
              Cari laporan
            </label>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-tinta-redup" aria-hidden="true" />
            <input
              id="cari"
              type="search"
              value={kataKunci}
              onChange={(e) => ubah(setKataKunci)(e.target.value)}
              placeholder="Cari jalan, masalah, daerah, atau nomor laporan"
              className={`${kelasPilihan} py-3 pl-9`}
            />
          </div>
          <button
            type="button"
            onClick={pakaiLokasi}
            disabled={statusGps === "mencari"}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-rambu ring-1 ring-rambu/40 ring-inset transition-colors hover:bg-rambu-muda disabled:opacity-60"
          >
            {statusGps === "mencari" ? (
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <LocateFixed className="size-4" aria-hidden="true" />
            )}
            Laporan di sekitarku
          </button>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Pilihan id="kota" label="Kota/kabupaten" nilai={kota} onUbah={(v) => { ubah(setKota)(v); setKecamatan("semua"); }} kelas={kelasPilihan}>
            <option value="semua">Semua daerah</option>
            {[...new Set(daftarKota.map((k) => k.provinsi))].map((provinsi) => (
              <optgroup key={provinsi} label={provinsi}>
                {daftarKota.filter((k) => k.provinsi === provinsi).map((k) => (
                  <option key={k.id} value={k.id}>{k.nama}</option>
                ))}
              </optgroup>
            ))}
          </Pilihan>
          <Pilihan id="kecamatan" label="Kecamatan" nilai={kecamatan} onUbah={ubah(setKecamatan)} kelas={kelasPilihan} nonaktif={!kotaTerpilih}>
            <option value="semua">{kotaTerpilih ? "Semua kecamatan" : "Pilih kota dulu"}</option>
            {kotaTerpilih?.kecamatan.map((k) => (
              <option key={k.nama} value={k.nama}>{k.nama}</option>
            ))}
          </Pilihan>
          <Pilihan id="masalah" label="Masalah" nilai={masalah} onUbah={ubah(setMasalah)} kelas={kelasPilihan}>
            <option value="semua">Semua masalah</option>
            {daftarKelompok.map((kel) => (
              <optgroup key={kel.id} label={kel.nama}>
                <option value={`kelompok:${kel.id}`}>Semua {kel.nama.toLowerCase()}</option>
                {daftarKategori.filter((k) => k.kelompok === (kel.id as KelompokId)).map((k) => (
                  <option key={k.id} value={k.id}>{k.nama}</option>
                ))}
              </optgroup>
            ))}
          </Pilihan>
          <Pilihan id="status" label="Status" nilai={status} onUbah={(v) => ubah(setStatus)(v as StatusLaporan | "semua")} kelas={kelasPilihan}>
            <option value="semua">Semua status</option>
            {(Object.keys(labelStatus) as StatusLaporan[]).map((s) => (
              <option key={s} value={s}>{labelStatus[s]}</option>
            ))}
          </Pilihan>
          <Pilihan id="urutan" label="Urutkan" nilai={urutan} onUbah={(v) => ubah(setUrutan)(v as Urutan)} kelas={kelasPilihan}>
            <option value="terbaru">Terbaru</option>
            <option value="dukungan">Dukungan terbanyak</option>
            <option value="terlambat">Lewat batas waktu</option>
            <option value="terdekat" disabled={!lokasi}>
              Terdekat{lokasi ? "" : " (aktifkan lokasi)"}
            </option>
          </Pilihan>
        </div>

        {(infoLokasi || statusGps === "gagal") && (
          <p className={`mt-3 flex items-start gap-2 rounded-xl px-3.5 py-2.5 text-sm ${statusGps === "gagal" ? "bg-bahaya-muda text-bahaya" : "bg-rambu-muda text-rambu-tua"}`}>
            <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {statusGps === "gagal"
              ? "Lokasimu tidak bisa dibaca. Izinkan akses lokasi di browser, atau pilih daerah secara manual."
              : infoLokasi}
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-tinta-redup" aria-live="polite">
          <span className="angka font-semibold text-tinta">{hasil.length}</span> laporan ditemukan
        </p>
        {adaFilter && (
          <button
            type="button"
            onClick={() => {
              setKataKunci("");
              setKota("semua");
              setKecamatan("semua");
              setMasalah("semua");
              setStatus("semua");
              setInfoLokasi(null);
              setJumlahTampil(PER_HALAMAN);
            }}
            className="inline-flex items-center gap-1 text-sm font-semibold text-rambu hover:text-rambu-tua"
          >
            <X className="size-4" aria-hidden="true" />
            Hapus semua filter
          </button>
        )}
      </div>

      {hasil.length > 0 ? (
        <ul className="mt-3 divide-y divide-garis overflow-hidden rounded-2xl border border-garis bg-white">
          {hasil.slice(0, jumlahTampil).map(({ l, jarak }) => (
            <BarisLaporan key={l.nomor} laporan={l} jarakKm={urutan === "terdekat" ? jarak : null} />
          ))}
        </ul>
      ) : (
        <div className="mt-3 rounded-2xl border border-dashed border-garis bg-white px-6 py-12 text-center">
          <p className="font-semibold">Tidak ada laporan yang cocok</p>
          <p className="mt-1 text-sm text-tinta-redup">Coba kata kunci lain atau ubah filter di atas.</p>
        </div>
      )}

      {hasil.length > jumlahTampil && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setJumlahTampil((n) => n + PER_HALAMAN)}
            className="rounded-xl border border-garis bg-white px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-kertas"
          >
            Tampilkan {Math.min(PER_HALAMAN, hasil.length - jumlahTampil)} laporan lagi
          </button>
        </div>
      )}
    </div>
  );
}

function Pilihan({
  id,
  label,
  nilai,
  onUbah,
  kelas,
  nonaktif = false,
  children,
}: {
  id: string;
  label: string;
  nilai: string;
  onUbah: (nilai: string) => void;
  kelas: string;
  nonaktif?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-tinta-redup">
        {label}
      </label>
      <select id={id} value={nilai} onChange={(e) => onUbah(e.target.value)} disabled={nonaktif} className={`${kelas} disabled:bg-kertas`}>
        {children}
      </select>
    </div>
  );
}
