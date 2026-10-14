import { ReportBallot } from "@/components/reports/ReportBallot";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { getCurrentUser } from "@/lib/auth";
import { getReportsWithVotes } from "@/lib/db";

export const metadata = { title: "Community reports — PARA PO" };

/**
 * Community reports board (Phase 5): RLS-visible reports newest-first with
 * accuracy voting. Guests can read counts; voting needs login.
 */
export default async function ReportsPage() {
  const user = await getCurrentUser();
  const { items, available } = await getReportsWithVotes(user?.id ?? null);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Community reports</h1>
        <p className="text-sm text-asphalt-muted">
          Confirm reports you also observe, or flag inaccurate ones. Votes are
          public counts; who voted what stays private. New reports start pending
          until moderated.
        </p>
      </div>
      {!available ? (
        <Card>
          <p className="text-sm font-semibold text-asphalt">Reports database not set up yet</p>
          <p className="mt-1 text-sm text-asphalt-muted">
            Run <code>supabase/migrations/20261015000000_phase2_core_schema.sql</code> first —
            then community reports will appear here.
          </p>
        </Card>
      ) : items.length === 0 ? (
        <EmptyState
          title="No community reports yet"
          message="Be the first to report what you observe on your commute."
          actionLabel="Submit a report"
          actionHref="/report"
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map(({ report, tally }) => (
            <li key={report.id}>
              <ReportBallot report={report} initialTally={tally} loggedIn={user !== null} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
