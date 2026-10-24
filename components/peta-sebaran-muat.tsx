"use client";

import dynamic from "next/dynamic";
import type { TitikSebaran } from "@/components/peta-sebaran";

const PetaSebaran = dynamic(() => import("@/components/peta-sebaran"), {
  ssr: false,
  loading: () => <div className="h-[420px] animate-pulse rounded-2xl border border-garis bg-white motion-reduce:animate-none" />,
});

export function PetaSebaranMuat({ titik }: { titik: TitikSebaran[] }) {
  return <PetaSebaran titik={titik} />;
}
