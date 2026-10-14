"use client";

// Client-only Leaflet map. Always loaded via next/dynamic with ssr:false
// (Leaflet touches `window` at render). Never import this in a Server Component directly.
import "leaflet/dist/leaflet.css";
import { useMemo } from "react";
import { CircleMarker, MapContainer, TileLayer, Tooltip } from "react-leaflet";
import type { DemoReport, DemoVehicle } from "@/types";

const TILE_URL =
  process.env.NEXT_PUBLIC_MAP_TILE_URL ??
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

const vehicleColor = (status: DemoVehicle["status"]) =>
  status === "full" ? "#64748B" : "#16A34A";

const reportColor = (type: DemoReport["type"]) =>
  type === "traffic" ? "#D97706" : type === "accident" ? "#DC2626" : type === "closure" ? "#0F172A" : "#64748B";

export function MapView({
  center,
  vehicles,
  reports,
  dimmedVehicleIds = [],
  mapLabel = "Demonstration transport map of Metro Manila",
}: {
  center: [number, number];
  vehicles: DemoVehicle[];
  reports: DemoReport[];
  /** Stale (>5 min) sightings render dimmed with a "last seen" note. */
  dimmedVehicleIds?: string[];
  mapLabel?: string;
}) {
  const tileUrl = useMemo(() => TILE_URL, []);
  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom
      className="h-full min-h-[320px] w-full"
      aria-label={mapLabel}
    >
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url={tileUrl} />
      {vehicles.map((v) => (
        <CircleMarker
          key={v.id}
          center={[v.latitude, v.longitude]}
          radius={10}
          pathOptions={{
            color: "#ffffff",
            weight: 2,
            fillColor: vehicleColor(v.status),
            fillOpacity: dimmedVehicleIds.includes(v.id) ? 0.3 : 0.9,
          }}
        >
          <Tooltip direction="top" offset={[0, -10]}>
            {v.live
              ? `Shared sighting (${v.status}) — community-reported, unverified.${v.lastSeen ? ` Last seen ${v.lastSeen}.` : ""}`
              : `Demo vehicle (${v.status}) — static sample, not live.`}
          </Tooltip>
        </CircleMarker>
      ))}
      {reports.map((r) => (
        <CircleMarker
          key={r.id}
          center={[r.latitude, r.longitude]}
          radius={7}
          pathOptions={{
            color: "#ffffff",
            weight: 2,
            fillColor: reportColor(r.type),
            fillOpacity: r.status === "pending" ? 0.45 : 0.9,
            dashArray: r.status === "pending" ? "4 3" : undefined,
          }}
        >
          <Tooltip direction="top" offset={[0, -8]}>
            {r.live
              ? `Community report (${r.type}, ${r.status}, unverified).`
              : `Sample ${r.type} report (${r.status}, unverified).`}
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
