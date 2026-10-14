import { createClient } from "@/lib/supabase/server";

/**
 * Server-side administrator gate. Reads the caller's OWN profile row and
 * requires role='admin'. Never trusts client-supplied roles. Use at the top
 * of every admin page and admin action (defense in depth alongside RLS).
 */
export async function requireAdmin(): Promise<{ ok: true; userId: string } | { ok: false; reason: "login" | "denied" | "setup" }> {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, reason: "login" };
  const { data: profile, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", auth.user.id)
    .maybeSingle();
  if (error) {
    if (error.code === "42P01") return { ok: false, reason: "setup" };
    return { ok: false, reason: "denied" };
  }
  if (!profile || profile.role !== "admin") return { ok: false, reason: "denied" };
  return { ok: true, userId: auth.user.id };
}
