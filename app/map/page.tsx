import { LiveMap } from "@/components/map/LiveMap";
import { MapLegend } from "@/components/map/MapLegend";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { getLiveReports, getLiveVehicles } from "@/lib/db";
import { toReportMarker, toVehicleMarker } from "@/lib/markers";
import { DEMO_REPORTS, DEMO_VEHICLES, METRO_MANILA_CENTER } from "@/lib/mock";

export const metadata = { title: "Live map — PARA PO" };

export default async function MapPage() {
  const [{ rows: vehicles, available: vehiclesLive }, { rows: reports, available: reportsLive }] =
    await Promise.all([getLiveVehicles(), getLiveReports()]);
  const live = vehiclesLive && reportsLive;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">Live map</h1>
        <p className="text-sm text-asphalt-muted">
          {live
            ? "Community-shared sightings and reports around Metro Manila, updating in real time. Unverified until moderated."
            : "Fictional demonstration markers — the database is unreachable, so live sharing is paused."}
        </p>
      </div>
      {!live ? <DemoNotice /> : null}
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <LiveMap
          center={METRO_MANILA_CENTER}
          initialVehicles={live ? vehicles.map(toVehicleMarker) : DEMO_VEHICLES}
          initialReports={live ? reports.map(toReportMarker) : DEMO_REPORTS}
          live={live}
        />
        <div className="flex flex-col gap-4">
          <MapLegend />
        </div>
      </div>
    </div>
  );
}
