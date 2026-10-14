"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type FavoriteOutcome =
  | { ok: true; favorited: boolean }
  | { ok: false; error: string; loginRequired?: boolean };

const SETUP_MESSAGE =
  "Favorites need the Phase 2 database tables, which are not set up yet. The migration file is ready in supabase/migrations/ — see docs/TESTING.md.";

/** Toggle a route favorite for the verified session user. Never trusts client IDs. */
export async function toggleFavorite(routeId: string): Promise<FavoriteOutcome> {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, error: "Log in to save favorites.", loginRequired: true };
  const userId = auth.user.id;

  const existing = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("route_id", routeId)
    .maybeSingle();
  if (existing.error && existing.error.code !== "PGRST116") {
    if (existing.error.code === "42P01") return { ok: false, error: SETUP_MESSAGE };
    return { ok: false, error: "Couldn't save that favorite. Please try again." };
  }
  if (existing.data) {
    const removed = await supabase.from("favorites").delete().eq("id", existing.data.id).eq("user_id", userId);
    if (removed.error) return { ok: false, error: "Couldn't remove that favorite. Please try again." };
    revalidatePath("/favorites");
    return { ok: true, favorited: false };
  }
  const inserted = await supabase.from("favorites").insert({ user_id: userId, route_id: routeId });
  if (inserted.error) {
    if (inserted.error.code === "42P01") return { ok: false, error: SETUP_MESSAGE };
    return { ok: false, error: "Couldn't save that favorite. Please try again." };
  }
  revalidatePath("/favorites");
  return { ok: true, favorited: true };
}

/** Remove one favorite by id — strictly owner-scoped. */
export async function removeFavorite(favoriteId: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, error: "Log in first." };
  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("id", favoriteId)
    .eq("user_id", auth.user.id);
  if (error) {
    if (error.code === "42P01") return { ok: false, error: SETUP_MESSAGE };
    return { ok: false, error: "Couldn't remove that favorite. Please try again." };
  }
  revalidatePath("/favorites");
  return { ok: true };
}
