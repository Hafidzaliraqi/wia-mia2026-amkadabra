"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { RingkasanLaporan } from "@/lib/data";
import type { StatusLaporan } from "@/lib/types";
import { labelStatus } from "@/lib/status";
import { BarisLaporan } from "@/components/baris-laporan";

type Urutan = "terbaru" | "dukungan" | "terlambat";

const PER_HALAMAN = 20;

export function JelajahLaporan({
  laporan,
  kategori,
  kecamatan,
}: {
  laporan: RingkasanLaporan[];
  kategori: { id: string; nama: string }[];
  kecamatan: string[];
}) {
  const [kataKunci, setKataKunci] = useState("");
  const [filterKategori, setFilterKategori] = useState("semua");
  const [filterKecamatan, setFilterKecamatan] = useState("semua");
  const [filterStatus, setFilterStatus] = useState<StatusLaporan | "semua">("semua");
  const [urutan, setUrutan] = useState<Urutan>("terbaru");
  const [jumlahTampil, setJumlahTampil] = useState(PER_HALAMAN);

  const hasil = useMemo(() => {
    const kunci = kataKunci.trim().toLowerCase();
    const tersaring = laporan.filter((l) => {
      if (filterKategori !== "semua" && l.kategoriId !== filterKategori) return false;
      if (filterKecamatan !== "semua" && l.kecamatan !== filterKecamatan) return false;
      if (filterStatus !== "semua" && l.status !== filterStatus) return false;
      if (!kunci) return true;
      return [l.judul, l.alamat, l.nomor, l.kecamatan].some((teks) => teks.toLowerCase().includes(kunci));
    });

    return tersaring.sort((a, b) => {
      if (urutan === "dukungan") return b.dukungan - a.dukungan;
      if (urutan === "terlambat") return Number(b.terlambat) - Number(a.terlambat) || b.dibuatPada.localeCompare(a.dibuatPada);
      return b.dibuatPada.localeCompare(a.dibuatPada);
    });
  }, [laporan, kataKunci, filterKategori, filterKecamatan, filterStatus, urutan]);

  const ubah = <T,>(setter: (nilai: T) => void) => (nilai: T) => {
    setter(nilai);
    setJumlahTampil(PER_HALAMAN);
  };

  const kelasPilihan =
    "w-full rounded-xl border border-garis bg-white px-3 py-2.5 text-sm focus:border-rambu focus:outline-none";

  return (
    <div>
      <div className="grid gap-3 rounded-2xl border border-garis bg-white p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
        <div className="sm:col-span-2 lg:col-span-1">
          <label htmlFor="cari" className="mb-1.5 block text-xs font-semibold text-tinta-redup">
            Cari
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-tinta-redup" aria-hidden="true" />
            <input
              id="cari"
              type="search"
              value={kataKunci}
              onChange={(e) => ubah(setKataKunci)(e.target.value)}
              placeholder="Nama jalan, masalah, atau nomor laporan"
              className={`${kelasPilihan} pl-9`}
            />
          </div>
        </div>
        <Pilihan id="kategori" label="Kategori" nilai={filterKategori} onUbah={ubah(setFilterKategori)} kelas={kelasPilihan}>
          <option value="semua">Semua kategori</option>
          {kategori.map((k) => (
            <option key={k.id} value={k.id}>{k.nama}</option>
          ))}
        </Pilihan>
        <Pilihan id="kecamatan" label="Kecamatan" nilai={filterKecamatan} onUbah={ubah(setFilterKecamatan)} kelas={kelasPilihan}>
          <option value="semua">Semua kecamatan</option>
          {kecamatan.map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </Pilihan>
        <Pilihan id="status" label="Status" nilai={filterStatus} onUbah={(v) => ubah(setFilterStatus)(v as StatusLaporan | "semua")} kelas={kelasPilihan}>
          <option value="semua">Semua status</option>
          {(Object.keys(labelStatus) as StatusLaporan[]).map((s) => (
            <option key={s} value={s}>{labelStatus[s]}</option>
          ))}
        </Pilihan>
        <Pilihan id="urutan" label="Urutkan" nilai={urutan} onUbah={(v) => ubah(setUrutan)(v as Urutan)} kelas={kelasPilihan}>
          <option value="terbaru">Terbaru</option>
          <option value="dukungan">Dukungan terbanyak</option>
          <option value="terlambat">Lewat batas waktu dulu</option>
        </Pilihan>
      </div>

      <p className="mt-6 text-sm text-tinta-redup" aria-live="polite">
        <span className="angka font-semibold text-tinta">{hasil.length}</span> laporan ditemukan
      </p>

      {hasil.length > 0 ? (
        <ul className="mt-3 divide-y divide-garis overflow-hidden rounded-2xl border border-garis bg-white">
          {hasil.slice(0, jumlahTampil).map((l) => (
            <BarisLaporan key={l.nomor} laporan={l} />
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
            className="rounded-xl border border-garis bg-white px-5 py-2.5 text-sm font-semibold hover:bg-kertas"
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
  children,
}: {
  id: string;
  label: string;
  nilai: string;
  onUbah: (nilai: string) => void;
  kelas: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-tinta-redup">
        {label}
      </label>
      <select id={id} value={nilai} onChange={(e) => onUbah(e.target.value)} className={kelas}>
        {children}
      </select>
    </div>
  );
}
