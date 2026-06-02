# Deploy Saif OS on Vercel (demo mode)

No Supabase required. The app runs with **Saif’s sample data** and in-memory edits (good for a public demo).

## 1. Push to GitHub

```bash
cd "/Users/straton/Documents/Demos/Life of Saif"
git init
git add .
git commit -m "Saif OS — demo deploy"
git branch -M main
```

Create a new repo on GitHub (e.g. `saif-os`), then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/saif-os.git
git push -u origin main
```

## 2. Import on Vercel

1. [vercel.com](https://vercel.com) → **Add New** → **Project**
2. Import your GitHub repository
3. Leave **Framework Preset**: Next.js (auto-detected)

## 3. Environment variables

Add **one** variable (Production + Preview):

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_DEMO_MODE` | `true` |

Do **not** set `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` for demo mode.

## 4. Deploy

Click **Deploy**. Your URL will be like `https://saif-os.vercel.app`.

## 5. What visitors get

- Opens straight to the **dashboard** (no login)
- Full UI: tasks, money, projects, reminders, etc.
- **Sample data** for Saif pre-loaded
- They can add/edit/delete — works on a warm instance; may reset after idle/cold start
- Blue banner: “Live demo”

## Upgrade later (real accounts + persistence)

1. Create a [Supabase](https://supabase.com) project
2. Run `supabase/migrations/*.sql`
3. Add to Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Remove or set `NEXT_PUBLIC_DEMO_MODE` to `false`

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails | Run `npm run build` locally first |
| Money page error | Hard refresh; charts load client-side |
| Changes disappeared | Expected on demo — use Supabase for persistence |
