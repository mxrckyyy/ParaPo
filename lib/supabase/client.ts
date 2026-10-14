// Supabase browser client. Uses the publishable key, which is public by
// design — RLS policies (not the key) enforce access. See docs/SECURITY.md.
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
  );
}
