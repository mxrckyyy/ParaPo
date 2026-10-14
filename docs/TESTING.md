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
| Purpose | Tool | Command |
|---|---|---|
| Lint | ESLint + Prettier | `npm run lint` |
| Types | TypeScript strict | `npm run typecheck` (`tsc --noEmit`) |
| Unit/Component | Vitest + Testing Library | `npm run test` / `test:unit` |
| E2E | Playwright | `npm run test:e2e` |
| DB/RLS | Supabase SQL + pgTAP or script | `npm run test:rls` (Phase 2) |
| Build | Next.js | `npm run build` |

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
Environment: Node v24.19.0, npm 11.17.0, git 2.55.0. Repo: no `package.json`, no git repo, no app code.
- `npm run lint` — NOT EXECUTED (no toolchain; no package.json).
- `npm run typecheck` — NOT EXECUTED (same reason).
- `npm run test` / unit / component / integration — NOT EXECUTED.
- RLS/permission tests — NOT EXECUTED (no Supabase project, no tables).
- E2E — NOT EXECUTED.
- `npm run build` — NOT EXECUTED (no Next.js scaffold).
No test has passed. No test has failed — all are **not executed**. Claiming otherwise is prohibited.

## 6. Defects / Unresolved
- SETUP-01: no Next.js scaffold → RESOLVED Phase 1 (manual in-place scaffold; `create-next-app` refused non-empty dir).
- SETUP-02: no git/GitHub remote → PARTIAL: local git initialized + 3 commits; GitHub remote NOT connected (`gh` CLI unavailable). Remaining: user creates repo (e.g. `parapo`), then `git remote add origin <url> && git push -u origin master`. Branch is `master` (local default).
- SETUP-03: no Supabase project/keys → STILL OPEN (Phase 2 prerequisite). `.env.example` ready; `gitignore`d `.env*.local`.
- VERCEL-01: no Vercel project (needs user auth). Remaining: `vercel` login / dashboard import of the GitHub repo, add env vars later (none needed for Phase 1 demo), deploy.
- BUG-01 (fixed): prerender `window is not defined` on `/` + `/map` — missing `"use client"` on `DemoMap.tsx` dynamic wrapper. Fixed + build re-verified.
- BUG-02 (fixed): `tsc` implicit-`any` on Supabase `setAll` callback — explicit `CookieOptions` types added. Re-verified.
- OPEN-01: browser visual check (map tiles, 360/1280px, console errors) not executed — needs a real browser. Suggested: `npm run dev`, open http://localhost:3000.
- OPEN-02: Prettier not configured (plan mentioned it; minor, optional).
- APP bugs beyond the above: none found. This section must grow, never shrink without verified fix + regression test id.
