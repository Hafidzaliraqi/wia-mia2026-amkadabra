"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  CircleCheck,
  Clock,
  EyeOff,
  ImagePlus,
  LoaderCircle,
  LocateFixed,
  Lock,
  MapPin,
  Search,
  Trash2,
  TriangleAlert,
  Users,
} from "lucide-react";
import type { KategoriId, KelompokId, StatusLaporan, Visibilitas } from "@/lib/types";
import type { Titik } from "@/components/peta-lokasi";
import { KategoriIkon, KelompokIkon } from "@/components/kategori-ikon";
import { StatusBadge } from "@/components/status-badge";
import { Tombol } from "@/components/dialog";
import { useToast } from "@/components/toast";
import { cariAlamat, type HasilAlamat } from "@/lib/geokode";
import { siapkanFoto, type FotoSiap } from "@/lib/foto-klien";
import { buatLaporan } from "@/lib/aksi/laporan";
import { cariKategori, daftarKategori, daftarKelompok, instansiTujuan } from "@/lib/data/referensi";
import { daftarKota, jarakKm, wilayahTerdekat } from "@/lib/wilayah";

// Peta hanya bisa jalan di browser, jadi dimuat terpisah tanpa server rendering
const PetaLokasi = dynamic(() => import("@/components/peta-lokasi"), {
  ssr: false,
  loading: () => <div className="h-72 animate-pulse rounded-xl border border-garis bg-kertas motion-reduce:animate-none sm:h-80" />,
});

export interface KandidatDuplikat {
  nomor: string;
  judul: string;
  kategoriId: KategoriId;
  kotaId: string;
  kecamatan: string;
  lat: number | null;
  lng: number | null;
  status: StatusLaporan;
  dukungan: number;
  dibuatTeks: string;
}

const LANGKAH = ["Lokasi", "Masalah", "Cerita", "Foto", "Privasi", "Periksa"];
const MAKS_FOTO = 3;
const RADIUS_DUPLIKAT_KM = 0.5;
const RADIUS_LAYANAN_KM = 25;

const pilihanVisibilitas: { id: Visibilitas; judul: string; isi: string; ikon: typeof Users }[] = [
  { id: "publik", judul: "Publik", isi: "Laporan dan namamu bisa dilihat semua orang.", ikon: Users },
  { id: "sembunyikan_nama", judul: "Sembunyikan nama", isi: "Laporan tetap publik, tapi namamu tidak ditampilkan.", ikon: EyeOff },
  { id: "privat", judul: "Privat", isi: "Hanya kamu, admin, dan instansi yang bisa melihat laporan ini.", ikon: Lock },
];

export function FormLaporan({
  kandidat,
  hariIni,
  batasVerifikasiTeks,
  pusatAwal,
}: {
  kandidat: KandidatDuplikat[];
  hariIni: string;
  batasVerifikasiTeks: string;
  pusatAwal: Titik;
}) {
  const toast = useToast();
  const [langkah, setLangkah] = useState(0);
  const [galat, setGalat] = useState<string | null>(null);
  const [mengirim, mulaiKirim] = useTransition();

  // Lokasi
  const [titik, setTitik] = useState<Titik | null>(null);
  const [fokus, setFokus] = useState<{ titik: Titik; urut: number } | null>(null);
  const [alamat, setAlamat] = useState("");
  const [kotaId, setKotaId] = useState("");
  const [kecamatan, setKecamatan] = useState("");
  const [luarWilayah, setLuarWilayah] = useState(false);
  const [kataCari, setKataCari] = useState("");
  const [saran, setSaran] = useState<HasilAlamat[]>([]);
  const [statusCari, setStatusCari] = useState<"diam" | "mencari" | "gagal" | "kosong">("diam");
  const [statusGps, setStatusGps] = useState<"diam" | "mencari" | "gagal">("diam");

  // Masalah, cerita, foto, privasi
  const [kelompok, setKelompok] = useState<KelompokId | null>(null);
  const [kategoriId, setKategoriId] = useState<KategoriId | null>(null);
  const [cerita, setCerita] = useState("");
  const [tanggal, setTanggal] = useState(hariIni);
  const [foto, setFoto] = useState<FotoSiap[]>([]);
  const [memprosesFoto, setMemprosesFoto] = useState(false);
  const [visibilitas, setVisibilitas] = useState<Visibilitas>("publik");
  const [visibilitasDiubah, setVisibilitasDiubah] = useState(false);
  const [setuju, setSetuju] = useState(false);
  const [terkirim, setTerkirim] = useState<string | null>(null);

  const judulLangkah = useRef<HTMLHeadingElement>(null);
  const sudahPindah = useRef(false);
  const fotoTerakhir = useRef<FotoSiap[]>([]);

  useEffect(() => {
    const kata = kataCari.trim();
    if (kata.length < 3) return;
    const pembatal = new AbortController();
    const pewaktu = window.setTimeout(async () => {
      setStatusCari("mencari");
      try {
        const kecamatanSemua = daftarKota.flatMap((k) => k.kecamatan.map((c) => c.nama));
        const hasil = await cariAlamat(kata, kecamatanSemua, pembatal.signal);
        setSaran(hasil);
        setStatusCari(hasil.length ? "diam" : "kosong");
      } catch {
        if (!pembatal.signal.aborted) setStatusCari("gagal");
      }
    }, 700);
    return () => {
      window.clearTimeout(pewaktu);
      pembatal.abort();
    };
  }, [kataCari]);

  useEffect(() => {
    if (sudahPindah.current) judulLangkah.current?.focus();
  }, [langkah]);

  useEffect(() => {
    fotoTerakhir.current = foto;
  }, [foto]);
  useEffect(() => () => fotoTerakhir.current.forEach((f) => URL.revokeObjectURL(f.pratinjau)), []);

  // Pilih titik: daerah langsung ditebak dari kecamatan terdekat (tanpa internet)
  function pilihTitik(baru: Titik, pindahkanPeta = false, alamatBaru?: string) {
    setTitik(baru);
    setGalat(null);
    if (pindahkanPeta) setFokus((lama) => ({ titik: baru, urut: (lama?.urut ?? 0) + 1 }));
    if (alamatBaru) setAlamat(alamatBaru);
    const terdekat = wilayahTerdekat(baru);
    if (terdekat && terdekat.jarak <= RADIUS_LAYANAN_KM) {
      setKotaId(terdekat.kota.id);
      setKecamatan(terdekat.kecamatan.nama);
      setLuarWilayah(false);
    } else {
      setLuarWilayah(true);
    }
  }

  function pakaiLokasiSaya() {
    if (!("geolocation" in navigator)) return setStatusGps("gagal");
    setStatusGps("mencari");
    navigator.geolocation.getCurrentPosition(
      (posisi) => {
        setStatusGps("diam");
        pilihTitik({ lat: posisi.coords.latitude, lng: posisi.coords.longitude }, true);
      },
      () => setStatusGps("gagal"),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function pilihKategori(id: KategoriId) {
    setKategoriId(id);
    setGalat(null);
    if (!visibilitasDiubah) {
      setVisibilitas(["pungli", "wewenang", "bansos"].includes(id) ? "sembunyikan_nama" : "publik");
    }
  }

  async function tambahFoto(event: React.ChangeEvent<HTMLInputElement>) {
    const berkas = Array.from(event.target.files ?? []).filter((b) => b.type.startsWith("image/"));
    event.target.value = "";
    const sisa = MAKS_FOTO - foto.length;
    if (sisa <= 0) return setGalat(`Maksimal ${MAKS_FOTO} foto.`);
    setMemprosesFoto(true);
    try {
      const siap = await Promise.all(berkas.slice(0, sisa).map(siapkanFoto));
      setFoto((lama) => [...lama, ...siap]);
      setGalat(berkas.length > sisa ? `Maksimal ${MAKS_FOTO} foto, sisanya tidak ditambahkan.` : null);
    } catch {
      setGalat("Ada foto yang tidak bisa dibaca. Coba foto lain.");
    } finally {
      setMemprosesFoto(false);
    }
  }

  function hapusFoto(pratinjau: string) {
    URL.revokeObjectURL(pratinjau);
    setFoto((lama) => lama.filter((f) => f.pratinjau !== pratinjau));
  }

  function periksa(nomorLangkah: number): string | null {
    if (nomorLangkah === 0) {
      if (!titik) return "Tandai titik lokasi di peta dulu (klik peta, cari alamat, atau pakai lokasimu).";
      if (alamat.trim().length < 5) return "Tulis alamat atau patokan lokasinya.";
      if (!kotaId || !kecamatan) return "Pilih kota/kabupaten dan kecamatan.";
    }
    if (nomorLangkah === 1 && !kategoriId) return "Pilih jenis masalahnya.";
    if (nomorLangkah === 2) {
      if (cerita.trim().length < 20) return "Ceritakan masalahnya minimal 20 karakter.";
      if (!tanggal) return "Isi tanggal kejadian.";
    }
    if (nomorLangkah === 5 && !setuju) return "Centang pernyataan di atas untuk mengirim laporan.";
    return null;
  }

  function pindah(ke: number) {
    sudahPindah.current = true;
    setGalat(null);
    setLangkah(ke);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function lanjut() {
    const masalah = periksa(langkah);
    if (masalah) return setGalat(masalah);
    pindah(langkah + 1);
  }

  function kirim() {
    for (let i = 0; i < LANGKAH.length; i++) {
      const masalah = periksa(i);
      if (masalah) {
        if (i !== langkah) pindah(i);
        return setGalat(masalah);
      }
    }
    const data = new FormData();
    data.set("lat", String(titik!.lat));
    data.set("lng", String(titik!.lng));
    data.set("alamat", alamat.trim());
    data.set("kotaId", kotaId);
    data.set("kecamatan", kecamatan);
    data.set("kategoriId", kategoriId!);
    data.set("cerita", cerita.trim());
    data.set("tanggal", tanggal);
    data.set("visibilitas", visibilitas);
    for (const f of foto) {
      data.append("foto", f.berkas);
      data.append("fotoWaktu", f.diambilPada ?? "");
      data.append("fotoLat", f.lat === null ? "" : String(f.lat));
      data.append("fotoLng", f.lng === null ? "" : String(f.lng));
    }
    mulaiKirim(async () => {
      const hasil = await buatLaporan(data);
      if (!hasil.ok) {
        setGalat(hasil.pesan);
        toast("galat", hasil.pesan);
        return;
      }
      setTerkirim(hasil.nomor);
      toast("sukses", `Laporan ${hasil.nomor} terkirim.`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const kategoriTerpilih = kategoriId ? cariKategori(kategoriId) : null;
  const kotaTerpilih = daftarKota.find((k) => k.id === kotaId);
  const instansi = kategoriId && kotaId ? instansiTujuan(kategoriId, kotaId) : null;

  if (terkirim) {
    return (
      <div className="mx-auto max-w-xl motion-safe:animate-muncul">
        <div className="rounded-2xl border border-garis bg-white p-6 sm:p-8">
          <span className="flex size-12 items-center justify-center rounded-full bg-tuntas-muda text-tuntas">
            <CircleCheck className="size-6" aria-hidden="true" />
          </span>
          <h2 className="mt-5 text-2xl font-extrabold tracking-tight">Laporan terkirim</h2>
          <p className="mt-1 text-tinta-redup">Simpan nomor ini untuk melacak laporanmu.</p>
          <p className="angka mt-5 rounded-xl bg-kertas px-4 py-3 text-2xl font-extrabold tracking-wide">{terkirim}</p>
          <ol className="mt-6 space-y-4 text-sm">
            <LangkahBerikut nomor={1} judul="Diverifikasi admin" isi={`Paling lambat ${batasVerifikasiTeks} WIB.`} />
            <LangkahBerikut nomor={2} judul={`Diteruskan ke ${instansi?.nama ?? "instansi terkait"}`} isi="Otomatis setelah lolos verifikasi." />
            <LangkahBerikut nomor={3} judul="Kamu dapat kabar di setiap tahap" isi="Lewat lonceng notifikasi, termasuk saat petugas butuh konfirmasimu." />
          </ol>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/laporan/${terkirim}`} className="rounded-xl bg-rambu px-5 py-3 font-semibold text-white transition hover:bg-rambu-tua">
              Lihat laporanku
            </Link>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-xl px-5 py-3 font-semibold text-tinta-redup ring-1 ring-garis ring-inset hover:text-tinta"
            >
              Buat laporan lain
            </button>
          </div>
        </div>
      </div>
    );
  }

  const duplikat = kategoriId
    ? kandidat
        .filter((k) => k.kategoriId === kategoriId)
        .map((k) => ({ k, jarak: titik && k.lat !== null && k.lng !== null ? jarakKm(titik, { lat: k.lat, lng: k.lng }) : null }))
        .filter(({ k, jarak }) => (jarak !== null ? jarak <= RADIUS_DUPLIKAT_KM : k.kotaId === kotaId && k.kecamatan === kecamatan))
        .sort((a, b) => (a.jarak ?? 0) - (b.jarak ?? 0))
        .slice(0, 3)
    : [];

  return (
    <div className="mx-auto max-w-3xl">
      <div>
        <p className="angka text-sm font-semibold text-tinta-redup">
          Langkah {langkah + 1} dari {LANGKAH.length}
        </p>
        <ol className="mt-3 grid grid-cols-6 gap-1.5" aria-label="Langkah formulir">
          {LANGKAH.map((nama, i) => (
            <li key={nama}>
              <span className={`block h-1.5 rounded-full transition-colors duration-300 ${i <= langkah ? "bg-rambu" : "bg-garis"}`} aria-hidden="true" />
              <span className={`mt-2 hidden text-xs sm:block ${i === langkah ? "font-bold text-tinta" : "text-tinta-redup"}`}>{nama}</span>
              <span className="sr-only">
                {nama}
                {i === langkah ? " (langkah saat ini)" : i < langkah ? " (selesai)" : ""}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <section key={langkah} className="mt-6 rounded-2xl border border-garis bg-white p-5 motion-safe:animate-muncul sm:p-7">
        {langkah === 0 && (
          <>
            <JudulLangkah ref={judulLangkah} judul="Di mana masalahnya?" isi="Cari alamat, pakai lokasimu, atau klik langsung di peta. Daerahnya terisi otomatis." />
            <div className="mt-5 space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <label htmlFor="cari-alamat" className="sr-only">
                    Cari alamat
                  </label>
                  <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-tinta-redup" aria-hidden="true" />
                  <input
                    id="cari-alamat"
                    type="search"
                    value={kataCari}
                    onChange={(e) => {
                      setKataCari(e.target.value);
                      if (e.target.value.trim().length < 3) {
                        setSaran([]);
                        setStatusCari("diam");
                      }
                    }}
                    placeholder="Cari nama jalan atau tempat"
                    autoComplete="off"
                    className="w-full rounded-xl border border-garis bg-white py-3 pr-4 pl-10 text-base focus:border-rambu focus:outline-none"
                  />
                </div>
                <Tombol varian="garis" onClick={pakaiLokasiSaya} memproses={statusGps === "mencari"} className="py-3">
                  {statusGps !== "mencari" && <LocateFixed className="size-4" aria-hidden="true" />}
                  Pakai lokasi saya
                </Tombol>
              </div>
              <div aria-live="polite">
                {statusCari === "mencari" && <p className="text-sm text-tinta-redup">Mencari alamat…</p>}
                {statusCari === "kosong" && <p className="text-sm text-tinta-redup">Alamat tidak ditemukan. Coba kata lain atau klik peta.</p>}
                {statusCari === "gagal" && <p className="text-sm text-bahaya">Pencarian alamat sedang tidak tersedia. Klik peta untuk menandai lokasi.</p>}
                {statusGps === "gagal" && <p className="text-sm text-bahaya">Lokasimu tidak bisa dibaca. Izinkan akses lokasi di browser atau klik peta.</p>}
              </div>
              {saran.length > 0 && (
                <ul className="overflow-hidden rounded-xl border border-garis motion-safe:animate-muncul">
                  {saran.map((s) => (
                    <li key={s.id} className="border-b border-garis last:border-b-0">
                      <button
                        type="button"
                        onClick={() => {
                          pilihTitik({ lat: s.lat, lng: s.lng }, true, s.nama);
                          setSaran([]);
                          setKataCari("");
                          setStatusCari("diam");
                        }}
                        className="flex w-full items-start gap-2.5 px-4 py-3 text-left text-sm hover:bg-kertas"
                      >
                        <MapPin className="mt-0.5 size-4 shrink-0 text-rambu" aria-hidden="true" />
                        {s.nama}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <PetaLokasi titik={titik} pusatAwal={pusatAwal} fokus={fokus} onPilih={(t) => pilihTitik(t)} />
              <p className="text-sm text-tinta-redup">{titik ? "Geser pin untuk titik yang lebih tepat." : "Belum ada titik. Klik peta untuk menaruh pin."}</p>
              {luarWilayah && (
                <p className="flex gap-2 rounded-xl bg-waspada-muda px-3.5 py-2.5 text-sm text-waspada">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  Titik ini di luar wilayah layanan saat ini. Pilih kota dan kecamatan terdekat secara manual.
                </p>
              )}
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label htmlFor="alamat" className="mb-1.5 block text-sm font-semibold">
                  Alamat atau patokan
                </label>
                <input
                  id="alamat"
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  placeholder="Contoh: Jl. Tebet Raya, depan minimarket"
                  className="w-full rounded-xl border border-garis bg-white px-4 py-3 text-base focus:border-rambu focus:outline-none"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="kota" className="mb-1.5 block text-sm font-semibold">
                    Kota/kabupaten
                  </label>
                  <select
                    id="kota"
                    value={kotaId}
                    onChange={(e) => {
                      setKotaId(e.target.value);
                      setKecamatan("");
                    }}
                    className="w-full rounded-xl border border-garis bg-white px-3 py-3 text-base focus:border-rambu focus:outline-none"
                  >
                    <option value="">Pilih kota/kabupaten</option>
                    {[...new Set(daftarKota.map((k) => k.provinsi))].map((provinsi) => (
                      <optgroup key={provinsi} label={provinsi}>
                        {daftarKota.filter((k) => k.provinsi === provinsi).map((k) => (
                          <option key={k.id} value={k.id}>{k.nama}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="kecamatan" className="mb-1.5 block text-sm font-semibold">
                    Kecamatan
                  </label>
                  <select
                    id="kecamatan"
                    value={kecamatan}
                    onChange={(e) => setKecamatan(e.target.value)}
                    disabled={!kotaTerpilih}
                    className="w-full rounded-xl border border-garis bg-white px-3 py-3 text-base focus:border-rambu focus:outline-none disabled:bg-kertas"
                  >
                    <option value="">{kotaTerpilih ? "Pilih kecamatan" : "Pilih kota dulu"}</option>
                    {kotaTerpilih?.kecamatan.map((k) => (
                      <option key={k.nama} value={k.nama}>{k.nama}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </>
        )}

        {langkah === 1 && (
          <>
            <JudulLangkah ref={judulLangkah} judul="Apa masalahnya?" isi="Pilih kelompoknya dulu, lalu jenis masalah yang paling sesuai." />
            <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Kelompok masalah">
              {daftarKelompok.map((k) => {
                const aktif = (kelompok ?? kategoriTerpilih?.kelompok) === k.id;
                return (
                  <button
                    key={k.id}
                    type="button"
                    aria-pressed={aktif}
                    onClick={() => setKelompok(k.id)}
                    className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
                      aktif ? "bg-rambu text-white" : "bg-kertas text-tinta hover:bg-rambu-muda"
                    }`}
                  >
                    <KelompokIkon id={k.id} className="size-4" />
                    {k.nama}
                  </button>
                );
              })}
            </div>

            {(kelompok ?? kategoriTerpilih?.kelompok) && (
              <fieldset className="mt-5 motion-safe:animate-muncul">
                <legend className="sr-only">Jenis masalah</legend>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {daftarKategori
                    .filter((k) => k.kelompok === (kelompok ?? kategoriTerpilih?.kelompok))
                    .map((k) => {
                      const dipilih = kategoriId === k.id;
                      return (
                        <label
                          key={k.id}
                          className={`flex cursor-pointer gap-3 rounded-xl border p-3.5 transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-rambu ${
                            dipilih ? "border-rambu bg-rambu-muda/60 ring-1 ring-rambu" : "border-garis hover:border-rambu/50"
                          }`}
                        >
                          <input type="radio" name="kategori" value={k.id} checked={dipilih} onChange={() => pilihKategori(k.id)} className="sr-only" />
                          <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${dipilih ? "bg-rambu text-white" : "bg-kertas"}`}>
                            <KategoriIkon id={k.id} className="size-4.5" />
                          </span>
                          <span>
                            <span className="block text-sm font-semibold">{k.nama}</span>
                            <span className="mt-0.5 block text-sm text-tinta-redup">{k.contoh}</span>
                          </span>
                        </label>
                      );
                    })}
                </div>
              </fieldset>
            )}

            {kategoriTerpilih && instansi && (
              <div className="mt-6 space-y-4">
                <p className="rounded-xl bg-kertas px-4 py-3 text-sm leading-relaxed">
                  Diteruskan ke <span className="font-semibold">{instansi.nama}</span>. Batas penyelesaian{" "}
                  {kategoriTerpilih.slaHariKerja} hari kerja sejak mulai dikerjakan.
                </p>
                {duplikat.length > 0 ? (
                  <div className="rounded-xl border-2 border-waspada/30 bg-waspada-muda p-4 motion-safe:animate-muncul">
                    <p className="font-semibold">Ada {duplikat.length} laporan serupa yang masih berjalan di dekat lokasimu</p>
                    <p className="mt-1 text-sm text-tinta-redup">Kalau masalahnya sama, cukup dukung laporan itu supaya lebih cepat ditangani.</p>
                    <ul className="mt-3 space-y-2">
                      {duplikat.map(({ k, jarak }) => (
                        <li key={k.nomor} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white p-3">
                          <div className="min-w-0">
                            <p className="text-sm leading-snug font-semibold">{k.judul}</p>
                            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-tinta-redup">
                              <StatusBadge status={k.status} />
                              <span className="angka">{k.dukungan} dukungan</span>
                              {jarak !== null && <span className="angka">{Math.round(jarak * 1000)} m dari titikmu</span>}
                            </div>
                          </div>
                          <Link href={`/laporan/${k.nomor}`} target="_blank" rel="noopener noreferrer" className="shrink-0 text-sm font-semibold text-rambu hover:text-rambu-tua">
                            Lihat dan dukung<span className="sr-only"> (buka di tab baru)</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 text-sm text-tinta-redup">Masalahmu berbeda? Lanjutkan saja dengan tombol di bawah.</p>
                  </div>
                ) : (
                  <p className="text-sm text-tinta-redup">Belum ada laporan serupa yang masih berjalan di sekitar titik ini.</p>
                )}
              </div>
            )}
          </>
        )}

        {langkah === 2 && (
          <>
            <JudulLangkah ref={judulLangkah} judul="Ceritakan masalahnya" isi="Semakin jelas ceritanya, semakin cepat petugas memahami dan menanganinya." />
            <div className="mt-5 space-y-5">
              <div>
                <label htmlFor="cerita" className="mb-1.5 block text-sm font-semibold">
                  Cerita kejadian
                </label>
                <textarea
                  id="cerita"
                  rows={7}
                  value={cerita}
                  onChange={(e) => setCerita(e.target.value)}
                  maxLength={5000}
                  placeholder="Apa masalahnya, sejak kapan terjadi, dan siapa yang terdampak? Contoh: Lubang di lajur kiri lebarnya sekitar 50 cm, sudah seminggu, dua motor jatuh di sini."
                  aria-describedby="hitung-cerita"
                  className="w-full rounded-xl border border-garis bg-white px-4 py-3 text-base leading-relaxed focus:border-rambu focus:outline-none"
                />
                <p id="hitung-cerita" className={`angka mt-1.5 text-sm ${cerita.trim().length >= 20 ? "text-tuntas" : "text-tinta-redup"}`}>
                  {cerita.trim().length} karakter{cerita.trim().length < 20 ? ", minimal 20" : ""}
                </p>
              </div>
              <div className="max-w-xs">
                <label htmlFor="tanggal" className="mb-1.5 block text-sm font-semibold">
                  Tanggal kejadian
                </label>
                <input
                  id="tanggal"
                  type="date"
                  value={tanggal}
                  max={hariIni}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full rounded-xl border border-garis bg-white px-4 py-3 text-base focus:border-rambu focus:outline-none"
                />
              </div>
            </div>
          </>
        )}

        {langkah === 3 && (
          <>
            <JudulLangkah ref={judulLangkah} judul="Tambahkan foto (opsional)" isi={`Foto membantu admin memverifikasi laporanmu. Maksimal ${MAKS_FOTO} foto.`} />
            <div className="mt-5 flex flex-wrap gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-rambu px-4 py-3 text-sm font-semibold text-white transition hover:bg-rambu-tua has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-rambu">
                <Camera className="size-4" aria-hidden="true" />
                Ambil foto
                <input type="file" accept="image/*" capture="environment" onChange={tambahFoto} className="sr-only" />
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-rambu ring-1 ring-rambu/40 ring-inset hover:bg-rambu-muda has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-rambu">
                <ImagePlus className="size-4" aria-hidden="true" />
                Pilih dari galeri
                <input type="file" accept="image/*" multiple onChange={tambahFoto} className="sr-only" />
              </label>
            </div>
            <p className="mt-3 text-sm text-tinta-redup">Foto diperkecil otomatis sebelum dikirim, jadi hemat kuota.</p>
            {memprosesFoto && (
              <p className="mt-3 flex items-center gap-2 text-sm text-tinta-redup" role="status">
                <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                Menyiapkan foto…
              </p>
            )}
            {foto.length > 0 && (
              <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {foto.map((f) => (
                  <li key={f.pratinjau} className="relative overflow-hidden rounded-xl border border-garis motion-safe:animate-muncul">
                    {/* eslint-disable-next-line @next/next/no-img-element -- pratinjau lokal dari blob URL */}
                    <img src={f.pratinjau} alt="Pratinjau foto laporan" className="aspect-[4/3] w-full object-cover" />
                    <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-semibold shadow">
                      <Clock className="size-3" aria-hidden="true" />
                      {f.diambilPada ? "Ada waktu foto" : "Tanpa data waktu"}
                    </span>
                    <button
                      type="button"
                      onClick={() => hapusFoto(f.pratinjau)}
                      className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-white/95 text-bahaya shadow"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                      <span className="sr-only">Hapus foto</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {langkah === 4 && (
          <>
            <JudulLangkah ref={judulLangkah} judul="Siapa yang boleh melihat?" isi="Apa pun pilihannya, admin dan instansi tetap bisa menghubungimu kalau perlu." />
            <fieldset className="mt-5 space-y-3">
              <legend className="sr-only">Pilihan privasi</legend>
              {pilihanVisibilitas.map((p) => {
                const dipilih = visibilitas === p.id;
                const Ikon = p.ikon;
                return (
                  <label
                    key={p.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-rambu ${
                      dipilih ? "border-rambu bg-rambu-muda/60 ring-1 ring-rambu" : "border-garis hover:border-rambu/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="visibilitas"
                      value={p.id}
                      checked={dipilih}
                      onChange={() => {
                        setVisibilitas(p.id);
                        setVisibilitasDiubah(true);
                      }}
                      className="sr-only"
                    />
                    <Ikon className={`mt-0.5 size-5 shrink-0 ${dipilih ? "text-rambu" : "text-tinta-redup"}`} aria-hidden="true" />
                    <span>
                      <span className="block font-semibold">{p.judul}</span>
                      <span className="mt-0.5 block text-sm text-tinta-redup">{p.isi}</span>
                    </span>
                    {dipilih && <Check className="ml-auto size-5 shrink-0 text-rambu" aria-hidden="true" />}
                  </label>
                );
              })}
            </fieldset>
          </>
        )}

        {langkah === 5 && (
          <>
            <JudulLangkah ref={judulLangkah} judul="Periksa sebelum mengirim" isi="Setelah terkirim, laporan langsung masuk antrean verifikasi admin." />
            <dl className="mt-5 divide-y divide-garis rounded-xl border border-garis">
              <BarisPeriksa label="Lokasi" onUbah={() => pindah(0)}>
                {alamat}
                <br />
                Kecamatan {kecamatan}, {kotaTerpilih?.nama}
              </BarisPeriksa>
              <BarisPeriksa label="Masalah" onUbah={() => pindah(1)}>
                {kategoriTerpilih?.nama}
                <span className="block text-tinta-redup">Diteruskan ke {instansi?.nama}</span>
              </BarisPeriksa>
              <BarisPeriksa label="Cerita" onUbah={() => pindah(2)}>
                <span className="line-clamp-4 whitespace-pre-line">{cerita}</span>
              </BarisPeriksa>
              <BarisPeriksa label="Foto" onUbah={() => pindah(3)}>
                {foto.length ? `${foto.length} foto` : "Tidak ada foto"}
              </BarisPeriksa>
              <BarisPeriksa label="Privasi" onUbah={() => pindah(4)}>
                {pilihanVisibilitas.find((p) => p.id === visibilitas)?.judul}
              </BarisPeriksa>
            </dl>
            <label className="mt-6 flex items-start gap-3 text-sm leading-relaxed">
              <input
                type="checkbox"
                checked={setuju}
                onChange={(e) => {
                  setSetuju(e.target.checked);
                  setGalat(null);
                }}
                className="mt-1 size-4 shrink-0 accent-rambu"
              />
              <span>Isi laporan ini benar dan bisa saya pertanggungjawabkan.</span>
            </label>
          </>
        )}

        {galat && (
          <p role="alert" className="mt-5 rounded-xl bg-bahaya-muda px-4 py-3 text-sm text-bahaya motion-safe:animate-muncul">
            {galat}
          </p>
        )}

        <div className="mt-7 flex items-center justify-between gap-3 border-t border-garis pt-5">
          {langkah > 0 ? (
            <Tombol varian="hantu" onClick={() => pindah(langkah - 1)} disabled={mengirim}>
              <ArrowLeft className="size-4" aria-hidden="true" />
              Kembali
            </Tombol>
          ) : (
            <span />
          )}
          {langkah < LANGKAH.length - 1 ? (
            <Tombol onClick={lanjut} disabled={memprosesFoto} className="px-5 py-3">
              {langkah === 3 && foto.length === 0 ? "Lewati" : "Lanjut"}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Tombol>
          ) : (
            <Tombol onClick={kirim} memproses={mengirim} className="px-6 py-3">
              {mengirim ? "Mengirim…" : "Kirim laporan"}
            </Tombol>
          )}
        </div>
      </section>
    </div>
  );
}

function JudulLangkah({ ref, judul, isi }: { ref: React.Ref<HTMLHeadingElement>; judul: string; isi: string }) {
  return (
    <div>
      <h2 ref={ref} tabIndex={-1} className="text-xl font-bold focus:outline-none">
        {judul}
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-tinta-redup">{isi}</p>
    </div>
  );
}

function BarisPeriksa({ label, onUbah, children }: { label: string; onUbah: () => void; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 px-4 py-3.5 text-sm">
      <dt className="w-20 shrink-0 font-semibold">{label}</dt>
      <dd className="min-w-0 flex-1 leading-relaxed">{children}</dd>
      <dd className="shrink-0">
        <button type="button" onClick={onUbah} className="font-semibold text-rambu hover:text-rambu-tua">
          Ubah<span className="sr-only"> {label.toLowerCase()}</span>
        </button>
      </dd>
    </div>
  );
}

function LangkahBerikut({ nomor, judul, isi }: { nomor: number; judul: string; isi: string }) {
  return (
    <li className="flex gap-3">
      <span className="angka flex size-7 shrink-0 items-center justify-center rounded-full bg-rambu-muda text-xs font-bold text-rambu-tua">{nomor}</span>
      <span>
        <span className="block font-semibold">{judul}</span>
        <span className="text-tinta-redup">{isi}</span>
      </span>
    </li>
  );
}
