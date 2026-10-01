# SaathChalo

SaathChalo is an intercity carpooling website for India, built as a portfolio and freelancing project. Drivers share empty seats, passengers split the cost. Rides on the site are sample data.

## Phase 1 (done)

- Home with ride search and popular routes
- About
- Search results with filters (price, time of day, rating, verified) and sorting
- Ride details with a simulated booking card

## Phase 2 (planned)

- Sign up and login
- Passenger and driver dashboards
- Real database (Supabase or PostgreSQL) behind the existing data layer

## Tech

Next.js (App Router), TypeScript, Tailwind CSS, lucide-react, Vitest.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests |

## How the data works

Pages and components only call the functions in `src/lib/rides.ts` (`searchRides`, `getRide`, `getDriver`, `getPopularRoutes`). Those functions read mock data from `src/data/`, with ride dates generated relative to today. To add a real backend, replace the internals of `src/lib/rides.ts`. Pages stay unchanged.
