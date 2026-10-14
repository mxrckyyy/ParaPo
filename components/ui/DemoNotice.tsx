import { DEMO_DATA_NOTICE } from "@/lib/mock";
import { Badge } from "./Badge";

/** Demo-data disclaimer strip — required anywhere fictional data is shown. */
export function DemoNotice({ compact = false }: { compact?: boolean }) {
  return (
    <p
      className={`flex flex-wrap items-center gap-2 text-xs text-asphalt-muted ${compact ? "" : "rounded-lg border border-dashed border-line bg-white px-3 py-2"}`}
    >
      <Badge kind="demo">Demo</Badge>
      <span>{DEMO_DATA_NOTICE}</span>
    </p>
  );
}
