import { createClient } from "@/lib/supabase/server";
import { DEMO_ROUTES } from "@/lib/mock";
import type { DemoRoute } from "@/types";
import type { DbAlert, DbFavorite, DbReport, DbRoute, DbStop, DbVehicle } from "@/types/database";

export type DataSource = "supabase" | "demo";

/** True when the Phase 2 tables are missing (migration not applied yet). */
function isMissingTable(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return error.code === "42P01" || /relation .* does not exist/i.test(error.message ?? "");
}

export interface LiveRoute extends DemoRoute {
  source: DataSource;
}

function toLiveRoute(row: DbRoute, stops: DbStop[], source: DataSource): LiveRoute {
  return {
    id: row.id,
    name: row.name,
    origin: row.origin,
    destination: row.destination,
    farePhp: row.fare ?? 0,
    // Live ETAs need GPS data (Phase 3) — range stays illustrative.
    etaMin: 0,
    etaMax: 0,
    stops: stops
      .filter((s) => s.route_id === row.id)
      .map((s) => ({ id: s.id, name: s.name, latitude: s.latitude, longitude: s.longitude })),
    steps: [],
    source,
  };
}

/**
 * Live route summaries for search. Falls back to clearly-labeled demo data
 * when Supabase is unreachable, tables are missing, or no verified rows exist.
 */
export async function getRouteSummaries(): Promise<{ routes: LiveRoute[]; source: DataSource }> {
  try {
    const supabase = createClient();
    const { data: routes, error: routeError } = await supabase
      .from("routes")
      .select("id,name,origin,destination,fare,geometry")
      .order("name");
    if (routeError || !routes || routes.length === 0) throw routeError ?? new Error("empty");
    const { data: stops } = await supabase.from("stops").select("id,route_id,name,latitude,longitude");
    const rows = routes as DbRoute[];
    const stopRows = (stops ?? []) as DbStop[];
    return { routes: rows.map((r) => toLiveRoute(r, stopRows, "supabase")), source: "supabase" };
  } catch {
    return { routes: DEMO_ROUTES.map((r) => ({ ...r, source: "demo" as const })), source: "demo" };
  }
}

/** Single route detail: demo rows first (instant), then live lookup by id. */
export async function getRouteDetail(id: string): Promise<LiveRoute | null> {
  const demo = DEMO_ROUTES.find((r) => r.id === id);
  if (demo) return { ...demo, source: "demo" };
  try {
    const supabase = createClient();
    const { data: route, error } = await supabase
      .from("routes")
      .select("id,name,origin,destination,fare,geometry")
      .eq("id", id)
      .maybeSingle();
    if (error || !route) return null;
    const { data: stops } = await supabase
      .from("stops")
      .select("id,route_id,name,latitude,longitude")
      .eq("route_id", id);
    return toLiveRoute(route as DbRoute, (stops ?? []) as DbStop[], "supabase");
  } catch {
    return null;
  }
}

export interface FavoritesResult {
  favorites: (DbFavorite & { routeName: string | null })[];
  setupPending: boolean;
}

/** Live vehicle sightings for the map (newest first). Empty when unavailable. */
export async function getLiveVehicles(limit = 100): Promise<{ rows: DbVehicle[]; available: boolean }> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("vehicles")
      .select("id,route_id,latitude,longitude,last_updated,status")
      .neq("status", "inactive")
      .order("last_updated", { ascending: false })
      .limit(limit);
    if (error || !data) return { rows: [], available: false };
    return { rows: data as DbVehicle[], available: true };
  } catch {
    return { rows: [], available: false };
  }
}

/** Live reports for the map (approved + own pending handled by RLS, newest first). */
export async function getLiveReports(limit = 100): Promise<{ rows: DbReport[]; available: boolean }> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("reports")
      .select("id,user_id,type,latitude,longitude,description,created_at,status")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error || !data) return { rows: [], available: false };
    return { rows: data as DbReport[], available: true };
  } catch {
    return { rows: [], available: false };
  }
}

/** Active vehicles on one route (for live ETA on the details page). */
export async function getVehiclesByRoute(routeId: string): Promise<DbVehicle[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("vehicles")
      .select("id,route_id,latitude,longitude,last_updated,status")
      .eq("route_id", routeId)
      .eq("status", "active")
      .order("last_updated", { ascending: false })
      .limit(20);
    if (error || !data) return [];
    return data as DbVehicle[];
  } catch {
    return [];
  }
}

/** Non-expired alerts for the alerts center (newest first). */
export async function getLiveAlerts(limit = 50): Promise<{ rows: DbAlert[]; available: boolean }> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("alerts")
      .select("id,title,message,severity,created_at,expires_at")
      .or("expires_at.is.null,expires_at.gt.now()")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error || !data) return { rows: [], available: false };
    return { rows: data as DbAlert[], available: true };
  } catch {
    return { rows: [], available: false };
  }
}

/** Owner-scoped favorites. setupPending=true when the migration isn't applied. */
export async function getMyFavorites(userId: string): Promise<FavoritesResult> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("favorites")
      .select("id,user_id,route_id,stop_id,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) return { favorites: [], setupPending: isMissingTable(error) };
    const rows = (data ?? []) as DbFavorite[];
    const routeIds = Array.from(new Set(rows.map((f) => f.route_id).filter((v): v is string => v !== null)));
    let names = new Map<string, string>();
    if (routeIds.length > 0) {
      const { data: routes } = await supabase.from("routes").select("id,name").in("id", routeIds);
      names = new Map(((routes ?? []) as { id: string; name: string }[]).map((r) => [r.id, r.name]));
    }
    return {
      favorites: rows.map((f) => ({ ...f, routeName: f.route_id ? (names.get(f.route_id) ?? "Unknown route") : null })),
      setupPending: false,
    };
  } catch {
    return { favorites: [], setupPending: true };
  }
}
