import { describe, expect, it } from "vitest";
import { timeAgo, toAlertItem, toReportMarker, toVehicleMarker } from "./markers";

describe("timeAgo", () => {
  const now = Date.parse("2026-10-15T12:00:00Z");
  it("says just now under a minute", () => {
    expect(timeAgo("2026-10-15T11:59:30Z", now)).toBe("just now");
  });
  it("says minutes and hours", () => {
    expect(timeAgo("2026-10-15T11:55:00Z", now)).toBe("5 min ago");
    expect(timeAgo("2026-10-15T10:00:00Z", now)).toBe("2 hr ago");
  });
  it("never goes negative", () => {
    expect(timeAgo("2026-10-15T12:05:00Z", now)).toBe("just now");
  });
});

describe("toVehicleMarker", () => {
  it("maps a live row and tolerates a null route", () => {
    const m = toVehicleMarker({
      id: "v1", route_id: null, latitude: 14.5, longitude: 121.0,
      last_updated: "2026-10-15T12:00:00Z", status: "active",
    });
    expect(m).toMatchObject({ id: "v1", routeId: "", live: true, status: "active" });
  });
});

describe("toReportMarker", () => {
  it("falls back when the description is blank", () => {
    const m = toReportMarker({
      id: "r1", user_id: "u", type: "full", latitude: 0, longitude: 0,
      description: "  ", created_at: "2026-10-15T12:00:00Z", status: "pending",
    });
    expect(m.description).toBe("Community full report.");
    expect(m.live).toBe(true);
  });
});

describe("toAlertItem", () => {
  it("labels open-ended and expiring alerts", () => {
    expect(
      toAlertItem({ id: "a", title: "t", message: "m", severity: "info", created_at: "", expires_at: null }).expiresText,
    ).toBe("until further notice");
    expect(
      toAlertItem({ id: "a", title: "t", message: "m", severity: "warning", created_at: "", expires_at: "2026-10-20T20:00:00Z" }).expiresText,
    ).toMatch(/^until /);
  });
});
