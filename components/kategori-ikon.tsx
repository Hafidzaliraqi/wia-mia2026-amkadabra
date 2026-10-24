import {
  Construction,
  Droplets,
  FileText,
  HandHeart,
  Lightbulb,
  ShieldAlert,
  Trash2,
  Trees,
  type LucideIcon,
} from "lucide-react";
import type { KategoriId } from "@/lib/types";

const ikon: Record<KategoriId, LucideIcon> = {
  jalan: Construction,
  lampu: Lightbulb,
  sampah: Trash2,
  drainase: Droplets,
  fasum: Trees,
  bansos: HandHeart,
  perizinan: FileText,
  pungli: ShieldAlert,
};

export function KategoriIkon({ id, className = "size-5" }: { id: KategoriId; className?: string }) {
  const Ikon = ikon[id];
  return <Ikon className={className} aria-hidden="true" />;
}
