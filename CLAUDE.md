# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start dev server on port 8080

# Build
npm run build        # Production build
npm run build:dev    # Development build

# Testing
npm run test         # Run Vitest unit tests once
npm run test:watch   # Watch mode
npx playwright test  # E2E tests

# Lint
npm run lint
```

## Architecture

This is a **mobile-first React SPA** for exploring heritage buildings in Vadodara's old city pol neighbourhoods — built as Aditi's architecture thesis project.

### Routing & Pages

All routes are declared in `src/App.tsx`. Pages live in `src/pages/`. The app opens with a `SplashScreen` (shown once per session via `sessionStorage`), then renders `MainMenu` as the home hub.

Key pages:
- `/houses` — Heritage catalogue with grade filtering, search, and detail dialog
- `/map` — Leaflet map (`MapPage.tsx`) with GPS-accurate heritage building markers
- `/events` — Community events pulled from Supabase with booking dialog
- `/booking`, `/book-coworking`, `/my-bookings` — Booking flows backed by Supabase

### Data Layer

**Static data** (no DB): Heritage houses (`src/data/heritageHouses.ts`) and stay packages (`src/data/stayPackages.ts`) are TypeScript arrays — not fetched from Supabase.

**Supabase tables** (live DB):
- `events` — Community events with categories, dates, locations
- `event_bookings` — Bookings linked to events
- `coworking_bookings` — Coworking space reservations
- `tour_bookings` — Guided tour bookings

The Supabase client is at `src/integrations/supabase/client.ts` — import it as `import { supabase } from "@/integrations/supabase/client"`. The auto-generated types are in `src/integrations/supabase/types.ts` — regenerate with `npx supabase gen types` if the schema changes.

### Heritage Grading System

The `HeritageHouse` interface in `src/data/heritageHouses.ts` uses `grade: "I" | "II" | "III" | "IV"`. Grade definitions live as inline constants in `src/pages/HousesPage.tsx` (`gradeDetails` object), not in the data file. `gradeLabels` and `gradeColors` are exported from `src/data/heritageHouses.ts`.

### Design System

Custom Tailwind tokens in `tailwind.config.ts`:
- **Heritage palette**: `heritage-deep`, `heritage-terracotta`, `heritage-gold`, `heritage-sand`, `heritage-cream`, `heritage-olive` — use these for all heritage-themed UI, not raw colours.
- **Fonts**: `font-display` = Playfair Display (headings), `font-body` = Lato (body text)

All UI primitives come from shadcn/ui (`src/components/ui/`). Do not add new primitive components — extend existing ones instead.

### Path Alias

`@/` resolves to `src/`. Always use this alias for imports within `src/`.

### Environment

`.env` is committed (contains only public anon keys). Supabase env vars are prefixed `VITE_SUPABASE_` for client-side access. The project ID is `nztkfxqsypxlgqqzkpjx`.
