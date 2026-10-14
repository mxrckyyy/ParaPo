"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAlert, deleteAlert } from "@/app/actions/admin";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import type { AlertSeverity } from "@/types";

const severities: AlertSeverity[] = ["info", "warning", "critical"];

/** Admin alert publishing + removal. Every mutation re-checks admin server-side. */
export function AlertManager() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<AlertSeverity>("info");
  const [expiresAt, setExpiresAt] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    setDone(false);
    setPending(true);
    try {
      const outcome = await createAlert({ title, message, severity, expiresAt });
      if (!outcome) {
        setError("Something went wrong. Please try again.");
        return;
      }
      if (!outcome.ok) {
        setError(outcome.error);
        return;
      }
      setTitle("");
      setMessage("");
      setExpiresAt("");
      setDone(true);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <h2 className="text-base font-bold text-asphalt">Publish alert</h2>
      <form onSubmit={onSubmit} className="mt-3 flex flex-col gap-3">
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Roadworks on the demo avenue" required />
        <div className="flex flex-col gap-1">
          <label htmlFor="alert-message" className="text-sm font-semibold text-asphalt">Message</label>
          <textarea
            id="alert-message"
            rows={3}
            maxLength={1000}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What should commuters know?"
            required
            className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-asphalt placeholder:text-asphalt-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          />
        </div>
        <fieldset>
          <legend className="mb-1 text-sm font-semibold text-asphalt">Severity</legend>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Severity">
            {severities.map((s) => (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={severity === s}
                onClick={() => setSeverity(s)}
                className={`min-h-[44px] rounded-lg border px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                  severity === s ? "border-primary bg-primary/10 text-primary-dark" : "border-line bg-white text-asphalt"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </fieldset>
        <Input
          label="Expires at (optional — blank means until deleted)"
          type="datetime-local"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
        />
        {error ? (
          <p role="alert" className="rounded-lg bg-severity-critical/10 px-3 py-2 text-sm text-severity-critical">{error}</p>
        ) : null}
        {done ? (
          <p role="status" className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary-dark">
            Alert published — it appears on the alerts page immediately.
          </p>
        ) : null}
        <div>
          <Button type="submit" disabled={pending}>{pending ? "Publishing…" : "Publish alert"}</Button>
        </div>
      </form>
    </Card>
  );
}

/** Delete button for one published alert (rendered beside each alert row). */
export function DeleteAlertButton({ alertId }: { alertId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>();
  return (
    <span className="inline-flex items-center gap-2">
      <Button
        variant="ghost"
        disabled={pending}
        aria-label="Delete alert"
        onClick={async () => {
          setPending(true);
          setError(undefined);
          const outcome = await deleteAlert(alertId);
          if (outcome.ok) router.refresh();
          else setError(outcome.error);
          setPending(false);
        }}
      >
        {pending ? "Deleting…" : "Delete"}
      </Button>
      {error ? (
        <span role="alert" className="text-xs text-severity-critical">{error}</span>
      ) : null}
    </span>
  );
}
