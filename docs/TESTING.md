# PARA PO — Testing

## 1. Tools / Commands (Phase 1 toolchain live)
| Purpose | Tool | Command | Phase 1 result |
|---|---|---|---|
| Lint | ESLint 8.57.1 (`next/core-web-vitals`) | `npm run lint` | PASS, no warnings/errors |
| Types | TypeScript 5.9.3 strict | `npm run typecheck` | PASS (after 1 fix, see §6) |
| Build | Next.js 14.2.35 | `npm run build` | PASS, 17 static pages (after 1 fix, see §6) |
| Smoke | `npm start` + HTTP checks | manual script | PASS, 11/11 routes HTTP 200 |
| Unit/Component | Vitest + Testing Library | `npm run test` | NOT EXECUTED (not configured; Phase 3) |
| E2E | Playwright | `npm run test:e2e` | NOT EXECUTED (not configured; Phase 3) |
| DB/RLS | Supabase SQL | `npm run test:rls` | NOT EXECUTED (no project; Phase 2) |
| Browser visual | real browser, 360px + 1280px, map tiles | manual | NOT EXECUTED (no headless tooling here) |

## 2. Strategy
- Unit: `lib/eta.ts` (haversine fixtures, speed variants, stale cutoff), `lib/routes.ts` ranking, Zod schemas (valid + boundary + hostile inputs).
- Component: states per UI_UX §6 — loading skeleton, empty, error, success toast, pending-vs-approved pins, login wall.
- Integration: Server Actions (report insert→pending, favorite upsert/delete + revalidate, admin approve/reject), Realtime two-client propagation.
- DB/AuthZ: RLS matrix below using 3 sessions (anon, commuter A/B, admin); run against local/staging, never prod.
- E2E (Playwright): guest map+search; commuter signup→report→favorite→share→logout; admin login→moderate→publish alert→expiry; mobile 360px + desktop 1280px; geolocation mocked granted/denied.

## 3. Required Cases per Feature
- Auth: signup creates `users` row role=commuter; duplicate email error; wrong password error; logout clears session; session persists refresh.
- Search/routes: ILIKE match, empty query state, no-result state, details ETA range + fare render.
- Reports: valid submit → pending + broadcast; overlong desc rejected; bad type rejected; rate-limit (2nd within 30s rejected); guest submit → login wall.
- Vehicles/share: start→marker moves on 2nd client; stop→inactive; >5min stale hidden; out-of-range coords rejected.
- Favorites: add/remove persists; commuter B cannot read/delete A's; guest → wall.
- Alerts: admin create → banner + list; expired hidden; severity colors correct.
- Admin: non-admin GET `/admin` → redirect/403; approve→visible, reject→hidden; alert CRUD.

## 4. Permission Matrix (must all pass from Phase 2 on)
| Table / op | Guest | Commuter (own) | Commuter (other's) | Admin |
|---|---|---|---|---|
| routes/stops read | ✅ | ✅ | ✅ | ✅ |
| routes/stops write | ❌ | ❌ | ❌ | ✅ |
| vehicles read | ✅ | ✅ | ✅ | ✅ |
| vehicles insert/update | ❌ | ✅ | ✅ (anon rows) | ✅ |
| reports read approved | ✅ | ✅ | ✅ | ✅ |
| reports read pending | ❌ (own ✅) | own ✅ | ❌ | ✅ |
| reports insert | ❌ | ✅ (as self) | ❌ | ✅ |
| alerts read live | ✅ | ✅ | ✅ | ✅ |
| alerts write | ❌ | ❌ | ❌ | ✅ |
| favorites | ❌ | own ✅ | ❌ | own ✅ |
| users role change | ❌ | ❌ | ❌ | ✅ via fn |

## 5. Actual Results (Phase 0, 2026-10-14)
Environment: Node v24.19.0, npm 11.17.0, git 2.55.0. Repo: no `package.json`, no git repo, no app code.
- `npm run lint` — NOT EXECUTED (no toolchain; no package.json).
- `npm run typecheck` — NOT EXECUTED (same reason).
- `npm run test` / unit / component / integration — NOT EXECUTED.
- RLS/permission tests — NOT EXECUTED (no Supabase project, no tables).
- E2E — NOT EXECUTED.
- `npm run build` — NOT EXECUTED (no Next.js scaffold).
No test has passed. No test has failed — all are **not executed**. Claiming otherwise is prohibited.

## 5b. Actual Results (Phase 1, 2026-10-15)
Environment: Node v24.19.0, npm 11.17.0, git 2.55.0. Next.js 14.2.35.
- `npm install` — RAN: 407 packages, deprecation warnings only (eslint-8/glob/rimraf chain); 1 pending optional postinstall (`unrs-resolver`, harmless).
- `npm run lint` — PASS: "No ESLint warnings or errors".
- `npm run typecheck` — PASS after fix: `lib/supabase/server.ts` `setAll` callback needed explicit `CookieOptions` param types under `strict` (fixed, re-ran clean).
- `npm run build` — PASS after fix: prerender of `/` + `/map` failed with `window is not defined` (Leaflet bundled server-side — `DemoMap.tsx` dynamic wrapper lacked `"use client"`); fixed, re-ran: "Compiled successfully", 17/17 static pages, all 11 routes listed.
- Prod smoke (`npm start` + HTTP GET) — PASS: 11/11 routes HTTP 200 (`/`, `/map`, `/search`, `/routes/demo-sampaguita-loop`, `/report`, `/alerts`, `/login`, `/signup`, `/favorites`, `/profile`, `/admin`).
- Tailwind palette check — PASS: `#16A34A` present in emitted `.next/static/css` bundle.
- Secret scan (`git ls-files` vs `.env*`/service-role patterns) — CLEAN; only `.env.example` tracked.
- Security headers (`next.config.mjs` per `docs/SECURITY.md` §8) — VERIFIED live: `/map` returns `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: geolocation=(self)`.
- NOT EXECUTED: unit/E2E (no framework yet), RLS matrix (no Supabase), browser visual (no headless tooling): map tile rendering, 360px/1280px layouts, console-error check.

## 5c. Actual Results (Phase 2, 2026-10-15)
Environment: same as Phase 1. Supabase project configured via gitignored `.env.local`
(base URL only, no `/rest/v1/`; new-style publishable key).
- `npm run lint` — PASS: "No ESLint warnings or errors" (after 1 fix: unescaped `'` in AuthForm).
- `npm run typecheck` — PASS (after 2 fixes: `Array.from(new Set(...))` in `lib/db.ts` for the default ES5 target; explicit `CookieOptions` types on the middleware `setAll` callback).
- `npm run build` — PASS: "Compiled successfully", 17/17 static pages. Session-reading pages correctly render dynamic (ƒ); middleware 86.1 kB.
- Supabase connectivity (read-only REST, no data created) — PASS: `GET /auth/v1/health` returns GoTrue status; `GET /rest/v1/routes` returns 404 `PGRST205` "Could not find the table 'public.routes'" (proves the project is reachable AND the migration is genuinely not applied); invalid-credentials login returns 400 (Auth rejects correctly).
- Prod smoke (`npm start` + HTTP GET) — PASS with one transient: 10/11 routes 200 on first pass with a single 500 on `/routes/demo-sampaguita-loop`; immediate retry and a later clean-server run gave 6/6 stable 200s plus correct 404 for unknown ids and zero server-log errors. Transient recorded as OPEN-03 (cause undetermined, not reproduced).
- Guest-state checks — PASS: logged-out `/favorites` and `/profile` render their login walls (server-side session check works against the live project).
- Secret scan — CLEAN: key material and project URL appear ONLY in untracked `.env.local`; tracked-file grep for `sb_publishable_[A-Za-z0-9_-]{10,}` and the project URL returns nothing; only `.env.example` (placeholders) is tracked. Service-role key: never provided, never used; `createAdminClient` remains unimported.
- NOT EXECUTED: migration apply (needs SQL Editor access — file is ready for the user); RLS permission matrix (needs applied tables + test sessions — `supabase/verify-phase2.sql` provided for post-apply checks); real signup/login/logout E2E (would create auth users — left for the user); email-confirmation behavior (depends on project mail settings, unverified); `supabase gen types` (needs CLI login — hand-maintained `types/database.ts` used instead); browser visual.

## 5d. Actual Results (Phase 2 verification, 2026-10-15 — migration applied by user)
- `npm run lint` — PASS, no warnings/errors (no code changes since §5c).
- `npm run typecheck` — PASS.
- `npm run build` — PASS: "Compiled successfully", 17/17 static pages.
- Tables confirmed live (read-only REST, anon key): `routes/stops/vehicles/reports/favorites` → 200 with 0 rows (tables exist; no seed rows yet); `alerts` + `users` SELECT → empty-401. Bad-column probe on `alerts` → 400 while a missing table → 404 PGRST205, proving the 401 happens at the privilege stage (table resolves, anon lacks table-level privilege) — recorded as OPEN-04, fail-closed (safe direction). No RLS bypass, no data touched.
- Anon write-denial suite (nothing creatable, all correctly denied) — PASS:
  `POST favorites` → 401 + `42501 new row violates row-level security policy` (RLS proven enforcing);
  `POST reports` → 401 + same 42501 proof;
  `POST routes` → 401 empty (no anon insert path by design);
  `PATCH users` role → 401 (self-escalation impossible anonymously).
- Prod smoke vs migrated DB (`npm start` + HTTP GET) — PASS: 11/11 routes 200, `/search` correctly stays in labeled demo mode (routes table empty), no OPEN-03 recurrence, no server-log errors.
- Remediation prepared (NOT applied — needs user SQL Editor run): `supabase/migrations/20261015000001_phase2_privilege_repair.sql` (GRANTs only, idempotent, includes pre-run privilege diagnostic). Rationale in `docs/TESTING.md` §6 PRIV-01.
- NOT EXECUTED (need a real browser + user-owned test accounts — steps in §6 AUTH-02): signup/email-confirmation behavior, login, session persistence across refresh, logout + wall return, invalid-login messaging in-app, favorites add/remove E2E, two-account owner isolation, authenticated role-escalation probe, `supabase gen types`, browser visual.

## 6. Defects / Unresolved
- SETUP-01: RESOLVED Phase 1.
- SETUP-02: still open (no GitHub remote; user push steps unchanged).
- SETUP-03: RESOLVED — env configured, connectivity verified, tables confirmed live (7/7 resolve via REST).
- MIGRATE-01: RESOLVED — user applied `20261015000000_phase2_core_schema.sql` and reports `verify-phase2.sql` checks passed. REST confirms 7/7 tables exist; policies/functions per user's verify run (not independently observable via REST).
- PRIV-01 (USER ACTION REQUIRED): anon SELECT denied (empty 401) on `alerts` + `users` while siblings allow it — privilege-stage denial, fail-closed. Fix prepared: run `supabase/migrations/20261015000001_phase2_privilege_repair.sql` (GRANTs only, idempotent, includes diagnostic query) in the SQL Editor, then re-check: anon `GET /rest/v1/alerts?select=id` should return 200. Until then, guests see demo alerts (app unaffected — alerts page is demo-scoped) but logged-in users may also miss live alerts/profile rows; no vulnerability either way.
- RLS-01: PARTIAL — anon write-denials proven live (favorites + reports 42501, routes + users 401). Authenticated half of the matrix (own vs other's favorites/reports, admin paths) NOT executed — needs test sessions (AUTH-02). RLS never disabled; no policy text changed.
- AUTH-01: code complete; live user flows NOT executed (would create real auth rows; needs user's browser).
- AUTH-02 (USER MANUAL TESTS, `npm run dev` → http://localhost:3000):
  1. Optional but recommended: run `supabase/seed.sql` first (SAMPLE routes enable the live-search + favorite tests).
  2. `/signup` with a test email → record whether you get a session (redirect to `/profile`) or the green "check your email" notice (answers the email-confirmation question; do NOT share the password with anyone).
  3. Same email again → expect "already registered" message.
  4. `/login` with a wrong password → expect "Incorrect email or password."
  5. Log in → nav shows Profile; open `/profile` (email + `commuter` badge after migration); refresh the page → still logged in (session persistence).
  6. Log out → `/favorites` + `/profile` show login walls again.
  7. Log in, open a Live-badged route (seeded SAMPLE), star it → `/favorites` lists it; remove it → list empties.
  8. Second account in an incognito window + its own favorite → each account sees ONLY its own list (owner isolation). Never share credentials; just compare screens.
  9. Report back which steps passed/failed; do NOT paste passwords, tokens, or JWTs anywhere.
- VERCEL-01: still open (needs the two `NEXT_PUBLIC_*` names at deploy time).
- OPEN-01 (browser visual), OPEN-02 (Prettier): unchanged.
- OPEN-03: no recurrence in this pass (11/11 + route re-hits clean).
- OPEN-04: alerts/users anon-401 anomaly (see PRIV-01). Fail-closed; repair prepared.
- BUG-01, BUG-02: remain fixed/verified.
