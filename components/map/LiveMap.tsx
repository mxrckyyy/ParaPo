"use client";

import { useMemo, useState } from "react";
import { DemoMap } from "@/components/map/DemoMap";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useRealtimeTable } from "@/hooks/useRealtimeTable";
import { isStale } from "@/lib/eta";
import { timeAgo, toReportMarker, toVehicleMarker } from "@/lib/markers";
import type { DemoReport, DemoVehicle, ReportType } from "@/types";
import type { DbReport, DbVehicle } from "@/types/database";

type Filter = "all" | ReportType;

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "All reports" },
  { value: "traffic", label: "Traffic" },
  { value: "full", label: "Full" },
  { value: "accident", label: "Accidents" },
  { value: "closure", label: "Closures" },
];

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

  const paused = live && (vehicles.status === "paused" || reports.status === "paused");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter reports">
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
        <p role="status" className="rounded-lg border border-dashed border-line bg-white px-3 py-2 text-xs text-asphalt-muted">
          Live updates paused — retrying. Showing the last loaded markers; refresh the page to reconnect.
        </p>
      ) : null}

      <div className="h-[60vh] min-h-[380px] overflow-hidden rounded-xl border border-line bg-white">
        <DemoMap
          center={center}
          vehicles={liveVehicles}
          reports={visibleReports}
          dimmedVehicleIds={dimmedVehicleIds}
        />
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
