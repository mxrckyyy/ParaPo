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

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 py-6">
      <h1 className="text-2xl font-bold">Profile</h1>
      <Card className="flex flex-col gap-2">
        <p className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold text-asphalt">{user.email}</span>
          {profile ? <Badge kind="approved">{profile.role}</Badge> : null}
        </p>
        <p className="text-xs text-asphalt-muted">
          {profile
            ? `Member since ${new Date(profile.created_at).toLocaleDateString()}. Role is assigned server-side and can only be changed by an administrator.`
            : "Signed in. Your app profile row will appear here once the Phase 2 database migration is applied."}
        </p>
        <p className="text-sm text-asphalt">
          <Link href="/favorites" className="font-semibold text-primary-dark hover:underline">
            {favorites.length} saved favorite{favorites.length === 1 ? "" : "s"} →
          </Link>
        </p>
        <div className="flex flex-wrap gap-2">
          <LogoutButton />
          <Link href="/map">
            <Button variant="ghost">Open map</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
