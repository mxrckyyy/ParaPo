# PARA PO — System Design

## 1. Functional Requirements (MVP)
| ID | Requirement | Actor | Notes |
|---|---|---|---|
| F1 | View full-screen map with live vehicle + report markers | Guest, Commuter | Guest read-only |
| F2 | Search destination, view suggested routes | Guest, Commuter | ILIKE on routes/stops MVP |
| F3 | View route details: steps, fare, ETA | Guest, Commuter | ETA = haversine/speed heuristic |
| F4 | Sign up / log in / log out (email+password) | Commuter | Supabase Auth |
| F5 | Submit crowdsourced report (type+location+desc) | Commuter | → `pending`, realtime broadcast |
| F6 | View/filter reports on map + list | Guest, Commuter | Filter by type/status |
| F7 | Receive active alerts (banner + list) | Guest, Commuter | `expires_at > now()` |
| F8 | Save/remove favorite routes/stops | Commuter | Auth required |
| F9 | Share ride location ("I'm on/off vehicle") | Commuter | 10–15s throttled updates |
| F10 | Moderate reports (approve/reject/delete) | Admin | Dashboard |
| F11 | Create/expire alerts | Admin | CRUD on alerts |
| F12 | Manage profile + favorites | Commuter | View own data only |

## 2. Non-Functional Requirements
- Mobile-first responsive; PWA installable (Phase 4); <3s load on 4G (code-split map, tile lazy-load).
- Scalability via Supabase free tier → thousands of users; Realtime channels per table, not per row.
- Security: RLS everywhere, JWT cookies (`httpOnly` via `@supabase/ssr`), Zod validation, no service-role in client.
- Accessibility WCAG 2.1 AA basics: focus states, labels, 4.5:1 contrast, keyboard-operable map list alternative.
- Reliability: OSM tile outage and geolocation denial must degrade gracefully.

## 3. Actors
- **Anonymous visitor:** map, search, route details, reports list, alerts list. No submit/favorite/share.
- **Authenticated commuter:** all visitor abilities + F5/F8/F9 + profile.
- **Administrator:** all commuter abilities + F10/F11; `users.role='admin'`.

## 4. Workflows
### 4.1 Auth
Signup → `supabase.auth.signUp` → session cookie → trigger creates `users(id, email, role='commuter')` → redirect map/profile. Login → `signInWithPassword`. Logout → `signOut` + redirect. Guest → no redirect, read-only banner on gated actions.

### 4.2 Route search
Input → debounce 300ms → query `routes` (name/origin/destination ILIKE) + `stops` (name ILIKE → join routes) → rank exact > prefix > substring → select → details page: stops ordered, fare, ETA, Save-favorite (auth-gated).

### 4.3 Reporting
Tap Report → geolocation request (fallback manual pin) → type (`traffic|full|accident|closure`) + desc ≤500 chars → Zod → Server Action inserts `status='pending'` → Realtime INSERT → pin appears (pending styled differently until approved). Anti-abuse: 1 report/30s per user (server check), vote/moderation later.

### 4.4 Favorites
Route/stop page → ★ toggle → Server Action checks session → upsert/delete with uniqueness `(user_id, route_id, stop_id)` guard → `revalidatePath('/favorites')`.

### 4.5 Alerts
Admin creates (`title, message, severity, expires_at`) → Realtime INSERT → banner (critical=red, warning=amber, info=blue) + `/alerts` list; expired filtered out (`expires_at IS NULL OR expires_at > now()`).

### 4.6 Admin
Login → middleware + server check role → `/admin` lists `reports WHERE pending` + alerts table → approve (`approved`) / reject (`rejected`) / delete; audit via `updated_at` (add in migration if needed).

## 5. Database Entities / Relationships / Constraints / Indexes
Tables (full DDL in `docs/DATABASE_SCHEMA.md`): `users(1)—<(reports, favorites)`, `routes(1)—<(stops, vehicles, favorites)`, `stops(1)—<favorites`, `alerts` standalone.
- FKs with `ON DELETE CASCADE` for favorites/reports owned rows.
- Checks: `reports.type IN (...)`, `reports.status IN (...)`, `vehicles.status IN (...)`, `alerts.severity IN (...)`, `users.role IN (commuter,admin,operator)`, lat [-90,90], lng [-180,180], `favorites` exactly-one-of route/stop.
- Indexes: `reports(created_at DESC)`, `reports(status)`, `vehicles(route_id, last_updated)`, `stops(route_id)`, `alerts(expires_at)`, trigram/GIN on route search columns (Phase 2).

## 6. AuthN / AuthZ Flows
- AuthN: Supabase Auth email/password; JWT (access+refresh) in cookies; `middleware.ts` refreshes.
- AuthZ: (a) RLS first — `auth.uid()` row ownership + admin check via `public.users.role`; (b) server-side role re-check for `/admin` and admin actions; (c) UI gating is UX only, never the enforcement.

## 7. RLS Policies / Boundaries (summary; exact SQL in `docs/DATABASE_SCHEMA.md`)
- `routes/stops`: SELECT public; writes admin-only (service-role or admin policy).
- `vehicles`: SELECT public (active only recommended); INSERT/UPDATE authenticated with rate-limit; DELETE admin.
- `reports`: SELECT `approved` public + own rows; INSERT authenticated; UPDATE own pending OR admin; DELETE own pending OR admin.
- `alerts`: SELECT non-expired public; writes admin-only.
- `favorites`: owner-only all operations (`auth.uid()=user_id`).
- `users`: SELECT own row; admin list; role change admin-only via secure function.

## 8. Validation / Errors / Failures
- Zod on every mutation (type enums, coord ranges, length caps). Client pre-validates for UX; server re-validates for security.
- Error map: 401 → login prompt; 403 → "not permitted"; 429 → cooldown message; RLS denial → generic "couldn't save" (no policy leakage); Realtime disconnect → "Live updates paused — retrying" + manual refresh; geolocation denied → manual pin; tile fail → placeholder.
- Forms preserve input on error; loading skeletons for map/list; empty states with CTA.

## 9. Security Risks / Mitigations
| Risk | Mitigation |
|---|---|
| Fake reports / spam | Pending-by-default, rate limit, votes + moderation, admin delete |
| Location stalking via vehicles | Coarse precision (~4 decimals), only `active` + recent rows public, no user_id on vehicles |
| Privilege escalation | Role settable only via `is_admin()` SECURITY DEFINER fn; no client role writes |
| Key leakage | Anon key public-by-design + RLS; service-role server-only, gitignored |
| Realtime overload | One channel/table/view, throttle vehicle updates, pagination |

## 10. Data Sources / Realtime / ETA Limits
- MVP source: crowdsourced sightings — sparse, unverified, biased to active users. Labeled "Community-reported · unverified" in UI.
- Realtime: Supabase `postgres_changes` (at-least-once, unordered under load); client dedupes by `id+last_updated/created_at`.
- ETA: `ETA = haversine(user, vehicle)/assumed_speed + dwell_fudge`; assumed jeep 15–20 km/h city / bus 25 km/h; NO live traffic feed in MVP → display as range ("~8–12 min") with "estimate" disclaimer. Future: traffic-weighted model, operator GPS.
