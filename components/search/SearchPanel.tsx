"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { searchDemoRoutes } from "@/lib/mock";
import { searchInputSchema } from "@/lib/validations";
import { RouteCard } from "./RouteCard";

/** Demo route search over fictional data. Live search ships in Phase 2/3. */
export function SearchPanel() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [errors, setErrors] = useState<{ origin?: string; destination?: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [query, setQuery] = useState("");

  const results = submitted && !errors.origin && !errors.destination ? searchDemoRoutes(query) : [];

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = searchInputSchema.safeParse({ origin, destination });
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors({ origin: fieldErrors.origin?.[0], destination: fieldErrors.destination?.[0] });
      setSubmitted(false);
      return;
    }
    setErrors({});
    // Demo matching: match either field against fictional route/stop text.
    setQuery(`${parsed.data.origin} ${parsed.data.destination}`);
    setSubmitted(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={onSubmit} className="flex flex-col gap-3" noValidate={false}>
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            label="Origin"
            placeholder="e.g. Demo Plaza Sampaguita"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            error={errors.origin}
            autoComplete="off"
          />
          <Input
            label="Destination"
            placeholder="e.g. Scout Circle"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            error={errors.destination}
            autoComplete="off"
          />
        </div>
        <div>
          <Button type="submit">
            <Search className="h-4 w-4" aria-hidden="true" /> Search demo routes
          </Button>
        </div>
      </form>

      <DemoNotice />

      {submitted ? (
        results.length > 0 ? (
          <ul className="flex flex-col gap-3" aria-live="polite">
            {results.map((r) => (
              <li key={r.id}>
                <RouteCard route={r} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="No demo routes match"
            message={`Nothing fictional matched “${query}”. Try “demo”, “sampaguita”, or “scout”. Live search arrives in a later phase.`}
          />
        )
      ) : (
        <p className="text-sm text-asphalt-muted">
          Enter an origin and destination to filter the fictional demo routes.
        </p>
      )}
    </div>
  );
}
