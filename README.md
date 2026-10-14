# PARA PO

Community-powered public transport information for Filipino commuters.
*"Para po!" — the words you say when your jeepney stop is near.*

> **Phase 1 preview.** The interface runs on fictional demonstration data.
> No live vehicle tracking, no official routes or fares, no accounts yet.
> Map imagery © OpenStreetMap contributors.

## Quickstart

Prerequisites: Node.js 18+ and npm.

```bash
npm install
npm run dev      # http://localhost:3000
```

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run lint` | ESLint (`next/core-web-vitals`) |
| `npm run typecheck` | `tsc --noEmit` (strict) |
| `npm run build` | Production build |
| `npm start` | Serve a production build |

## Stack (Phase 1)

Next.js 14 (App Router) · React 18 · TypeScript (strict) · Tailwind CSS 3 ·
Leaflet + react-leaflet (client-only, OSM tiles) · lucide-react icons · Zod
schemas (client UX validation; server enforcement from Phase 2) ·
Supabase client modules prepared in `lib/supabase/` (not wired — Phase 2).

## Project layout

- `app/` — routes: `/` landing, `/map`, `/search`, `/routes/[id]`, `/report`,
  `/alerts`, `/favorites`, `/profile`, `/login`, `/signup`, `/admin` (demo shell)
- `components/` — `ui/` reusable primitives, `layout/`, `map/`, `search/`,
  `reports/`, `alerts/`, `auth/`
- `lib/` — `mock.ts` (fictional demo data), `validations.ts` (Zod),
  `format.ts`, `supabase/` (Phase 2 prep)
- `types/` — shared TypeScript types
- `docs/` — the 9 permanent project documents (source of truth)

## Environment (Phase 2+)

Copy `.env.example` to `.env.local` and fill in values. Never commit
`.env.local`. The service-role key must never be prefixed `NEXT_PUBLIC_` or
imported in client code. Phase 1 needs no credentials.

## Deployment

Standard Next.js build (`npm run build`), Vercel-compatible with no custom
server config. No deployment is claimed until a production URL is verified.
