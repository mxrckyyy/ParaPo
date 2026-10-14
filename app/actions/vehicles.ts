"use server";

import { createClient } from "@/lib/supabase/server";
import { vehicleShareSchema } from "@/lib/validations";

/**
 * Minimum gap between position updates for one shared vehicle (10 s).
 * Client throttles to ~15 s; this is the enforced backstop.
 */
const UPDATE_THROTTLE_MS = 10 * 1000;

const SETUP_MESSAGE =
  "Ride sharing needs the Phase 2 database tables, which are not set up yet. The migration file is ready in supabase/migrations/ — see docs/TESTING.md.";

export type ShareOutcome =
  | { ok: true; vehicleId: string }
  | { ok: false; error: string; loginRequired?: boolean };

export type UpdateOutcome =
  | { ok: true; throttled: boolean }
  | { ok: false; error: string };

/**
 * Start sharing a ride: creates one anonymous vehicle row (no user_id by
 * design — docs/DATABASE_SCHEMA.md). The client keeps the returned id for
 * updates/stop. Requires login (RLS insert is authenticated-only).
 */
export async function startSharing(input: {
  routeId: string | null;
  latitude: number;
  longitude: number;
}): Promise<ShareOutcome> {
  const parsed = vehicleShareSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the location." };
  }
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, error: "Log in to share your ride.", loginRequired: true };

  const { data, error } = await supabase
    .from("vehicles")
    .insert({
      route_id: parsed.data.routeId,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      status: "active",
    })
    .select("id")
    .single();
  if (error || !data) {
    if (error?.code === "42P01") return { ok: false, error: SETUP_MESSAGE };
    return { ok: false, error: "Couldn't start sharing. Please try again." };
  }
  return { ok: true, vehicleId: data.id };
}

/** Move a shared vehicle. Rejects updates arriving faster than the throttle. */
export async function updatePosition(input: {
  vehicleId: string;
  latitude: number;
  longitude: number;
}): Promise<UpdateOutcome> {
  if (typeof input.vehicleId !== "string" || input.vehicleId.length === 0) {
    return { ok: false, error: "Missing shared vehicle." };
  }
  const parsed = vehicleShareSchema.safeParse({
    routeId: null,
    latitude: input.latitude,
    longitude: input.longitude,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the location." };
  }
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, error: "Log in to share your ride." };

  const current = await supabase
    .from("vehicles")
    .select("last_updated,status")
    .eq("id", input.vehicleId)
    .maybeSingle();
  if (current.error) {
    if (current.error.code === "42P01") return { ok: false, error: SETUP_MESSAGE };
    return { ok: false, error: "Couldn't update the shared location." };
  }
  if (!current.data || current.data.status !== "active") {
    return { ok: false, error: "This shared ride already ended." };
  }
  if (Date.now() - Date.parse(current.data.last_updated) < UPDATE_THROTTLE_MS) {
    return { ok: true, throttled: true };
  }
  const { error } = await supabase
    .from("vehicles")
    .update({ latitude: parsed.data.latitude, longitude: parsed.data.longitude, last_updated: new Date().toISOString() })
    .eq("id", input.vehicleId);
  if (error) return { ok: false, error: "Couldn't update the shared location." };
  return { ok: true, throttled: false };
}

/** End a shared ride (row stays as an inactive record). */
export async function stopSharing(vehicleId: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, error: "Log in first." };
  const { error } = await supabase
    .from("vehicles")
    .update({ status: "inactive" })
    .eq("id", vehicleId);
  if (error) {
    if (error.code === "42P01") return { ok: false, error: SETUP_MESSAGE };
    return { ok: false, error: "Couldn't stop sharing. The marker will fade automatically." };
  }
  return { ok: true };
}
