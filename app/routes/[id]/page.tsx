import Link from "next/link";
import { notFound } from "next/navigation";
import { Footprints, Star } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { formatEtaRange, formatPeso } from "@/lib/format";
import { DEMO_ROUTES, findDemoRoute } from "@/lib/mock";

export function generateStaticParams() {
  return DEMO_ROUTES.map((r) => ({ id: r.id }));
}

export default function RouteDetailPage({ params }: { params: { id: string } }) {
  const route = findDemoRoute(params.id);
  if (!route) notFound();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <Link href="/search" className="text-sm font-semibold text-primary-dark hover:underline">
        ← Back to search
      </Link>
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold">{route.name}</h1>
        <Badge kind="demo">Demo</Badge>
      </div>
      <DemoNotice />

      <Card className="flex flex-col gap-2 bg-asphalt text-white">
        <p className="text-sm text-white/70">Illustrative travel time (not a real prediction)</p>
        <p className="text-3xl font-bold tabular-nums">{formatEtaRange(route.etaMin, route.etaMax)}</p>
        <p className="text-sm">
          Sample fare: <span className="font-bold text-fare">{formatPeso(route.farePhp)}</span>{" "}
          <span className="text-white/70">(not an official fare)</span>
        </p>
      </Card>

      <Card>
        <h2 className="text-base font-bold">Step-by-step (fictional)</h2>
        <ol className="mt-2 flex flex-col gap-2">
          {route.steps.map((s, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface">
                {s.kind === "walk" ? (
                  <Footprints className="h-3.5 w-3.5 text-asphalt-muted" aria-label="Walk" />
                ) : (
                  <span aria-label="Ride" className="h-2.5 w-2.5 rounded-full bg-primary" />
                )}
              </span>
              <span className="text-asphalt">{s.text}</span>
            </li>
          ))}
        </ol>
      </Card>

      <Card>
        <h2 className="text-base font-bold">Fictional stops</h2>
        <ul className="mt-2 flex flex-col gap-1 text-sm text-asphalt-muted">
          {route.stops.map((s) => (
            <li key={s.id}>
              {s.name} · {s.latitude.toFixed(4)}, {s.longitude.toFixed(4)}
            </li>
          ))}
        </ul>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Link href="/favorites">
          <Button variant="secondary">
            <Star className="h-4 w-4" aria-hidden="true" /> Save to favorites
          </Button>
        </Link>
        <Link href="/report">
          <Button variant="ghost">Report an issue on this route</Button>
        </Link>
      </div>
      <p className="text-xs text-asphalt-muted">
        Saving favorites requires an account (Phase 2). Reporting goes live in Phase 3.
      </p>
    </div>
  );
}
