-- PARA PO Phase 2 core schema — matches docs/DATABASE_SCHEMA.md §1–§4.
-- Apply in Supabase Dashboard → SQL Editor (paste whole file → Run).
-- Never edit after applying; fix forward with a new migration file.

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- ---------------------------------------------------------------- users
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  role text not null default 'commuter'
    check (role in ('commuter', 'admin', 'operator')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- routes
create table public.routes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  origin text not null,
  destination text not null,
  fare numeric check (fare is null or fare >= 0),
  geometry jsonb
);
create index idx_routes_dest on public.routes (destination);
create index routes_search_trgm on public.routes
  using gin (name gin_trgm_ops, origin gin_trgm_ops, destination gin_trgm_ops);

-- ---------------------------------------------------------------- stops
create table public.stops (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references public.routes (id) on delete cascade,
  name text not null,
  latitude numeric not null check (latitude between -90 and 90),
  longitude numeric not null check (longitude between -180 and 180)
);
create index idx_stops_route on public.stops (route_id);

-- ---------------------------------------------------------------- vehicles
create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  route_id uuid references public.routes (id) on delete set null,
  latitude numeric not null check (latitude between -90 and 90),
  longitude numeric not null check (longitude between -180 and 180),
  last_updated timestamptz not null default now(),
  status text not null default 'active'
    check (status in ('active', 'full', 'inactive'))
);
create index idx_vehicles_route_updated
  on public.vehicles (route_id, last_updated desc);

-- ---------------------------------------------------------------- reports
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  type text not null check (type in ('traffic', 'full', 'accident', 'closure')),
  latitude numeric not null check (latitude between -90 and 90),
  longitude numeric not null check (longitude between -180 and 180),
  description text check (char_length(description) <= 500),
  created_at timestamptz not null default now(),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected'))
);
create index idx_reports_created on public.reports (created_at desc);
create index idx_reports_status on public.reports (status);

-- ---------------------------------------------------------------- alerts
create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null check (char_length(message) <= 1000),
  severity text not null check (severity in ('info', 'warning', 'critical')),
  created_at timestamptz not null default now(),
  expires_at timestamptz
);
create index idx_alerts_expires on public.alerts (expires_at);

-- ---------------------------------------------------------------- favorites
create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  route_id uuid references public.routes (id) on delete cascade,
  stop_id uuid references public.stops (id) on delete cascade,
  created_at timestamptz not null default now(),
  check (num_nonnulls(route_id, stop_id) = 1)
);
-- Null-safe uniqueness: exactly one of route_id/stop_id is set, so partial
-- indexes enforce one favorite per user per route (or per stop).
create unique index favorites_route_uniq on public.favorites (user_id, route_id)
  where route_id is not null and stop_id is null;
create unique index favorites_stop_uniq on public.favorites (user_id, stop_id)
  where stop_id is not null and route_id is null;

-- ---------------------------------------------------------------- helpers
create or replace function public.is_admin() returns boolean
language sql security definer set search_path = public as $$
  select exists (select 1 from public.users where id = auth.uid() and role = 'admin');
$$;

create or replace function public.set_role(target_user uuid, new_role text)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'not permitted';
  end if;
  if new_role not in ('commuter', 'admin', 'operator') then
    raise exception 'invalid role: %', new_role;
  end if;
  update public.users set role = new_role where id = target_user;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, role)
  values (new.id, new.email, 'commuter')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Lock down SECURITY DEFINER functions: callable by signed-in users only,
-- authorization enforced inside (is_admin check).
revoke all on function public.is_admin() from public, anon, authenticated;
revoke all on function public.set_role(uuid, text) from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.set_role(uuid, text) to authenticated;

-- ---------------------------------------------------------------- RLS
alter table public.users enable row level security;
alter table public.routes enable row level security;
alter table public.stops enable row level security;
alter table public.vehicles enable row level security;
alter table public.reports enable row level security;
alter table public.alerts enable row level security;
alter table public.favorites enable row level security;

create policy "users own read" on public.users
  for select using (auth.uid() = id or public.is_admin());

create policy "routes public read" on public.routes
  for select using (true);
create policy "routes admin write" on public.routes
  for all using (public.is_admin()) with check (public.is_admin());

create policy "stops public read" on public.stops
  for select using (true);
create policy "stops admin write" on public.stops
  for all using (public.is_admin()) with check (public.is_admin());

create policy "vehicles public read" on public.vehicles
  for select using (true);
create policy "vehicles authed insert" on public.vehicles
  for insert to authenticated with check (true);
create policy "vehicles authed update" on public.vehicles
  for update to authenticated using (true);
create policy "vehicles admin delete" on public.vehicles
  for delete using (public.is_admin());

create policy "reports public read" on public.reports
  for select using (status = 'approved' or auth.uid() = user_id);
create policy "reports authed insert" on public.reports
  for insert to authenticated with check (auth.uid() = user_id);
create policy "reports owner/admin update" on public.reports
  for update using (auth.uid() = user_id or public.is_admin());
create policy "reports owner/admin delete" on public.reports
  for delete using (auth.uid() = user_id or public.is_admin());

create policy "alerts public read" on public.alerts
  for select using (expires_at is null or expires_at > now());
create policy "alerts admin write" on public.alerts
  for all using (public.is_admin()) with check (public.is_admin());

create policy "favorites owner all" on public.favorites
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
