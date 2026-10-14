"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { voteSchema } from "@/lib/validations";
import { tallyVotes, type VoteTally } from "@/lib/votes";

const SETUP_MESSAGE =
  "Voting needs the report-votes table — run supabase/migrations/20261015000003_report_votes.sql first (see docs/TESTING.md).";

export type VoteOutcome =
  | { ok: true; tally: VoteTally }
  | { ok: false; error: string; loginRequired?: boolean };

/**
 * Toggle an accuracy vote (Phase 5). Same value twice removes the vote.
 * Identity always comes from getUser(); the UNIQUE(report_id, user_id)
 * constraint backstops one-vote-per-user at the database.
 */
export async function toggleVote(reportId: string, value: 1 | -1): Promise<VoteOutcome> {
  const parsed = voteSchema.safeParse({ reportId, value });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check this vote." };
  }

  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, error: "Log in to vote on reports.", loginRequired: true };
  const userId = auth.user.id;

  const existing = await supabase
    .from("report_votes")
    .select("id,value")
    .eq("report_id", parsed.data.reportId)
    .eq("user_id", userId)
    .maybeSingle();
  if (existing.error && existing.error.code !== "PGRST116") {
    if (existing.error.code === "42P01") return { ok: false, error: SETUP_MESSAGE };
    return { ok: false, error: "Couldn't load existing votes." };
  }

  if (existing.data && existing.data.value === parsed.data.value) {
    const removed = await supabase.from("report_votes").delete().eq("id", existing.data.id).eq("user_id", userId);
    if (removed.error) return { ok: false, error: "Couldn't remove that vote." };
  } else if (existing.data) {
    const changed = await supabase
      .from("report_votes")
      .update({ value: parsed.data.value })
      .eq("id", existing.data.id)
      .eq("user_id", userId);
    if (changed.error) return { ok: false, error: "Couldn't change that vote." };
  } else {
    const inserted = await supabase.from("report_votes").insert({
      report_id: parsed.data.reportId,
      user_id: userId,
      value: parsed.data.value,
    });
    if (inserted.error) {
      if (inserted.error.code === "42P01") return { ok: false, error: SETUP_MESSAGE };
      return { ok: false, error: "Couldn't save that vote." };
    }
  }

  const all = await supabase.from("report_votes").select("user_id,value").eq("report_id", parsed.data.reportId);
  if (all.error) return { ok: false, error: "Vote saved, but counts couldn't reload." };
  revalidatePath("/reports");
  return { ok: true, tally: tallyVotes(all.data ?? [], userId) };
}
