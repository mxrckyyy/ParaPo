import Link from "next/link";
import { FavoritesSetupNotice, RemoveFavoriteButton } from "@/components/favorites/FavoriteButtons";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoginWall } from "@/components/ui/LoginWall";
import { getCurrentUser } from "@/lib/auth";
import { getMyFavorites } from "@/lib/db";

export const metadata = { title: "Favorites — PARA PO" };

export default async function FavoritesPage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="py-6">
        <LoginWall
          title="Your favorite routes live here"
          message="Log in to save frequent routes and stops for quick access."
        />
      </div>
    );
  }

  const { favorites, setupPending } = await getMyFavorites(user.id);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 py-6">
      <h1 className="text-xl font-bold sm:text-2xl">Favorites</h1>
      {setupPending ? (
        <FavoritesSetupNotice />
      ) : favorites.length === 0 ? (
        <EmptyState
          title="No favorites yet"
          message="Save a verified route from its details page and it will appear here. Only you can see your favorites."
          actionLabel="Search routes"
          actionHref="/search"
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {favorites.map((f) => (
            <li key={f.id}>
              <Card className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 flex-col">
                  {f.route_id ? (
                    <Link
                      href={`/routes/${f.route_id}`}
                      className="truncate text-sm font-semibold text-primary-dark hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                      {f.routeName ?? "Saved route"}
                    </Link>
                  ) : (
                    <p className="text-sm font-semibold text-asphalt">{f.routeName ?? "Saved stop"}</p>
                  )}
                  <p className="text-xs text-asphalt-muted">
                    Saved {new Date(f.created_at).toLocaleDateString()}
                  </p>
                </div>
                <RemoveFavoriteButton favoriteId={f.id} />
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
