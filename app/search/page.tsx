import { SearchPanel } from "@/components/search/SearchPanel";
import { getRouteSummaries } from "@/lib/db";

export const metadata = { title: "Route search — PARA PO" };

export default async function SearchPage() {
  const { routes, source } = await getRouteSummaries();
  const liveAvailable = source === "supabase";
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Route search</h1>
        <p className="text-sm text-asphalt-muted">
          {liveAvailable
            ? "Searching verified routes from Supabase, plus fictional demo matches below."
            : "Filters fictional demo routes only. Verified database records appear here once the Phase 2 migration is applied and routes are added."}
        </p>
      </div>
      <SearchPanel liveRoutes={liveAvailable ? routes : []} liveAvailable={liveAvailable} />
    </div>
  );
}
