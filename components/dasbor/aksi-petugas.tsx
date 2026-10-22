"use client";

import { useState, useTransition } from "react";
import { Camera, CircleCheck, Trash2 } from "lucide-react";
import type { StatusLaporan } from "@/lib/types";
import { Tombol } from "@/components/dialog";
import { useToast } from "@/components/toast";
import { siapkanFoto, type FotoSiap } from "@/lib/foto-klien";
import { alihkanLaporan, kirimBalasan, mintaPerpanjangan, tandaiSelesai, terimaLaporan } from "@/lib/aksi/petugas";

const kelasIsian = "w-full rounded-xl border border-garis bg-white px-3.5 py-2.5 text-sm focus:border-rambu focus:outline-none";

function Kartu({ judul, isi, children }: { judul: string; isi?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-garis bg-white p-5">
      <h2 className="font-bold">{judul}</h2>
      {isi && <p className="mt-1 text-sm leading-relaxed text-tinta-redup">{isi}</p>}
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

export function PanelPetugas({
  nomor,
  status,
  bisaPerpanjang,
  instansiLain,
}: {
  nomor: string;
  status: StatusLaporan;
  bisaPerpanjang: boolean;
  instansiLain: { id: string; nama: string }[];
}) {
  const toast = useToast();
  const [memproses, mulai] = useTransition();
  const [aksiAktif, setAksiAktif] = useState<string | null>(null);
  const [catatanTerima, setCatatanTerima] = useState("");
  const [kabar, setKabar] = useState("");
  const [catatanSelesai, setCatatanSelesai] = useState("");
  const [foto, setFoto] = useState<FotoSiap[]>([]);
  const [hari, setHari] = useState(7);
  const [alasanPerpanjang, setAlasanPerpanjang] = useState("");
  const [tujuan, setTujuan] = useState("");
  const [alasanAlih, setAlasanAlih] = useState("");

  function jalankan(nama: string, aksi: () => Promise<{ ok: boolean; pesan?: string }>, pesanSukses: string, setelah?: () => void) {
    setAksiAktif(nama);
    mulai(async () => {
      const hasil = await aksi();
      if (!hasil.ok) toast("galat", hasil.pesan ?? "Gagal menyimpan.");
      else {
        toast("sukses", pesanSukses);
        setelah?.();
      }
    });
  }

  if (!["diteruskan", "diproses"].includes(status)) {
    return (
      <Kartu
        judul={status === "menunggu_konfirmasi" ? "Menunggu konfirmasi warga" : "Tidak ada tindakan"}
        isi={
          status === "menunggu_konfirmasi"
            ? "Pelapor atau pendukung akan mengonfirmasi apakah masalahnya benar-benar beres. Kalau dibuka ulang, laporan kembali ke antreanmu."
            : "Laporan ini sudah ditutup."
        }
      >
        <span />
      </Kartu>
    );
  }

  return (
    <div className="space-y-6">
      {status === "diteruskan" && (
        <Kartu judul="Laporan baru untuk instansimu" isi="Terima laporan untuk mulai menghitung batas waktu penyelesaian.">
          <textarea rows={3} value={catatanTerima} onChange={(e) => setCatatanTerima(e.target.value)} placeholder="Catatan untuk warga (opsional), misal jadwal survei" className={kelasIsian} aria-label="Catatan untuk warga" />
          <Tombol
            className="w-full"
            memproses={memproses && aksiAktif === "terima"}
            disabled={memproses}
            onClick={() => jalankan("terima", () => terimaLaporan(nomor, catatanTerima), "Laporan diterima. Warga sudah diberi tahu.")}
          >
            Terima dan mulai kerjakan
          </Tombol>
        </Kartu>
      )}

      {status === "diproses" && (
        <Kartu judul="Tandai selesai" isi="Wajib lampirkan foto sesudah pekerjaan. Warga akan diminta mengonfirmasi dalam 10 hari.">
          <textarea rows={3} value={catatanSelesai} onChange={(e) => setCatatanSelesai(e.target.value)} placeholder="Apa yang sudah dikerjakan?" className={kelasIsian} aria-label="Catatan pekerjaan" />
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-garis px-4 py-3 text-sm font-semibold text-rambu hover:border-rambu has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-rambu">
            <Camera className="size-4" aria-hidden="true" />
            {foto.length ? "Tambah foto lagi" : "Ambil atau pilih foto sesudah"}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              className="sr-only"
              onChange={async (e) => {
                const berkas = Array.from(e.target.files ?? []).slice(0, 3 - foto.length);
                e.target.value = "";
                const siap = await Promise.all(berkas.map(siapkanFoto));
                setFoto((lama) => [...lama, ...siap].slice(0, 3));
              }}
            />
          </label>
          {foto.length > 0 && (
            <ul className="grid grid-cols-3 gap-2">
              {foto.map((f) => (
                <li key={f.pratinjau} className="relative overflow-hidden rounded-lg border border-garis">
                  {/* eslint-disable-next-line @next/next/no-img-element -- pratinjau lokal */}
                  <img src={f.pratinjau} alt="Pratinjau foto sesudah" className="aspect-square w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setFoto((lama) => lama.filter((x) => x.pratinjau !== f.pratinjau))}
                    className="absolute top-1 right-1 flex size-7 items-center justify-center rounded-full bg-white/95 text-bahaya shadow"
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                    <span className="sr-only">Hapus foto</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <Tombol
            varian="tuntas"
            className="w-full"
            memproses={memproses && aksiAktif === "selesai"}
            disabled={memproses}
            onClick={() => {
              const data = new FormData();
              data.set("nomor", nomor);
              data.set("catatan", catatanSelesai);
              foto.forEach((f) => data.append("foto", f.berkas));
              jalankan("selesai", () => tandaiSelesai(data), "Ditandai selesai. Warga diminta mengonfirmasi.");
            }}
          >
            <CircleCheck className="size-4" aria-hidden="true" />
            Tandai selesai
          </Tombol>
        </Kartu>
      )}

      <Kartu judul="Kirim kabar ke warga" isi="Kabar tampil di riwayat laporan dan dikirim ke pelapor serta pendukung.">
        <textarea rows={3} value={kabar} onChange={(e) => setKabar(e.target.value)} placeholder="Contoh: Material sudah datang, pengerjaan dimulai besok pagi." className={kelasIsian} aria-label="Isi kabar" />
        <Tombol
          varian="garis"
          className="w-full"
          memproses={memproses && aksiAktif === "kabar"}
          disabled={memproses}
          onClick={() => jalankan("kabar", () => kirimBalasan(nomor, kabar), "Kabar terkirim ke warga.", () => setKabar(""))}
        >
          Kirim kabar
        </Tombol>
      </Kartu>

      {status === "diproses" && bisaPerpanjang && (
        <Kartu judul="Minta perpanjangan" isi="Hanya sekali per putaran pengerjaan. Alasan ditampilkan ke publik.">
          <label className="block text-sm font-semibold" htmlFor="hari-perpanjangan">
            Tambahan waktu
          </label>
          <select id="hari-perpanjangan" value={hari} onChange={(e) => setHari(Number(e.target.value))} className={kelasIsian}>
            {[3, 5, 7, 10, 14].map((h) => (
              <option key={h} value={h}>{h} hari kerja</option>
            ))}
          </select>
          <textarea rows={2} value={alasanPerpanjang} onChange={(e) => setAlasanPerpanjang(e.target.value)} placeholder="Alasan perpanjangan" className={kelasIsian} aria-label="Alasan perpanjangan" />
          <Tombol
            varian="hantu"
            className="w-full ring-1 ring-garis ring-inset"
            memproses={memproses && aksiAktif === "perpanjang"}
            disabled={memproses}
            onClick={() => jalankan("perpanjang", () => mintaPerpanjangan(nomor, hari, alasanPerpanjang), "Batas waktu diperpanjang.")}
          >
            Perpanjang batas waktu
          </Tombol>
        </Kartu>
      )}

      <details className="group rounded-2xl border border-garis bg-white">
        <summary className="cursor-pointer list-none px-5 py-4 font-bold [&::-webkit-details-marker]:hidden">
          Bukan kewenangan instansimu?
          <span className="block text-sm font-normal text-tinta-redup">Alihkan ke instansi lain di daerah yang sama.</span>
        </summary>
        <div className="space-y-3 border-t border-garis px-5 py-4">
          <select value={tujuan} onChange={(e) => setTujuan(e.target.value)} className={kelasIsian} aria-label="Instansi tujuan">
            <option value="">Pilih instansi tujuan</option>
            {instansiLain.map((i) => (
              <option key={i.id} value={i.id}>{i.nama}</option>
            ))}
          </select>
          <textarea rows={2} value={alasanAlih} onChange={(e) => setAlasanAlih(e.target.value)} placeholder="Alasan pengalihan" className={kelasIsian} aria-label="Alasan pengalihan" />
          <Tombol
            varian="gelap"
            className="w-full"
            memproses={memproses && aksiAktif === "alih"}
            disabled={memproses}
            onClick={() => jalankan("alih", () => alihkanLaporan(nomor, tujuan, alasanAlih), "Laporan dialihkan.")}
          >
            Alihkan laporan
          </Tombol>
        </div>
      </details>
    </div>
  );
}
