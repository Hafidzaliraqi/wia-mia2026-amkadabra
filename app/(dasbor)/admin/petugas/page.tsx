import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { kueri } from "@/lib/server/db";
import { cariInstansi } from "@/lib/data/referensi";
import { formatTanggal } from "@/lib/waktu";
import { FormAkunPetugas } from "@/components/dasbor/form-akun-petugas";

export const metadata: Metadata = { title: "Akun petugas" };

export default function HalamanAkunPetugas() {
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-extrabold tracking-tight">Akun petugas</h1>
      <p className="mt-1 text-tinta-redup">Akun petugas hanya bisa dibuat admin, supaya tidak ada yang mengaku-ngaku petugas.</p>
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-white motion-reduce:animate-none" />}>
          <DaftarPetugas />
        </Suspense>
        <section className="rounded-2xl border border-garis bg-white p-5">
          <h2 className="mb-4 font-bold">Tambah petugas</h2>
          <FormAkunPetugas />
        </section>
      </div>
    </div>
  );
}

async function DaftarPetugas() {
  await connection();
  const petugas = await kueri<{ id: string; nama: string; email: string; hp: string; instansi_id: string; dibuat_pada: Date }>(
    "SELECT id, nama, email, hp, instansi_id, dibuat_pada FROM pengguna WHERE peran = 'petugas' ORDER BY dibuat_pada DESC",
  );
  return (
    <div className="overflow-x-auto rounded-2xl border border-garis bg-white">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-garis bg-kertas/60 text-tinta-redup">
          <tr>
            <th scope="col" className="px-5 py-3 font-semibold">Nama</th>
            <th scope="col" className="px-4 py-3 font-semibold">Instansi</th>
            <th scope="col" className="px-4 py-3 font-semibold">Kontak</th>
            <th scope="col" className="px-5 py-3 font-semibold">Dibuat</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-garis">
          {petugas.map((p) => (
            <tr key={p.id}>
              <th scope="row" className="px-5 py-3.5 font-semibold">{p.nama}</th>
              <td className="px-4 py-3.5">{cariInstansi(p.instansi_id).nama}</td>
              <td className="px-4 py-3.5 text-tinta-redup">
                {p.email}
                <span className="angka block">{p.hp}</span>
              </td>
              <td className="angka px-5 py-3.5 text-tinta-redup">{formatTanggal(p.dibuat_pada)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
