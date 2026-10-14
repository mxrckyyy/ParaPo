import { SearchPanel } from "@/components/search/SearchPanel";

export const metadata = { title: "Route search — PARA PO" };

export default function SearchPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Route search</h1>
        <p className="text-sm text-asphalt-muted">
          Filters fictional demo routes only. Destination matching against verified
          data ships in Phase 2.
        </p>
      </div>
      <SearchPanel />
    </div>
  );
}
