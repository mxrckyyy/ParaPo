const tone: Record<string, string> = {
  info: "bg-severity-info/10 text-severity-info",
  warning: "bg-severity-warning/10 text-severity-warning",
  critical: "bg-severity-critical/10 text-severity-critical",
  traffic: "bg-severity-warning/10 text-severity-warning",
  full: "bg-asphalt-muted/10 text-asphalt-muted",
  accident: "bg-severity-critical/10 text-severity-critical",
  closure: "bg-asphalt/10 text-asphalt",
  pending: "bg-severity-warning/10 text-severity-warning",
  approved: "bg-primary/10 text-primary-dark",
  rejected: "bg-asphalt-muted/10 text-asphalt-muted",
  demo: "bg-fare/15 text-asphalt",
};

export function Badge({ kind, children }: { kind: string; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${tone[kind] ?? "bg-surface text-asphalt"}`}
    >
      {children}
    </span>
  );
}
