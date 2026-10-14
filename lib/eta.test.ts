import { describe, expect, it } from "vitest";
import {
  DWELL_MINUTES,
  STALE_MS,
  estimateEta,
  haversineKm,
  isStale,
  SPEEDS,
} from "./eta";

describe("haversineKm", () => {
  it("returns 0 for identical points", () => {
    expect(haversineKm(14.5995, 120.9842, 14.5995, 120.9842)).toBe(0);
  });

  it("matches a known Manila distance (~11.1 km per 0.1° latitude)", () => {
    // 0.1° of latitude ≈ 11.1 km anywhere on Earth.
    expect(haversineKm(14.5, 121.0, 14.6, 121.0)).toBeCloseTo(11.12, 1);
  });

  it("is symmetric", () => {
    const a = haversineKm(14.5995, 120.9842, 14.6371, 121.0354);
    const b = haversineKm(14.6371, 121.0354, 14.5995, 120.9842);
    expect(a).toBeCloseTo(b, 10);
  });
});

describe("estimateEta", () => {
  it("returns a range with min <= max", () => {
    const eta = estimateEta(3);
    expect(eta.minMinutes).toBeLessThanOrEqual(eta.maxMinutes);
  });

  it("scales with distance at jeep speeds (3 km → 9–15 min)", () => {
    // 3 km @ 20 km/h = 9 min; 3 km @ 15 km/h = 12 min + 3 dwell = 15.
    expect(estimateEta(3, SPEEDS.jeep)).toEqual({ minMinutes: 9, maxMinutes: 12 + DWELL_MINUTES });
  });

  it("clamps negative distances to zero", () => {
    expect(estimateEta(-5)).toEqual({ minMinutes: 0, maxMinutes: DWELL_MINUTES });
  });
});

describe("isStale", () => {
  const now = Date.parse("2026-10-15T12:00:00Z");
  it("is fresh just now", () => {
    expect(isStale("2026-10-15T11:59:00Z", now)).toBe(false);
  });
  it("is stale past 5 minutes", () => {
    expect(isStale("2026-10-15T11:54:59Z", now)).toBe(true);
  });
  it("treats the exact boundary as fresh", () => {
    expect(isStale(new Date(now - STALE_MS).toISOString(), now)).toBe(false);
  });
  it("treats unparseable timestamps as stale", () => {
    expect(isStale("not-a-date", now)).toBe(true);
  });
});
