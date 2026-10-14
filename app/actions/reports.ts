"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { reportSubmitSchema } from "@/lib/validations";

/** Max 1 report per user per 30 seconds (docs/SYSTEM_DESIGN.md §4.3). */
const REPORT_COOLDOWN_MS = 30 * 1000;

const SETUP_MESSAGE =
  "Community reporting needs the Phase 2 database tables, which are not set up yet. The migration file is ready in supabase/migrations/ — see docs/TESTING.md.";

export type ReportOutcome =
  | { ok: true }
  | { ok: false; error: string; loginRequired?: boolean };

/**
 * Submit a crowdsourced report. Verified session identity only — the row's
 * user_id always comes from getUser(), never from client input. Starts
 * `pending` (unverified) per docs/SYSTEM_DESIGN.md §4.3.
 */
export async function submitReport(input: {
  type: string;
  description?: string;
  latitude: number;
  longitude: number;
}): Promise<ReportOutcome> {
  const parsed = reportSubmitSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check this form." };
  }

  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, error: "Log in to submit a report.", loginRequired: true };

  // Server-side rate limit (client throttling is UX only).
  const recent = await supabase
    .from("reports")
    .select("created_at")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (recent.error && recent.error.code === "42P01") return { ok: false, error: SETUP_MESSAGE };
  if (!recent.error && recent.data) {
    const ageMs = Date.now() - Date.parse(recent.data.created_at);
    if (ageMs < REPORT_COOLDOWN_MS) {
      const waitSec = Math.ceil((REPORT_COOLDOWN_MS - ageMs) / 1000);
      return { ok: false, error: `Please wait ${waitSec} more second(s) before sending another report.` };
    }
  }

  const { error } = await supabase.from("reports").insert({
    user_id: auth.user.id,
    type: parsed.data.type,
    description: parsed.data.description?.trim() ? parsed.data.description.trim() : null,
    latitude: parsed.data.latitude,
    longitude: parsed.data.longitude,
    status: "pending",
  });
  if (error) {
    if (error.code === "42P01") return { ok: false, error: SETUP_MESSAGE };
    return { ok: false, error: "Couldn't save that report. Please try again." };
  }
  revalidatePath("/report");
  revalidatePath("/map");
  return { ok: true };
}
