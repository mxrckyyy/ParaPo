-- PARA PO reports admin-read widening — needed for the Phase 4 moderation
-- dashboard: admins must be able to SELECT other users' PENDING reports.
-- The base migration's "reports public read" policy only exposes approved rows
-- plus one's own, so an admin listing would otherwise come back empty.
-- ADDITIVE policy change only (one DROP + CREATE of a single policy, no data
-- changes, RLS stays enabled). Safe to run repeatedly (IF NOT EXISTS guards
-- are unavailable for policies, so the DROP makes it idempotent).
-- Apply in Supabase Dashboard → SQL Editor.

drop policy if exists "reports public read" on public.reports;

create policy "reports public read" on public.reports
  for select using (
    status = 'approved'
    or auth.uid() = user_id
    or public.is_admin()
  );

-- REQUIRED companion grant: the widened policy calls is_admin() while
-- evaluating rows for EVERY role, including anon. The base migration revoked
-- EXECUTE on is_admin() from anon, so without this grant every anonymous
-- SELECT on reports would fail with "permission denied for function"
-- instead of returning approved rows. Granting EXECUTE is safe: the function
-- only tests the CALLER's own row and always returns false for anon
-- (auth.uid() is NULL), leaking nothing about who the admins are.
grant execute on function public.is_admin() to anon;
