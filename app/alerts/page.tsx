import { AlertCard } from "@/components/alerts/AlertCards";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { DEMO_ALERTS } from "@/lib/mock";

export const metadata = { title: "Alerts — PARA PO" };

export default function AlertsPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Alerts</h1>
        <p className="text-sm text-asphalt-muted">
          Sample service alerts for layout preview. Real-time admin broadcasts
          arrive in a later phase.
        </p>
      </div>
      <DemoNotice />
      <div className="flex flex-col gap-3">
        {DEMO_ALERTS.map((a) => (
          <AlertCard key={a.id} alert={a} />
        ))}
      </div>
    </div>
  );
}
