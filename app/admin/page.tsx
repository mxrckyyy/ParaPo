import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export const metadata = { title: "Admin — PARA PO" };

/** Shell of the future moderation dashboard. No admin powers in Phase 1. */
export default function AdminPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <ShieldCheck className="h-6 w-6" aria-hidden="true" /> Moderation dashboard
        </h1>
        <Badge kind="demo">Demo shell</Badge>
      </div>
      <Card>
        <p className="text-sm font-semibold text-asphalt">Coming in Phase 4</p>
        <p className="mt-1 text-sm text-asphalt-muted">
          Pending-report review, approve/reject actions, and alert publishing will
          live here once administrator roles and server-side permission checks
          ship. This page intentionally performs no admin actions.
        </p>
      </Card>
      <div className="grid gap-3 md:grid-cols-3">
        {["Pending reports", "Active alerts", "Users"].map((t) => (
          <Card key={t}>
            <p className="text-sm font-semibold text-asphalt">{t}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-asphalt-muted">—</p>
            <p className="text-xs text-asphalt-muted">No data connected yet.</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
