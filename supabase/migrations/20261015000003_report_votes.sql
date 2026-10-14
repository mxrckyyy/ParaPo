-- PARA PO report votes (Phase 5) — community accuracy signals on reports.
-- One vote per user per report: value 1 (confirmed) or -1 (inaccurate).
-- CREATE-only, RLS enforced, table privileges granted inline (PRIV-01 lesson:
-- never rely on ambient default privileges). Safe to run repeatedly? No:
-- run once; re-running fails on existing objects (by design — fix forward).
-- Apply in Supabase Dashboard → SQL Editor.

create table public.report_votes (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  value smallint not null check (value in (1, -1)),
  created_at timestamptz not null default now(),
  unique (report_id, user_id)
);

create index idx_report_votes_report on public.report_votes (report_id);

alter table public.report_votes enable row level security;

-- Everyone may read tallies (counts only; no emails exposed).
create policy "report_votes public read" on public.report_votes
  for select using (true);

-- Signed-in users may manage ONLY their own votes (user_id from auth.uid()).
create policy "report_votes owner write" on public.report_votes
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select on public.report_votes to anon, authenticated;
grant insert, update, delete on public.report_votes to authenticated;
