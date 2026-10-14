// Small pure formatting helpers (unit-testable, no I/O).

export function formatPeso(amount: number): string {
  return `₱${amount.toFixed(0)}`;
}

/** "8–14 min" style range label for illustrative ETAs. */
export function formatEtaRange(min: number, max: number): string {
  return `~${min}–${max} min`;
}
