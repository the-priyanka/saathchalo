# SaathChalo

SaathChalo is an intercity carpooling website for India, built as a portfolio and freelancing project. Drivers share empty seats, passengers split the cost. Rides on the site are sample data.

## Phase 1 (done)

- Home with ride search and popular routes
- About
- Search results with filters (price, time of day, rating, verified) and sorting
- Ride details with a simulated booking card

## Phase 2A (done)

- Supabase backend: `profiles` and `rides` tables with Row Level Security
- Email and password accounts with 6 digit email OTP for signup verification and password reset
- Protected account page with an editable bio
- Demo rides refresh every night with `pg_cron`, so the live demo never goes stale

## Phase 2B (done)

- Offer a ride (`/rides/new`) and My rides (`/my-rides`): signed-in users can post a ride, see their own rides, and edit or delete upcoming ones
- Rules enforced in the database: price 50 to 5000 INR, 1 to 6 seats, 15 minutes to 24 hours, departure from 1 hour to 90 days ahead, at most 10 upcoming rides per user
- Posts from the shared demo account are cleaned up every night
- Run `supabase/migrations/0003_driver_rides.sql` once in the Supabase SQL editor after the first two migrations

## Phase 2C (planned)

- Passenger side: book a seat, my bookings, booking requests

## Tech

Next.js (App Router), TypeScript, Tailwind CSS, Supabase (Postgres, Auth), lucide-react, Vitest.

## Getting started

```bash
npm install
bash scripts/setup-wizard.sh   # guided Supabase setup, about 10 minutes
npm run dev
```

Open http://localhost:3000.

Without Supabase keys the site still starts: pages that need data show a friendly message.

## Demo login

Email: `demo@saathchalo.test`
Password: `saathchalo-demo-2026` (or the value of `DEMO_USER_PASSWORD` in `.env.local` before seeding)

This is a normal user with no extra privileges.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests |
| `npm run db:seed` | Seed demo drivers, demo rides, and the demo user (safe to re-run) |
| `npm run db:check` | Live checks against your Supabase project: data layer, security rules, demo refresh. They assume only the demo rides exist: rides posted from the demo account are cleared automatically, so delete rides posted from other test accounts before running |

## How the data works

Pages and components only call the functions in `src/lib/rides.ts` (`searchRides`, `getRide`, `getDriver`, `getPopularRoutes`). They read from Supabase with a public, read-only client. Row Level Security allows everyone to read rides and profiles, and lets only the owner edit their own profile (name, bio, avatar). The `service_role` key is used only by the scripts in `scripts/` and is never sent to the browser.

## Notes for the portfolio demo

- Free tier Supabase projects pause after about a week without activity. Restore the project in the dashboard before sharing the link.
- The default Supabase email sender allows only a few emails per hour. Use the demo login to see the signed-in experience without signing up.
- After restoring a paused project, run `npm run db:seed` (or wait for the 00:05 IST job) so the demo rides are in the future again. The nightly job does not run while the project is paused.
- If the demo account is changed by a visitor (name, bio, or password), run `npm run db:seed` to reset it.
