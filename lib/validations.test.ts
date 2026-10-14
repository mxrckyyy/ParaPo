import { describe, expect, it } from "vitest";
import { alertCreateSchema, reportSubmitSchema, vehicleShareSchema, voteSchema } from "./validations";

describe("reportSubmitSchema", () => {
  it("accepts a valid report", () => {
    expect(
      reportSubmitSchema.safeParse({
        type: "traffic",
        description: "Slow near the demo avenue.",
        latitude: 14.5,
        longitude: 121.0,
      }).success,
    ).toBe(true);
  });

  it("rejects unknown types, long descriptions, and bad coordinates", () => {
    expect(reportSubmitSchema.safeParse({ type: "ufo", latitude: 0, longitude: 0 }).success).toBe(false);
    expect(
      reportSubmitSchema.safeParse({ type: "full", description: "x".repeat(501), latitude: 0, longitude: 0 }).success,
    ).toBe(false);
    expect(reportSubmitSchema.safeParse({ type: "full", latitude: 91, longitude: 0 }).success).toBe(false);
    expect(reportSubmitSchema.safeParse({ type: "full", latitude: 0, longitude: 181 }).success).toBe(false);
  });
});

describe("vehicleShareSchema", () => {
  it("accepts coords with or without a route", () => {
    expect(vehicleShareSchema.safeParse({ routeId: null, latitude: 14.5, longitude: 121.0 }).success).toBe(true);
  });

  it("rejects non-UUID route ids and out-of-range coords", () => {
    expect(vehicleShareSchema.safeParse({ routeId: "abc", latitude: 0, longitude: 0 }).success).toBe(false);
    expect(vehicleShareSchema.safeParse({ routeId: null, latitude: -91, longitude: 0 }).success).toBe(false);
  });
});

describe("alertCreateSchema", () => {
  it("accepts a valid alert with or without expiry", () => {
    expect(
      alertCreateSchema.safeParse({ title: "Roadworks", message: "Slow weekend.", severity: "warning" }).success,
    ).toBe(true);
  });

  it("rejects short titles, long messages, and bad severities", () => {
    expect(alertCreateSchema.safeParse({ title: "ab", message: "ok message", severity: "info" }).success).toBe(false);
    expect(
      alertCreateSchema.safeParse({ title: "Roadworks", message: "x".repeat(1001), severity: "info" }).success,
    ).toBe(false);
    expect(alertCreateSchema.safeParse({ title: "Roadworks", message: "ok", severity: "urgent" }).success).toBe(false);
  });
});

describe("voteSchema", () => {
  it("accepts +1/-1 on a UUID report", () => {
    expect(
      voteSchema.safeParse({ reportId: "11111111-1111-4111-8111-111111111111", value: 1 }).success,
    ).toBe(true);
    expect(
      voteSchema.safeParse({ reportId: "11111111-1111-4111-8111-111111111111", value: -1 }).success,
    ).toBe(true);
  });

  it("rejects bad ids and out-of-range values", () => {
    expect(voteSchema.safeParse({ reportId: "nope", value: 1 }).success).toBe(false);
    expect(voteSchema.safeParse({ reportId: "11111111-1111-4111-8111-111111111111", value: 0 }).success).toBe(false);
    expect(voteSchema.safeParse({ reportId: "11111111-1111-4111-8111-111111111111", value: 2 }).success).toBe(false);
  });
});
