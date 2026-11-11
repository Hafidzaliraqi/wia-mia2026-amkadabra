import type { Laporan } from "@/lib/types";
import { hitungTenggat } from "@/lib/sla";
import { eskalasiBerikutnya, tanggaEskalasi, tingkatSaatIni } from "@/lib/eskalasi";
import { formatHariTanggalJam } from "@/lib/waktu";

// Jalur tanggung jawab: siapa yang memegang laporan sekarang,
// dan ke mana laporan naik kalau batas waktu terlewati.
export function TanggaEskalasi({ laporan }: { laporan: Laporan }) {
  const tenggat = hitungTenggat(laporan);
  if (!tenggat || !tenggat.tanggungJawabPetugas) return null;
  const tangga = tanggaEskalasi(laporan);
  const tingkat = tingkatSaatIni(laporan);
  const berikut = eskalasiBerikutnya(laporan);

  return (
    <section className="rounded-2xl border border-garis bg-white p-5" aria-labelledby={`judul-tangga-${laporan.nomor}`}>
      <h2 id={`judul-tangga-${laporan.nomor}`} className="font-bold">
        Jalur tanggung jawab
      </h2>
      <p className="mt-1 text-sm text-tinta-redup">Lewat batas waktu, laporan naik ke tingkat berikutnya secara otomatis.</p>
      <ol className="mt-4">
        {tangga.map((t, i) => {
          const sekarangDi = i === tingkat;
          const terlewati = i < tingkat;
          return (
            <li key={t.tingkat} className="relative flex gap-3 pb-4 last:pb-0">
              {i < tangga.length - 1 && (
                <span aria-hidden="true" className={`absolute top-7 bottom-0 left-[11px] w-0.5 ${terlewati ? "bg-bahaya/40" : "bg-garis"}`} />
              )}
              <span
                className={`relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  sekarangDi
                    ? tingkat > 0
                      ? "bg-bahaya text-white ring-4 ring-bahaya-muda"
                      : "bg-rambu text-white ring-4 ring-rambu-muda"
                    : terlewati
                      ? "bg-bahaya-muda text-bahaya"
                      : "bg-kertas text-tinta-redup ring-1 ring-garis"
                }`}
              >
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className={`text-sm font-semibold ${i > tingkat ? "text-tinta-redup" : ""}`}>{t.nama}</p>
                <p className="text-xs text-tinta-redup">
                  {t.peran}
                  {sekarangDi && <span className={`font-semibold ${tingkat > 0 ? "text-bahaya" : "text-rambu"}`}> · memegang laporan</span>}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
      {berikut && (
        <p className="mt-4 rounded-xl bg-kertas px-3.5 py-2.5 text-xs leading-relaxed text-tinta-redup">
          Belum ditindaklanjuti sampai <span className="font-semibold text-tinta">{formatHariTanggalJam(berikut.waktu)} WIB</span>? Laporan
          naik ke {berikut.nama}.
        </p>
      )}
    </section>
  );
}
