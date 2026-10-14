import { DemoMap } from "@/components/map/DemoMap";
import { MapLegend } from "@/components/map/MapLegend";
import { Card } from "@/components/ui/Card";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { DEMO_REPORTS, DEMO_VEHICLES, METRO_MANILA_CENTER } from "@/lib/mock";

export const metadata = { title: "Demo map — PARA PO" };

export default function MapPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Demo map</h1>
        <p className="text-sm text-asphalt-muted">
          Fictional vehicles and sample reports around Metro Manila. Positions are
          static — live tracking arrives in Phase 3.
        </p>
      </div>
      <DemoNotice />
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="h-[60vh] min-h-[380px] overflow-hidden rounded-xl border border-line bg-white">
          <DemoMap center={METRO_MANILA_CENTER} vehicles={DEMO_VEHICLES} reports={DEMO_REPORTS} />
        </div>
        <div className="flex flex-col gap-4">
          <MapLegend />
          <Card aria-label="Marker list">
            <p className="text-sm font-semibold">All demo markers (list view)</p>
            <ul className="mt-2 flex flex-col gap-2 text-xs text-asphalt-muted">
              {DEMO_VEHICLES.map((v) => (
                <li key={v.id} className="rounded-lg bg-surface px-2 py-1.5">
                  <strong className="text-asphalt">Demo vehicle</strong> · {v.status} ·{" "}
                  {v.latitude.toFixed(4)}, {v.longitude.toFixed(4)} · static sample
                </li>
              ))}
              {DEMO_REPORTS.map((r) => (
                <li key={r.id} className="rounded-lg bg-surface px-2 py-1.5">
                  <strong className="text-asphalt">Sample {r.type}</strong> · {r.status} ·{" "}
                  {r.latitude.toFixed(4)}, {r.longitude.toFixed(4)} · {r.createdAgo}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
