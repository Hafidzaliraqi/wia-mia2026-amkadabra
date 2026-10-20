import type { Metadata } from "next";
import {
  BATAS_KONFIRMASI_HARI,
  SLA_RESPONS_HARI_KERJA,
  SLA_VERIFIKASI_HARI_KERJA,
  daftarKategori,
} from "@/lib/data/referensi";
import { laporanPerBulan, raporInstansi } from "@/lib/statistik";

export const metadata: Metadata = { title: "Transparansi" };

function teksPersen(nilai: number | null) {
  return nilai === null ? "–" : `${nilai}%`;
}

export default function HalamanTransparansi() {
  const rapor = [...raporInstansi()].sort((a, b) => (b.persenTepatWaktu ?? 0) - (a.persenTepatWaktu ?? 0));
  const perBulan = laporanPerBulan(3);
  const maksBulan = Math.max(...perBulan.map((b) => b.total), 1);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Transparansi</h1>
      <p className="mt-2 max-w-2xl text-tinta-redup">
        Kinerja setiap instansi dihitung otomatis dari riwayat laporan, tanpa diisi manual. Siapa pun
        bisa melihat dan membandingkannya.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-bold">Rapor instansi</h2>
        <p className="mt-1 text-sm text-tinta-redup">Diurutkan dari yang paling sering tepat waktu.</p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-garis bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-garis bg-kertas/60 text-tinta-redup">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">Instansi</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Laporan</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Respons awal</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Lama pengerjaan</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Tepat waktu</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Dibuka ulang</th>
                <th scope="col" className="px-5 py-3 text-right font-semibold">Lewat batas sekarang</th>
              </tr>
            </thead>
            <tbody className="angka divide-y divide-garis">
              {rapor.map((r) => (
                <tr key={r.instansi.id}>
                  <th scope="row" className="px-5 py-3.5 font-semibold">{r.instansi.nama}</th>
                  <td className="px-4 py-3.5 text-right">{r.masuk}</td>
                  <td className="px-4 py-3.5 text-right">
                    {r.rataJamRespons === null ? "–" : `${Math.round(r.rataJamRespons)} jam`}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {r.rataHariPenyelesaian === null ? "–" : `${r.rataHariPenyelesaian.toFixed(1)} hari`}
                  </td>
                  <td
                    className={`px-4 py-3.5 text-right font-semibold ${
                      (r.persenTepatWaktu ?? 100) < 70 ? "text-bahaya" : "text-tuntas"
                    }`}
                  >
                    {teksPersen(r.persenTepatWaktu)}
                  </td>
                  <td className="px-4 py-3.5 text-right">{teksPersen(r.persenDibukaUlang)}</td>
                  <td className={`px-5 py-3.5 text-right ${r.terlambatSekarang > 0 ? "font-semibold text-bahaya" : ""}`}>
                    {r.terlambatSekarang}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-tinta-redup">
          Respons awal dihitung sejak laporan diteruskan sampai instansi mulai mengerjakan. Dibuka ulang
          artinya pelapor menyatakan masalahnya belum beres setelah ditandai selesai.
        </p>
      </section>

      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="text-xl font-bold">Standar waktu layanan</h2>
          <p className="mt-1 text-sm text-tinta-redup">
            Batas waktu ini berlaku untuk semua laporan dan dihitung dalam hari kerja.
          </p>
          <dl className="mt-5 divide-y divide-garis rounded-2xl border border-garis bg-white">
            <BarisStandar label="Verifikasi oleh admin" nilai={`${SLA_VERIFIKASI_HARI_KERJA} hari kerja`} />
            <BarisStandar label="Respons awal instansi" nilai={`${SLA_RESPONS_HARI_KERJA} hari kerja`} />
            {daftarKategori.map((k) => (
              <BarisStandar key={k.id} label={`Penyelesaian: ${k.nama.toLowerCase()}`} nilai={`${k.slaHariKerja} hari kerja`} />
            ))}
            <BarisStandar label="Konfirmasi pelapor sebelum ditutup otomatis" nilai={`${BATAS_KONFIRMASI_HARI} hari`} />
          </dl>
        </section>

        <section>
          <h2 className="text-xl font-bold">Laporan per bulan</h2>
          <p className="mt-1 text-sm text-tinta-redup">Jumlah laporan baru yang masuk.</p>
          <ol className="mt-5 space-y-5 rounded-2xl border border-garis bg-white p-5">
            {perBulan.map((b) => (
              <li key={b.bulan}>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">{b.bulan}</span>
                  <span className="angka text-tinta-redup">{b.total} laporan</span>
                </div>
                <div className="mt-1.5 h-2.5 rounded-full bg-kertas">
                  <div className="h-full rounded-full bg-rambu" style={{ width: `${(b.total / maksBulan) * 100}%` }} />
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}

function BarisStandar({ label, nilai }: { label: string; nilai: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
      <dt>{label}</dt>
      <dd className="angka shrink-0 font-semibold">{nilai}</dd>
    </div>
  );
}
