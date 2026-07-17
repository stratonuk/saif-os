# JARVIS

Premium personal life dashboard — tasks, money, projects, reminders, goals, ideas and contacts in one place.

## Stack

- **Next.js 15** (App Router) + TypeScript
- **Tailwind CSS 4** + shadcn-style UI
- **Neon Postgres** + **Auth.js** (email/password)
- **Lucide** icons · **Recharts** charts
- **Zod** validation · Server Actions

## Quick start (demo mode)

No database required — the app runs with realistic sample data.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you’ll land on the dashboard.

## Go live (Vercel + Neon + Auth)

See **[DEPLOY-VERCEL-DEMO.md](./DEPLOY-VERCEL-DEMO.md)** for:

1. Vercel project + Neon Marketplace database  
2. `AUTH_SECRET` + `DATABASE_URL`  
3. Running `neon/schema.sql`  
4. Sign up / sign in with a real account  

## Supabase setup

Legacy path — the app now prefers **Neon + Auth.js**. Old Supabase client files remain unused.

## Pages

| Route | Description |
|-------|-------------|
| `/dashboard` | Overview — tasks, money, projects, reminders |
| `/tasks` | CRUD tasks with filters |
| `/reminders` | Bills, MOT, birthdays, recurring |
| `/money` | Income/expenses, charts, goals |
| `/projects` | Kanban by status |
| `/ideas` | Ideas vault with search |
| `/goals` | Progress bars by type |
| `/contacts` | Personal CRM |
| `/settings` | Profile + theme |

## Project structure

```
src/
  app/(app)/          # Protected dashboard routes
  app/(auth)/         # Login & signup
  actions/            # Server actions
  components/         # UI, layout, feature pages
  lib/                # Data layer, types, Supabase, demo seed
supabase/
  migrations/         # Schema
  seed.sql            # Sample data for Saif
```

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — production server
- `npm run lint` — ESLint
