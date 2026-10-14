"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { removeFavorite, toggleFavorite } from "@/app/actions/favorites";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

/** Star toggle for a route. Guests get a login link instead (server decides). */
export function FavoriteButton({
  routeId,
  initialFavorited,
  loggedIn,
}: {
  routeId: string;
  initialFavorited: boolean;
  loggedIn: boolean;
}) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>();

  if (!loggedIn) {
    return (
      <Link href="/login">
        <Button variant="secondary">
          <Star className="h-4 w-4" aria-hidden="true" /> Save to favorites
        </Button>
      </Link>
    );
  }

  return (
    <span className="inline-flex flex-col gap-1">
      <Button
        variant={favorited ? "primary" : "secondary"}
        disabled={pending}
        aria-pressed={favorited}
        onClick={async () => {
          setPending(true);
          setError(undefined);
          const outcome = await toggleFavorite(routeId);
          if (outcome.ok) {
            setFavorited(outcome.favorited);
            router.refresh();
          } else setError(outcome.error);
          setPending(false);
        }}
      >
        <Star
          className="h-4 w-4"
          aria-hidden="true"
          fill={favorited ? "currentColor" : "none"}
        />
        {pending ? "Saving…" : favorited ? "Saved ★" : "Save to favorites"}
      </Button>
      {error ? (
        <span role="alert" className="text-xs text-severity-critical">
          {error}
        </span>
      ) : null}
    </span>
  );
}

/** Remove button for one row on /favorites. */
export function RemoveFavoriteButton({ favoriteId }: { favoriteId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>();
  return (
    <span className="inline-flex items-center gap-2">
      <Button
        variant="ghost"
        disabled={pending}
        aria-label="Remove favorite"
        onClick={async () => {
          setPending(true);
          setError(undefined);
          const outcome = await removeFavorite(favoriteId);
          if (outcome.ok) router.refresh();
          else setError(outcome.error);
          setPending(false);
        }}
      >
        {pending ? "Removing…" : "Remove"}
      </Button>
      {error ? (
        <span role="alert" className="text-xs text-severity-critical">
          {error}
        </span>
      ) : null}
    </span>
  );
}

/** Empty-state card used when the favorites table isn't set up yet. */
export function FavoritesSetupNotice() {
  return (
    <Card>
      <p className="text-sm font-semibold text-asphalt">Favorites database not set up yet</p>
      <p className="mt-1 text-sm text-asphalt-muted">
        Your account works, but the <code>favorites</code> table from the Phase 2
        migration has not been applied to the Supabase project yet. Once it is,
        saved routes will appear here.
      </p>
    </Card>
  );
}
