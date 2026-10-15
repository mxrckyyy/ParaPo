"use client";

// Client-only Leaflet map. Always loaded via next/dynamic with ssr:false
// (Leaflet touches `window` at render). Never import this in a Server Component directly.
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type { DemoReport, DemoVehicle } from "@/types";
import type { LeafletMouseEvent } from "leaflet";

const TILE_URL =
  process.env.NEXT_PUBLIC_MAP_TILE_URL ??
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

function MapReadyCapture({ onReady }: { onReady?: (map: import("leaflet").Map) => void }) {
  const map = useMap();
  useEffect(() => {
    onReady?.(map);
  }, [map, onReady]);
  return null;
}

function MapClickCatcher({ onClick }: { onClick?: () => void }) {
  useMapEvents({ click: () => onClick?.() });
  return null;
}

const vehicleColor = (status: DemoVehicle["status"]) =>
  status === "full" ? "#64748B" : "#10B981";

const reportColor = (type: DemoReport["type"]) =>
  type === "traffic" ? "#D97706" : type === "accident" ? "#DC2626" : type === "closure" ? "#0F172A" : "#64748B";

/** Keeps Leaflet in sync with CSS-driven container size changes. */
function ResizeInvalidator() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(container);
    return () => observer.disconnect();
  }, [map]);
  return null;
}

export function MapView({
  center,
  vehicles,
  reports,
  dimmedVehicleIds = [],
  mapLabel = "Demonstration transport map of Metro Manila",
  onMapReady,
  onVehicleSelect,
  onReportSelect,
  onMapClick,
  selectedVehicleId = null,
  selectedReportId = null,
}: {
  center: [number, number];
  vehicles: DemoVehicle[];
  reports: DemoReport[];
  dimmedVehicleIds?: string[];
  mapLabel?: string;
  onMapReady?: (map: import("leaflet").Map) => void;
  onVehicleSelect?: (vehicle: DemoVehicle | null) => void;
  onReportSelect?: (report: DemoReport | null) => void;
  onMapClick?: () => void;
  selectedVehicleId?: string | null;
  selectedReportId?: string | null;
}) {
  const tileUrl = useMemo(() => TILE_URL, []);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="relative h-full min-h-[320px] w-full">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom
        className="h-full min-h-[320px] w-full rounded-xl"
        aria-label={mapLabel}
      >
        <ResizeInvalidator />
        <MapReadyCapture onReady={onMapReady} />
        <MapClickCatcher onClick={onMapClick} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={tileUrl}
        />
        {vehicles.map((v) => {
          const selected = v.id === selectedVehicleId;
          return (
            <CircleMarker
              key={v.id}
              center={[v.latitude, v.longitude]}
              radius={selected ? 13 : 10}
              pathOptions={{
                color: "#ffffff",
                weight: selected ? 3 : 2,
                fillColor: vehicleColor(v.status),
                fillOpacity: dimmedVehicleIds.includes(v.id) ? 0.3 : 0.9,
              }}
              eventHandlers={{
                click: (event: LeafletMouseEvent) => {
                  event.originalEvent.stopPropagation();
                  onVehicleSelect?.(v);
                },
              }}
            >
              <Tooltip direction="top" offset={[0, -10]}>
                {v.live
                  ? `Shared sighting (${v.status}) — community-reported, unverified.${v.lastSeen ? ` Last seen ${v.lastSeen}.` : ""}`
                  : `Demo vehicle (${v.status}) — static sample, not live.`}
              </Tooltip>
            </CircleMarker>
          );
        })}
        {reports.map((r) => {
          const selected = r.id === selectedReportId;
          return (
            <CircleMarker
              key={r.id}
              center={[r.latitude, r.longitude]}
              radius={selected ? 10 : 7}
              pathOptions={{
                color: "#ffffff",
                weight: selected ? 3 : 2,
                fillColor: reportColor(r.type),
                fillOpacity: r.status === "pending" ? 0.45 : 0.9,
                dashArray: r.status === "pending" ? "4 3" : undefined,
              }}
              eventHandlers={{
                click: (event: LeafletMouseEvent) => {
                  event.originalEvent.stopPropagation();
                  onReportSelect?.(r);
                },
              }}
            >
              <Tooltip direction="top" offset={[0, -8]}>
                {r.live
                  ? `Community report (${r.type}, ${r.status}, unverified).`
                  : `Sample ${r.type} report (${r.status}, unverified).`}
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}