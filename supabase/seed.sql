-- PARA PO sample seed — FICTIONAL demonstration rows only (dev use).
-- Run AFTER 20261015000000_phase2_core_schema.sql, in the SQL Editor.
-- NEVER treat these as official routes, fares, or verified data
-- (see docs/DATABASE_SCHEMA.md §5).

insert into public.routes (id, name, origin, destination, fare)
values
  ('11111111-1111-4111-8111-111111111111',
   'SAMPLE — Sampaguita Loop (fictional)', 'Sample Plaza Sampaguita',
   'Sample Ilang-Ilang Crossing', 13),
  ('22222222-2222-4222-8222-222222222222',
   'SAMPLE — Kamuning Shuttle (fictional)', 'Sample Kamuning Market',
   'Sample Scout Circle', 15)
on conflict (id) do nothing;

insert into public.stops (route_id, name, latitude, longitude)
values
  ('11111111-1111-4111-8111-111111111111', 'SAMPLE Stop — Plaza Sampaguita', 14.5826, 120.9781),
  ('11111111-1111-4111-8111-111111111111', 'SAMPLE Stop — Ilang-Ilang Crossing', 14.5912, 120.9845),
  ('22222222-2222-4222-8222-222222222222', 'SAMPLE Stop — Kamuning Market', 14.6371, 121.0354),
  ('22222222-2222-4222-8222-222222222222', 'SAMPLE Stop — Scout Circle', 14.6435, 121.0412);

insert into public.alerts (title, message, severity, expires_at)
values
  ('SAMPLE alert: demo roadworks (fictional)',
   'Fictional roadworks slow the sample shuttle this weekend.',
   'warning', now() + interval '3 days');
