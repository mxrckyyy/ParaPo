"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import { alertCreateSchema, reportStatusSchema } from "@/lib/validations";

export type AdminOutcome = { ok: true } | { ok: false; error: string };

function gateError(reason: "login" | "denied" | "setup"): Extract<AdminOutcome, { ok: false }> {
  if (reason === "login") return { ok: false, error: "Log in as an administrator first." };
  if (reason === "setup") {
    return { ok: false, error: "Admin features need the Phase 2 database tables — see docs/TESTING.md." };
  }
  return { ok: false, error: "Not permitted: administrator role required." };
}

/** Pending community reports for moderation (newest first). */
export async function listPendingReports() {
  const gate = await requireAdmin();
  if (!gate.ok) return { ok: false as const, error: gateError(gate.reason).error, rows: [] };
  const supabase = createClient();
  const { data, error } = await supabase
    .from("reports")
    .select("id,user_id,type,latitude,longitude,description,created_at,status")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) {
    if (error.code === "42P01") return { ok: false as const, error: gateError("setup").error, rows: [] };
    return { ok: false as const, error: "Couldn't load pending reports.", rows: [] };
  }
  return { ok: true as const, rows: data ?? [] };
}

/** Approve or reject one report. RLS owner/admin policy enforces at the DB too. */
export async function setReportStatus(reportId: string, status: "approved" | "rejected"): Promise<AdminOutcome> {
  const parsed = reportStatusSchema.safeParse(status);
  if (!parsed.success || parsed.data === "pending") return { ok: false, error: "Invalid status." };
  const gate = await requireAdmin();
  if (!gate.ok) return gateError(gate.reason);
  const supabase = createClient();
  const { error } = await supabase.from("reports").update({ status: parsed.data }).eq("id", reportId);
  if (error) {
    if (error.code === "42P01") return gateError("setup");
    return { ok: false, error: "Couldn't update that report." };
  }
  revalidatePath("/admin");
  revalidatePath("/map");
  return { ok: true };
}

/** Permanently delete one report (spam/abuse). */
export async function deleteReport(reportId: string): Promise<AdminOutcome> {
  const gate = await requireAdmin();
  if (!gate.ok) return gateError(gate.reason);
  const supabase = createClient();
  const { error } = await supabase.from("reports").delete().eq("id", reportId);
  if (error) {
    if (error.code === "42P01") return gateError("setup");
    return { ok: false, error: "Couldn't delete that report." };
  }
  revalidatePath("/admin");
  revalidatePath("/map");
  return { ok: true };
}

/** Publish a broadcast alert. Expires-at is optional (blank = until deleted). */
export async function createAlert(input: {
  title: string;
  message: string;
  severity: string;
  expiresAt?: string;
}): Promise<AdminOutcome> {
  const parsed = alertCreateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check this form." };
  }
  const gate = await requireAdmin();
  if (!gate.ok) return gateError(gate.reason);
  let expires_at: string | null = null;
  if (parsed.data.expiresAt?.trim()) {
    const t = Date.parse(parsed.data.expiresAt);
    if (Number.isNaN(t)) return { ok: false, error: "Expiry date isn't valid." };
    expires_at = new Date(t).toISOString();
  }
  const supabase = createClient();
  const { error } = await supabase.from("alerts").insert({
    title: parsed.data.title.trim(),
    message: parsed.data.message.trim(),
    severity: parsed.data.severity,
    expires_at,
  });
  if (error) {
    if (error.code === "42P01") return gateError("setup");
    return { ok: false, error: "Couldn't publish that alert." };
  }
  revalidatePath("/admin");
  revalidatePath("/alerts");
  return { ok: true };
}

/** Remove one alert. */
export async function deleteAlert(alertId: string): Promise<AdminOutcome> {
  const gate = await requireAdmin();
  if (!gate.ok) return gateError(gate.reason);
  const supabase = createClient();
  const { error } = await supabase.from("alerts").delete().eq("id", alertId);
  if (error) {
    if (error.code === "42P01") return gateError("setup");
    return { ok: false, error: "Couldn't delete that alert." };
  }
  revalidatePath("/admin");
  revalidatePath("/alerts");
  return { ok: true };
}
