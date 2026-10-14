import Link from "next/link";
import { AlertsLive } from "@/components/alerts/AlertsLive";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { getLiveAlerts } from "@/lib/db";
import { toAlertItem } from "@/lib/markers";
import { DEMO_ALERTS } from "@/lib/mock";

export const metadata = { title: "Alerts — PARA PO" };

export default async function AlertsPage() {
  const { rows, available } = await getLiveAlerts();
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Alerts</h1>
        <p className="text-sm text-asphalt-muted">
          {available
            ? "Official service alerts from administrators. Expired alerts are hidden automatically."
            : "Sample service alerts for layout preview — the alerts database is unreachable."}
        </p>
      </div>
      {!available ? <DemoNotice /> : null}
      <AlertsLive initial={available ? rows.map(toAlertItem) : DEMO_ALERTS} live={available} />
      <p className="text-xs text-asphalt-muted">
        Critical alerts also appear as a banner on the home page. <Link href="/map" className="font-semibold text-primary-dark hover:underline">Open the map</Link>
      </p>
    </div>
  );
}
