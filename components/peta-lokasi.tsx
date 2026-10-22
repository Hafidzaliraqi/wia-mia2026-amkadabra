"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";

export interface Titik {
  lat: number;
  lng: number;
}

// Pin dibuat dari HTML supaya tidak perlu file gambar ikon bawaan Leaflet
const ikonPin = L.divIcon({
  className: "",
  html: `<svg width="36" height="44" viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M18 1C8.6 1 1 8.4 1 17.6 1 29.4 15.2 41.6 16.8 43a1.8 1.8 0 0 0 2.4 0C20.8 41.6 35 29.4 35 17.6 35 8.4 27.4 1 18 1z" fill="#1f4fa8" stroke="white" stroke-width="2"/>
    <circle cx="18" cy="17.5" r="6" fill="white"/>
  </svg>`,
  iconSize: [36, 44],
  iconAnchor: [18, 43],
});

function KlikPeta({ onPilih }: { onPilih: (titik: Titik) => void }) {
  useMapEvents({
    click(event) {
      onPilih({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });
  return null;
}

// Pindahkan tampilan peta kalau lokasi dipilih dari pencarian atau GPS
function IkutiFokus({ fokus }: { fokus: { titik: Titik; urut: number } | null }) {
  const peta = useMap();
  useEffect(() => {
    if (!fokus) return;
    peta.flyTo([fokus.titik.lat, fokus.titik.lng], Math.max(peta.getZoom(), 17), { duration: 0.6 });
  }, [peta, fokus]);
  return null;
}

export default function PetaLokasi({
  titik,
  pusatAwal,
  fokus,
  onPilih,
}: {
  titik: Titik | null;
  pusatAwal: Titik;
  fokus: { titik: Titik; urut: number } | null;
  onPilih: (titik: Titik) => void;
}) {
  return (
    // isolate: supaya tombol peta tidak menutupi navbar saat halaman di-scroll
    <div className="isolate overflow-hidden rounded-xl border border-garis">
      <MapContainer
        center={[titik?.lat ?? pusatAwal.lat, titik?.lng ?? pusatAwal.lng]}
        zoom={titik ? 17 : 13}
        scrollWheelZoom={false}
        className="h-72 w-full sm:h-80"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <KlikPeta onPilih={onPilih} />
        <IkutiFokus fokus={fokus} />
        {titik && (
          <Marker
            position={[titik.lat, titik.lng]}
            icon={ikonPin}
            draggable
            eventHandlers={{
              dragend(event) {
                const posisi = (event.target as L.Marker).getLatLng();
                onPilih({ lat: posisi.lat, lng: posisi.lng });
              },
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
