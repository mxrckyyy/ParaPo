import Link from "next/link";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LoginWall } from "@/components/ui/LoginWall";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth";
import { getMyFavorites } from "@/lib/db";

export const metadata = { title: "Profile — PARA PO" };

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="py-6">
        <LoginWall
          title="Your commuter profile"
          message="Manage your info, favorites, and shared trips here. Log in or create an account to continue."
        />
      </div>
    );
  }

  const profile = await getCurrentProfile();
  const { favorites } = await getMyFavorites(user.id);
  const initials = (user.email ?? "PP").slice(0, 2).toUpperCase();

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 py-6">
      <h1 className="text-xl font-bold sm:text-2xl">Profile</h1>
      <Card className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary-dark">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-asphalt">{user.email}</p>
            {profile ? <Badge kind="approved">{profile.role}</Badge> : null}
            <p className="mt-1 text-xs text-asphalt-muted">
              {profile
                ? `Member since ${new Date(profile.created_at).toLocaleDateString()}. Role is assigned server-side and can only be changed by an administrator.`
                : "Signed in. Your app profile row will appear here once the Phase 2 database migration is applied."}
            </p>
          </div>
        </div>

        <section className="flex flex-col gap-2" aria-labelledby="saved-routes-heading">
          <h2 id="saved-routes-heading" className="text-sm font-bold text-asphalt">Saved routes</h2>
          <Link
            href="/favorites"
            className="inline-flex min-h-[44px] items-center justify-between rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold text-primary-dark hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <span>{favorites.length} saved favorite{favorites.length === 1 ? "" : "s"}</span>
            <span aria-hidden="true">→</span>
          </Link>
        </section>

        <section className="flex flex-col gap-2" aria-labelledby="account-actions-heading">
          <h2 id="account-actions-heading" className="text-sm font-bold text-asphalt">Account actions</h2>
          <div className="flex flex-wrap gap-2">
            <LogoutButton />
            <Link href="/map">
              <Button variant="ghost">Open map</Button>
            </Link>
          </div>
        </section>
      </Card>
    </div>
  );
}
