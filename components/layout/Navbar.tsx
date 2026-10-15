"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bus, Menu, X } from "lucide-react";

const links = [
  { href: "/", label: "Map" },
  { href: "/search", label: "Search" },
  { href: "/report", label: "Report" },
  { href: "/alerts", label: "Alerts" },
  { href: "/profile", label: "Profile" },
];

export function Navbar({ userEmail }: { userEmail: string | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-semibold"
      >
        Skip to content
      </a>
      <nav aria-label="Primary" className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2" aria-label="PARA PO home">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
            <Bus className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-base font-bold sm:text-lg tracking-tight text-asphalt">
            PARA&nbsp;PO
          </span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={pathname === l.href ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                  pathname === l.href ? "bg-primary/10 text-primary-dark" : "text-asphalt hover:bg-surface"
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href={userEmail ? "/profile" : "/login"}
              className="ml-2 inline-flex min-h-[44px] items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              {userEmail ? "Profile" : "Log in"}
            </Link>
          </li>
        </ul>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-asphalt hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 md:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
        </button>
      </nav>

      {open ? (
        <ul className="border-t border-line bg-white px-4 py-2 md:hidden">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={() => setOpen(false)}
                aria-current={pathname === l.href ? "page" : undefined}
                className={`block rounded-lg px-3 py-3 text-sm font-semibold ${
                  pathname === l.href ? "bg-primary/10 text-primary-dark" : "text-asphalt hover:bg-surface"
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
          <li className="py-2">
            <Link
              href={userEmail ? "/profile" : "/login"}
              onClick={() => setOpen(false)}
              className="block rounded-lg bg-primary px-3 py-3 text-center text-sm font-semibold text-white hover:bg-primary-dark"
            >
              {userEmail ? "Profile" : "Log in"}
            </Link>
          </li>
        </ul>
      ) : null}
    </header>
  );
}
