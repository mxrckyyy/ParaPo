# PARA PO — UI/UX Guidelines

## 1. Design Goals / Users
Goals: glanceable on a crowded jeepney, one-thumb operation, <3 taps to map→route→ETA, trustworthy community data. Users: students/office commuters on low-mid Android + 4G; tourists unfamiliar with routes; admins on desktop. Constraints: small screens, poor connectivity, bright sunlight, Tagalog/English mix.

Brand: name **PARA PO** ("stop here, please") — jeepney stop phrase. Tone: friendly, concise, bilingual where wayfinding matters (e.g., "Para po! · Stop request").

## 2. Palette / Typography / Spacing / Borders
- Palette (do not change without documented reason):
  - Primary (jeepney green): `#16A34A` / hover `#15803D`; on-primary text white.
  - Secondary (asphalt): `#0F172A` (text/headings), muted `#64748B`.
  - Accent (fare gold): `#F59E0B` — fares, ★ favorites only.
  - Severity: info `#2563EB`, warning `#D97706`, critical `#DC2626`; bg tints `…/10`.
  - Surface: white cards, page bg `#F8FAFC`, border `#E2E8F0`.
- Typography: system stack / Inter; H1 24/32 bold, H2 18/28 semibold, body 14–16/24, caption 12/16 muted. Numbers (ETA/fare) tabular-nums, semibold.
- Spacing scale 4px; page padding 16 mobile / 24 desktop; card padding 16; map controls min 44×44 touch target.
- Borders: cards `rounded-xl border shadow-sm`; inputs `rounded-lg border` + `focus:ring-2 ring-primary/40`; pins/markers get white halo for sunlight legibility.

## 3. Responsive Rules
- Mobile-first (360px base): bottom tab bar (Map · Search · Report · Alerts · Profile); full-screen map; bottom-sheet for details.
- Tablet (≥768px): side panel (320–380px) + map; tab bar → top nav.
- Desktop (≥1024px): left sidebar nav + center panel + full map; admin tables full-width.
- Map always visible on Home; lists never cover map fully on mobile (max 70% sheet). Leaflet zoom control bottom-right (thumb-safe); locate button above it.

## 4. Navigation / Page Layouts
- `/` Home/Map: search bar overlay top, marker layers, locate + report FABs, alert banner slot.
- `/search`: big input → suggestion list (route name, origin→destination, fare, ETA chip).
- `/routes/[id]`: header, ETA hero, fare + steps timeline (walk/ride icons), ★ Save, report-on-this-route CTA.
- `/report`: type selector (4 big cards), map mini-picker, desc counter, submit → success toast + "view on map".
- `/alerts`: severity filter chips + cards (title, message, expiry "until …").
- `/favorites`, `/profile`: login wall for guests; lists with remove actions.
- `/admin`: stats row + tabs (Pending reports | Alerts | Users read-only MVP).

## 5. Reusable Components (single source in `components/ui`)
Button (primary/secondary/ghost/destructive), Input/SearchInput, Card, Badge/Chip (type + severity colors fixed), Spinner/Skeleton, EmptyState (icon+title+action), Toast, BottomSheet/Drawer, LoginWall. No page-local button styles.

Marker/legend contract: 🚐 vehicle=green circle w/ route label; reports: traffic=amber ▲, full=gray ■, accident=red ✖, closure=black ⛔; pending = dashed/50% opacity + "unverified" tag; alert banner colors per severity. Legend always on map.

## 6. States
- Loading: map skeleton + pulsing markers; lists: 3-line skeletons. Never blank screen.
- Success: toast "Report submitted — thanks, kapwa commuter!" + deep link.
- Empty: "No active vehicles on this route yet — be the first to share 🚌" + CTA.
- Error: inline field errors (red 12px), form-level banner, map failure card with Retry.
- Offline (Phase 4 goal): queued reports outbox indicator; read-only cached map notice.

## 7. Accessibility / Keyboard / Contrast
- AA: text 4.5:1, large 3:1; never color-only meaning (icon + label).
- All actions keyboard-reachable; visible focus rings; skip-to-content link; map has list alternative (every marker also in adjacent list).
- Form labels on all inputs; `aria-live` for toasts/ETA updates; `prefers-reduced-motion` disables marker animation.
- Touch: ≥44px targets, 8px gaps; geolocation and motion require explicit consent + denial fallback.

## 8. Map Interaction / Mobile Usability
- Default: Metro Manila bbox; auto-locate only on tap (permission). Pinch/drag native; double-tap zoom; marker tap → bottom-sheet preview, not page push.
- Layers toggle (vehicles/reports/alerts radius); clustering >50 markers; stale vehicles (>5 min) auto-dim + "last seen …".
- Tile attribution to OSM always visible. Tile fail → gray grid + "map tiles unavailable — list view still works".
- Location sharing: explicit start/stop, persistent "Sharing • tap to stop" pill, 10–15s throttle notice.

## 9. Consistency Rules (do not break without documented reason)
1. Primary green = go/navigate/share only; destructive = red; fare/star = gold.
2. Severity/type colors fixed (§5) across map, lists, banners.
3. ETA always a range + "~" + "estimate" caption in MVP.
4. Community data always badged "Community-reported · unverified" until approved.
5. One toast system; no `alert()`; no page-local button variants.
6. Bottom tabs order fixed: Map · Search · Report · Alerts · Profile.
