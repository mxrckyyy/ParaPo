// PARA PO ETA estimation (Phase 3). Pure functions — no I/O, unit-tested.
//
// Honesty contract (docs/SYSTEM_DESIGN.md §10): NO live traffic feed in MVP.
// Estimates assume free-flow city speeds, so results are RANGES labeled
// "estimate" in the UI, never precise predictions.

export const EARTH_RADIUS_KM = 6371;

/** Assumed free-flow city speeds (km/h). Jeepneys stop often; buses less. */
export const SPEEDS = {
  jeep: { slow: 15, fast: 20 },
  bus: { slow: 20, fast: 30 },
} as const;

/** Extra dwell/board time folded into the upper bound (minutes). */
export const DWELL_MINUTES = 3;

/** A sighting older than this is stale (not live). Matches the 5-min UI rule. */
export const STALE_MS = 5 * 60 * 1000;

export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

export interface EtaRange {
  minMinutes: number;
  maxMinutes: number;
}

/**
 * ETA range for a vehicle `distanceKm` away. Fast bound at top speed,
 * slow bound at crawl speed + dwell. Rounded up to whole minutes.
 */
export function estimateEta(
  distanceKm: number,
  speed: { slow: number; fast: number } = SPEEDS.jeep,
): EtaRange {
  const safe = Math.max(0, distanceKm);
  return {
    minMinutes: Math.ceil((safe / speed.fast) * 60),
    maxMinutes: Math.ceil((safe / speed.slow) * 60) + DWELL_MINUTES,
  };
}

/** True when a `last_updated` ISO timestamp is older than STALE_MS. */
export function isStale(lastUpdatedIso: string, nowMs: number = Date.now()): boolean {
  const t = Date.parse(lastUpdatedIso);
  if (Number.isNaN(t)) return true;
  return nowMs - t > STALE_MS;
}
