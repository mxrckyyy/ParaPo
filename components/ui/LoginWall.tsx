import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "./Button";
import { Card } from "./Card";

/** Shown on auth-gated pages (favorites, profile) while auth ships in Phase 2. */
export function LoginWall({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <Card className="mx-auto flex max-w-md flex-col items-center gap-3 py-10 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface">
        <Lock className="h-6 w-6 text-asphalt-muted" aria-hidden="true" />
      </span>
      <h1 className="text-base font-bold sm:text-lg text-asphalt">{title}</h1>
      <p className="text-sm text-asphalt-muted">{message}</p>
      <div className="flex gap-2">
        <Link href="/login">
          <Button>Log in</Button>
        </Link>
        <Link href="/signup">
          <Button variant="secondary">Sign up</Button>
        </Link>
      </div>
      <p className="text-xs text-asphalt-muted">Accounts launch in Phase 2 — nothing is created yet.</p>
    </Card>
  );
}
