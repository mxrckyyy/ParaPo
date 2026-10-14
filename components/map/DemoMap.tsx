// Client boundary: next/dynamic with ssr:false must live in a Client Component,
// otherwise the Leaflet bundle leaks into server prerendering.
"use client";

import dynamic from "next/dynamic";

// Single entry point for the demo map: client-only, SSR disabled.
export const DemoMap = dynamic(
  () => import("./MapView").then((m) => m.MapView),
  {
    ssr: false,
    loading: () => (
      <div
        role="status"
        aria-label="Loading map"
        className="flex h-full min-h-[320px] w-full animate-pulse items-center justify-center rounded-xl bg-surface text-sm text-asphalt-muted"
      >
        Loading map…
      </div>
    ),
  },
);
