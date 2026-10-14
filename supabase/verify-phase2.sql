-- PARA PO Phase 2 verification — READ-ONLY. Run in the SQL Editor AFTER
-- applying 20261015000000_phase2_core_schema.sql. Every query must return rows.
-- If a check returns nothing, the migration did not apply cleanly.

-- 1. All 7 tables exist
select table_name from information_schema.tables
where table_schema = 'public'
  and table_name in ('users','routes','stops','vehicles','reports','favorites','alerts')
order by table_name;
-- expect: 7 rows

-- 2. RLS enabled on all 7
select tablename from pg_tables
where schemaname = 'public' and rowsecurity = true
  and tablename in ('users','routes','stops','vehicles','reports','favorites','alerts')
order by tablename;
-- expect: 7 rows

-- 3. Policies present (expect 15 rows with the names below)
select tablename, policyname from pg_policies
where schemaname = 'public' order by tablename, policyname;

-- 4. Helper functions exist
select proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and proname in ('is_admin','set_role','handle_new_user');
-- expect: 3 rows

-- 5. Signup trigger exists on auth.users
select trigger_name from information_schema.triggers
where trigger_name = 'on_auth_user_created';
-- expect: 1 row

-- 6. Extensions for UUIDs + trigram search
select extname from pg_extension where extname in ('pgcrypto','pg_trgm');
-- expect: 2 rows
