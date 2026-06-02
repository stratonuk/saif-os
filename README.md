# Saif OS

Premium personal life dashboard — tasks, money, projects, reminders, goals, ideas and contacts in one place.

## Stack

- **Next.js 15** (App Router) + TypeScript
- **Tailwind CSS 4** + shadcn-style UI
- **Supabase** (auth + PostgreSQL)
- **Lucide** icons · **Recharts** charts
- **Zod** validation · Server Actions

## Quick start (demo mode)

No Supabase required — the app runs with realistic sample data for **Saif**.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you’ll land on the dashboard.

**All CRUD works in demo mode** — changes persist to `data/saif-store.json` locally. Add tasks, log expenses, update goals, mark contacts as reached, etc.

Use **Sign out** in Settings to reach `/login` (any email/password works in demo mode).

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. Copy `.env.example` → `.env.local` and add your URL + anon key
3. Run the migration in `supabase/migrations/001_initial_schema.sql` via the SQL editor
4. Sign up in the app, then run `supabase/seed.sql` replacing `:user_id` with your auth user UUID

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
