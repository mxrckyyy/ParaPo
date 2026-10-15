import { AlertTriangle, Bell, Info } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { DemoAlert, DemoReport } from "@/types";

const severityLabel: Record<DemoAlert["severity"], string> = {
  info: "Info",
  warning: "Warning",
  critical: "Critical",
};

const severityBorder: Record<DemoAlert["severity"], string> = {
  info: "border-l-severity-info",
  warning: "border-l-severity-warning",
  critical: "border-l-severity-critical",
};

const severityIcon = {
  info: Info,
  warning: AlertTriangle,
  critical: Bell,
} satisfies Record<DemoAlert["severity"], (typeof Info)>;

export function AlertCard({ alert, demo = true }: { alert: DemoAlert; demo?: boolean }) {
  return (
    <Card className={`border-l-4 ${severityBorder[alert.severity]}`}>
      <div className="flex flex-wrap items-start gap-2">
        <span
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
            alert.severity === "info"
              ? "bg-severity-info/10 text-severity-info"
              : alert.severity === "warning"
              ? "bg-severity-warning/10 text-severity-warning"
              : "bg-severity-critical/10 text-severity-critical"
          }`}
        >
          {(() => {
            const Icon = severityIcon[alert.severity];
            return <Icon className="h-4 w-4" aria-hidden />;
          })()}
        </span>
        <p className="min-w-0 flex-1 text-sm font-bold text-asphalt">{alert.title}</p>
      </div>
      <p className="mt-1 text-sm text-asphalt-muted">{alert.message}</p>
      <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-asphalt-muted">
        <Badge kind={alert.severity}>{severityLabel[alert.severity]}</Badge>
        {demo ? <Badge kind="demo">Demo</Badge> : <Badge kind="approved">Live</Badge>}
        <span>{alert.expiresText}</span>
      </p>
    </Card>
  );
}

const typeLabel: Record<DemoReport["type"], string> = {
  traffic: "Traffic",
  full: "Full vehicle",
  accident: "Accident",
  closure: "Closure",
};

export function ReportCard({ report }: { report: DemoReport }) {
  return (
    <Card>
      <div className="flex flex-wrap items-center gap-2">
        <Badge kind={report.type}>{typeLabel[report.type]}</Badge>
        <Badge kind={report.status}>{report.status}</Badge>
        <Badge kind="demo">Demo</Badge>
      </div>
      <p className="mt-2 text-sm text-asphalt">{report.description}</p>
      <p className="mt-1 text-xs text-asphalt-muted">
        Sample pin · {report.createdAgo} · Community-reported · unverified
      </p>
    </Card>
  );
}
