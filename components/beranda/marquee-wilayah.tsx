import { MapPin } from "lucide-react";
import { daftarKota } from "@/lib/wilayah";

// Deretan nama wilayah layanan yang bergerak pelan
export function MarqueeWilayah() {
  const nama = daftarKota.map((k) => k.nama);
  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-malam-2 py-4 text-white/85">
      <p className="sr-only">Wilayah layanan: {nama.join(", ")}.</p>
      <div className="flex w-max motion-safe:animate-geser hover:[animation-play-state:paused]" aria-hidden="true">
        {[0, 1].map((salinan) => (
          <ul key={salinan} className="flex shrink-0 items-center gap-10 pr-10">
            {nama.map((n) => (
              <li key={n} className="flex items-center gap-2 text-sm font-semibold whitespace-nowrap">
                <MapPin className="size-4 text-sinyal" />
                {n}
              </li>
            ))}
          </ul>
        ))}
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-malam-2 to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-malam-2 to-transparent" />
    </div>
  );
}
