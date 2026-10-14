import type { DemoAlert, DemoReport, DemoVehicle } from "@/types";
import type { DbAlert, DbReport, DbVehicle } from "@/types/database";

/** Map a live vehicle row to a presentation marker. */
export function toVehicleMarker(row: DbVehicle): DemoVehicle {
  return {
    id: row.id,
    routeId: row.route_id ?? "",
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    status: row.status,
    live: true,
    lastSeen: row.last_updated,
  };
}

/** Map a live report row to a presentation marker. */
export function toReportMarker(row: DbReport): DemoReport {
  return {
    id: row.id,
    type: row.type,
    status: row.status,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    description: row.description?.trim() ? row.description : `Community ${row.type} report.`,
    createdAgo: row.created_at,
    live: true,
  };
}

/** Map a live alert row to an alert card item. */
export function toAlertItem(row: DbAlert): DemoAlert {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    severity: row.severity,
    expiresText: row.expires_at
      ? `until ${new Date(row.expires_at).toLocaleString()}`
      : "until further notice",
    live: true,
  };
}

/** Compact relative time ("just now", "4 min ago", "2 hr ago"). Input: ISO string. */
export function timeAgo(iso: string, nowMs: number = Date.now()): string {
  const diff = Math.max(0, nowMs - Date.parse(iso));
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} day(s) ago`;
}
