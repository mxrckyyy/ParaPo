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
