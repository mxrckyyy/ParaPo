"use client";

import { useState } from "react";
import { AlertTriangle, Ban, Car, Users } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { reportInputSchema } from "@/lib/validations";
import type { ReportType } from "@/types";

const options: { value: ReportType; label: string; icon: typeof Car }[] = [
  { value: "traffic", label: "Heavy traffic", icon: Car },
  { value: "full", label: "Vehicle full", icon: Users },
  { value: "accident", label: "Accident", icon: AlertTriangle },
  { value: "closure", label: "Road closure", icon: Ban },
];

/** Static demo of the future report form. Nothing is saved — reporting ships in Phase 3. */
export function ReportForm() {
  const [type, setType] = useState<ReportType>("traffic");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [done, setDone] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = reportInputSchema.safeParse({ type, description });
    if (!parsed.success) {
      setError(parsed.error.flatten().fieldErrors.description?.[0] ?? "Please check this form.");
      return;
    }
    setError(undefined);
    setDone(true);
  }

  if (done) {
    return (
      <Card className="flex flex-col gap-2" aria-live="polite">
        <p className="text-base font-bold text-asphalt">Demo submitted — nothing was saved.</p>
        <p className="text-sm text-asphalt-muted">
          You picked <strong>{type}</strong>
          {description.trim() ? (
            <>
              {" "}with note “{description.trim()}”.
            </>
          ) : (
            " with no note."
          )}{" "}
          Community reporting (with geolocation and moderation) launches in Phase 3.
        </p>
        <div>
          <Button variant="secondary" onClick={() => setDone(false)}>
            Fill in another demo
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-asphalt">Report type</legend>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Report type">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={type === o.value}
              onClick={() => setType(o.value)}
              className={`flex min-h-[44px] items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                type === o.value ? "border-primary bg-primary/10 text-primary-dark" : "border-line bg-white text-asphalt"
              }`}
            >
              <o.icon className="h-4 w-4" aria-hidden="true" /> {o.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-1">
        <label htmlFor="report-description" className="text-sm font-semibold text-asphalt">
          Description <span className="font-normal text-asphalt-muted">(optional, max 500 characters)</span>
        </label>
        <textarea
          id="report-description"
          rows={3}
          maxLength={500}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Sample queue forming at the demo stop."
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "report-description-error" : "report-description-count"}
          className={`rounded-lg border bg-white px-3 py-2 text-sm text-asphalt placeholder:text-asphalt-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${error ? "border-severity-critical" : "border-line"}`}
        />
        {error ? (
          <p id="report-description-error" role="alert" className="text-xs text-severity-critical">
            {error}
          </p>
        ) : (
          <p id="report-description-count" className="text-xs text-asphalt-muted">
            {description.length}/500
          </p>
        )}
      </div>

      <div className="rounded-lg border border-dashed border-line bg-surface px-3 py-2 text-xs text-asphalt-muted">
        Map pin picker and geolocation arrive in Phase 3. This demo does not record a location.
      </div>

      <div>
        <Button type="submit">Preview demo report</Button>
      </div>
      <DemoNotice compact />
      <p className="text-xs text-asphalt-muted">
        Status on save: <Badge kind="pending">pending</Badge> — every future community
        report starts unverified until moderated.
      </p>
    </form>
  );
}
