// PARA PO shared TypeScript types (Phase 1: demo shapes only).
// Database row types generated via `supabase gen types` land here in Phase 2.

export type ReportType = "traffic" | "full" | "accident" | "closure";
export type ReportStatus = "pending" | "approved" | "rejected";
export type AlertSeverity = "info" | "warning" | "critical";
export type VehicleStatus = "active" | "full" | "inactive";

export interface DemoStop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

export interface DemoRouteStep {
  kind: "walk" | "ride";
  text: string;
}

export interface DemoRoute {
  id: string;
  name: string;
  origin: string;
  destination: string;
  /** Illustrative sample fare in PHP — NOT an official fare. */
  farePhp: number;
  /** Illustrative ETA range in minutes — NOT a real prediction. */
  etaMin: number;
  etaMax: number;
  stops: DemoStop[];
  steps: DemoRouteStep[];
}

export interface DemoVehicle {
  id: string;
  routeId: string;
  latitude: number;
  longitude: number;
  status: VehicleStatus;
}

export interface DemoReport {
  id: string;
  type: ReportType;
  status: ReportStatus;
  latitude: number;
  longitude: number;
  description: string;
  createdAgo: string;
}

export interface DemoAlert {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  expiresText: string;
}
