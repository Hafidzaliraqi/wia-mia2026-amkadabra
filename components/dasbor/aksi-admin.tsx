"use client";

import { useState, useTransition } from "react";
import { CircleCheck, Flag } from "lucide-react";
import type { Risiko } from "@/lib/server/risiko";
import { Tombol } from "@/components/dialog";
import { useToast } from "@/components/toast";
import { abaikanTanda, tegurInstansi, tolakLaporan, tutupTidakValid, verifikasiLaporan } from "@/lib/aksi/admin";

const kelasIsian = "w-full rounded-xl border border-garis bg-white px-3.5 py-2.5 text-sm focus:border-rambu focus:outline-none";
const warnaRisiko = { tinggi: "bg-bahaya-muda text-bahaya", sedang: "bg-waspada-muda text-waspada", info: "bg-kertas text-tinta-redup" };

export function PanelAdmin({
  nomor,
  menungguVerifikasi,
  terlambat,
  instansiDefault,
  instansiWilayah,
  risiko,
  jumlahTanda,
  aktif,
  teguranTerakhir,
}: {
  nomor: string;
  menungguVerifikasi: boolean;
  terlambat: boolean;
  instansiDefault: string;
  instansiWilayah: { id: string; nama: string }[];
  risiko: Risiko[];
  jumlahTanda: number;
  aktif: boolean;
  teguranTerakhir: string | null;
}) {
  const toast = useToast();
  const [memproses, mulai] = useTransition();
  const [aksi, setAksi] = useState<string | null>(null);
  const [instansi, setInstansi] = useState(instansiDefault);
  const [modeTolak, setModeTolak] = useState(false);
  const [alasan, setAlasan] = useState("");
  const [palsu, setPalsu] = useState(false);
  const [teguran, setTeguran] = useState("");
  const [teguranBaru, setTeguranBaru] = useState(false);
  const [alasanTutup, setAlasanTutup] = useState("");

  function jalankan(nama: string, fn: () => Promise<{ ok: boolean; pesan?: string }>, sukses: string, setelah?: () => void) {
    setAksi(nama);
    mulai(async () => {
      const hasil = await fn();
      if (!hasil.ok) return toast("galat", hasil.pesan ?? "Gagal menyimpan.");
      toast("sukses", sukses);
      setelah?.();
    });
  }

  const sudahDitegur = teguranBaru || teguranTerakhir !== null;

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
            <div className="mt-4 space-y-3 motion-safe:animate-muncul">
              <textarea rows={3} value={alasan} onChange={(e) => setAlasan(e.target.value)} placeholder="Alasan penolakan (dikirim ke pelapor)" className={kelasIsian} aria-label="Alasan penolakan" />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={palsu} onChange={(e) => setPalsu(e.target.checked)} className="size-4 accent-bahaya" />
                Tandai sebagai laporan palsu
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Tombol varian="bahaya" memproses={memproses && aksi === "tolak"} disabled={memproses} onClick={() => jalankan("tolak", () => tolakLaporan(nomor, alasan, palsu), "Laporan ditolak. Pelapor sudah diberi tahu.", () => setAlasan(""))}>
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
          {sudahDitegur ? (
            <p className="mt-2 flex gap-2 rounded-xl bg-white px-3.5 py-3 text-sm motion-safe:animate-muncul" role="status">
              <CircleCheck className="mt-0.5 size-4 shrink-0 text-tuntas" aria-hidden="true" />
              <span>
                Teguran terkirim {teguranBaru ? "barusan" : teguranTerakhir} dan tercatat di riwayat publik. Petugas instansi mendapat
                notifikasi. Teguran berikutnya bisa dikirim setelah 24 jam.
              </span>
            </p>
          ) : (
            <>
              <p className="mt-1 text-sm text-tinta-redup">
                Sistem sudah mengeskalasi otomatis. Kirim teguran resmi supaya instansi segera menindaklanjuti. Teguran tercatat di
                riwayat publik dan masuk ke notifikasi petugas.
              </p>
              <textarea rows={3} value={teguran} onChange={(e) => setTeguran(e.target.value)} placeholder="Isi teguran" className={`${kelasIsian} mt-3`} aria-label="Isi teguran" />
              <Tombol
                varian="bahaya"
                className="mt-3 w-full"
                memproses={memproses && aksi === "tegur"}
                disabled={memproses}
                onClick={() => jalankan("tegur", () => tegurInstansi(nomor, teguran), "Teguran terkirim ke instansi.", () => {
                  setTeguran("");
                  setTeguranBaru(true);
                })}
              >
                Kirim teguran
              </Tombol>
            </>
          )}
        </section>
      )}

      {jumlahTanda > 0 && aktif && (
        <section className="rounded-2xl border border-garis bg-white p-5">
          <h2 className="flex items-center gap-2 font-bold">
            <Flag className="size-4 text-waspada" aria-hidden="true" />
            Ditandai tidak sesuai oleh {jumlahTanda} warga
          </h2>
          <p className="mt-1 text-sm text-tinta-redup">Baca alasannya di kolom kiri. Kalau memang tidak valid, tutup laporannya.</p>
          <textarea rows={2} value={alasanTutup} onChange={(e) => setAlasanTutup(e.target.value)} placeholder="Alasan menutup (tampil ke publik)" className={`${kelasIsian} mt-3`} aria-label="Alasan menutup laporan" />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Tombol varian="bahaya" memproses={memproses && aksi === "tutup"} disabled={memproses} onClick={() => jalankan("tutup", () => tutupTidakValid(nomor, alasanTutup), "Laporan ditutup sebagai tidak valid.", () => setAlasanTutup(""))}>
              Tutup laporan
            </Tombol>
            <Tombol varian="hantu" className="ring-1 ring-garis ring-inset" memproses={memproses && aksi === "abaikan"} disabled={memproses} onClick={() => jalankan("abaikan", () => abaikanTanda(nomor), "Tanda diabaikan. Laporan tetap berjalan.")}>
              Laporan valid
            </Tombol>
          </div>
        </section>
      )}

      {!menungguVerifikasi && !terlambat && !(jumlahTanda > 0 && aktif) && (
        <section className="rounded-2xl border border-garis bg-white p-5 text-sm text-tinta-redup">
          Tidak ada tindakan admin untuk laporan ini. Admin bertindak saat laporan baru masuk, lewat batas waktu, atau ditandai warga.
        </section>
      )}
    </div>
  );
}
