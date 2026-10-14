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
      <p className="flex items-center gap-2 text-sm font-semibold text-asphalt">
        Legend <Badge kind="demo">Demo</Badge>
      </p>
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
    </Card>
  );
}
