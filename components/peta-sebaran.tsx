"use client";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from "react-leaflet";

export interface TitikSebaran {
  kunci: string;
  nama: string;
  lat: number;
  lng: number;
  total: number;
  terlambat: number;
}

function warna(t: TitikSebaran) {
  const porsi = t.total ? t.terlambat / t.total : 0;
  return porsi >= 0.25 ? "#b42318" : porsi >= 0.1 ? "#d99a1c" : "#157347";
}

function PasBatas({ titik }: { titik: TitikSebaran[] }) {
  const peta = useMap();
  useEffect(() => {
    if (titik.length) peta.fitBounds(titik.map((t) => [t.lat, t.lng] as [number, number]), { padding: [24, 24] });
  }, [peta, titik]);
  return null;
}

export default function PetaSebaran({ titik }: { titik: TitikSebaran[] }) {
  return (
    <div className="isolate overflow-hidden rounded-2xl border border-garis">
      <MapContainer center={[-6.4, 106.9]} zoom={8} scrollWheelZoom={false} className="h-[420px] w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <PasBatas titik={titik} />
        {titik.map((t) => (
          <CircleMarker
            key={t.kunci}
            center={[t.lat, t.lng]}
            radius={5 + Math.sqrt(t.total) * 3}
            pathOptions={{ color: "white", weight: 1.5, fillColor: warna(t), fillOpacity: 0.85 }}
          >
            <Tooltip>
              <strong>{t.nama}</strong>
              <br />
              {t.total} laporan, {t.terlambat} lewat batas waktu
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
