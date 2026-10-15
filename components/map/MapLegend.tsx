import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

/** Legend shared by every page that shows the demo map. */
export function MapLegend() {
  const items = [
    { swatch: "bg-primary", label: "Demo vehicle (sample, not live)" },
    { swatch: "bg-asphalt-muted", label: "Demo vehicle — full (sample)" },
    { swatch: "bg-severity-warning", label: "Sample traffic report" },
    { swatch: "bg-severity-critical", label: "Sample accident report" },
    { swatch: "bg-asphalt", label: "Sample closure report" },
  ];
  return (
    <Card className="flex flex-col gap-2" aria-label="Map legend">
      <details className="group" open>
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-semibold text-asphalt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
          <span className="flex items-center gap-2">
            Legend <Badge kind="demo">Demo</Badge>
          </span>
          <span className="text-xs font-normal text-asphalt-muted group-open:hidden">Show</span>
          <span className="hidden text-xs font-normal text-asphalt-muted group-open:inline">Hide</span>
        </summary>
        <div className="mt-2 flex flex-col gap-2">
          <ul className="flex flex-col gap-1.5 text-xs text-asphalt-muted">
            {items.map((i) => (
              <li key={i.label} className="flex items-center gap-2">
                <span className={`h-3 w-3 rounded-full ring-2 ring-white ${i.swatch}`} aria-hidden="true" />
                {i.label}
              </li>
            ))}
          </ul>
          <p className="text-xs text-asphalt-muted">
            Dashed, faded pins are <em>pending (unverified)</em> samples.
          </p>
        </div>
      </details>
    </Card>
  );
}
