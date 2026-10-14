import type { DbVote } from "@/types/database";

export interface VoteTally {
  up: number;
  down: number;
  /** The caller's own vote, if any. */
  mine: 1 | -1 | null;
}

/** Pure tally over a report's vote rows (unit-tested; no I/O). */
export function tallyVotes(rows: Pick<DbVote, "user_id" | "value">[], userId: string | null): VoteTally {
  let up = 0;
  let down = 0;
  let mine: 1 | -1 | null = null;
  for (const r of rows) {
    if (r.value === 1) up += 1;
    else if (r.value === -1) down += 1;
    if (userId !== null && r.user_id === userId) mine = r.value;
  }
  return { up, down, mine };
}
