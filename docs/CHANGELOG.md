# PARA PO — Changelog

All significant changes by phase. Docs updated per Maintenance Rules; test claims only with real results.

## [Phase 0] — 2026-10-14 — Docs baseline + rename to PARA PO
- Renamed project BiyaheMate → PARA PO (owner request); `BiyaheMate.pdf` kept as reference spec.
- Created: `docs/PROJECT_CONTEXT.md` (purpose, stack, status, env names, recovery procedure).
- Created: `docs/ARCHITECTURE.md` (target App Router layout, BaaS design, 3-client Supabase pattern, safe-change rules).
- Created: `docs/SYSTEM_DESIGN.md` (F1–F12, NFRs, 7 workflows, RLS summary, ETA limits).
- Created: `docs/UI_UX_GUIDELINES.md` (palette `#16A34A`/`#0F172A`/`#F59E0B`, responsive, marker contract, consistency rules).
- Created: `docs/IMPLEMENTATION_PLAN.md` (Phases 0–5+, gates).
- Created: `docs/DATABASE_SCHEMA.md` (7 tables, constraints, indexes, RLS SQL, `is_admin`/`handle_new_user`, admin-grant, seed-vs-prod rule).
- Created: `docs/SECURITY.md` (RLS-first, server checks, Zod, rate limits, privacy, deploy).
- Created: `docs/TESTING.md` (strategy, RLS matrix, Phase 0 not-executed results).
- Created: `docs/CHANGELOG.md` (this file).
- Modified: none (no code existed). Deleted: none.
- Migrations: none. Verification: env baseline only — Node v24.19.0 / npm 11.17.0 / git 2.55.0; no package.json; no git repo; lint/type/test/build NOT EXECUTABLE (recorded, not passed).
- Decisions: BaaS-only (solo dev speed); Leaflet+OSM (free); crowdsourcing-first; anon `vehicles` rows + 5-min stale rule (privacy/perf).
- Bugs: no app bugs (no code); blockers SETUP-01–03 carried to Phase 1.

## [Phase 0] — 2026-10-14 — Moved docs into `docs/`
- Moved all 9 `.md` files from project root into `docs/` with no content changes except path references; no duplicates remain in root.
- Updated `docs/PROJECT_CONTEXT.md` recovery procedure to the 10-step `docs/`-prefixed sequence; `docs/PROJECT_CONTEXT.md` confirmed as main persistent context file.
- Updated file-location references in `docs/ARCHITECTURE.md`, `docs/SYSTEM_DESIGN.md`, `docs/DATABASE_SCHEMA.md`, `docs/SECURITY.md`, `docs/IMPLEMENTATION_PLAN.md`, `docs/PROJECT_CONTEXT.md`, and this changelog to `docs/` paths.
- Verification: 9/9 files present in `docs/`, 0 in root; content, phase status, and TESTING not-executed results preserved; no scaffold created; no tests claimed.
