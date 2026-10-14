"use client";

import { useEffect, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export type LiveStatus = "live" | "paused";

/**
 * Subscribes to INSERT/UPDATE/DELETE on one table and maintains a
 * de-duplicated view list keyed by `id`. Raw DB payloads are mapped through
 * `mapRow`; server-provided initial markers arrive already mapped.
 * Falls back to the initial rows when Realtime is unreachable (e.g. table not
 * in the `supabase_realtime` publication) and reports `paused` instead of
 * crashing. One channel per table per view (docs/ARCHITECTURE.md §6).
 */
export function useRealtimeTable<TDb extends { id: string }, TView extends { id: string }>(
  table: "vehicles" | "reports" | "alerts",
  initial: TView[],
  live: boolean,
  mapRow: (row: TDb) => TView,
): { rows: TView[]; status: LiveStatus } {
  const [rows, setRows] = useState<TView[]>(initial);
  const [status, setStatus] = useState<LiveStatus>(live ? "live" : "paused");

  useEffect(() => {
    setRows(initial);
    if (!live) {
      setStatus("paused");
      return;
    }
    let channel: RealtimeChannel | null = null;
    try {
      const supabase = createClient();
      channel = supabase
        .channel(`public:${table}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table },
          (payload) => {
            if (payload.eventType === "INSERT") {
              const row = mapRow(payload.new as TDb);
              setRows((prev) => (prev.some((r) => r.id === row.id) ? prev : [row, ...prev]));
            } else if (payload.eventType === "UPDATE") {
              const row = mapRow(payload.new as TDb);
              setRows((prev) => prev.map((r) => (r.id === row.id ? row : r)));
            } else if (payload.eventType === "DELETE") {
              const old = payload.old as { id: string };
              setRows((prev) => prev.filter((r) => r.id !== old.id));
            }
          },
        )
        .subscribe((s) => {
          setStatus(s === "SUBSCRIBED" ? "live" : "paused");
        });
    } catch {
      setStatus("paused");
    }
    return () => {
      try {
        if (channel) void createClient().removeChannel(channel);
      } catch {
        /* offline — nothing to clean up */
      }
    };
    // Re-subscribe only when the table or availability flag changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, live]);

  return { rows, status };
}
