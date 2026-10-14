# PARA PO — Security

## 1. AuthN / AuthZ Design
- Supabase Auth email/password; sessions in `httpOnly` cookies via `@supabase/ssr` (browser + server clients); `middleware.ts` refreshes tokens.
- Enforcement order: **RLS (DB) → server-side checks (actions/routes/middleware) → UI gating (UX only).** UI hiding is never a control.
- Roles: `commuter` (default), `admin`, `operator` (reserved future). Role lives in `public.users.role`; settable only via `is_admin()`-gated function (`docs/DATABASE_SCHEMA.md` §4).

## 2. Env / Secret Handling
- Public (safe in client): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_MAP_TILE_URL`, optional `NEXT_PUBLIC_MAPBOX_TOKEN`.
- Secret (server-only): `SUPABASE_SERVICE_ROLE_KEY` — Vercel server env + local `.env.local` (gitignored) only. Never `NEXT_PUBLIC_`, never committed, never imported in client bundles.
- `.env.local` / `.env*.local` gitignored; `.env.example` documents names with placeholder values. Vercel env set via dashboard, preview vs production separated.

## 3. RLS Requirements
- RLS enabled on all 7 tables before any prod data. Policies per `docs/DATABASE_SCHEMA.md` §3.
- Every new table ships with `ENABLE ROW LEVEL SECURITY` + deny-by-default + explicit policies in the same migration; PR blocked without policy tests (`docs/TESTING.md` matrix).

## 4. Server-Side Permission Checks
- `/admin` layout + each admin action re-checks `is_admin()` server-side (cookie session), even though RLS also blocks.
- Mutations verify `auth.uid()` ownership (reports/favorites); rate limits enforced server-side (report 1/30s/user; vehicle update 1/10s/client) — client throttling is UX, server check is control.
- Service-role client (`lib/supabase/admin.ts`) only in Route Handlers/scripts; lint rule / code review must reject client imports of it.

## 5. Input Validation / Output Handling
- Zod schemas (`lib/validations.ts`): enums for type/status/severity/role; lat/lng ranges; desc ≤500, alert message ≤1000; fare ≥0.
- Server re-validates everything; client validates for UX. Render user text via React escaping (no `dangerouslySetInnerHTML`); map popups text-only; URLs never built from raw user input.

## 6. Rate Limiting / Abuse Prevention
- MVP: server timestamp checks (reports, vehicle updates); admin delete + `rejected` status for spam; future: Supabase rate limits / Upstash sliding window + report votes + auto-hide threshold.
- Realtime: one channel per table per view; vehicle payloads minimal (id, route_id, lat, lng, status, last_updated); throttle 10–15s.

## 7. Privacy (Personal + Location)
- `vehicles` rows carry no `user_id`; recommend ~4-decimal precision; stale (>5 min) hidden/purged; explicit start/stop consent pill for sharing.
- Reports store `user_id` but public reads show only `approved` rows; no email exposure (join only own row or admin).
- Geolocation permission-gated with manual-pin fallback; no background tracking; no third-party trackers in MVP.

## 8. Deployment Security
- Vercel: auto-deploy on push; env per environment; production branch protected, PR reviews for migrations/policy changes.
- Supabase: separate account OK; anon key + URL copied manually; service-role only in Vercel server env + local gitignored file; dashboard MFA on; backups on before prod seed.
- Headers (Phase 1 `next.config`): `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy: geolocation=(self)`; CSP evaluated in Phase 4 (OSM tiles + Supabase wss allowlist).

## 9. Testing Procedures / Known Risks
- Procedures: RLS matrix test (guest/commuter/admin × tables — `docs/TESTING.md`), Zod fuzz (out-of-range coords, overlong text, bad enums), admin-route probe without session, service-role import grep (`grep -r service_role --include=*.tsx components app` must be empty), secret grep (no `eyJh` service key in repo).
- Known risks (open): crowdsourced data unverified (mitigation: pending-default + moderation + "unverified" badge); ETA is heuristic, not traffic-aware (labeled estimate); free-tier Supabase quotas; OSM tile availability; no WAF/bot protection in MVP — documented, deferred to post-MVP hardening.
