# PARA PO — Project Context (Source of Truth)

> Former working title: BiyaheMate. Renamed to **PARA PO** as of 2026-10-14 per owner request.
> Reference spec: `BiyaheMate.pdf` (v1.0, Comeros, John Marc, 10/14/26) — authoritative product requirements.

## 1. Purpose
PARA PO is a web-based, mobile-first Progressive Web App (PWA) providing real-time Philippine public transport information. It uses crowdsourced sightings (later operator GPS) + Backend-as-a-Service to deliver live PUV locations, dynamic ETAs, multimodal route suggestions, crowdsourced disruption reports, and community alerts.

Problem addressed: Metro Manila commuters lose ~127 hrs/yr to congestion; waits of 30–60 min with no arrival info ("hula-hula lang"); ~₱108/day transport cost (~16% of NCR minimum wage); Google Maps/Waze are car-centric; local apps have stale data.

## 2. Target Users
- Students, office workers, daily commuters (primary)
- Tourists / occasional riders
- Admins/moderators (report + alert curation)
- Operators/cooperatives (future: routes, schedules, GPS, announcements)

## 3. Core Requirements (MVP = Phases 1–3)
1. Email/password auth (Supabase Auth), guest map viewing
2. Interactive map (Leaflet + OpenStreetMap) with vehicle + report markers
3. Destination search + route suggestions (routes/stops tables)
4. Route details: steps, fare, basic ETA
5. Crowdsourced reports (traffic/full/accident/closure) with geolocation
6. Supabase Realtime for vehicles + reports + alerts
7. Favorites (saved routes/stops, login required)
8. Admin moderation (approve/reject reports) + alerts CRUD
9. Mobile-responsive PWA, <3s load on 4G, WCAG 2.1 AA basics

Out of MVP (Phase 4+): operator dashboard, direct GPS devices, push notifications, fare-matrix calculator, full offline mode.

## 4. Technology Stack
| Layer | Choice | Version / Note (initial) |
|---|---|---|
| Frontend framework | Next.js (React, App Router) | To be scaffolded — target Next.js 14+ / React 18+ |
| Language | TypeScript | `strict: true` |
| Styling | Tailwind CSS | v3+ |
| Map | Leaflet + `react-leaflet`, OpenStreetMap tiles | No Mapbox by default |
| Backend (BaaS) | Supabase: Auth, PostgreSQL, Realtime, Storage (optional) | Free tier; separate account OK |
| Client lib | `@supabase/supabase-js` + `@supabase/ssr` (browser/server clients) | To be pinned in package.json |
| Hosting | Vercel (auto-deploy from GitHub) | — |
| VCS | Git + GitHub | Not yet initialized (2026-10-14) |
| Design | Figma (optional) | — |
| PWA | `next-pwa` or native App Router + manifest + service worker | Phase 4 |

No custom backend server. Frontend talks directly to Supabase via RLS-secured anon key; service-role key never ships to client.

## 5. Implementation Status (2026-10-14, Phase 0)
- Phase 0 (this task): documentation only. **No application code exists.**
- Repo state: single file `BiyaheMate.pdf`; no `package.json`, no git repo, no Next.js scaffold, no Supabase project linked.
- All 9 required docs: created in `docs/` (see `docs/CHANGELOG.md`).

## 6. Current Phase / Next Task / Outstanding Issues
- Current phase: **Phase 0 — complete after this report.**
- Next task: **Phase 1 Foundation** — scaffold Next.js+TS+Tailwind+Leaflet, static UI screens with mock data, init GitHub repo. See `docs/IMPLEMENTATION_PLAN.md` Phase 1.
- Outstanding issues / blockers:
  1. No `package.json` — Next.js scaffold not run.
  2. No git repo — `git init` + GitHub remote pending.
  3. No Supabase project — URL/anon key unavailable; env vars unset.
  4. No lint/test/build toolchain — nothing to execute yet (recorded in `docs/TESTING.md`).

## 7. Key Decisions + Reasons
1. **BaaS over custom server** — solo frontend dev, 8–12 week MVP; Supabase covers auth/DB/realtime without backend code.
2. **Next.js App Router + Server Actions/Route Handlers + client components** — SSR for SEO/first paint, client components only where map/realtime needs browser APIs.
3. **Leaflet + OSM over Mapbox/Google** — free, no API key, light tiles for poor connectivity.
4. **Crowdsourced sightings first, GPS later** — hardware integration too costly for MVP; validate with community data + votes/moderation.
5. **RLS on every table + server-side role checks** — anon key is public; DB is the enforcement point.
6. **Project renamed BiyaheMate → PARA PO** — owner request 2026-10-14; "Para po" is the jeepney stop phrase, more memorable/local. Old PDF name retained as reference only.

## 8. Environment Variables (names only, no secrets)
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_MAP_TILE_URL   # optional, default https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
NEXT_PUBLIC_MAPBOX_TOKEN   # optional, only if Mapbox layer added
```
Server-only (never `NEXT_PUBLIC_`): `SUPABASE_SERVICE_ROLE_KEY` — only in Supabase dashboard / Vercel server env / local `.env.local` (gitignored), for admin scripts only.

## 9. Commands (toolchain pending Phase 1)
Intended (not yet runnable — no package.json):
```
npm run dev      # Next.js dev server
npm run lint     # ESLint
npm run typecheck # tsc --noEmit
npm run test     # Vitest + Playwright (to be configured)
npm run build    # next build
```
Actual Phase 0 checks run: `node -v` → v24.19.0; `npm -v` → 11.17.0; `git --version` → 2.55.0; `package.json` → NOT FOUND; `git status` → not a git repo. Lint/type/test/build: NOT EXECUTABLE (no scaffold). Recorded as failures/blockers, not passes.

## 10. Known Bugs / Failed Tests / Blockers
- No code → no test results. `docs/TESTING.md` marks all suites "not executed."
- Blockers are setup items in §6, not application bugs.

## 11. Context Recovery Procedure (mandatory every OpenCode session / reset)

`docs/PROJECT_CONTEXT.md` is the main persistent context file. Whenever OpenCode starts a new session or resets its context, it must:

1. Read `docs/PROJECT_CONTEXT.md` first.
2. Read `docs/IMPLEMENTATION_PLAN.md` to identify the current phase.
3. Read `docs/ARCHITECTURE.md` and `docs/SYSTEM_DESIGN.md` before making structural changes.
4. Read `docs/UI_UX_GUIDELINES.md` before creating or redesigning interfaces.
5. Read `docs/DATABASE_SCHEMA.md` and `docs/SECURITY.md` before modifying database logic, authentication, or authorization.
6. Read `docs/TESTING.md` and `docs/CHANGELOG.md` to understand existing verification results and recent changes.
7. Inspect the actual source files, package configuration, Git status, and test results before continuing.
8. Identify the last verified completed phase and the next approved task. Docs vs code conflict → code + actual test output wins; then fix docs.
9. Never assume that documented work is implemented without checking the actual project. Continue from existing implementation instead of recreating completed work.
10. Update the relevant documentation in `docs/` after each phase. Do not code until steps 1–9 are done.
