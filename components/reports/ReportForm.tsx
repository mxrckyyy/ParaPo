"use client";

import { useState } from "react";
import { AlertTriangle, Ban, Car, LocateFixed, Users } from "lucide-react";
import { submitReport } from "@/app/actions/reports";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DemoNotice } from "@/components/ui/DemoNotice";
import type { ReportType } from "@/types";

const options: { value: ReportType; label: string; icon: typeof Car }[] = [
  { value: "traffic", label: "Heavy traffic", icon: Car },
  { value: "full", label: "Vehicle full", icon: Users },
  { value: "accident", label: "Accident", icon: AlertTriangle },
  { value: "closure", label: "Road closure", icon: Ban },
];

type GeoState =
  | { status: "idle" }
  | { status: "locating" }
  | { status: "ready"; latitude: number; longitude: number }
  | { status: "error"; message: string };

/**
 * Community report form (Phase 3). Submits via Server Action with
 * server-side validation, auth check, and a 30 s rate limit. New rows start
 * `pending` (unverified) and appear on the live map after moderation.
 */
export function ReportForm() {
  const [type, setType] = useState<ReportType>("traffic");
  const [description, setDescription] = useState("");
  const [geo, setGeo] = useState<GeoState>({ status: "idle" });
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  function locate() {
    if (!("geolocation" in navigator)) {
      setGeo({ status: "error", message: "Geolocation isn't available in this browser — enter coordinates manually below." });
      return;
    }
    setGeo({ status: "locating" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeo({ status: "ready", latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setError(undefined);
      },
      (err) => {
        setGeo({
          status: "error",
          message:
            err.code === err.PERMISSION_DENIED
              ? "Location permission was denied — enter coordinates manually below, or enable location and try again."
              : "Couldn't read your location — enter coordinates manually below.",
        });
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 },
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    const latitude = geo.status === "ready" ? geo.latitude : Number(manualLat);
    const longitude = geo.status === "ready" ? geo.longitude : Number(manualLng);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      setError("Add a location first — use your GPS or type coordinates manually.");
      return;
    }
    setPending(true);
    try {
      const outcome = await submitReport({ type, description, latitude, longitude });
      if (!outcome) {
        setError("Something went wrong. Please try again.");
        return;
      }
      if (!outcome.ok) {
        setError(outcome.error);
        return;
      }
      setDone(true);
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <Card className="flex flex-col gap-2" aria-live="polite">
        <p className="text-base font-bold text-asphalt">Report received — thanks, kapwa commuter!</p>
        <p className="text-sm text-asphalt-muted">
          Status: <Badge kind="pending">pending</Badge> Every report starts unverified;
          it appears on the live map once approved by a moderator.
        </p>
        <div>
          <Button variant="secondary" onClick={() => { setDone(false); setDescription(""); }}>
            Submit another report
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-asphalt">Report type</legend>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Report type">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={type === o.value}
              onClick={() => setType(o.value)}
              className={`flex min-h-[44px] items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                type === o.value ? "border-primary bg-primary/10 text-primary-dark" : "border-line bg-white text-asphalt"
              }`}
            >
              <o.icon className="h-4 w-4" aria-hidden="true" /> {o.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-asphalt">Location</p>
        {geo.status === "ready" ? (
          <p role="status" className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary-dark">
            Pinned at {geo.latitude.toFixed(5)}, {geo.longitude.toFixed(5)}{" "}
            <button type="button" onClick={locate} className="font-semibold underline">
              Re-pin
            </button>
          </p>
        ) : (
          <Button type="button" variant="secondary" onClick={locate} disabled={geo.status === "locating"}>
            <LocateFixed className="h-4 w-4" aria-hidden="true" />
            {geo.status === "locating" ? "Locating…" : "Use my location"}
          </Button>
        )}
        {geo.status === "error" ? (
          <p role="alert" className="text-xs text-severity-critical">{geo.message}</p>
        ) : null}
        {geo.status !== "ready" ? (
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1 text-xs font-semibold text-asphalt">
              Latitude
              <input
                type="number"
                step="any"
                min={-90}
                max={90}
                inputMode="decimal"
                placeholder="14.5995"
                value={manualLat}
                onChange={(e) => setManualLat(e.target.value)}
                className="min-h-[44px] rounded-lg border border-line bg-white px-3 py-2 text-sm font-normal text-asphalt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-asphalt">
              Longitude
              <input
                type="number"
                step="any"
                min={-180}
                max={180}
                inputMode="decimal"
                placeholder="120.9842"
                value={manualLng}
                onChange={(e) => setManualLng(e.target.value)}
                className="min-h-[44px] rounded-lg border border-line bg-white px-3 py-2 text-sm font-normal text-asphalt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              />
            </label>
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="report-description" className="text-sm font-semibold text-asphalt">
          Description <span className="font-normal text-asphalt-muted">(optional, max 500 characters)</span>
        </label>
        <textarea
          id="report-description"
          rows={3}
          maxLength={500}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Queue forming at the corner stop."
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-asphalt placeholder:text-asphalt-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        />
        <p className="text-xs text-asphalt-muted">{description.length}/500 · max 1 report per 30 seconds</p>
      </div>

      {error ? (
        <p role="alert" className="rounded-lg bg-severity-critical/10 px-3 py-2 text-sm text-severity-critical">
          {error}
        </p>
      ) : null}

      <div>
        <Button type="submit" disabled={pending}>{pending ? "Sending…" : "Submit report"}</Button>
      </div>
      <DemoNotice compact />
      <p className="text-xs text-asphalt-muted">
        New reports start as <Badge kind="pending">pending</Badge> — unverified until moderated.
      </p>
    </form>
  );
}
