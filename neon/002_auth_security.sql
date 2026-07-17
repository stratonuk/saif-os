-- Auth security: session PIN + email login challenges

alter table public.users
  add column if not exists pin_hash text;

create table if not exists public.login_challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade not null,
  email text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists login_challenges_user_id_idx on public.login_challenges (user_id);
create index if not exists login_challenges_expires_at_idx on public.login_challenges (expires_at);
