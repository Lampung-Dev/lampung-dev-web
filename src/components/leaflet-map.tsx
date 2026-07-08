"use client";

import dynamic from "next/dynamic";
import type { MapMarker } from "./map-utils";

// Re-export utilities (they don't depend on Leaflet DOM)
export { calculateDistance, parseGoogleMapsUrl } from "./map-utils";
export type { MapMarker } from "./map-utils";

const LeafletMapInner = dynamic(() => import("./leaflet-map-inner"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center bg-muted/30 rounded-lg border border-white/10" style={{ height: "300px" }}>
      <p className="text-sm text-muted-foreground animate-pulse">Memuat peta...</p>
    </div>
  ),
});

interface LeafletMapProps {
  markers: MapMarker[];
  showLine?: boolean;
  height?: string;
  className?: string;
}

export default function LeafletMap(props: LeafletMapProps) {
  return <LeafletMapInner {...props} />;
}
