"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { type MapMarker } from "./map-utils";

// Fix default marker icons for webpack/next.js
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom colored marker icons
function createColoredIcon(color: "blue" | "red" | "green") {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
}

function FitBounds({ markers }: { markers: MapMarker[] }) {
  const map = useMap();

  useEffect(() => {
    if (markers.length === 0) return;
    if (markers.length === 1) {
      map.setView([markers[0].lat, markers[0].lng], 14);
    } else {
      const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [markers, map]);

  return null;
}

interface LeafletMapProps {
  markers: MapMarker[];
  showLine?: boolean;
  height?: string;
  className?: string;
}

export default function LeafletMapInner({
  markers,
  showLine = false,
  height = "300px",
  className = "",
}: LeafletMapProps) {
  const center: [number, number] =
    markers.length > 0
      ? [markers[0].lat, markers[0].lng]
      : [-5.45, 105.26]; // Default: Bandar Lampung

  return (
    <div style={{ height }} className={`rounded-lg overflow-hidden border border-white/10 ${className}`}>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((marker, idx) => (
          <Marker
            key={idx}
            position={[marker.lat, marker.lng]}
            icon={createColoredIcon(marker.color || "blue")}
          >
            <Popup>
              <span className="font-medium text-sm">{marker.label}</span>
            </Popup>
          </Marker>
        ))}
        {showLine && markers.length >= 2 && (
          <Polyline
            positions={markers.map((m) => [m.lat, m.lng] as [number, number])}
            color="#3b82f6"
            weight={2}
            dashArray="8 4"
          />
        )}
        <FitBounds markers={markers} />
      </MapContainer>
    </div>
  );
}

