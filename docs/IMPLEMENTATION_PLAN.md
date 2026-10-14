# PARA PO — Implementation Plan

Phases run in order. Do not start the next phase until its gate conditions are met.

## Phase 0 — Docs & Setup Baseline (current)
- Scope: this 9-doc set; environment baseline; no app code.
- Deliverables: all 9 `docs/*.md` files accurate to `BiyaheMate.pdf` + actual `node/npm/git` results.
- Verification: files exist; plan lists all phases; next task = Phase 1.
- Gate: §Phase 0 Acceptance in user brief satisfied → report issued.
- Status (2026-10-14): DONE (user signed off; docs moved to `docs/`).

## Phase 1 — Foundation (Weeks 1–2)
- Scope: `npx create-next-app` (TS, Tailwind, App Router) + ESLint/Prettier; Leaflet + react-leaflet (dynamic SSR-off); static screens (Home/Search/Route/Report/Alerts/Profile/Admin shell) with `lib/mock.ts` data; `git init` + GitHub remote; Vercel preview deploy.
- Deliverables: runnable `npm run dev`, 7 static routes, mock map markers, README quickstart.
- Verification: `lint`, `typecheck`, `build` pass; manual: all routes render at 360px + 1280px; map loads OSM tiles.
- Gate: build green + preview URL live. No Supabase yet.
- Status (2026-10-15): CODE COMPLETE, deploy pending. Built manually in-place
  (not `create-next-app`, which refuses non-empty dirs) with Next.js 14.2.35 /
  React 18.3.1 / TS 5.9.3 strict / Tailwind 3.4.19 / ESLint 8.57.1: 11 routes,
  client-only Leaflet map, mock search + report/auth/admin previews, README.
  `lint` + `typecheck` + `build` green; prod smoke 11/11 HTTP 200; local git
  (3 commits), no remote. Browser tile/360px/1280px check + Vercel preview still
  pending (need user browser + Vercel auth). Prettier not added (deferred, minor).

## Phase 2 — Supabase Integration (Weeks 3–5)
- Scope: Supabase project + env wiring; migrations for 7 tables + RLS (see `docs/DATABASE_SCHEMA.md`); browser/server/admin clients; replace mocks with live queries; email/password auth + profile + favorites CRUD; seed SAMPLE data clearly labeled.
- Deliverables: working login/signup, favorites persist, routes/stops/vehicles from DB, RLS tests pass for guest/commuter/admin.
- Verification: auth flow E2E (signup→login→logout), favorites owner-isolation test, `supabase gen types` committed.
- Gate: no mock imports remain on data paths; RLS matrix green. Depends on Phase 1 gate.
- Status (2026-10-15): CODE COMPLETE (incl. BUG-03 login fix fd6f2b2), migration APPLIED by user, verification PARTIAL.
  User-verified: login without crash/error, profile nav + email, refresh persistence, logout + walls.
  Gate NOT met yet: privilege repair needs the user's SQL run (PRIV-01), and signup/confirmation, error paths, favorites E2E, two-account isolation, and the authenticated RLS half need user browser tests (`docs/TESTING.md` AUTH-02 + §7). Live-data paths stay in labeled demo mode until seed/real rows exist. Phase 3 must not start without explicit approval.

## Phase 3 — Realtime & Crowdsourcing (Weeks 6–8)
- Scope: Realtime channels for vehicles/reports/alerts; Report form + geolocation + Server Action + rate limit; "I'm on/off vehicle" sharing (throttled); `lib/eta.ts` range estimates; filters + legend + stale-dim.
- Deliverables: live pins/markers across two browsers; ETA range on route page; pending-vs-approved styling.
- Verification: two-client realtime test, report rate-limit test, ETA unit tests (haversine fixtures), stale-vehicle hiding test.
- Gate: realtime latency acceptable on 4G; no duplicate-marker bugs. Depends on Phase 2 gate.
- Status (2026-10-15): CODE COMPLETE, live-verification pending (explicitly proceeding with Phase 2 manual checks still open, per user instruction — they stay NOT EXECUTED).
  Implemented: realtime hook + LiveMap (dedupe merge, filters, stale-dim, pending-dashed, paused fallback); report action (30 s server limit) + geolocation form (manual-coords fallback, guests walled); anonymous ride sharing (10 s server throttle) + consent pill; `lib/eta.ts` + 14/14 Vitest PASS; live ETA ranges on verified routes. Verification: ETA unit tests PASS (haversine fixtures); lint/typecheck/build + 12/12 smoke PASS. NOT executed: two-client propagation, live rate-limit/stale/share/geolocation E2E, 4G latency, `gen types`, browser visual. RT-01 (Replication exposure) also pending user. Gate NOT met.

## Phase 4 — PWA & Polish + Deploy (Weeks 9–12)
- Scope: manifest + icons + service worker (app shell + tile cache), alerts center + admin moderation dashboard + alert CRUD, favorites/profile polish, user testing + bugfix, production Vercel deploy + env checklist.
- Deliverables: installable PWA (Lighthouse PWA pass), admin can approve/reject + publish alerts, prod URL + CHANGELOG release entry.
- Verification: Lighthouse (PWA + perf smoke), admin E2E (pending→approved visible; rejected hidden; alert expiry), `next build` clean.
- Gate: MVP acceptance: guest map+search, commuter report+favorite+share, admin moderate+alert, all on prod. Depends on Phase 3 gate.
- Status (2026-10-15): CODE COMPLETE, deploy + live-verification pending (Phase 2/3 manual checks kept open per instructions).
  Implemented: PWA manifest + generated icons + hand SW + offline page + prod-only registration; admin dashboard (gated page + 5 admin actions, policy-hint empty state); alert CRUD + alerts center (filter, realtime, expiry) + home banner; favorites/profile polish. New pending user SQL: RLS-02 (reports admin-read widening) alongside PRIV-01 + RT-01.
  Verification: unit 22/22, lint/typecheck/build, 15/15 smoke (manifest valid, admin wall, assets served) PASS. NOT executed: Lighthouse/PWA install, SW offline, admin E2E, deploy — no prod URL, so the "all on prod" gate criterion is unmet. Phase 5 not started.

## Phase 5+ — Future (out of MVP)
Operator dashboard, GPS-device ingest, push notifications, fare-matrix calculator, full offline outbox, votes on reports, i18n (Tagalog). Each needs its own plan amendment + migration + doc updates.
- Status (2026-10-15): PARTIAL by design, per user instruction to proceed. Implemented the single item completable purely in code with available resources: **votes on reports** (`report_votes` + toggle action + `/reports` board + tests; migration prepared, user applies). Explicitly DEFERRED (each blocked as noted, none started): operator dashboard (needs operator requirements amendment); GPS-device ingest (needs hardware + ingest design); push notifications (needs provider credentials/opt-in infra); fare-matrix calculator (needs a verified fare source — inventing fares is forbidden); full offline outbox (needs IndexedDB sync-design amendment); Tagalog i18n (needs scope/dictionary amendment). No acceptance gate defined for this bucket in the plan; the voting slice is code-complete with live-E2E pending (VOTE-01).

> Note (2026-10-15): there is no Phase 6 in this plan — phases run 0–4 plus the "Phase 5+ Future" bucket above. Any work beyond that bucket requires a user-defined scope amendment; nothing was invented under a "Phase 6" label.

## Completion Requirements (every phase)
1. Code + migration committed; docs updated per Maintenance Rules.
2. `lint + typecheck + tests + build` executed; real output pasted in `docs/TESTING.md` (no claimed passes).
3. Known bugs retained until verified fixed.
4. `docs/CHANGELOG.md` appended; `docs/PROJECT_CONTEXT.md` next-step advanced.
