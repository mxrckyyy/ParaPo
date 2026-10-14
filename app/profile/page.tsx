import { LoginWall } from "@/components/ui/LoginWall";

export const metadata = { title: "Profile — PARA PO" };

export default function ProfilePage() {
  return (
    <div className="py-6">
      <LoginWall
        title="Your commuter profile"
        message="Manage your info, favorites, and shared trips here once accounts launch in Phase 2."
      />
    </div>
  );
}
