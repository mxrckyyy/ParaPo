"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { toggleVote } from "@/app/actions/votes";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { timeAgo } from "@/lib/markers";
import type { VoteTally } from "@/lib/votes";
import type { DbReport } from "@/types/database";

/**
 * One community report with accuracy voting (Phase 5). Counts are public;
 * voting needs login. Toggling the same value removes the vote.
 */
export function ReportBallot({
  report,
  initialTally,
  loggedIn,
}: {
  report: DbReport;
  initialTally: VoteTally;
  loggedIn: boolean;
}) {
  const router = useRouter();
  const [tally, setTally] = useState(initialTally);
  const [pending, setPending] = useState<1 | -1 | null>(null);
  const [notice, setNotice] = useState<string | undefined>();

  async function vote(value: 1 | -1) {
    if (!loggedIn) {
      setNotice("Log in to vote on reports.");
      return;
    }
    setPending(value);
    setNotice(undefined);
    const outcome = await toggleVote(report.id, value);
    if (!outcome) {
      setNotice("Something went wrong. Please try again.");
    } else if (!outcome.ok) {
      setNotice(outcome.error);
    } else {
      setTally(outcome.tally);
      router.refresh();
    }
    setPending(null);
  }

  return (
    <Card className="flex flex-col gap-2">
      <p className="flex flex-wrap items-center gap-2">
        <Badge kind={report.type}>{report.type}</Badge>
        <Badge kind={report.status}>{report.status}</Badge>
        <span className="text-xs text-asphalt-muted">
          {Number(report.latitude).toFixed(4)}, {Number(report.longitude).toFixed(4)} ·{" "}
          {timeAgo(report.created_at)}
        </span>
      </p>
      <p className="text-sm text-asphalt">
        {report.description?.trim() ? report.description : "(no description)"}
      </p>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Vote on report accuracy">
        <button
          type="button"
          disabled={pending !== null}
          aria-pressed={tally.mine === 1}
          onClick={() => void vote(1)}
          className={`inline-flex min-h-[44px] items-center gap-1 rounded-lg border px-3 py-1 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50 ${
            tally.mine === 1 ? "border-primary bg-primary/10 text-primary-dark" : "border-line bg-white text-asphalt"
          }`}
        >
          <ThumbsUp className="h-4 w-4" aria-hidden="true" /> {tally.up}
          <span className="sr-only">confirmed votes</span>
        </button>
        <button
          type="button"
          disabled={pending !== null}
          aria-pressed={tally.mine === -1}
          onClick={() => void vote(-1)}
          className={`inline-flex min-h-[44px] items-center gap-1 rounded-lg border px-3 py-1 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50 ${
            tally.mine === -1 ? "border-severity-critical bg-severity-critical/10 text-severity-critical" : "border-line bg-white text-asphalt"
          }`}
        >
          <ThumbsDown className="h-4 w-4" aria-hidden="true" /> {tally.down}
          <span className="sr-only">inaccurate votes</span>
        </button>
        {!loggedIn ? (
          <Link href="/login" className="text-xs font-semibold text-primary-dark hover:underline">
            Log in to vote
          </Link>
        ) : null}
      </div>
      {notice ? (
        <p role={notice.startsWith("Log in") ? "status" : "alert"} className="text-xs text-asphalt-muted">
          {notice}
        </p>
      ) : null}
    </Card>
  );
}
