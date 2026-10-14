// Supabase browser client (Phase 2+). Prepared in Phase 1 so the import
// surface matches docs/ARCHITECTURE.md §5. NOT imported anywhere yet —
// no Supabase project or credentials exist, and Phase 1 is mock-data only.
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  );
}
