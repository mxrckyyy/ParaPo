"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LocateFixed, RefreshCcw, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { DemoMap } from "@/components/map/DemoMap";
import { MapLegend } from "@/components/map/MapLegend";
import { useRealtimeTable } from "@/hooks/useRealtimeTable";
import { isStale } from "@/lib/eta";
import { timeAgo, toReportMarker, toVehicleMarker } from "@/lib/markers";
import type { DemoReport, DemoVehicle, ReportType } from "@/types";
import type { DbReport, DbVehicle } from "@/types/database";
import type { LeafletMouseEvent } from "leaflet";

type Filter = "all" | ReportType;

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "All reports" },
  { value: "traffic", label: "Traffic" },
  { value: "full", label: "Full" },
  { value: "accident", label: "Accidents" },
  { value: "closure", label: "Closures" },
];

type Selection =
  | { kind: "vehicle"; id: string }
  | { kind: "report"; id: string }
  | null;

/**
 * Live map surface: server-provided initial markers + Realtime INSERT/UPDATE/
 * DELETE merged by id (dedupe, no duplicate markers). Stale sightings dim;
 * pending reports render dashed until approved. Falls back to clearly-labeled
 * demo markers when the database is unreachable.
 */
export function LiveMap({
  center,
  initialVehicles,
  initialReports,
  live,
}: {
  center: [number, number];
  initialVehicles: DemoVehicle[];
  initialReports: DemoReport[];
  /** False when tables are missing/unreachable — realtime stays off. */
  live: boolean;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [selection, setSelection] = useState<Selection>(null);
  const [map, setMap] = useState<import("leaflet").Map | null>(null);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const locationStatusRef = useRef(locationStatus);
  locationStatusRef.current = locationStatus;

  const vehicles = useRealtimeTable<DbVehicle, DemoVehicle>(
    "vehicles",
    initialVehicles,
    live,
    toVehicleMarker,
  );
  const reports = useRealtimeTable<DbReport, DemoReport>(
    "reports",
    initialReports,
    live,
    toReportMarker,
  );

  const liveVehicles = vehicles.rows;
  const allReports = reports.rows;

  const dimmedVehicleIds = useMemo(
    () => liveVehicles.filter((v) => v.live && v.lastSeen && isStale(v.lastSeen)).map((v) => v.id),
    [liveVehicles],
  );
  const visibleReports = useMemo(
    () => (filter === "all" ? allReports : allReports.filter((r) => r.type === filter)),
    [allReports, filter],
  );

  const selectedVehicle =
    selection?.kind === "vehicle" ? liveVehicles.find((v) => v.id === selection.id) ?? null : null;
  const selectedReport =
    selection?.kind === "report" ? allReports.find((r) => r.id === selection.id) ?? null : null;

  const paused = live && (vehicles.status === "paused" || reports.status === "paused");
  const router = useRouter();

  const locate = () => {
    if (!map) {
      setLocationStatus("Map is still loading.");
      return;
    }
    if (!("geolocation" in navigator)) {
      setLocationStatus("Location is not available in this browser.");
      return;
    }
    setLocationStatus("Requesting your location…");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        map.setView([position.coords.latitude, position.coords.longitude], 15);
        setLocationStatus("Location found.");
      },
      (error) => {
        setLocationStatus(
          error.code === error.PERMISSION_DENIED
            ? "Location permission was denied."
            : "Your location could not be found.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const resetView = () => {
    if (!map) return;
    map.setView(center, 13);
    setLocationStatus("Map view reset.");
  };

  return (
    <div className="relative h-full min-h-[340px] overflow-hidden rounded-xl border border-line bg-white">
      <div className="flex flex-wrap items-center gap-2 p-3 pb-2" role="group" aria-label="Filter reports">
        {filters.map((f) => (
          <button
            key={f.value}
            type="button"
            aria-pressed={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={`min-h-[44px] rounded-full border px-3 py-1 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
              filter === f.value
                ? "border-primary bg-primary/10 text-primary-dark"
                : "border-line bg-white text-asphalt"
            }`}
          >
            {f.label}
          </button>
        ))}
        {live ? (
          <Badge kind={paused ? "pending" : "approved"}>{paused ? "Live updates paused" : "Live"}</Badge>
        ) : (
          <Badge kind="demo">Demo</Badge>
        )}
      </div>

      {paused ? (
        <p role="status" className="mx-3 rounded-lg border border-dashed border-line bg-white px-3 py-2 text-xs text-asphalt-muted">
          Live updates paused — retrying. Showing the last loaded markers; refresh the page to reconnect.
        </p>
      ) : null}

      <div className="relative min-h-0 flex-1">
        <DemoMap
          center={center}
          vehicles={liveVehicles}
          reports={visibleReports}
          dimmedVehicleIds={dimmedVehicleIds}
          onMapReady={setMap}
          onVehicleSelect={(vehicle) => setSelection(vehicle ? { kind: "vehicle", id: vehicle.id } : null)}
          onReportSelect={(report) => setSelection(report ? { kind: "report", id: report.id } : null)}
          onMapClick={() => setSelection(null)}
          selectedVehicleId={selection?.kind === "vehicle" ? selection.id : null}
          selectedReportId={selection?.kind === "report" ? selection.id : null}
          mapLabel={live ? "Live community transport map of Metro Manila" : "Demonstration transport map of Metro Manila"}
        />

        {/* Floating search entry: links into the existing route search flow. */}
        <div className="pointer-events-none absolute left-3 right-16 top-3 z-[1000] sm:left-4">
          <button
            type="button"
            onClick={() => router.push("/search")}
            className="pointer-events-auto flex min-h-[44px] w-full items-center gap-2 rounded-full border border-line bg-white/95 px-4 py-2 text-sm font-semibold text-asphalt shadow-md backdrop-blur focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            aria-label="Open route search"
          >
            <Search className="h-4 w-4 shrink-0 text-asphalt-muted" aria-hidden="true" />
            <span className="truncate text-asphalt-muted">Saan ka papunta?</span>
          </button>
        </div>

        {/* Map controls */}
        <div className="absolute right-3 top-3 z-[1000] flex flex-col gap-2">
          <button
            type="button"
            onClick={locate}
            aria-label="Find my location"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white/95 text-asphalt shadow-md backdrop-blur focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <LocateFixed className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={resetView}
            aria-label="Reset map view"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white/95 text-asphalt shadow-md backdrop-blur focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <RefreshCcw className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {locationStatus ? (
          <p
            role="status"
            className="absolute left-3 top-16 z-[1000] max-w-[calc(100%-6.5rem)] rounded-lg border border-line bg-white/95 px-3 py-2 text-xs text-asphalt shadow-md backdrop-blur"
          >
            {locationStatus}
          </p>
        ) : null}

        {/* Mobile legend overlay */}
        {!(selectedVehicle || selectedReport) ? (          <div className="pointer-events-auto absolute bottom-3 left-3 z-[1000] w-64 max-w-[calc(100%-6rem)] lg:hidden">
            <MapLegend />
          </div>
        ) : null}

        {/* Marker details panel */}
        {selectedVehicle || selectedReport ? (
          <section
            aria-labelledby="marker-details-title"
            className="absolute bottom-3 left-3 right-3 z-[1000] max-h-[35vh] overflow-auto rounded-xl border border-line bg-card p-4 shadow-lg sm:left-auto sm:w-80 md:bottom-4 md:right-4 md:left-auto"
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <h2 id="marker-details-title" className="text-sm font-bold text-asphalt">
                {selectedVehicle
                  ? selectedVehicle.live
                    ? "Shared vehicle sighting"
                    : "Demo vehicle"
                  : selectedReport?.live
                  ? "Community report"
                  : "Sample report"}
              </h2>
              <button
                type="button"
                onClick={() => setSelection(null)}
                aria-label="Close marker details"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-asphalt-muted hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            {selectedVehicle ? (
              <dl className="flex flex-col gap-1 text-xs text-asphalt-muted">
                <div>
                  <dt className="font-semibold text-asphalt">Status</dt>
                  <dd>
                    {selectedVehicle.status}
                    {selectedVehicle.live ? " (community-reported, unverified)" : " (static sample, not live)"}
                  </dd>
                </div>
                {selectedVehicle.lastSeen ? (
                  <div>
                    <dt className="font-semibold text-asphalt">Last seen</dt>
                    <dd>{timeAgo(selectedVehicle.lastSeen)}</dd>
                  </div>
                ) : (
                  <div>
                    <dt className="font-semibold text-asphalt">Data source</dt>
                    <dd>Static sample, no live tracking</dd>
                  </div>
                )}
                <div>
                  <dt className="font-semibold text-asphalt">Location</dt>
                  <dd>
                    {selectedVehicle.latitude.toFixed(5)}, {selectedVehicle.longitude.toFixed(5)}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-asphalt">Data notice</dt>
                  <dd>No ETA or fare is calculated from this marker.</dd>
                </div>
              </dl>
            ) : null}
            {selectedReport ? (
              <dl className="flex flex-col gap-1 text-xs text-asphalt-muted">
                <div>
                  <dt className="font-semibold text-asphalt">Type</dt>
                  <dd>{selectedReport.type}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-asphalt">Status</dt>
                  <dd>
                    {selectedReport.status}
                    {selectedReport.status === "pending" ? " (unverified)" : ""}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-asphalt">Description</dt>
                  <dd className="whitespace-pre-wrap break-words">{selectedReport.description}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-asphalt">Reported</dt>
                  <dd>{selectedReport.createdAgo}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-asphalt">Location</dt>
                  <dd>
                    {selectedReport.latitude.toFixed(5)}, {selectedReport.longitude.toFixed(5)}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-asphalt">Data notice</dt>
                  <dd>No route change or official transport status is implied.</dd>
                </div>
              </dl>
            ) : null}
          </section>
        ) : null}
      </div>

      <MarkerList vehicles={liveVehicles} reports={visibleReports} dimmedIds={dimmedVehicleIds} live={live} />
    </div>
  );
}

/** Text list alternative for every marker (keyboard/screen-reader access). */
function MarkerList({
  vehicles,
  reports,
  dimmedIds,
  live,
}: {
  vehicles: DemoVehicle[];
  reports: DemoReport[];
  dimmedIds: string[];
  live: boolean;
}) {
  return (
    <Card aria-label="Marker list">
      <p className="text-sm font-semibold">All markers (list view)</p>
      {vehicles.length === 0 && reports.length === 0 ? (
        <p className="mt-1 text-xs text-asphalt-muted">
          {live
            ? "No active shared vehicles or community reports yet — be the first to share 🚌"
            : "No demo markers configured."}
        </p>
      ) : null}
      <ul className="mt-2 flex flex-col gap-2 text-xs text-asphalt-muted">
        {vehicles.map((v) => {
          const stale = dimmedIds.includes(v.id);
          return (
            <li key={v.id} className="rounded-lg bg-surface px-2 py-1.5">
              <strong className="text-asphalt">{v.live ? "Shared sighting" : "Demo vehicle"}</strong> ·{" "}
              {v.status} · {v.latitude.toFixed(4)}, {v.longitude.toFixed(4)}
              {v.live && v.lastSeen ? ` · last seen ${timeAgo(v.lastSeen)}` : " · static sample"}
              {stale ? " · stale (auto-dimmed)" : ""}
            </li>
          );
        })}
        {reports.map((r) => (
          <li key={r.id} className="rounded-lg bg-surface px-2 py-1.5">
            <strong className="text-asphalt">
              {r.live ? "Community" : "Sample"} {r.type}
            </strong>{" "}
            · {r.status}
            {r.status === "pending" ? " (unverified)" : ""} · {r.latitude.toFixed(4)},{" "}
            {r.longitude.toFixed(4)} · {r.live && r.createdAgo ? timeAgo(r.createdAgo) : r.createdAgo}
          </li>
        ))}
      </ul>
    </Card>
  );
}