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
