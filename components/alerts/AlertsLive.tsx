"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertCard } from "@/components/alerts/AlertCards";
import { Badge } from "@/components/ui/Badge";
import { useRealtimeTable } from "@/hooks/useRealtimeTable";
import { toAlertItem } from "@/lib/markers";
import type { AlertSeverity, DemoAlert } from "@/types";
import type { DbAlert } from "@/types/database";

type Filter = "all" | AlertSeverity;

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "info", label: "Info" },
  { value: "warning", label: "Warnings" },
  { value: "critical", label: "Critical" },
];

/** Live alerts list: server initial rows + realtime inserts/deletes, severity filter. */
export function AlertsLive({
  initial,
  live,
}: {
  initial: DemoAlert[];
  live: boolean;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const { rows, status } = useRealtimeTable<DbAlert, DemoAlert>(
    "alerts",
    initial,
    live,
    toAlertItem,
  );

  const visible = useMemo(
    () => (filter === "all" ? rows : rows.filter((a) => a.severity === filter)),
    [rows, filter],
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter alerts by severity">
        {filters.map((f) => (
          <button
            key={f.value}
            type="button"
            aria-pressed={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={`min-h-[44px] rounded-full border px-3 py-1 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
              filter === f.value
                ? "border-primary bg-primary/10 text-primary-dark"
                : "border-line bg-white text-asphalt"
            }`}
          >
            {f.label}
          </button>
        ))}
        {live ? (
          <Badge kind={status === "live" ? "approved" : "pending"}>
            {status === "live" ? "Live" : "Updates paused"}
          </Badge>
        ) : (
          <Badge kind="demo">Demo</Badge>
        )}
      </div>
      {visible.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line bg-white px-4 py-8 text-center text-sm text-asphalt-muted">
          No active alerts right now.{" "}
          <Link href="/map" className="font-semibold text-primary-dark hover:underline">
            Check the map instead
          </Link>
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((a) => (
            <li key={a.id}>
              <AlertCard alert={a} demo={!a.live} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
