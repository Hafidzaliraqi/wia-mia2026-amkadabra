import type { Kejadian, Laporan } from "@/lib/types";
import { cariInstansi } from "@/lib/data/referensi";
import { tanggaEskalasi } from "@/lib/eskalasi";
import { formatTanggalJam } from "@/lib/waktu";

// Log integrasi (webhook simulasi): data yang dikirim ke sistem instansi
// dan saluran notifikasi setiap kali laporan berubah tahap.
function peristiwa(k: Kejadian, laporan: Laporan) {
  const instansi = cariInstansi(laporan.instansiId);
  const tangga = tanggaEskalasi(laporan);
  switch (k.jenis) {
    case "dibuat":
      return { event: "laporan.dibuat", tujuan: "antrean-verifikasi", efek: "Masuk antrean verifikasi admin." };
    case "diverifikasi":
      return { event: "laporan.diverifikasi", tujuan: "routing", efek: "Lolos verifikasi, sistem memilih instansi." };
    case "diteruskan":
      return { event: "laporan.diteruskan", tujuan: instansi.id, efek: `Masuk antrean ${instansi.nama}. Pelapor dikabari lewat WhatsApp dan email.` };
    case "diproses":
      return { event: "laporan.diproses", tujuan: "notifikasi-warga", efek: "Pelapor dan pendukung dikabari laporan mulai dikerjakan." };
    case "balasan":
      return { event: "pesan.petugas", tujuan: "notifikasi-warga", efek: "Pesan petugas dikirim ke pelapor dan pendukung." };
    case "ditandai_selesai":
      return { event: "laporan.ditandai_selesai", tujuan: "notifikasi-warga", efek: "Pelapor diminta konfirmasi dalam 10 hari." };
    case "dikonfirmasi_beres":
      return { event: "laporan.selesai", tujuan: "rapor-publik", efek: "Rapor instansi di halaman Transparansi diperbarui." };
    case "eskalasi":
      return {
        event: "laporan.eskalasi",
        tujuan: `eskalasi-tingkat-${k.tingkat ?? 1}`,
        efek: `Diteruskan ke ${tangga.at(Math.min(3, k.tingkat ?? 1))?.nama}. Petugas dan pelapor dikabari.`,
      };
    default:
      return { event: `laporan.${k.jenis}`, tujuan: "notifikasi-warga", efek: "Pihak terkait dikabari." };
  }
}

export function LogIntegrasi({ laporan }: { laporan: Laporan }) {
  const daftar = [...laporan.riwayat].reverse();
  return (
    <section className="rounded-3xl border border-garis bg-white p-6" aria-labelledby="judul-log">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="judul-log" className="text-xl font-bold">
          Log integrasi
        </h2>
        <span className="rounded-full bg-sinyal-muda px-2.5 py-1 text-xs font-semibold text-waspada">Webhook simulasi</span>
      </div>
      <p className="mt-1 text-sm text-tinta-redup">Data yang dikirim ke sistem instansi dan saluran notifikasi setiap laporan berubah tahap.</p>
      <ol className="mt-5 space-y-3">
        {daftar.map((k, i) => {
          const p = peristiwa(k, laporan);
          const muatan = {
            event: p.event,
            nomor: laporan.nomor,
            instansi: cariInstansi(laporan.instansiId).nama,
            waktu: k.waktu,
            ...(k.tingkat ? { tingkat_eskalasi: k.tingkat } : {}),
            ...(k.catatan ? { catatan: k.catatan } : {}),
          };
          return (
            <li key={`${k.waktu}-${i}`} className={`rounded-2xl border border-garis p-4 ${i === 0 ? "motion-safe:animate-muncul" : ""}`}>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="kode rounded-md bg-tuntas-muda px-2 py-0.5 font-bold text-tuntas">200</span>
                <span className="kode font-semibold break-all">POST /v1/webhook/{p.tujuan}</span>
                <span className="ml-auto text-tinta-redup">{formatTanggalJam(k.waktu)}</span>
              </div>
              <pre className="kode mt-3 rounded-xl bg-malam p-3.5 text-xs leading-relaxed break-all whitespace-pre-wrap text-white/85">{JSON.stringify(muatan, null, 2)}</pre>
              <p className="mt-2 text-sm text-tinta-redup">{p.efek}</p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
