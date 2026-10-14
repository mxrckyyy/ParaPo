import Link from "next/link";

export function EmptyState({
  title,
  message,
  actionLabel,
  actionHref,
}: {
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-line bg-white px-6 py-10 text-center">
      <p className="text-base font-semibold text-asphalt">{title}</p>
      <p className="max-w-sm text-sm text-asphalt-muted">{message}</p>
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-asphalt transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
