"use client";

import Link from "next/link";
import { AlertTriangle, Bell, Map as MapIcon, Search, User } from "lucide-react";
import { usePathname } from "next/navigation";

const items = [
  { href: "/map", label: "Map", icon: MapIcon },
  { href: "/search", label: "Search", icon: Search },
  { href: "/report", label: "Report", icon: AlertTriangle },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary mobile"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-white/96 backdrop-blur supports-[padding:env(safe-area-inset-bottom)]:pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid grid-cols-5">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-16 flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] font-semibold leading-none transition-colors ${
                  active ? "text-primary" : "text-asphalt-muted hover:text-asphalt"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
