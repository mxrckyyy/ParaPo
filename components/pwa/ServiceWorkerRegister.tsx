"use client";

import { useEffect } from "react";

/**
 * Registers /sw.js in production only. Skipped in development so the worker
 * never masks fresh edits, and skipped entirely where unsupported.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* offline-first is best-effort; the app works without it */
    });
  }, []);
  return null;
}
