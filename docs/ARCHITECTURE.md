# PARA PO — Architecture

## 1. Planned Folder / File Structure (Next.js App Router, to be scaffolded in Phase 1)
```
/
├── app/
│   ├── (public)/
│   │   ├── page.tsx            # Home / full-screen map
│   │   ├── search/page.tsx     # Destination search + suggestions
│   │   ├── routes/[id]/page.tsx# Route details (steps, fare, ETA)
│   │   ├── alerts/page.tsx     # Active alerts list
│   │   └── report/page.tsx     # Report submission (auth-gated action, guest-readable map)
│   ├── (protected)/
│   │   ├── favorites/page.tsx  # Requires session
│   │   └── profile/page.tsx    # Requires session
│   ├── admin/
│   │   ├── page.tsx            # Moderation dashboard (admin role only)
│   │   └── alerts/page.tsx     # Alert CRUD (admin only)
│   ├── api/                    # Route Handlers — only where secrets/server checks needed
│   │   └── admin/route.ts      # Example: admin-only mutations via service-role
│   ├── actions/                # Server Actions (auth, favorites, reports, admin)
│   ├── layout.tsx / globals.css
│   └── manifest.ts / icon.*    # PWA (Phase 4)
├── components/
│   ├── map/          # MapView (client-only, dynamic import), VehicleMarkers, ReportPins
│   ├── search/       # SearchBar, RouteList, RouteCard
│   ├── reports/      # ReportForm, ReportFilters
│   ├── alerts/       # AlertBanner, AlertList
│   ├── favorites/    # FavoriteButton, FavoriteList
│   ├── auth/         # LoginForm, SignupForm, SessionProvider
│   └── ui/           # Button, Input, Card, Badge, Spinner, EmptyState (shadcn-style)
├── lib/
│   ├── supabase/
│   │   ├── client.ts  # Browser client (@supabase/ssr createBrowserClient) — realtime + reads
│   │   ├── server.ts  # Server client (createServerClient, cookies) — SSR/RSC + Server Actions
│   │   └── admin.ts   # Service-role client — server-only, admin Route Handlers/scripts
│   ├── eta.ts         # ETA calculation (haversine + speed heuristic)
│   ├── routes.ts      # Route-matching helpers
│   └── validations.ts # Zod schemas shared client/server
├── hooks/            # useRealtimeVehicles, useRealtimeReports, useGeolocation
├── types/            # DB row types (generated via supabase gen types)
├── supabase/
│   ├── migrations/   # SQL migrations (committed, numbered)
│   └── seed.sql      # Clearly-labeled SAMPLE data, never prod-verified
├── public/           # Static assets, PWA icons
├── e2e/              # Playwright specs
└── docs/              # The 9 permanent docs (PROJECT_CONTEXT, ARCHITECTURE, ...)
```

Actual state 2026-10-15 (Phase 1): scaffold exists. Real tree (flat, no `src/`):
```
/
├── app/
│   ├── page.tsx                  # Landing (hero, demo map preview, search, samples)
│   ├── layout.tsx / globals.css / icon.svg
│   ├── map/page.tsx              # Live map + demo fallback (Phase 3)
│   ├── search/page.tsx           # SearchPanel (mock filter, validation, empty state)
│   ├── routes/[id]/page.tsx      # Route details (SSG ×3 demo routes, illustrative ETA; live ETA + ride sharing — Phase 3)
│   ├── report/page.tsx           # Login-gated community report form (Phase 3)
│   ├── alerts/page.tsx           # Sample alert cards
│   ├── favorites/page.tsx + profile/page.tsx  # LoginWall (auth — Phase 2)
│   ├── login/page.tsx + signup/page.tsx       # AuthForm layouts (no auth — Phase 2)
│   └── admin/page.tsx            # Gated moderation dashboard (Phase 4)
├── components/
│   ├── ui/ (Button, Input, Card, Badge, EmptyState, LoginWall, DemoNotice)
│   ├── layout/ (Navbar client w/ session-aware links + skip link, Footer)
│   ├── map/ (MapView client, DemoMap dynamic ssr:false + "use client", MapLegend)
│   ├── search/ (SearchPanel client + live section, RouteCard + LiveRouteCard)
│   ├── reports/ (ReportForm client) · alerts/ (AlertCard, ReportCard)
│   ├── auth/ (AuthForm wired to Server Actions, LogoutButton)
│   ├── favorites/ (FavoriteButton, RemoveFavoriteButton, FavoritesSetupNotice)
├── app/actions/ (auth.ts signup/login/logout, favorites.ts toggle/remove — Phase 2)
├── middleware.ts (Supabase session refresh — Phase 2)
├── lib/ (mock.ts fictional data, validations.ts Zod, format.ts, auth.ts session helpers, db.ts live-with-demo-fallback, eta.ts estimates + tests, markers.ts presentation mappers)
├── hooks/useRealtimeTable.ts (one channel/table, id-dedupe, paused fallback — Phase 3)
├── app/actions/ (+ reports.ts 30 s-limited submit, vehicles.ts throttled share, admin.ts gated moderation/alerts — Phase 3/4)
├── lib/admin.ts requireAdmin gate (Phase 4)
├── components/map/ (+ LiveMap.tsx filters/stale-dim/list — Phase 3) · components/vehicles/ShareRideButton.tsx (Phase 3)
├── components/admin/ (ModerationQueue, AlertManager — Phase 4) · components/alerts/ (+ AlertsLive, AlertBanner — Phase 4) · components/pwa/ServiceWorkerRegister.tsx (Phase 4)
├── app/ (+ manifest.ts, apple-icon.svg, offline/ — Phase 4) · public/ (sw.js, icons/ generated placeholders — Phase 4) · scripts/gen-icons.mjs (Phase 4)
├── lib/supabase/ (client.ts, server.ts — publishable key; admin.ts service-role, unimported)
├── types/ (index.ts demo shapes, database.ts hand-maintained rows — Phase 2)
├── supabase/ (migrations/20261015000000_* APPLIED by user, ...00001_privilege_repair pending user run, seed.sql, verify-phase2.sql)
├── tailwind.config.ts (palette #16A34A/#0F172A/#F59E0B) · .env.example (PUBLISHABLE_KEY names)
└── docs/ (the 9 permanent docs)
```
Deferred to later phases (still per plan): `app/api/`, `e2e/`, PWA manifest, alerts live wiring (Phase 4 with admin CRUD). `vitest.config.ts` + `npm run test` added in Phase 3.

## 2. Responsibilities
- `app/` — routing + layouts; Server Components fetch initial data (SEO, fast paint); client components isolated to map/realtime/forms.
- `components/map` — Leaflet only; must be `ssr: false` (`next/dynamic`) — Leaflet touches `window`.
- `components/ui` — single source for buttons/inputs/cards; no page-specific styling duplication.
- `lib/supabase/*` — sole Supabase access layer; components never inline `createClient`.
- `lib/eta.ts`, `lib/routes.ts` — pure functions, unit-testable, no I/O.
- `supabase/migrations` — only path for schema change; never ad-hoc dashboard edits without a committed migration.

## 3. System Architecture
- **Frontend:** Next.js PWA on Vercel. Mix of RSC (search results, route details, alerts list) + client islands (map, realtime subscriptions, geolocation).
- **BaaS:** Supabase Auth (email/password, JWT in cookies), PostgreSQL (7 MVP tables), Realtime (`postgres_changes` on `vehicles`, `reports`, `alerts`), Storage optional.
- **Auth:** `@supabase/ssr` cookie sessions; middleware refreshes tokens; Server Actions/Route Handlers + RLS enforce permissions.
- **DB:** all access via RLS policies; anon key is public by design. Service-role bypasses RLS — server-only.
- **Hosting:** Vercel auto-deploys on `git push`; env vars injected from Vercel dashboard. Supabase project independent (manual URL/key copy).
- **Maps:** tiles direct from OSM (`https://{s}.tile.openstreetmap.org/...`); no app server in tile path.

## 4. Component Relationships / Data Flow
1. App load: Server Component reads session (server client) → pre-fetches active vehicles/routes/reports/alerts → renders shell.
2. Hydration: `MapView` (client) subscribes via browser client channels `public:vehicles`, `public:reports`, `public:alerts`.
3. Report submit: `ReportForm` → Zod validate → Server Action (auth check) → `INSERT reports(status='pending')` → Realtime broadcast → all maps add pin.
4. Vehicle share: rider taps "I'm on this vehicle" → `navigator.geolocation.watchPosition` (10–15s throttle) → throttled update to `vehicles` → broadcast → markers move. "I'm off" → `status='inactive'`; stale rows (>5 min `last_updated`) hidden client-side and purged by scheduled function (future).
5. Search: query `routes`/`stops` (ILIKE match MVP) → rank → Route Details computes ETA via `lib/eta.ts`.
6. Favorites: auth-required Server Action → `favorites` insert/delete; RLS restricts to `auth.uid() = user_id`.
7. Admin: middleware + server check `users.role='admin'` → dashboard lists `reports WHERE status='pending'` → approve/reject; alerts CRUD.

## 5. Supabase Client Responsibilities
| Client | File | Key | Where used | May do |
|---|---|---|---|---|
| Browser | `lib/supabase/client.ts` | publishable | Client components, hooks | Subscribe, filtered reads, auth UI calls |
| Server | `lib/supabase/server.ts` | publishable + cookies | RSC, Server Actions, middleware | Session reads, RLS-scoped writes, pre-render fetches |
| Admin | `lib/supabase/admin.ts` | service-role | Route Handlers / scripts only | RLS bypass, user role grants, backfills; NEVER imported by client code |

Rule: if a check matters for security, enforce in RLS + server code, never only in the UI.

## 6. API Routes / Server Actions / DB Patterns
- Prefer **Server Actions** for forms/mutations (report, favorite, auth).
- **Route Handlers (`app/api/*`)** only for: admin mutations needing service-role, webhooks, or non-form clients.
- Reads: direct Supabase queries from Server Components where RLS suffices; no bespoke REST layer.
- Mutations: validate with Zod → auth check → RLS-scoped query → `revalidatePath` where SSR lists change.
- Realtime: `supabase.channel('public:<table>').on('postgres_changes', {event:'*', schema:'public', table}, handler).subscribe()`; always `unsubscribe` on unmount; one channel per table per view.

## 7. External Integrations / Boundaries
- OSM tiles (free, attribution required). No SLA; tile failure → show cached/error tile state, never crash map.
- Geolocation API (browser permission-gated; denial → manual pin drop fallback).
- Vercel ↔ GitHub (deploy); Supabase (managed Postgres). No coupling between Vercel and Supabase accounts.
- Future: operator GPS ingest endpoint, push provider (e.g., web-push), fare-matrix source.

## 8. Rules for Adding Features Safely
1. New table/column → new migration in `supabase/migrations/` + update `docs/DATABASE_SCHEMA.md` + RLS policies in same migration.
2. Newmutation → Zod schema in `lib/validations.ts` + server-side auth/role check + RLS test.
3. New client component needing `window`/map → `dynamic(..., {ssr:false})` + loading skeleton.
4. No secrets in `NEXT_PUBLIC_*`; no service-role import outside `lib/supabase/admin.ts` or `app/api/`.
5. Run `lint + typecheck + tests + build` before merge; record real results in `docs/TESTING.md`.
6. Update the `docs/` files + `docs/CHANGELOG.md` per Documentation Maintenance Rules.
