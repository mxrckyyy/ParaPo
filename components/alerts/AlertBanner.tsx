import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import type { DemoAlert } from "@/types";

/** Home-page banner for the most urgent live alert (critical first). Guests and users alike. */
export function AlertBanner({ alerts }: { alerts: DemoAlert[] }) {
  const top = alerts.find((a) => a.severity === "critical") ?? alerts.find((a) => a.severity === "warning");
  if (!top) return null;
  const critical = top.severity === "critical";
  return (
    <Link
      href="/alerts"
      className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
        critical
          ? "border-severity-critical/30 bg-severity-critical/10 text-severity-critical"
          : "border-severity-warning/30 bg-severity-warning/10 text-severity-warning"
      }`}
      aria-label={`Service alert: ${top.title}`}
    >
      <TriangleAlert className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span className="line-clamp-2">{top.title} — view alerts</span>
    </Link>
  );
}
