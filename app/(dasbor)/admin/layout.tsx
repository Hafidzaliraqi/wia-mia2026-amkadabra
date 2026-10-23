import { Suspense } from "react";
import { KerangkaDasbor, PenjagaDasbor } from "@/components/dasbor/penjaga";

export default function TataLetak({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<KerangkaDasbor />}>
      <PenjagaDasbor peran="admin">{children}</PenjagaDasbor>
    </Suspense>
  );
}
