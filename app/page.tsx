import Link from "next/link";
import { Bell, Map as MapIcon, Search } from "lucide-react";
import { AlertCard, ReportCard } from "@/components/alerts/AlertCards";
import { AlertBanner } from "@/components/alerts/AlertBanner";
import { DemoMap } from "@/components/map/DemoMap";
import { MapLegend } from "@/components/map/MapLegend";
import { SearchPanel } from "@/components/search/SearchPanel";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { DEMO_ALERTS, DEMO_REPORTS, DEMO_VEHICLES, METRO_MANILA_CENTER } from "@/lib/mock";
import { getLiveAlerts, getRouteSummaries } from "@/lib/db";
import { toAlertItem } from "@/lib/markers";

export default async function HomePage() {
  const { routes: liveRoutes, source } = await getRouteSummaries();
  const liveAvailable = source === "supabase";
  const { rows: liveAlerts, available: alertsLive } = await getLiveAlerts(10);
  return (
    <div className="flex flex-col gap-8">
      <DemoNotice />
      {alertsLive ? <AlertBanner alerts={liveAlerts.map(toAlertItem)} /> : null}

      {/* Hero */}
      <section className="flex flex-col gap-4 rounded-2xl bg-asphalt px-6 py-10 text-white md:px-10" aria-labelledby="hero-heading">
        <h1 id="hero-heading" className="max-w-xl text-xl font-bold sm:text-2xl leading-8 md:text-3xl">
          Para po! Know your ride before you wait.
        </h1>
        <p className="max-w-xl text-sm leading-6 text-white/80 md:text-base">
          PARA PO will be a community-powered transport companion for Filipino
          commuters — live PUV locations, route suggestions, and crowdsourced
          alerts. This Phase 1 preview demonstrates the interface with fictional
          data; nothing here is live yet.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href="/map">
            <Button>
              <MapIcon className="h-4 w-4" aria-hidden="true" /> Explore the demo map
            </Button>
          </Link>
          <Link
            href="/search"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-white/30 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <Search className="h-4 w-4" aria-hidden="true" /> Try route search
          </Link>
        </div>
      </section>

      {/* Map preview */}
      <section className="flex flex-col gap-3" aria-labelledby="map-preview-heading">
        <h2 id="map-preview-heading" className="text-base font-bold sm:text-lg">
          Demo map
        </h2>
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="h-72 min-h-[320px] overflow-hidden rounded-xl border border-line bg-white sm:h-[380px]">
            <DemoMap center={METRO_MANILA_CENTER} vehicles={DEMO_VEHICLES} reports={DEMO_REPORTS} />
          </div>
          <div className="flex flex-col gap-4">
            <MapLegend />
            <Card>
              <p className="text-sm font-semibold">Markers have a list alternative</p>
              <ul className="mt-2 flex flex-col gap-1 text-xs text-asphalt-muted">
                {DEMO_VEHICLES.map((v) => (
                  <li key={v.id}>
                    Demo vehicle · {v.status} · {v.latitude.toFixed(4)}, {v.longitude.toFixed(4)}
                  </li>
                ))}
                {DEMO_REPORTS.map((r) => (
                  <li key={r.id}>
                    Sample {r.type} report · {r.status} · {r.createdAgo}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="flex flex-col gap-3" aria-labelledby="search-heading">
        <h2 id="search-heading" className="text-base font-bold sm:text-lg">
          Find a demo route
        </h2>
        <SearchPanel liveRoutes={liveAvailable ? liveRoutes : []} liveAvailable={liveAvailable} />
      </section>

      {/* Reports + alerts preview */}
      <section className="grid gap-4 md:grid-cols-2" aria-labelledby="community-heading">
        <div className="flex flex-col gap-3">
          <h2 id="community-heading" className="flex items-center gap-2 text-base font-bold sm:text-lg">
            <Bell className="h-5 w-5" aria-hidden="true" /> Sample alerts
          </h2>
          {DEMO_ALERTS.map((a) => (
            <AlertCard key={a.id} alert={a} />
          ))}
          <Link href="/alerts" className="text-sm font-semibold text-primary-dark hover:underline">
            View all sample alerts
          </Link>
        </div>
        <div className="flex flex-col gap-3">
          <h2 className="text-base font-bold sm:text-lg">Sample community reports</h2>
          {DEMO_REPORTS.map((r) => (
            <ReportCard key={r.id} report={r} />
          ))}
          <Link href="/report" className="text-sm font-semibold text-primary-dark hover:underline">
            Preview the report form
          </Link>
        </div>
      </section>
    </div>
  );
}
