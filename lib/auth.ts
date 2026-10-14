import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { DbUser } from "@/types/database";

/**
 * Verified server-side identity. Uses getUser() (validates the JWT with the
 * Auth server) — never trust client-supplied IDs or roles.
 * Returns null when logged out OR when Supabase is unreachable/misconfigured,
 * so pages degrade to guest UI instead of crashing.
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    return data.user;
  } catch {
    return null;
  }
}

/** App profile row (role). Null when logged out, row missing, or DB unreachable. */
export async function getCurrentProfile(): Promise<DbUser | null> {
  try {
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return null;
    const { data, error } = await supabase
      .from("users")
      .select("id,email,role,created_at")
      .eq("id", auth.user.id)
      .maybeSingle();
    if (error || !data) return null;
    return data as DbUser;
  } catch {
    return null;
  }
}
