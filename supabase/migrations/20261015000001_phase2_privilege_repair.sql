-- PARA PO Phase 2 privilege repair — ADDITIVE ONLY (GRANTs, no DROPs, no data changes).
-- Safe to run repeatedly in Supabase Dashboard → SQL Editor.
--
-- Cause: anon SELECT on public.alerts / public.users is denied (empty 401)
-- while sibling tables allow it, even though all tables + RLS policies come
-- from 20261015000000_phase2_core_schema.sql. That pattern means the
-- anon/authenticated roles lack table-level privileges on those tables
-- (PostgREST checks privileges before RLS; without them it fails closed).
-- GRANTs can never weaken RLS: policies still filter every row.
--
-- Diagnose first (optional) — compare grants per table:
--   select table_name, grantee, string_agg(privilege_type, ', ' order by privilege_type)
--   from information_schema.role_table_grants
--   where table_schema = 'public'
--     and table_name in ('users','routes','stops','vehicles','reports','favorites','alerts')
--   group by table_name, grantee order by table_name, grantee;
-- Expect after this file: anon holds SELECT on the 5 public-read tables;
-- authenticated holds working privileges on all 7 (RLS still enforces rows).

-- Public-read tables: guests + signed-in users may read (RLS filters rows).
grant select on public.routes to anon, authenticated;
grant select on public.stops to anon, authenticated;
grant select on public.vehicles to anon, authenticated;
grant select on public.reports to anon, authenticated;
grant select on public.alerts to anon, authenticated;

-- Owner-scoped tables: signed-in users need privileges for RLS-filtered access.
grant select, insert, update, delete on public.favorites to authenticated;
grant select on public.users to authenticated;

-- Authenticated writes permitted by policy design (RLS still enforces terms).
grant insert, update, delete on public.vehicles to authenticated;
grant insert, update, delete on public.reports to authenticated;

-- Admin writes (Phase 4 moderation/alerts): RLS "admin write" policies gate
-- these to admins, but the authenticated role still needs table-level
-- privileges or admin INSERT/UPDATE/DELETE fails before RLS is evaluated.
-- Ordinary users remain blocked by the RLS policies themselves.
grant insert, update, delete on public.alerts to authenticated;
