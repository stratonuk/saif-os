# Deploy JARVIS on Vercel with Neon + Auth

Real sign-in (email/password) backed by Neon Postgres.

## 1. Push to GitHub

Commit and push to `stratonuk/saif-os` (or your fork).

## 2. Create Vercel project

1. [vercel.com](https://vercel.com) → **Add New** → **Project**
2. Import the GitHub repo
3. Framework: Next.js (auto)

## 3. Add Neon (Vercel Marketplace)

1. Vercel project → **Storage** → **Create Database** → **Neon**
2. Connect it to this project (Production + Preview)
3. Vercel will inject `DATABASE_URL` (and related vars)

Or create a Neon project at [neon.tech](https://neon.tech) and paste the pooled connection string as `DATABASE_URL`.

## 4. Environment variables

In Vercel → Settings → Environment Variables:

| Name | Value |
|------|--------|
| `DATABASE_URL` | Neon pooled connection string (auto if Marketplace) |
| `AUTH_SECRET` | Run `openssl rand -base64 32` and paste the result |

Do **not** set `NEXT_PUBLIC_DEMO_MODE=true` for production.

## 5. Run the schema on Neon

In the Neon SQL Editor (or `psql` with your connection string), paste and run:

`neon/schema.sql`

## 6. Deploy

Click **Deploy**. Open the URL → you should land on **Login**.

1. Go to **/signup** and create your account  
2. Sign in with that email/password  
3. Your data persists in Neon

## Local development with Neon

```bash
cp .env.example .env.local
# fill DATABASE_URL + AUTH_SECRET
# run neon/schema.sql once against your Neon DB
npm run dev
```

Without `DATABASE_URL`, the app stays in **demo mode** (sample data, no real auth).

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Always redirects to dashboard without login | `NEXT_PUBLIC_DEMO_MODE` is true, or `DATABASE_URL` missing |
| Invalid credentials after signup | Confirm `neon/schema.sql` was applied; check Neon tables `users` / `profiles` |
| Build fails on AUTH_SECRET | Set `AUTH_SECRET` in Vercel env for Production |
| Schema errors | Use the Neon SQL Editor; ensure `pgcrypto` is allowed (schema enables it) |
