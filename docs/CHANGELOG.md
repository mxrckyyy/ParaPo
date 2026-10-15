# PARA PO — Changelog

All significant changes by phase. Docs updated per Maintenance Rules; test claims only with real results.

## [Phase 0] — 2026-10-14 — Docs baseline + rename to PARA PO
- Renamed project BiyaheMate → PARA PO (owner request); `BiyaheMate.pdf` kept as reference spec.
- Created: `docs/PROJECT_CONTEXT.md` (purpose, stack, status, env names, recovery procedure).
- Created: `docs/ARCHITECTURE.md` (target App Router layout, BaaS design, 3-client Supabase pattern, safe-change rules).
- Created: `docs/SYSTEM_DESIGN.md` (F1–F12, NFRs, 7 workflows, RLS summary, ETA limits).
- Created: `docs/UI_UX_GUIDELINES.md` (palette `#16A34A`/`#0F172A`/`#F59E0B`, responsive, marker contract, consistency rules).
- Created: `docs/IMPLEMENTATION_PLAN.md` (Phases 0–5+, gates).
- Created: `docs/DATABASE_SCHEMA.md` (7 tables, constraints, indexes, RLS SQL, `is_admin`/`handle_new_user`, admin-grant, seed-vs-prod rule).
- Created: `docs/SECURITY.md` (RLS-first, server checks, Zod, rate limits, privacy, deploy).
- Created: `docs/TESTING.md` (strategy, RLS matrix, Phase 0 not-executed results).
- Created: `docs/CHANGELOG.md` (this file).
- Modified: none (no code existed). Deleted: none.
- Migrations: none. Verification: env baseline only — Node v24.19.0 / npm 11.17.0 / git 2.55.0; no package.json; no git repo; lint/type/test/build NOT EXECUTABLE (recorded, not passed).
- Decisions: BaaS-only (solo dev speed); Leaflet+OSM (free); crowdsourcing-first; anon `vehicles` rows + 5-min stale rule (privacy/perf).
- Bugs: no app bugs (no code); blockers SETUP-01–03 carried to Phase 1.

## [Phase 0] — 2026-10-14 — Moved docs into `docs/`
- Moved all 9 `.md` files from project root into `docs/` with no content changes except path references; no duplicates remain in root.
- Updated `docs/PROJECT_CONTEXT.md` recovery procedure to the 10-step `docs/`-prefixed sequence; `docs/PROJECT_CONTEXT.md` confirmed as main persistent context file.
- Updated file-location references in `docs/ARCHITECTURE.md`, `docs/SYSTEM_DESIGN.md`, `docs/DATABASE_SCHEMA.md`, `docs/SECURITY.md`, `docs/IMPLEMENTATION_PLAN.md`, `docs/PROJECT_CONTEXT.md`, and this changelog to `docs/` paths.
- Verification: 9/9 files present in `docs/`, 0 in root; content, phase status, and TESTING not-executed results preserved; no scaffold created; no tests claimed.

## [Phase 1] — 2026-10-15 — Foundation scaffold + static demo interface (code complete, deploy pending)
- Scaffolded in place (manual; `create-next-app` refuses non-empty dirs): Next.js 14.2.35, React 18.3.1, TS 5.9.3 strict, Tailwind 3.4.19, ESLint 8.57.1, leaflet 1.9.4 + react-leaflet 4.2.1, lucide-react 0.441.0, zod 3.25.76, supabase-js 2.117.3 + @supabase/ssr 0.5.2 (prepared, unwired).
- Created 11 routes: `/` (hero, demo map preview, search, samples), `/map` (full map + legend + list alternative), `/search` (validated mock filter + empty state), `/routes/[id]` (SSG ×3, illustrative ETA range + sample fare), `/report` (preview form, saves nothing), `/alerts` (sample cards), `/favorites` + `/profile` (login walls), `/login` + `/signup` (layouts, no auth), `/admin` (demo shell). All mock content badged Demo/fictional; no fake auth, no live-data claims.
- Key fix: Leaflet SSR crash (`window is not defined`) solved with `"use client"` on the `next/dynamic(ssr:false)` wrapper (`components/map/DemoMap.tsx`) — documented in `docs/TESTING.md` BUG-01.
- Supabase prep only: `lib/supabase/{client,server,admin}.ts` match `docs/ARCHITECTURE.md` §5; unimported; `.env.example` placeholders; `.env*.local` gitignored; secret scan clean.
- Git: local repo initialized, 3 commits (scaffold, tsbuildinfo ignore, gitignore-encoding fix); no remote (`gh` unavailable — manual push steps in `docs/TESTING.md` SETUP-02). No Vercel project yet (standard `next build`, compatible).
- Verification: `lint` PASS, `typecheck` PASS, `build` PASS (17 static pages), prod smoke 11/11 HTTP 200, Tailwind palette in CSS bundle, security headers verified live. NOT executed: unit/E2E (no framework), RLS (no Supabase), browser visual (no headless tooling). No zero-bug claim.
- Decisions: manual scaffold over `create-next-app`; react-leaflet v4 (React 18 pair); fictional "Demo …" data naming; report/auth forms that validate but transparently save nothing.

## [Phase 2] — 2026-10-15 — Supabase wiring + auth/favorites/route data (code complete, migration pending)
- Configured `.env.local` (gitignored, base URL without `/rest/v1/`) and standardized on `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` across clients, `.env.example`, and docs (decision recorded in `docs/PROJECT_CONTEXT.md` §7).
- Implemented `middleware.ts` (session refresh, no redirects), real signup/login/logout Server Actions (Zod, friendly errors, confirmation-sent path), session-aware nav, profile (email/role/logout), owner-scoped favorites (toggle/list/remove with setup-degraded states), live route search/detail with labeled demo fallback, hand-maintained `types/database.ts`.
- Committed `supabase/migrations/20261015000000_phase2_core_schema.sql` (7 tables, checks, trigram + partial-unique indexes, 3 SECURITY DEFINER functions with revokes, 15 RLS policies) + `seed.sql` + `verify-phase2.sql` — NOT APPLIED (needs user SQL Editor run; CREATE-only, no data risk).
- Verification: `lint`/`typecheck`/`build` PASS (17 pages, dynamic where session-read); read-only connectivity PASS (GoTrue health, PGRST205 = tables absent, 400 on bad login); prod smoke 11/11 200 (1 transient 500, OPEN-03) + guest walls + live headers. NOT executed: migration apply, RLS matrix, real auth E2E, email delivery, `gen types`. Scans clean (no key/URL in tracked files; service-role never provided/used).
- Decisions: demo-fallback data layer (app works pre- and post-migration); `getUser()`-verified identity everywhere, never client IDs; middleware refreshes but never gates (pages show login walls).

## [Phase 2 verification] — 2026-10-15 — migration confirmed, anon RLS proven, repair prepared (gate not met)
- User applied the core migration; REST confirms 7/7 tables resolve. Anon write-denial suite PASS (favorites + reports rejected with explicit 42501 RLS proof; routes + users writes 401).
- Found: anon SELECT denied at privilege stage (empty 401) on `alerts` + `users` while siblings 200 — fail-closed, no vulnerability. Prepared additive-only `20261015000001_phase2_privilege_repair.sql` (GRANTs + diagnostic; RLS untouched) for the user's SQL Editor run. No policy text changed; RLS never disabled.
- `lint`/`typecheck`/`build` PASS; prod smoke 11/11 200 vs migrated DB; no code defects found, no app-code changes needed.
- NOT executed (need user): repair SQL run, AUTH-02 browser tests (signup/confirmation/login/persistence/logout/favorites E2E/owner isolation), `gen types`, browser visual. Phase 2 gate stays open until those land.

## [Phase 2 fix] — 2026-10-15 — login crash BUG-03 fixed (no redirect signals in actions)
- Root cause: `signIn`/`signUp` ended with server-side `redirect()`, which throws NEXT_REDIRECT; awaited imperatively from the submit handler, the client dispatcher consumed the redirect and the promise resolved `undefined`, so `outcome.ok` crashed exactly on successful login.
- Fix: actions return `{ ok, confirmationSent, redirectTo }` on every path (no `redirect()` calls, nothing thrown or swallowed); `AuthForm` navigates via `router.push` + `router.refresh()` with a defensive `if (!outcome)` backstop; same pattern for `signOut`/`LogoutButton`. Validation, Supabase flow, friendly errors, confirmation path unchanged.
- Also fixed BUILD-01 (corrupt `.next` vendor chunk broke `next start`; clean rebuild) and closed OPEN-03 (same corrupt-build family).
- Verification: `lint`/`typecheck`/`build` PASS (17 pages); smoke 5/5 200 with login form rendering. Live login with a real account NOT executed — retest steps in `docs/TESTING.md` AUTH-02a.

## [Phase 3] — 2026-10-15 — realtime + crowdsourcing code complete, live-verification pending (Phase 2 manual checks kept open)
- Added `lib/eta.ts` (haversine, ETA ranges, 5-min stale rule) + Vitest harness (`npm run test`, 14/14 PASS incl. haversine fixtures, boundary + hostile validation cases).
- Added `app/actions/reports.ts` (Zod, verified identity, 30 s server rate limit, pending-by-default) and `app/actions/vehicles.ts` (anonymous start/move/stop, 10 s server throttle); upgraded `ReportForm` (geolocation + manual coords, guests walled) and added `ShareRideButton` (consent pill, denial states).
- Added `hooks/useRealtimeTable.ts` (one channel/table, id-dedupe, paused fallback) + `LiveMap` (type filters, stale-dim, pending-dashed, list alternative); `/map` serves live markers with demo fallback; verified routes show live ETA ranges.
- No schema change (all columns existed) — no new migration. RLS untouched; realtime subscriptions are subscriber-scoped (anon sees only RLS-visible rows).
- Verification: unit 14/14, lint/typecheck/build, 12/12 smoke PASS. NOT executed: two-client realtime, live rate-limit/stale/share/geolocation E2E, 4G latency, RT-01 exposure, Phase 2 manual remainder. Harness port-contention lesson recorded (OPEN-03/BUILD-01 non-defects). No zero-bug claim; Phase 4 not started.

## [Phase 4] — 2026-10-15 — PWA + admin moderation + alerts center code complete, deploy pending (earlier manual checks kept open)
- PWA: `app/manifest.ts` (standalone, theme, 3 icons) + generated `public/icons/*.png` (verified PNG signatures/dimensions; placeholder geometric branding, replace before launch) + `app/apple-icon.svg` + hand-written `public/sw.js` (tile cache-first capped at 200, shell precache, offline fallback; `node --check` clean) + `app/offline` page + prod-only `ServiceWorkerRegister`.
- Admin: `lib/admin.ts requireAdmin` gate + `app/actions/admin.ts` (pending list, approve/reject/delete, alert publish/delete — every action re-checks admin) + dashboard rewrite (login wall → not-permitted → queue + alert manager). Found + documented: base reports SELECT policy hides others' pending rows from admins → prepared `20261015000002_reports_admin_read.sql` (additive, user applies).
- Alerts center: `getLiveAlerts` (expiry-filtered) + `AlertsLive` (severity filter, realtime) + home `AlertBanner`; `/alerts` serves live rows or labeled samples. Favorites link to routes + saved dates; profile shows counts + links.
- Verification: unit 22/22, lint/typecheck/build, 15/15 smoke (manifest valid JSON, admin wall, assets served) PASS. NOT executed: Lighthouse/PWA install, SW offline, admin E2E (ADMIN-01 steps), deploy — no prod URL claimed. Phase 2/3 manual items preserved NOT EXECUTED. No zero-bug claim; Phase 5 not started.

## [Phase 5] — 2026-10-15 — report voting implemented; other future items explicitly deferred (no scope invented)
- Scope decision: the plan's Phase 5+ bucket lists 7 future ideas with no acceptance criteria. Implemented the only one completable in code with available resources — **votes on reports**; the other six are deferred with per-item reasons (operator dashboard: needs requirements amendment; GPS ingest: needs hardware + design; push: needs provider credentials; fare calculator: no verified fare source exists and inventing fares is forbidden; offline outbox: needs sync-design amendment; i18n: needs scope amendment).
- Added `supabase/migrations/20261015000003_report_votes.sql` (table + one-vote UNIQUE + index + RLS + inline GRANTs; user applies), `DbVote` type, `voteSchema`, pure `tallyVotes` + `app/actions/votes.ts` toggle (verified identity, UNIQUE backstop), `getReportsWithVotes`, `/reports` board + `ReportBallot` (counts public, voting login-gated), links from `/report`.
- Verification: unit 28/28, lint/typecheck/build, 15/15 smoke incl. `/reports` PASS. NOT executed: vote E2E, vote isolation, migration apply, `gen types`, browser visual. Earlier phases' NOT EXECUTED items untouched. No zero-bug claim; Phase 6 not started.

## [Verification Batch 1] — 2026-10-15 — DB blockers audited, two migration defects fixed pre-apply, live runs still pending
- Live REST (nothing created/altered): PRIV-01 still 401s (repair unapplied); `report_votes` absent PGRST205 (VOTE-01 unapplied); routes 0 rows (seed not run).
- Fixed before any damage: (1) RLS-02 file would have broken ALL anon report reads (missing anon EXECUTE on `is_admin()`) → grant added with rationale; (2) PRIV-01 file lacked authenticated write grants on `alerts` → Phase 4 admin alert publish/delete would have failed at privilege stage → grants added (RLS still gates to admins).
- RT-01 code re-verified (paused-fallback + cleanup); publication membership needs the user Dashboard check. VOTE-01 code/SQL re-audited clean.
- Checks: test 28/28, lint, typecheck, build (20/20) all PASS. RLS never disabled; no secrets touched; migrations remain CREATE/GRANT-only.

## [Batch 1 re-probe] — 2026-10-15 — live state unchanged, no new user results to record
- Re-probed all four blockers via REST: PRIV-01 still 401s (unapplied), `report_votes` still absent (unapplied), routes/reports still empty (seed not run). No change since §5k; statuses preserved.
- Tree re-verified green (test 28/28, lint, typecheck, build 20/20) on the committed tree. Stopping here per instructions — awaiting user SQL/Dashboard results.

## [Phase 6 audit] — 2026-10-15 — no such phase defined; nothing implemented, nothing invented
- Verified `docs/IMPLEMENTATION_PLAN.md` contains Phase 0–4 plus "Phase 5+ Future" only. Per the do-not-invent-scope rule: zero code, schema, or config changes.
- Tree-integrity re-verification: `npm run test` 28/28, `lint`, `typecheck`, `build` (20/20) all PASS on the unchanged tree.
- All prior NOT EXECUTED items, blockers, and gates carry over untouched. Next: user defines new scope or supplies manual-verification results.

## [Phase 2 audit] — 2026-10-15 — user browser login tests PASS, gate honestly held open
- Recorded user-verified PASS: login without crash or red box (BUG-03 fix confirmed in real use), profile nav + email, refresh persistence, logout + walls. Authenticated-sessions code path now proven both directions (logged-in email + logged-out walls).
- Added `docs/TESTING.md` §7 acceptance checklist (PASS / NOT EXECUTED per criterion, evidence-linked). No FAILs; nothing passed without evidence. Still NOT EXECUTED: signup/confirmation, error-message paths, favorites E2E, two-account isolation, authenticated RLS half, PRIV-01 repair run, `gen types`, browser visual.
- Verification this pass: `lint`/`typecheck`/`build` re-run green (no code changes). Phase 2 stays OPEN per its gate; Phase 3 not started.

## [Post-migration re-verification] — 2026-10-15 — safe probes only, no schema/version changes

- Anonymous REST probes after user-reported migration runs: alerts/users now 200 [] (PRIV-01 execution/anonymous scope PASS); reports 200 [] (RLS-02 execution + anon is_admin() EXECUTE assertion PASS at REST level); report_votes 200 [] with five columns (VOTE-01 table + anon read policy PASS). RT-01 publication membership was user-reported for vehicles/reports/alerts; no websocket delivery was attempted.
- Overstatement guards: no admin behavior was proven (blocked on test-session availability), no uniqueness/owner isolation was exercised (no retained rows), no votes were inserted, and no seed was run.
- Automated checks: `npm run test` PASS (28/28), `lint` PASS, `typecheck` PASS, and `npm run build` PASS (20/20 pages) on the unchanged tree.
- Code/DB docs: updated PRIV-01, RLS-02, VOTE-01, RT-01 blocker language as PARTIAL/BLOCKED; DATABASE_SCHEMA statuses updated from "pending" to user-run with manual scope qualifying each.

## [Batch 2 — browser E2E] — 2026-10-15 — not runnable in supplied environment

- No Playwright/Cypress/browser binary/session or user-controlled accounts were available, so all interactive Batch 2 browser flows remain BLOCKED/NOT EXECUTED, not treated as failures.
- Related safe evidence: npm run test 28/28 PASS, lint PASS, typecheck PASS, npm run build 20/20 PASS; earlier user-confirmed AUTH-02a subset remains the only browser evidence.
- No application or schema changes were performed. Tests remaining: auth validation/errors, protected/admin access, favorites isolation, report/vote behavior and isolation, admin moderation, realtime runtime delivery, PWA install/offline/browser visual.

## [Mobile-first UI pass] - 2026-10-15 (code, not a new phase)

- Added responsive bottom navigation for primary commuter actions and mobile bottom spacing to prevent content overlap.
- Reduced card/footer spacing and improved mobile map height; standardized headings with responsive Tailwind sizes.
- Verified: lint PASS, typecheck PASS, test 28/28 PASS, build 20/20 PASS.
- Not verified: browser screenshots/viewports were not inspected in this environment; no mobile visual or touch interaction claim is made.

## [Phase 1 UI/UX refactor] - 2026-10-15 (design system + responsive app shell, code)

- User-approved direction implemented for design system only: primary green `#10B981`, accent amber `#F59E0B`, app background `#F9FAFB`, white cards, semantic info/warning/critical states, Inter-first font stack, consistent focus rings, border/shadow hierarchy. Tailwind tokens and globals updated. No Supabase schema, migration, RLS, auth logic, Server Action, or database contract was modified.
- Responsive app shell preserved: sticky top navigation with active route indicator and backdrop blur; fixed five-item bottom navigation (Map, Search, Report, Alerts, Profile) with Lucide icons and labels, active item highlighting, touch-friendly targets, and safe-area padding; bottom content padding prevents it from covering forms/buttons.
- Shared component polish: consistent card padding/surface color, button focus styles, empty-state presentation, global word-wrap/horizontal-scroll containment.
- Files changed: `tailwind.config.ts`, `app/globals.css`, `app/layout.tsx`, `components/layout/BottomNav.tsx`, `components/ui/Card.tsx`, plus `docs/CHANGELOG.md` and `docs/TESTING.md`.
- Verification: lint PASS, typecheck PASS, test 28/28 PASS, build 20/20 PASS, `git diff --check` PASS. NOT VERIFIED: browser viewports 320px/375px/390px/430px/768px/1024px/1440px, overlap checks, safe-area behavior on iOS, map tiles. No browser or deployment action was performed. No commit, push, or deploy was performed.
## [Phase 2 UI/UX refactor] - 2026-10-15 (mobile map experience, code)

- Mobile map experience implemented on \/map\: layout changed to fill the available height between header and content/bottom navigation, with desktop side panel preserved. No full-page duplicate map implementation was added; homepage remains a preview and \/map\ remains the primary map.
- Floating search entry added on the map using the existing route-search flow ("Saan ka papunta?") without a new backend contract.
- Map controls added for safe geolocation and meaningful reset; permission/unavailable-location states are handled without crashing. Controls have accessible labels, visible focus, and >=44px touch targets.
- Legend changed to a collapsible details element.
- Marker selection now opens a mobile-friendly details panel with actual marker data, close action, coordinate information, status/type/description/date as available, and explicit "no ETA/fare/route" notices.
- MapView now uses a ResizeObserver to recalculate Leaflet size and supports selected-marker highlighting and selection callbacks while preserving demo/live markers and existing filters.
- Files changed: \pp/map/page.tsx\, \components/map/LiveMap.tsx\, \components/map/MapView.tsx\, \components/map/MapLegend.tsx\.
- Constraints preserved: no database schema/migration/RLS/auth/server-action/environment changes; no routes removed; no real data replaced; no new dependencies.
- Verification: \
pm run lint\ PASS; \
pm run typecheck\ PASS; \
pm run test\ PASS (28/28); \
pm run build\ PASS (20/20); \git diff --check\ PASS (CRLF warnings only). HTTP dev check: GET / 200 and GET /map 200, with the floating search text present in the /map response. Visual map/touch/viewport behavior was not manually or browser-automated in this environment. No commit, push, deploy, reset, or discard was performed. Phase 3 not started.

## [Phase 3 UI/UX refactor] - 2026-10-15 (search, reports, alerts, profile, code)

- Search UX improved: origin/destination inputs are full-width, submit button is full-width on small screens, and an accessible swap control was added without changing search behavior. Existing demo/live routes and validation remain unchanged.
- Report UX improved: larger report-type selection controls, full-width submit button with loading text, improved description textarea height and validation feedback, and preserved submit payload fields.
- Alerts visual hierarchy improved with severity icons, borders, badges, readable empty state and map link.
- Profile page polished with an initials avatar fallback, authenticated email/role, relative sections for saved routes and account actions, and actual saved-favorite count only.
- Files changed: components/search/SearchPanel.tsx, components/reports/ReportForm.tsx, components/alerts/AlertCards.tsx, app/profile/page.tsx.
- Constraints preserved: no schema, RLS, auth, Server Action, env, or route changes; no data invented or replaced; no new dependencies.
- Verification: npm run lint PASS; npm run typecheck PASS; npm run test PASS (28/28); npm run build PASS (20/20); git diff --check PASS (CRLF warnings only). No browser automation/manual viewport testing was performed. No commit, push, deploy, reset, or discard was performed. Phase 4 not started.
