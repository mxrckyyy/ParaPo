// PARA PO demo data (Phase 1 static UI only).
//
// IMPORTANT: everything here is FICTIONAL demonstration data so the interface
// can be built before verified sources exist. It must never be presented as
// official routes, official fares, live vehicle positions, or real ETAs.
// Verified data sources replace this module in Phase 2 (see docs/DATABASE_SCHEMA.md §5).

import type { DemoAlert, DemoReport, DemoRoute, DemoVehicle } from "@/types";

export const DEMO_DATA_NOTICE =
  "Demonstration data — fictional routes, sample fares, and illustrative times. Not official, not live.";

/** Metro Manila default view (Luneta area). Tiles come from OpenStreetMap. */
export const METRO_MANILA_CENTER: [number, number] = [14.5826, 120.9781];

export const DEMO_ROUTES: DemoRoute[] = [
  {
    id: "demo-sampaguita-loop",
    name: "Demo Sampaguita Loop (fictional)",
    origin: "Demo Plaza Sampaguita",
    destination: "Demo Ilang-Ilang Crossing",
    farePhp: 13,
    etaMin: 8,
    etaMax: 14,
    stops: [
      { id: "st-sp1", name: "Demo Stop — Plaza Sampaguita", latitude: 14.5826, longitude: 120.9781 },
      { id: "st-sp2", name: "Demo Stop — Sampaguita Ave. Corner", latitude: 14.5868, longitude: 120.9812 },
      { id: "st-sp3", name: "Demo Stop — Ilang-Ilang Crossing", latitude: 14.5912, longitude: 120.9845 },
    ],
    steps: [
      { kind: "walk", text: "Walk ~3 min from Demo Plaza Sampaguita to Demo Stop — Plaza Sampaguita." },
      { kind: "ride", text: "Ride the Demo Sampaguita Loop vehicle for 4 fictional stops." },
      { kind: "walk", text: "Walk ~2 min to Demo Ilang-Ilang Crossing." },
    ],
  },
  {
    id: "demo-kamuning-shuttle",
    name: "Demo Kamuning Shuttle (fictional)",
    origin: "Demo Kamuning Market",
    destination: "Demo Scout Circle",
    farePhp: 15,
    etaMin: 10,
    etaMax: 18,
    stops: [
      { id: "st-km1", name: "Demo Stop — Kamuning Market", latitude: 14.6371, longitude: 121.0354 },
      { id: "st-km2", name: "Demo Stop — K-H Street Corner", latitude: 14.6402, longitude: 121.0381 },
      { id: "st-km3", name: "Demo Stop — Scout Circle", latitude: 14.6435, longitude: 121.0412 },
    ],
    steps: [
      { kind: "walk", text: "Walk ~4 min from Demo Kamuning Market to the shuttle stop." },
      { kind: "ride", text: "Ride the Demo Kamuning Shuttle for 3 fictional stops." },
      { kind: "walk", text: "Walk ~2 min to Demo Scout Circle." },
    ],
  },
  {
    id: "demo-baywalk-express",
    name: "Demo Baywalk Express (fictional)",
    origin: "Demo Baywalk North",
    destination: "Demo Baywalk South",
    farePhp: 20,
    etaMin: 12,
    etaMax: 22,
    stops: [
      { id: "st-bw1", name: "Demo Stop — Baywalk North", latitude: 14.5753, longitude: 120.9708 },
      { id: "st-bw2", name: "Demo Stop — Baywalk Mid", latitude: 14.5698, longitude: 120.9695 },
      { id: "st-bw3", name: "Demo Stop — Baywalk South", latitude: 14.5642, longitude: 120.9682 },
    ],
    steps: [
      { kind: "walk", text: "Walk ~3 min to Demo Stop — Baywalk North." },
      { kind: "ride", text: "Ride the Demo Baywalk Express for 2 fictional stops." },
      { kind: "walk", text: "Walk ~3 min along the bay to your destination." },
    ],
  },
];

/** Fictional vehicle positions — static dots, NOT live tracking. */
export const DEMO_VEHICLES: DemoVehicle[] = [
  { id: "vh-1", routeId: "demo-sampaguita-loop", latitude: 14.585, longitude: 120.98, status: "active" },
  { id: "vh-2", routeId: "demo-kamuning-shuttle", latitude: 14.639, longitude: 121.037, status: "full" },
  { id: "vh-3", routeId: "demo-baywalk-express", latitude: 14.572, longitude: 120.97, status: "active" },
];

export const DEMO_REPORTS: DemoReport[] = [
  {
    id: "rp-1",
    type: "traffic",
    status: "approved",
    latitude: 14.5875,
    longitude: 120.982,
    description: "Sample report: slow fictional traffic near the demo avenue.",
    createdAgo: "12 min ago",
  },
  {
    id: "rp-2",
    type: "full",
    status: "pending",
    latitude: 14.6395,
    longitude: 121.0375,
    description: "Sample report: demo shuttle looked full at the fictional stop.",
    createdAgo: "26 min ago",
  },
  {
    id: "rp-3",
    type: "accident",
    status: "approved",
    latitude: 14.571,
    longitude: 120.9698,
    description: "Sample report: minor fictional incident, one demo lane blocked.",
    createdAgo: "1 hr ago",
  },
];

export const DEMO_ALERTS: DemoAlert[] = [
  {
    id: "al-1",
    title: "Sample alert: Demo Baywalk roadworks",
    message: "Fictional roadworks slow the Demo Baywalk Express this weekend. Plan extra time.",
    severity: "warning",
    expiresText: "until Sunday 8:00 PM",
  },
  {
    id: "al-2",
    title: "Sample alert: New demo stop",
    message: "A fictional stop was added to the Demo Sampaguita Loop for layout testing.",
    severity: "info",
    expiresText: "until further notice",
  },
];

export function findDemoRoute(id: string) {
  return DEMO_ROUTES.find((r) => r.id === id);
}

/** Case-insensitive substring match over fictional route/stop names. */
export function searchDemoRoutes(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return DEMO_ROUTES.filter(
    (r) =>
      r.name.toLowerCase().includes(q) ||
      r.origin.toLowerCase().includes(q) ||
      r.destination.toLowerCase().includes(q) ||
      r.stops.some((s) => s.name.toLowerCase().includes(q)),
  );
}
