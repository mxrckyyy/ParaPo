import { ShieldCheck } from "lucide-react";
import { listPendingReports } from "@/app/actions/admin";
import { AlertManager, DeleteAlertButton } from "@/components/admin/AlertManager";
import { ModerationQueue } from "@/components/admin/ModerationQueue";
import { AlertCard } from "@/components/alerts/AlertCards";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { LoginWall } from "@/components/ui/LoginWall";
import { requireAdmin } from "@/lib/admin";
import { getCurrentUser } from "@/lib/auth";
import { getLiveAlerts } from "@/lib/db";
import { toAlertItem } from "@/lib/markers";

export const metadata = { title: "Admin — PARA PO" };

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="py-6">
        <LoginWall
          title="Moderation dashboard"
          message="Administrator sign-in required. This area is enforced server-side, not just hidden."
        />
      </div>
    );
  }

  const gate = await requireAdmin();
  if (!gate.ok) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-4 py-6">
        <Card className="flex flex-col items-center gap-2 py-10 text-center">
          <ShieldCheck className="h-8 w-8 text-asphalt-muted" aria-hidden="true" />
          <h1 className="text-lg font-bold text-asphalt">Not permitted</h1>
          <p className="max-w-sm text-sm text-asphalt-muted">
            {gate.reason === "setup"
              ? "The user database isn't set up yet, so roles can't be checked."
              : "This dashboard requires the administrator role, which is granted server-side only."}
          </p>
        </Card>
      </div>
    );
  }

  const [{ rows: pending }, { rows: alerts, available: alertsLive }] = await Promise.all([
    listPendingReports(),
    getLiveAlerts(20),
  ]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <ShieldCheck className="h-6 w-6" aria-hidden="true" /> Moderation dashboard
        </h1>
        <Badge kind="approved">Admin</Badge>
      </div>

      <section className="flex flex-col gap-3" aria-labelledby="pending-heading">
        <h2 id="pending-heading" className="text-lg font-bold">
          Pending reports ({pending.length})
        </h2>
        <ModerationQueue items={pending} />
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="alerts-admin-heading">
        <h2 id="alerts-admin-heading" className="text-lg font-bold">Service alerts</h2>
        <AlertManager />
        {!alertsLive ? (
          <p className="text-xs text-asphalt-muted">
            Published alerts will appear here once the alerts table is readable (see PRIV-01 in docs/TESTING.md).
          </p>
        ) : alerts.length === 0 ? (
          <p className="text-sm text-asphalt-muted">No active alerts published.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {alerts.map((a) => {
              const item = toAlertItem(a);
              return (
                <li key={a.id}>
                  <Card className="flex flex-col gap-2">
                    <AlertCard alert={item} />
                    <div>
                      <DeleteAlertButton alertId={a.id} />
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
