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
| Frontend framework | Next.js (React, App Router) | Next.js 14.2.35 / React 18.3.1 (Phase 1) |
| Language | TypeScript | 5.9.3, `strict: true` |
| Styling | Tailwind CSS | 3.4.19 (+ postcss, autoprefixer) |
| Map | Leaflet + `react-leaflet`, OpenStreetMap tiles | leaflet 1.9.4 / react-leaflet 4.2.1, client-only via `dynamic(ssr:false)` |
| Icons / validation | lucide-react, Zod | 0.441.0 / 3.25.76 |
| Lint | ESLint | 8.57.1 + eslint-config-next 14.2.35 |
| Backend (BaaS) | Supabase | WIRED Phase 2: project URL + publishable key in gitignored `.env.local`; browser/server clients + middleware live; all 7 tables confirmed present; anon write-denials proven; privilege repair for alerts/users reads pending user SQL run. supabase-js 2.117.3 / @supabase/ssr 0.5.2 |
| Hosting | Vercel (auto-deploy from GitHub) | Not connected (needs user auth) |
| VCS | Git + GitHub | Local git repo initialized Phase 1 (no remote yet) |
| Design | Figma (optional) | — |
| PWA | `next-pwa` or native App Router + manifest + service worker | Phase 4 |

No custom backend server. Frontend talks directly to Supabase via RLS-secured anon key; service-role key never ships to client.

## 5. Implementation Status (2026-10-15, Phase 2 verification pass)
- Phase 0: DONE. Phase 1: code complete locally, deploy pending.
- Phase 2: code COMPLETE, migration APPLIED by user, verification IN PROGRESS.
  Tables confirmed live (7/7 resolve); anon write-denials proven (favorites +
  reports 42501, routes + users 401); app smoke 11/11 green against migrated DB.
  Open: privilege repair for alerts/users reads (`..._privilege_repair.sql`
  prepared, needs user SQL run); live auth/favorites session flows need the
  user's browser + test accounts (`docs/TESTING.md` AUTH-02). No code defects
  found; no policy text changed.
- Repo state: local git, no remote; Supabase migrated (privilege repair pending); no Vercel.

## 6. Current Phase / Next Task / Outstanding Issues
- Current phase: **Phase 2 verification — 2 user steps left (PRIV-01 SQL run, AUTH-02 browser tests).**
- Next task: run the privilege-repair migration, then the AUTH-02 manual auth/favorites tests, report results — then Phase 2 can be marked complete and **Phase 3** approved. See `docs/TESTING.md` §6.
- Outstanding issues / blockers:
  1. PRIV-01: alerts/users reads denied at privilege stage (repair SQL ready, fail-closed meanwhile).
  2. AUTH-02: session flows need user's browser (no headless tooling here; test accounts must be user-owned).
  3. No GitHub remote / Vercel project — need user auth.
  4. Map tiles + responsive layouts not verified in a real browser.

## 7. Key Decisions + Reasons
1. **BaaS over custom server** — solo frontend dev, 8–12 week MVP; Supabase covers auth/DB/realtime without backend code.
2. **Next.js App Router + Server Actions/Route Handlers + client components** — SSR for SEO/first paint, client components only where map/realtime needs browser APIs.
3. **Leaflet + OSM over Mapbox/Google** — free, no API key, light tiles for poor connectivity.
4. **Crowdsourced sightings first, GPS later** — hardware integration too costly for MVP; validate with community data + votes/moderation.
5. **RLS on every table + server-side role checks** — anon key is public; DB is the enforcement point.
6. **Project renamed BiyaheMate → PARA PO** — owner request 2026-10-14; "Para po" is the jeepney stop phrase, more memorable/local. Old PDF name retained as reference only.
7. **Publishable-key naming (Phase 2)** — standardized on `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (new-style `sb_publishable_…` key) instead of the legacy `ANON_KEY` name across clients, `.env.example`, and docs, since the issued credential is a publishable key.

## 8. Environment Variables (names only, no secrets)
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_MAP_TILE_URL   # optional, default https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
NEXT_PUBLIC_MAPBOX_TOKEN   # optional, only if Mapbox layer added
```
Server-only (never `NEXT_PUBLIC_`): `SUPABASE_SERVICE_ROLE_KEY` — only in Supabase dashboard / Vercel server env / local `.env.local` (gitignored), for admin scripts only.

## 9. Commands (Phase 1 toolchain live)
```
npm run dev       # Next.js dev server → http://localhost:3000
npm run lint      # next lint — PASS 2026-10-15 (no warnings/errors)
npm run typecheck # tsc --noEmit (strict) — PASS 2026-10-15
npm run build     # next build — PASS 2026-10-15 (17 static pages)
npm start         # serve production build — verified, 11/11 routes HTTP 200
```
Phase 2 verification: lint/typecheck/build green; tables confirmed live 7/7;
anon write-denials proven (42501 on favorites/reports); prod smoke 11/11 + guest
walls against migrated DB. Open: privilege repair SQL run + AUTH-02 browser
tests (need user). Full log in `docs/TESTING.md` §5d. Phase 2 gate NOT yet met
(RLS authenticated half + auth E2E unverified).

## 10. Known Bugs / Failed Tests / Blockers
- Build bug found + fixed in Phase 1: `window is not defined` prerendering `/`
  and `/map` — `next/dynamic(ssr:false)` wrapper lacked a client boundary.
  Fixed by adding `"use client"` to `components/map/DemoMap.tsx`; build green after.
- Login bug found + fixed (BUG-03, `docs/TESTING.md`): server-side `redirect()`
  in auth actions resolved the awaited promise as `undefined`, crashing
  `outcome.ok` on successful login. Actions now return `redirectTo`; client navigates.
- Map tiles and 360px/1280px layouts NOT verified in a real browser (no headless
  browser tooling in this environment) — manual check recommended before deploy.
- Blockers: privilege repair SQL run (PRIV-01); AUTH-02 browser tests (need user-owned test accounts); GitHub remote + Vercel need user auth; email-confirmation delivery unverified.
- `docs/TESTING.md` §5d–§6 hold the full verified state; nothing is claimed green
  that was not executed.

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
