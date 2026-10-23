import {
  Building2,
  Bus,
  CircleParking,
  Construction,
  Droplets,
  Factory,
  FileStack,
  FileText,
  Footprints,
  HandHeart,
  Hospital,
  IdCard,
  Leaf,
  Lightbulb,
  Route,
  Scale,
  School,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Store,
  TrafficCone,
  Trash2,
  TreeDeciduous,
  type LucideIcon,
} from "lucide-react";
import type { KategoriId, KelompokId } from "@/lib/types";

const ikonKategori: Record<KategoriId, LucideIcon> = {
  "jalan-rusak": Construction,
  trotoar: Footprints,
  "lampu-jalan": Lightbulb,
  rambu: TrafficCone,
  angkutan: Bus,
  sampah: Trash2,
  drainase: Droplets,
  pencemaran: Factory,
  "pohon-taman": TreeDeciduous,
  faskes: Hospital,
  sekolah: School,
  fasum: Store,
  kependudukan: IdCard,
  perizinan: FileText,
  bansos: HandHeart,
  parkir: CircleParking,
  pkl: Store,
  pungli: ShieldAlert,
  wewenang: Scale,
};

const ikonKelompok: Record<KelompokId, LucideIcon> = {
  jalan: Route,
  lingkungan: Leaf,
  fasilitas: Building2,
  administrasi: FileStack,
  ketertiban: Siren,
  integritas: ShieldCheck,
};

export function KategoriIkon({ id, className = "size-5" }: { id: KategoriId; className?: string }) {
  const Ikon = ikonKategori[id] ?? FileText;
  return <Ikon className={className} aria-hidden="true" />;
}

export function KelompokIkon({ id, className = "size-5" }: { id: KelompokId; className?: string }) {
  const Ikon = ikonKelompok[id];
  return <Ikon className={className} aria-hidden="true" />;
}
