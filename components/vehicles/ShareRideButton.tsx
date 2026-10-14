"use client";

import { useEffect, useRef, useState } from "react";
import { Bus } from "lucide-react";
import { startSharing, stopSharing, updatePosition } from "@/app/actions/vehicles";
import { Button } from "@/components/ui/Button";

/** Client sends a position update about every 15 s; server enforces 10 s. */
const UPDATE_INTERVAL_MS = 15_000;

type Phase = "idle" | "starting" | "sharing" | "error";

/**
 * "I'm on this vehicle" sharing (Phase 3). Explicit start/stop with a
 * persistent pill; geolocation denial shows a friendly error. The shared row
 * is anonymous (no user link) and fades automatically when stale.
 */
export function ShareRideButton({ routeId }: { routeId: string | null }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | undefined>();
  const vehicleId = useRef<string | null>(null);
  const watchId = useRef<number | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  async function push(latitude: number, longitude: number) {
    if (!vehicleId.current) return;
    const outcome = await updatePosition({ vehicleId: vehicleId.current, latitude, longitude });
    if (!outcome) return;
    if (!outcome.ok) {
      // Ride already ended server-side — stop quietly.
      void endSharing(false);
    }
  }

  function cleanupWatchers() {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    if (timer.current !== null) {
      clearInterval(timer.current);
      timer.current = null;
    }
  }

  async function endSharing(notify = true) {
    cleanupWatchers();
    if (vehicleId.current && notify) {
      await stopSharing(vehicleId.current);
    }
    vehicleId.current = null;
    setPhase("idle");
  }

  // Stop sharing if the component unmounts mid-ride.
  useEffect(() => {
    return () => {
      cleanupWatchers();
      if (vehicleId.current) void stopSharing(vehicleId.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function begin() {
    setError(undefined);
    if (!("geolocation" in navigator)) {
      setError("Geolocation isn't available in this browser, so ride sharing can't start.");
      setPhase("error");
      return;
    }
    setPhase("starting");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const outcome = await startSharing({
          routeId,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        if (!outcome) {
          setError("Something went wrong. Please try again.");
          setPhase("error");
          return;
        }
        if (!outcome.ok) {
          setError(outcome.error);
          setPhase("error");
          return;
        }
        vehicleId.current = outcome.vehicleId;
        setPhase("sharing");
        watchId.current = navigator.geolocation.watchPosition(
          (p) => void push(p.coords.latitude, p.coords.longitude),
          () => {},
          { enableHighAccuracy: false, timeout: 20000, maximumAge: 10000 },
        );
        timer.current = setInterval(() => {
          navigator.geolocation.getCurrentPosition(
            (p) => void push(p.coords.latitude, p.coords.longitude),
            () => {},
            { enableHighAccuracy: false, timeout: 20000, maximumAge: 10000 },
          );
        }, UPDATE_INTERVAL_MS);
      },
      (err) => {
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission was denied — enable location to share your ride."
            : "Couldn't read your location. Please try again.",
        );
        setPhase("error");
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 },
    );
  }

  if (phase === "sharing") {
    return (
      <span className="inline-flex flex-col gap-1">
        <Button variant="destructive" onClick={() => void endSharing(true)} aria-label="Stop sharing your ride">
          <Bus className="h-4 w-4" aria-hidden="true" /> Sharing • tap to stop
        </Button>
        <span className="text-xs text-asphalt-muted">Your position updates about every 15 seconds.</span>
      </span>
    );
  }

  return (
    <span className="inline-flex flex-col gap-1">
      <Button variant="secondary" onClick={() => void begin()} disabled={phase === "starting"}>
        <Bus className="h-4 w-4" aria-hidden="true" />
        {phase === "starting" ? "Starting…" : "I'm on this vehicle"}
      </Button>
      {phase === "error" && error ? (
        <span role="alert" className="text-xs text-severity-critical">
          {error}{" "}
          <button type="button" onClick={() => { setPhase("idle"); setError(undefined); }} className="font-semibold underline">
            Dismiss
          </button>
        </span>
      ) : null}
    </span>
  );
}
