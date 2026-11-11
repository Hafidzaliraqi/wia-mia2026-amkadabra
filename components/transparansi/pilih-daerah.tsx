"use client";

import { usePathname, useRouter } from "next/navigation";

export function PilihDaerah({ nilai, daftar }: { nilai: string; daftar: { id: string; nama: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <select
      aria-label="Pilih daerah"
      value={nilai}
      onChange={(e) => router.replace(e.target.value === "semua" ? pathname : `${pathname}?kota=${e.target.value}`, { scroll: false })}
      className="rounded-xl border border-garis bg-white px-3 py-2.5 text-sm font-semibold focus:border-rambu focus:outline-none"
    >
      <option value="semua">Semua daerah</option>
      {daftar.map((k) => (
        <option key={k.id} value={k.id}>
          {k.nama}
        </option>
      ))}
    </select>
  );
}
