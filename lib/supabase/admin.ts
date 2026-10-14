// Supabase admin client (Phase 2+, Route Handlers / scripts ONLY).
// SECURITY: uses the service-role key, bypasses RLS. Never import this from
// client components or any file bundled for the browser.
// NOT imported anywhere in Phase 1.
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Supabase admin client is not configured (Phase 2).");
  }
  return createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
