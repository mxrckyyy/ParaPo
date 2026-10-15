import Link from "next/link";
import { Bus } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-3">
        <div className="flex flex-col gap-2">
          <p className="flex items-center gap-2 text-base font-bold text-asphalt">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-asphalt">
              <Bus className="h-4 w-4" aria-hidden="true" />
            </span>
            PARA PO
          </p>
          <p className="text-sm text-asphalt-muted">
            Community-powered public transport information for Filipino commuters.
            Phase 1 preview — map data shown is fictional demonstration data.
          </p>
        </div>
        <nav aria-label="Footer">
          <p className="mb-2 text-sm font-semibold text-asphalt">Explore</p>
          <ul className="flex flex-col gap-1 text-sm">
            <li><Link className="text-asphalt-muted hover:text-asphalt" href="/map">Live map</Link></li>
            <li><Link className="text-asphalt-muted hover:text-asphalt" href="/search">Route search</Link></li>
            <li><Link className="text-asphalt-muted hover:text-asphalt" href="/report">Submit a report</Link></li>
            <li><Link className="text-asphalt-muted hover:text-asphalt" href="/alerts">Alerts</Link></li>
          </ul>
        </nav>
        <nav aria-label="Account">
          <p className="mb-2 text-sm font-semibold text-asphalt">Account</p>
          <ul className="flex flex-col gap-1 text-sm">
            <li><Link className="text-asphalt-muted hover:text-asphalt" href="/favorites">Favorites</Link></li>
            <li><Link className="text-asphalt-muted hover:text-asphalt" href="/profile">Profile</Link></li>
            <li><Link className="text-asphalt-muted hover:text-asphalt" href="/login">Log in</Link></li>
            <li><Link className="text-asphalt-muted hover:text-asphalt" href="/signup">Sign up</Link></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-asphalt-muted">
          Map imagery © OpenStreetMap contributors. Demonstration build — no live
          vehicle tracking or official fares yet.
        </p>
      </div>
    </footer>
  );
}
