# PARA PO — Testing

## 1. Tools / Commands (intended; toolchain lands in Phase 1)
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

## 6. Defects / Unresolved
- SETUP-01: no Next.js scaffold → blocks all checks. Owner: dev. Next: Phase 1 `create-next-app`.
- SETUP-02: no git/GitHub remote → no CI. Next: `git init` + push + Vercel link.
- SETUP-03: no Supabase project/keys → no DB tests. Next: create project, set envs, run migrations.
- APP bugs: none yet (no code). This section must grow, never shrink without verified fix + regression test id.
