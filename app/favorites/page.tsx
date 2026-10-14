import { LoginWall } from "@/components/ui/LoginWall";

export const metadata = { title: "Favorites — PARA PO" };

export default function FavoritesPage() {
  return (
    <div className="py-6">
      <LoginWall
        title="Your favorite routes live here"
        message="Log in to save frequent routes and stops for quick access. Favorites sync with your account in Phase 2."
      />
    </div>
  );
}
