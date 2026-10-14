"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteReport, setReportStatus } from "@/app/actions/admin";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { timeAgo } from "@/lib/markers";
import type { DbReport } from "@/types/database";

function RowActions({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>();

  async function run(kind: "approved" | "rejected" | "deleted", fn: () => Promise<{ ok: boolean; error?: string }>) {
    setPending(kind);
    setError(undefined);
    const outcome = await fn();
    if (outcome.ok) router.refresh();
    else setError(outcome.error);
    setPending(null);
  }

  return (
    <span className="inline-flex flex-col gap-1">
      <span className="flex flex-wrap gap-1">
        <Button variant="secondary" disabled={pending !== null} onClick={() => void run("approved", () => setReportStatus(id, "approved"))}>
          {pending === "approved" ? "…" : "Approve"}
        </Button>
        <Button variant="secondary" disabled={pending !== null} onClick={() => void run("rejected", () => setReportStatus(id, "rejected"))}>
          {pending === "rejected" ? "…" : "Reject"}
        </Button>
        <Button variant="destructive" disabled={pending !== null} onClick={() => void run("deleted", () => deleteReport(id))}>
          {pending === "deleted" ? "…" : "Delete"}
        </Button>
      </span>
      {error ? (
        <span role="alert" className="text-xs text-severity-critical">{error}</span>
      ) : null}
    </span>
  );
}

/** Server-fetched pending rows; actions refresh from the server (no local copy). */
export function ModerationQueue({ items }: { items: DbReport[] }) {
  if (items.length === 0) {
    return (
      <Card>
        <p className="text-sm font-semibold text-asphalt">No pending reports</p>
        <p className="mt-1 text-sm text-asphalt-muted">
          The queue is empty. If reporters are active but nothing appears here, the{" "}
          <code>20261015000002_reports_admin_read.sql</code> policy migration may not be applied yet
          (admins need it to read other users&apos; pending rows).
        </p>
      </Card>
    );
  }
  return (
    <ul className="flex flex-col gap-3">
      {items.map((r) => (
        <li key={r.id}>
          <Card className="flex flex-col gap-2">
            <p className="flex flex-wrap items-center gap-2">
              <Badge kind={r.type}>{r.type}</Badge>
              <Badge kind="pending">{r.status}</Badge>
              <span className="text-xs text-asphalt-muted">
                {Number(r.latitude).toFixed(4)}, {Number(r.longitude).toFixed(4)} · {timeAgo(r.created_at)}
              </span>
            </p>
            <p className="text-sm text-asphalt">{r.description?.trim() ? r.description : "(no description)"}</p>
            <RowActions id={r.id} />
          </Card>
        </li>
      ))}
    </ul>
  );
}
