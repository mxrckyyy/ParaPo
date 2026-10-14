# PARA PO — Database Schema (Supabase / PostgreSQL)

> Source: `BiyaheMate.pdf` §4.4 + §7.1, hardened with constraints/RLS. This doc must be updated with every migration. Sample/seed data ≠ verified production data.

## 1. Tables

### users — one row per auth user (app profile, not auth itself)
| col | type | constraints |
|---|---|---|
| id | uuid PK | `REFERENCES auth.users(id) ON DELETE CASCADE` |
| email | text | |
| role | text | `DEFAULT 'commuter' CHECK (role IN ('commuter','admin','operator'))` |
| created_at | timestamptz | `DEFAULT now()` |
Purpose: role + profile. Created by trigger on `auth.users` insert (see §4). RLS: users read own row; admins list; role writes admin-only via function.

### routes — PUV routes
| col | type | constraints |
|---|---|---|
| id | uuid PK | `DEFAULT gen_random_uuid()` |
| name | text NOT NULL | e.g. "Quiapo–Fairview Jeep" |
| origin / destination | text NOT NULL | searchable |
| fare | numeric | `CHECK (fare >= 0)` |
| geometry | jsonb | optional `[[lat,lng],…]` path; validate array client/server |
Purpose: search + details. Indexes: `idx_routes_dest (destination)`, trigram GIN (Phase 2: `pg_trgm` on name/origin/destination).

### stops — physical stops per route
| col | type | constraints |
|---|---|---|
| id | uuid PK | `DEFAULT gen_random_uuid()` |
| route_id | uuid NOT NULL | `REFERENCES routes(id) ON DELETE CASCADE` |
| name | text NOT NULL | |
| latitude / longitude | numeric NOT NULL | `CHECK (lat BETWEEN -90 AND 90, lng BETWEEN -180 AND 180)` |
Index: `idx_stops_route (route_id)`.

### vehicles — live PUV sightings (crowdsourced MVP)
| col | type | constraints |
|---|---|---|
| id | uuid PK | `DEFAULT gen_random_uuid()` |
| route_id | uuid | `REFERENCES routes(id) ON DELETE SET NULL` |
| latitude / longitude | numeric NOT NULL | range checks as above |
| last_updated | timestamptz | `DEFAULT now()` |
| status | text | `DEFAULT 'active' CHECK (status IN ('active','full','inactive'))` |
Notes: NO `user_id` (privacy); coarse precision recommended (~4–5 decimals). Indexes: `idx_vehicles_route_updated (route_id, last_updated DESC)`. Client hides `last_updated < now()-5min` or `status='inactive'`; purge via cron (future).

### reports — crowdsourced disruptions
| col | type | constraints |
|---|---|---|
| id | uuid PK | `DEFAULT gen_random_uuid()` |
| user_id | uuid NOT NULL | `REFERENCES users(id) ON DELETE CASCADE` |
| type | text NOT NULL | `CHECK (type IN ('traffic','full','accident','closure'))` |
| latitude / longitude | numeric NOT NULL | range checks |
| description | text | `CHECK (char_length(description) <= 500)` |
| created_at | timestamptz | `DEFAULT now()` |
| status | text | `DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected'))` |
Indexes: `idx_reports_created (created_at DESC)`, `idx_reports_status (status)`.

### alerts — admin broadcasts
| col | type | constraints |
|---|---|---|
| id | uuid PK | `DEFAULT gen_random_uuid()` |
| title / message | text NOT NULL | message ≤1000 chars |
| severity | text NOT NULL | `CHECK (severity IN ('info','warning','critical'))` |
| created_at | timestamptz | `DEFAULT now()` |
| expires_at | timestamptz | nullable (null = until deleted) |
Index: `idx_alerts_expires (expires_at)`. Read filter: `expires_at IS NULL OR expires_at > now()`.

### favorites — saved routes/stops per user
| col | type | constraints |
|---|---|---|
| id | uuid PK | `DEFAULT gen_random_uuid()` |
| user_id | uuid NOT NULL | `REFERENCES users(id) ON DELETE CASCADE` |
| route_id | uuid NULL | `REFERENCES routes(id) ON DELETE CASCADE` |
| stop_id | uuid NULL | `REFERENCES stops(id) ON DELETE CASCADE` |
| created_at | timestamptz | `DEFAULT now()` |
Constraints: `CHECK ((route_id IS NULL) <> (stop_id IS NULL))` (exactly one set); `UNIQUE (user_id, route_id, stop_id)` (null-safe via partial indexes in migration if needed — document exact DDL there).

## 2. Relationships
`users 1—< reports, favorites`; `routes 1—< stops, vehicles`; `routes/stops 1—< favorites`; `alerts` standalone; `vehicles` deliberately user-anonymous.

## 3. RLS Policies (to be committed as migration; enable RLS on all 7 tables)
```sql
-- helper: admin check (used by policies; no client role writes)
create or replace function public.is_admin() returns boolean
language sql security definer set search_path = public as $$
  select exists (select 1 from public.users where id = auth.uid() and role = 'admin');
$$;

-- routes/stops: public read, admin write
create policy "routes public read" on routes for select using (true);
create policy "routes admin write" on routes for all using (public.is_admin()) with check (public.is_admin());
-- (mirror for stops)

-- vehicles: public read active-recent recommended; authed insert/update; admin delete
create policy "vehicles public read" on vehicles for select using (true);
create policy "vehicles authed insert" on vehicles for insert to authenticated with check (true);
create policy "vehicles authed update" on vehicles for update to authenticated using (true);
create policy "vehicles admin delete" on vehicles for delete using (public.is_admin());

-- reports: public sees approved + own; authed insert; owner-or-admin update/delete
create policy "reports public read" on reports for select using (status='approved' or auth.uid()=user_id);
create policy "reports authed insert" on reports for insert to authenticated with check (auth.uid()=user_id);
create policy "reports owner/admin update" on reports for update using (auth.uid()=user_id or public.is_admin());
create policy "reports owner/admin delete" on reports for delete using (auth.uid()=user_id or public.is_admin());

-- alerts: public reads live; admin writes
create policy "alerts public read" on alerts for select using (expires_at is null or expires_at > now());
create policy "alerts admin write" on alerts for all using (public.is_admin()) with check (public.is_admin());

-- favorites: owner-only
create policy "favorites owner all" on favorites for all using (auth.uid()=user_id) with check (auth.uid()=user_id);

-- users: own read; admin list; no direct role self-edit (role change via admin function only)
create policy "users own read" on users for select using (auth.uid()=id or public.is_admin());
```
Test matrix in `docs/TESTING.md` covers guest/commuter/admin × each table.

## 4. Triggers / Functions / Migrations
- `handle_new_user()`: `AFTER INSERT ON auth.users` → `INSERT INTO public.users(id, email)` with `role='commuter'`; SECURITY DEFINER.
- `is_admin()` above (SECURITY DEFINER, `search_path=public` fixed).
- `set_role(target uuid, new_role text)`: admin-only wrapper; checks `is_admin()`, validates enum.
- Migrations: `supabase/migrations/YYYYMMDDHHMMSS_<name>.sql`, numbered, committed; never edit applied migrations — new migration to fix.
- Phase 2 migration: `supabase/migrations/20261015000000_phase2_core_schema.sql`
  implements §1–§4 exactly (incl. trigram index, partial unique favorites indexes,
  function revokes) — STATUS: committed, NOT APPLIED (needs user SQL Editor run;
  non-destructive, CREATE-only). `supabase/seed.sql` (SAMPLE rows) and
  `supabase/verify-phase2.sql` (read-only checks) accompany it.
- Admin grant (secure, run in SQL editor or script with service-role, never client):
```sql
update public.users set role='admin' where email='admin@example.com';
```
First admin bootstrapped this way; thereafter via `set_role`.

## 5. Sample vs Production Data
- `supabase/seed.sql` = clearly fake (e.g., "Sample Jeep Route 1", coords around Luneta) for dev only; must never be mistaken for verified routes/fares.
- Production route/fare/stop data requires operator/LTFRB verification; UI must badge unverified rows until then (see `docs/UI_UX_GUIDELINES.md` §9.4).

## 6. Updating This Document
Every migration that adds/alters tables, columns, checks, indexes, policies, triggers, or functions must update §1–§4 here in the same PR, plus `docs/CHANGELOG.md` entry.
