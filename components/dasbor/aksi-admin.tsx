"use client";

import { useState, useTransition } from "react";
import type { Risiko } from "@/lib/server/risiko";
import { Tombol } from "@/components/dialog";
import { useToast } from "@/components/toast";
import { tegurInstansi, tolakLaporan, verifikasiLaporan } from "@/lib/aksi/admin";

const kelasIsian = "w-full rounded-xl border border-garis bg-white px-3.5 py-2.5 text-sm focus:border-rambu focus:outline-none";
const warnaRisiko = { tinggi: "bg-bahaya-muda text-bahaya", sedang: "bg-waspada-muda text-waspada", info: "bg-kertas text-tinta-redup" };

export function PanelAdmin({
  nomor,
  menungguVerifikasi,
  terlambat,
  instansiDefault,
  instansiWilayah,
  risiko,
}: {
  nomor: string;
  menungguVerifikasi: boolean;
  terlambat: boolean;
  instansiDefault: string;
  instansiWilayah: { id: string; nama: string }[];
  risiko: Risiko[];
}) {
  const toast = useToast();
  const [memproses, mulai] = useTransition();
  const [aksi, setAksi] = useState<string | null>(null);
  const [instansi, setInstansi] = useState(instansiDefault);
  const [modeTolak, setModeTolak] = useState(false);
  const [alasan, setAlasan] = useState("");
  const [palsu, setPalsu] = useState(false);
  const [teguran, setTeguran] = useState("");

  function jalankan(nama: string, fn: () => Promise<{ ok: boolean; pesan?: string }>, sukses: string) {
    setAksi(nama);
    mulai(async () => {
      const hasil = await fn();
      if (!hasil.ok) toast("galat", hasil.pesan ?? "Gagal menyimpan.");
      else toast("sukses", sukses);
    });
  }

  return (
    <div className="space-y-6">
      {menungguVerifikasi && (
        <section className="rounded-2xl border border-garis bg-white p-5">
          <h2 className="font-bold">Verifikasi laporan</h2>
          {risiko.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {risiko.map((r) => (
                <li key={r.label} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${warnaRisiko[r.tingkat]}`}>
                  {r.label}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-sm text-tuntas">Tidak ada tanda risiko.</p>
          )}
          {!modeTolak ? (
            <div className="mt-4 space-y-3">
              <label htmlFor="instansi-tujuan" className="block text-sm font-semibold">
                Teruskan ke
              </label>
              <select id="instansi-tujuan" value={instansi} onChange={(e) => setInstansi(e.target.value)} className={kelasIsian}>
                {instansiWilayah.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.nama}
                    {i.id === instansiDefault ? " (otomatis)" : ""}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <Tombol memproses={memproses && aksi === "terima"} disabled={memproses} onClick={() => jalankan("terima", () => verifikasiLaporan(nomor, instansi), "Laporan diverifikasi dan diteruskan.")}>
                  Verifikasi
                </Tombol>
                <Tombol varian="hantu" className="text-bahaya ring-1 ring-bahaya/30 ring-inset hover:bg-bahaya-muda hover:text-bahaya" disabled={memproses} onClick={() => setModeTolak(true)}>
                  Tolak
                </Tombol>
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <textarea rows={3} value={alasan} onChange={(e) => setAlasan(e.target.value)} placeholder="Alasan penolakan (dikirim ke pelapor)" className={kelasIsian} aria-label="Alasan penolakan" />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={palsu} onChange={(e) => setPalsu(e.target.checked)} className="size-4 accent-bahaya" />
                Tandai sebagai laporan palsu
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Tombol varian="bahaya" memproses={memproses && aksi === "tolak"} disabled={memproses} onClick={() => jalankan("tolak", () => tolakLaporan(nomor, alasan, palsu), "Laporan ditolak. Pelapor sudah diberi tahu.")}>
                  Tolak laporan
                </Tombol>
                <Tombol varian="hantu" disabled={memproses} onClick={() => setModeTolak(false)}>
                  Batal
                </Tombol>
              </div>
            </div>
          )}
        </section>
      )}

      {terlambat && (
        <section className="rounded-2xl border-2 border-bahaya/30 bg-bahaya-muda p-5">
          <h2 className="font-bold text-bahaya">Lewat batas waktu</h2>
          <p className="mt-1 text-sm text-tinta-redup">Kirim teguran resmi ke instansi. Teguran tercatat di riwayat publik.</p>
          <textarea rows={3} value={teguran} onChange={(e) => setTeguran(e.target.value)} placeholder="Isi teguran" className={`${kelasIsian} mt-3`} aria-label="Isi teguran" />
          <Tombol varian="bahaya" className="mt-3 w-full" memproses={memproses && aksi === "tegur"} disabled={memproses} onClick={() => jalankan("tegur", () => tegurInstansi(nomor, teguran), "Teguran terkirim ke instansi.")}>
            Kirim teguran
          </Tombol>
        </section>
      )}

      {!menungguVerifikasi && !terlambat && (
        <section className="rounded-2xl border border-garis bg-white p-5 text-sm text-tinta-redup">Tidak ada tindakan admin untuk laporan ini.</section>
      )}
    </div>
  );
}
