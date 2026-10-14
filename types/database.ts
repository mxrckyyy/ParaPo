// Minimal Supabase row types matching
// supabase/migrations/20261015000000_phase2_core_schema.sql.
// Hand-maintained until `supabase gen types` is wired (needs CLI login).
// If the migration changes, update this file in the same commit.

export interface DbRoute {
  id: string;
  name: string;
  origin: string;
  destination: string;
  fare: number | null;
  geometry: unknown;
}

export interface DbStop {
  id: string;
  route_id: string;
  name: string;
  latitude: number;
  longitude: number;
}

export interface DbVehicle {
  id: string;
  route_id: string | null;
  latitude: number;
  longitude: number;
  last_updated: string;
  status: "active" | "full" | "inactive";
}

export interface DbReport {
  id: string;
  user_id: string;
  type: "traffic" | "full" | "accident" | "closure";
  latitude: number;
  longitude: number;
  description: string | null;
  created_at: string;
  status: "pending" | "approved" | "rejected";
}

export interface DbAlert {
  id: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "critical";
  created_at: string;
  expires_at: string | null;
}

export interface DbFavorite {
  id: string;
  user_id: string;
  route_id: string | null;
  stop_id: string | null;
  created_at: string;
}

export interface DbUser {
  id: string;
  email: string | null;
  role: "commuter" | "admin" | "operator";
  created_at: string;
}
