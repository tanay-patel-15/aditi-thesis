# Explore Vadodara Heart

An interactive heritage exploration app built as part of an architecture thesis on Vadodara's historic pol neighbourhood. Documents and showcases Grade I–IV heritage buildings, guided walks, community events, and booking flows for tours and coworking spaces.

## Tech Stack

- **Frontend** — React 18, TypeScript, Vite
- **UI** — Tailwind CSS, shadcn/ui (Radix primitives), Framer Motion
- **Maps** — Leaflet + React-Leaflet (GPS-accurate heritage markers)
- **Backend** — Supabase (hosted Postgres, RLS, real-time)
- **Forms** — React Hook Form + Zod
- **Testing** — Vitest, Testing Library, Playwright

## Prerequisites

- Node.js v22+
- npm

## Getting Started

```bash
# Clone the repo
git clone https://github.com/tanay-patel-15/aditi-thesis.git
cd aditi-thesis

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:8080](http://localhost:8080).

The app connects to a hosted Supabase instance — no local database setup required. Environment variables are committed in `.env` (anon/publishable keys only).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on port 8080 |
| `npm run build` | Production build |
| `npm run build:dev` | Development build |
| `npm run test` | Run unit tests (Vitest) |
| `npm run test:watch` | Unit tests in watch mode |
| `npm run lint` | ESLint |
| `npx playwright test` | End-to-end tests |

## Features

- **Heritage Catalogue** — Browse buildings graded I–IV with search and filter
- **Interactive Map** — GPS-accurate Leaflet map of heritage sites across Vadodara's pol
- **Grading System** — Detailed Grade I–IV definitions with identifying elements and conservation scope
- **Guided Tours** — Tour listings with booking
- **Experience Walks** — Curated walking routes through the pol
- **Community Events** — Live events from Supabase with booking dialogs
- **Shop** — Pol-themed merchandise
- **Coworking Booking** — Reserve coworking seats in the pol
- **History** — Contextual history of Vadodara's heritage precincts

## Database

Hosted on Supabase (`nztkfxqsypxlgqqzkpjx`). Migrations in `supabase/migrations/`:

| Table | Description |
|-------|-------------|
| `events` | Community events with categories, dates, locations |
| `event_bookings` | Event registrations |
| `coworking_bookings` | Coworking space reservations |
