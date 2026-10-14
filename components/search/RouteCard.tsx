import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatEtaRange, formatPeso } from "@/lib/format";
import type { LiveRoute } from "@/lib/db";
import type { DemoRoute } from "@/types";

export function RouteCard({ route }: { route: DemoRoute }) {
  return (
    <Card className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-bold text-asphalt">{route.name}</p>
        <Badge kind="demo">Demo</Badge>
      </div>
      <p className="text-sm text-asphalt-muted">
        {route.origin} → {route.destination}
      </p>
      <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <span className="font-semibold tabular-nums text-fare">
          Sample fare {formatPeso(route.farePhp)}
        </span>
        <span className="font-semibold tabular-nums text-asphalt">
          {formatEtaRange(route.etaMin, route.etaMax)}{" "}
          <span className="font-normal text-asphalt-muted">(illustrative estimate)</span>
        </span>
      </p>
      <Link
        href={`/routes/${route.id}`}
        className="inline-flex min-h-[44px] items-center gap-1 text-sm font-semibold text-primary-dark hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        View details <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </Card>
  );
}

/** Card for a verified row from Supabase. Fares/ETAs show only when verified. */
export function LiveRouteCard({ route }: { route: LiveRoute }) {
  return (
    <Card className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-bold text-asphalt">{route.name}</p>
        <Badge kind="approved">Live</Badge>
      </div>
      <p className="text-sm text-asphalt-muted">
        {route.origin} → {route.destination}
      </p>
      <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        {route.farePhp > 0 ? (
          <span className="font-semibold tabular-nums text-fare">
            {formatPeso(route.farePhp)}
          </span>
        ) : (
          <span className="text-asphalt-muted">Fare not published yet</span>
        )}
        <span className="text-asphalt-muted">
          {route.stops.length} stop{route.stops.length === 1 ? "" : "s"} · ETA with GPS data (Phase 3)
        </span>
      </p>
      <Link
        href={`/routes/${route.id}`}
        className="inline-flex min-h-[44px] items-center gap-1 text-sm font-semibold text-primary-dark hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        View details <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </Card>
  );
}
