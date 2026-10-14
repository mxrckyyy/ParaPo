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

## 5e. Actual Results (login crash fix, 2026-10-15 — no other code changes)
- `npm run lint` — PASS, no warnings/errors.
- `npm run typecheck` — PASS.
- `npm run build` — PASS (twice): "Compiled successfully", 17/17 static pages. Second build was a clean rebuild (`Remove-Item .next`) after BUILD-01 below.
- Prod smoke from clean build — PASS: `/login`, `/signup`, `/profile`, `/favorites`, `/` all 200; login page renders email + password fields.
- BUILD-01 (found + fixed during this task): `next start` crashed on every request with `Cannot find module './vendor-chunks/@supabase.js'` — stale/corrupt `.next` output, not source code. Fixed by deleting `.next` and rebuilding; all routes 200 after. Likely same family as the earlier transient OPEN-03 500 (single unreproduced `/routes/[id]` 500); OPEN-03 now considered explained — a corrupt build artifact, resolved by clean rebuild, no recurrence since.
- Live login with a real account NOT executed (needs the user's browser + own credentials) — exact retest steps in §6 AUTH-02a. No login success claimed.

## 5f. Actual Results (user browser tests, 2026-10-15 — existing account, localhost:3000)
User-verified PASS (reported by the user; not independently observable here):
- Login completed with NO runtime error (BUG-03 fix confirmed in real use).
- No red error box during successful login.
- Navigation to `/profile` worked (email displayed = server session read works logged-in).
- Refreshing `/profile` preserved the session.
- Logout returned to `/login`; `/favorites` + `/profile` required authentication after logout.
NOT covered by this report (do not assume): signup/confirmation, error-message paths, favorites E2E, second-account isolation, privilege-repair run, seed run.
- Re-run this pass: `lint` PASS · `typecheck` PASS · `build` PASS ("Compiled successfully", 17/17). No code changes since fd6f2b2.

## 7. Phase 2 Acceptance Checklist (evidence-linked; code review alone never = PASS)
### Authentication
| Check | Status | Evidence |
|---|---|---|
| Login succeeds without crash or red box | PASS (user browser) | User report 2026-10-15; fix fd6f2b2 |
| Profile navigation after login | PASS (user browser) | User report (email displayed) |
| Session persists across refresh | PASS (user browser) | User report |
| Logout → login page + walls on protected pages | PASS (user browser) | User report |
| Server identity correct logged-out (walls) | PASS | Smoke tests §5c/§5d |
| Server identity correct logged-in (email shown) | PASS (user browser) | User report |
| Signup + email-confirmation behavior | NOT EXECUTED | AUTH-02 steps 2–3 |
| Wrong-password / duplicate friendly errors | NOT EXECUTED | AUTH-02 steps 3–4 |
### Database and RLS
| Check | Status | Evidence |
|---|---|---|
| Migration applied, 7 tables present | PASS | User verify run + REST 7/7 resolve |
| Constraints, indexes, functions, trigger as designed | PASS (user-reported) | User `verify-phase2.sql` run; not REST-observable |
| RLS enabled on all 7 tables | PASS (user-reported) | Same verify run |
| Anonymous users cannot write (favorites/reports/routes/users role) | PASS | REST denials §5d (42501 + 401s) |
| Authenticated users limited to own records | NOT EXECUTED | Needs session tests |
| Favorites isolated between two accounts | NOT EXECUTED | Needs 2 accounts (AUTH-02 step 8) |
| Ordinary users cannot modify admin-only transport records | NOT EXECUTED (anon half proven) | Authenticated half needs a session |
| Users cannot self-grant admin | NOT EXECUTED (anon half proven) | Authenticated probe needs a session |
| Privilege repair applied + diagnostic checked | NOT EXECUTED | PRIV-01 file ready, awaiting user |
### Favorites and reports
| Check | Status | Evidence |
|---|---|---|
| Add/remove favorites with session | NOT EXECUTED | AUTH-02 steps 1+7 (run seed first) |
| Report submission auth/validation | NOT EXECUTED | Phase 3 feature; Phase 2 ships preview only |
### Verdict
Phase 2 gate (IMPLEMENTATION_PLAN.md: RLS matrix green, no mocks on data paths) is NOT met: the authenticated RLS half, favorites E2E, isolation, signup/confirmation, and error-path tests are outstanding, and demo fallback is still active (routes table empty). No FAILs recorded; nothing marked PASS without evidence.
### Remaining mandatory tests (exact steps)
1. PRIV-01: SQL Editor → run `supabase/migrations/20261015000001_phase2_privilege_repair.sql` → confirm anon `GET /rest/v1/alerts?select=id` returns 200 (I can re-check on request). This also unblocks the `commuter` role badge on `/profile`.
2. Seed (recommended): run `supabase/seed.sql` → `/search` should show Live-badged SAMPLE routes.
3. AUTH-02 remainder in the browser: signup/confirmation behavior, duplicate + wrong-password messages, star/remove a Live favorite, second-account isolation (incognito). Never share credentials; never paste tokens.
4. Report results per step → Phase 2 can then be marked COMPLETE.

## 5g. Actual Results (Phase 3 implementation, 2026-10-15)
- `npm run test` (Vitest 2.1.9, NEW harness) — PASS: 14/14 (`lib/eta.test.ts` 10: haversine zero/known-distance/symmetry, ETA range math, stale boundary/invalid; `lib/validations.test.ts` 4: report/vehicle schemas valid + hostile).
- `npm run lint` — PASS, no warnings/errors. `npm run typecheck` — PASS.
- `npm run build` — PASS: "Compiled successfully", 17/17 static pages (prerender executed all server data paths against the live project without errors). `/map` grew to 71.4 kB route JS (realtime client) — expected.
- Prod smoke from a SINGLE clean server instance — PASS: 12/12 routes 200 (all 11 + second demo route); `/map` renders filter chips + Live badge; logged-out `/report` shows the login wall. Zero server-log errors.
- Harness lesson (applies to OPEN-03 + BUILD-01): all previously observed `MODULE_NOT_FOUND` vendor-chunk failures were stale-server/port-contention artifacts of rapid kill→rebuild→restart smoke scripts (an old server kept :3000 while a newer build replaced `.next` under it), NOT product defects. With verified-single-instance discipline (port confirmed free before start), every run is clean. Vercel-style single-instance deploys are unaffected. No app-code change resulted.
- NOT EXECUTED (need two browsers + user-owned sessions): two-client realtime propagation, report rate-limit live rejection, stale-vehicle dimming in a live browser, realtime latency on 4G, ride-share start/move/stop E2E, geolocation granted/denied paths, `supabase gen types`, browser visual. Realtime ALSO needs the user to expose tables: Dashboard → Database → Replication → enable `vehicles`, `reports` (and `alerts` later) for the `supabase_realtime` publication — else subscriptions report `paused` and the UI falls back to server-loaded markers (verified fallback path renders).

## 5h. Actual Results (Phase 4 implementation, 2026-10-15)
- `npm run test` — PASS: 22/22 (3 files: eta 10, validations 8 incl. new alert schemas, markers 6).
- `npm run lint` — PASS. `npm run typecheck` — PASS (after 1 fix: `gateError` return type narrowed to the `ok:false` union member).
- `node --check public/sw.js` + `scripts/gen-icons.mjs` — PASS (syntax valid).
- `npm run build` — PASS: "Compiled successfully", 19/19 pages (`/manifest.webmanifest`, `/offline` added; prerender ran all server paths cleanly).
- Prod smoke, verified single instance — PASS: 15/15 routes 200 (13 pages + manifest + sw.js + icon PNG); manifest body inspected raw = valid JSON (name, short_name, standalone, 3 icons incl. maskable); logged-out `/admin` shows the admin login wall.
- Generated icons verified: PNG signatures + 192/512 dimensions correct (placeholder geometric branding, documented for replacement).
- NOT EXECUTED (need browser/dashboard/Vercel): PWA installability + Lighthouse, SW install/update behavior offline, admin E2E (approve→visible / reject→hidden / alert publish→banner / expiry), two-client realtime (carried), Phase 2 manual remainder (carried, unchanged). No deploy performed — no prod URL claimed.
- New pending user SQL (non-destructive): `20261015000002_reports_admin_read.sql` (widens reports SELECT with `is_admin()` so the moderation list works) alongside PRIV-01 + RT-01.

## 6. Defects / Unresolved Realtime ALSO needs the user to expose tables: Dashboard → Database → Replication → enable `vehicles`, `reports` (and `alerts` later) for the `supabase_realtime` publication — else subscriptions report `paused` and the UI falls back to server-loaded markers (verified fallback path renders).
- SETUP-01: RESOLVED Phase 1.
- SETUP-02: still open (no GitHub remote; user push steps unchanged).
- SETUP-03: RESOLVED — env configured, connectivity verified, tables confirmed live (7/7 resolve via REST).
- MIGRATE-01: RESOLVED — user applied `20261015000000_phase2_core_schema.sql` and reports `verify-phase2.sql` checks passed. REST confirms 7/7 tables exist; policies/functions per user's verify run (not independently observable via REST).
- PRIV-01 (USER ACTION REQUIRED): anon SELECT denied (empty 401) on `alerts` + `users` while siblings allow it — privilege-stage denial, fail-closed. Fix prepared: run `supabase/migrations/20261015000001_phase2_privilege_repair.sql` (GRANTs only, idempotent, includes diagnostic query) in the SQL Editor, then re-check: anon `GET /rest/v1/alerts?select=id` should return 200. Until then, guests see demo alerts (app unaffected — alerts page is demo-scoped) but logged-in users may also miss live alerts/profile rows; no vulnerability either way.
- RLS-01: PARTIAL — anon write-denials proven live (favorites + reports 42501, routes + users 401). Authenticated half of the matrix (own vs other's favorites/reports, admin paths) NOT executed — needs test sessions (AUTH-02). RLS never disabled; base policy text unchanged (only the additive ...00002 widening prepared).
- RLS-02 (USER ACTION REQUIRED): run `supabase/migrations/20261015000002_reports_admin_read.sql` so admins can SELECT others' pending reports (base policy only exposes approved + own rows). Policy-widening only, no data changes, RLS stays enabled. Until applied, the moderation queue shows an empty-state hint instead of real rows.
- ADMIN-01 (USER BROWSER TESTS): with an admin account (bootstrap via `DATABASE_SCHEMA.md` §4 grant, then `set_role`), verify pending→approve appears on `/map`, reject hides, alert publish shows banner + `/alerts`, expired alert hidden, non-admin sees "Not permitted", logged-out sees login wall.
- PWA-01 (USER BROWSER TESTS): installability prompt + Lighthouse PWA check; offline `/offline` fallback; tile caching on flaky network.
- DEPLOY-01 (USER ACTION REQUIRED): Vercel project from the GitHub repo with `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (+ optional tile URL); no prod URL exists until then — MVP "all on prod" gate criterion is unmet by definition.
- AUTH-01: code complete; live user flows NOT executed (would create real auth rows; needs user's browser).
- AUTH-02a: COMPLETE — user verified login (no crash, no red box), profile nav + email, refresh persistence, logout + walls (2026-10-15).
- AUTH-02 (remaining USER MANUAL TESTS, `npm run dev` → http://localhost:3000):
  1. Optional but recommended: run `supabase/seed.sql` first (SAMPLE routes enable the live-search + favorite tests below).
  2. `/signup` with a test email → record session-redirect vs green "check your email" notice (answers email-confirmation; do NOT share the password).
  3. Same email again → expect "already registered"; `/login` with wrong password → expect "Incorrect email or password."
  4. Log in, open a Live-badged route (seeded SAMPLE), star it → `/favorites` lists it; remove it → list empties.
  5. Second account in an incognito window + its own favorite → each account sees ONLY its own list (owner isolation). Never share credentials; just compare screens.
  6. Report back which steps passed/failed; do NOT paste passwords, tokens, or JWTs anywhere.
- VERCEL-01: still open (needs the two `NEXT_PUBLIC_*` names at deploy time).
- OPEN-01 (browser visual), OPEN-02 (Prettier): unchanged.
- OPEN-03: closed — reattributed to harness port-contention (see §5g harness lesson), not a product defect.
- BUILD-01 (reclassified, not a product defect): the `vendor-chunks` MODULE_NOT_FOUND crashes recurred and were traced to stale servers holding :3000 while newer builds replaced `.next` underneath (see §5g). Single-instance runs are clean; no app-code change.
- RT-01 (USER ACTION REQUIRED for live updates): expose `vehicles` + `reports` (+ `alerts` in Phase 4) in Dashboard → Database → Replication for the `supabase_realtime` publication. Until then the map shows server-loaded markers with a "paused" badge — verified working fallback, no errors.
- OPEN-04: alerts/users anon-401 anomaly (see PRIV-01). Fail-closed; repair prepared, still awaiting user run.
- BUG-03 (fixed): login crash `TypeError: Cannot read properties of undefined (reading 'ok')` in `AuthForm.tsx`. Root cause: `signIn`/`signUp` ended with server-side `redirect()`, which throws NEXT_REDIRECT; when awaited imperatively from the submit handler, the client dispatcher consumes the redirect and the promise resolves `undefined` — so the crash hit exactly on successful login. Fix: actions now return `{ ok, confirmationSent, redirectTo }` on every path (no `redirect()` in actions; nothing thrown or swallowed); `AuthForm` navigates via `router.push(redirectTo)` + `router.refresh()`; same pattern applied to `signOut`/`LogoutButton`; defensive `if (!outcome)` guard added as backstop only. Zod, Supabase calls, friendly errors, and confirmation flow unchanged. Verified by lint/typecheck/build + smoke; live login still needs AUTH-02a.
- BUILD-01 (fixed): corrupt `.next` output crashed `next start` (`Cannot find module './vendor-chunks/@supabase.js'`). Fixed by clean rebuild; all routes 200.
- AUTH-02a (USER LOGIN RETEST — `npm run dev` → http://localhost:3000, use your existing account, never share the password):
  1. Open `/login`, enter your email + password, submit → expect navigation to `/profile` showing your email (NO crash, NO error banner).
  2. If you instead see "Incorrect email or password," the fix still worked (that is the friendly-error path) — double-check the credentials.
  3. On `/profile`, refresh the browser → you stay logged in (session persists).
  4. Click Log out → you return to `/login`; `/favorites` and `/profile` show login walls.
  5. Report which steps passed; on ANY red error box, paste its exact text (no tokens/passwords).
- BUG-01, BUG-02: remain fixed/verified.
