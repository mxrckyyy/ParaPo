# PARA PO — Implementation Plan

Phases run in order. Do not start the next phase until its gate conditions are met.

## Phase 0 — Docs & Setup Baseline (current)
- Scope: this 9-doc set; environment baseline; no app code.
- Deliverables: all 9 `docs/*.md` files accurate to `BiyaheMate.pdf` + actual `node/npm/git` results.
- Verification: files exist; plan lists all phases; next task = Phase 1.
- Gate: §Phase 0 Acceptance in user brief satisfied → report issued.
- Status (2026-10-14): DONE (pending user sign-off).

## Phase 1 — Foundation (Weeks 1–2)
- Scope: `npx create-next-app` (TS, Tailwind, App Router) + ESLint/Prettier; Leaflet + react-leaflet (dynamic SSR-off); static screens (Home/Search/Route/Report/Alerts/Profile/Admin shell) with `lib/mock.ts` data; `git init` + GitHub remote; Vercel preview deploy.
- Deliverables: runnable `npm run dev`, 7 static routes, mock map markers, README quickstart.
- Verification: `lint`, `typecheck`, `build` pass; manual: all routes render at 360px + 1280px; map loads OSM tiles.
- Gate: build green + preview URL live. No Supabase yet.

## Phase 2 — Supabase Integration (Weeks 3–5)
- Scope: Supabase project + env wiring; migrations for 7 tables + RLS (see `docs/DATABASE_SCHEMA.md`); browser/server/admin clients; replace mocks with live queries; email/password auth + profile + favorites CRUD; seed SAMPLE data clearly labeled.
- Deliverables: working login/signup, favorites persist, routes/stops/vehicles from DB, RLS tests pass for guest/commuter/admin.
- Verification: auth flow E2E (signup→login→logout), favorites owner-isolation test, `supabase gen types` committed.
- Gate: no mock imports remain on data paths; RLS matrix green. Depends on Phase 1 gate.

## Phase 3 — Realtime & Crowdsourcing (Weeks 6–8)
- Scope: Realtime channels for vehicles/reports/alerts; Report form + geolocation + Server Action + rate limit; "I'm on/off vehicle" sharing (throttled); `lib/eta.ts` range estimates; filters + legend + stale-dim.
- Deliverables: live pins/markers across two browsers; ETA range on route page; pending-vs-approved styling.
- Verification: two-client realtime test, report rate-limit test, ETA unit tests (haversine fixtures), stale-vehicle hiding test.
- Gate: realtime latency acceptable on 4G; no duplicate-marker bugs. Depends on Phase 2 gate.

## Phase 4 — PWA & Polish + Deploy (Weeks 9–12)
- Scope: manifest + icons + service worker (app shell + tile cache), alerts center + admin moderation dashboard + alert CRUD, favorites/profile polish, user testing + bugfix, production Vercel deploy + env checklist.
- Deliverables: installable PWA (Lighthouse PWA pass), admin can approve/reject + publish alerts, prod URL + CHANGELOG release entry.
- Verification: Lighthouse (PWA + perf smoke), admin E2E (pending→approved visible; rejected hidden; alert expiry), `next build` clean.
- Gate: MVP acceptance: guest map+search, commuter report+favorite+share, admin moderate+alert, all on prod. Depends on Phase 3 gate.

## Phase 5+ — Future (out of MVP)
Operator dashboard, GPS-device ingest, push notifications, fare-matrix calculator, full offline outbox, votes on reports, i18n (Tagalog). Each needs its own plan amendment + migration + doc updates.

## Completion Requirements (every phase)
1. Code + migration committed; docs updated per Maintenance Rules.
2. `lint + typecheck + tests + build` executed; real output pasted in `docs/TESTING.md` (no claimed passes).
3. Known bugs retained until verified fixed.
4. `docs/CHANGELOG.md` appended; `docs/PROJECT_CONTEXT.md` next-step advanced.
