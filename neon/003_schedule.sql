-- Weekly schedule: recurring blocks (job hours etc.) + dated entries

create table if not exists public.schedule_blocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade not null,
  title text not null,
  notes text,
  day_of_week integer not null check (day_of_week between 1 and 7),
  start_time text not null,
  end_time text not null,
  kind text not null default 'other' check (kind in ('job', 'task', 'personal', 'other')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists schedule_blocks_user_id_idx on public.schedule_blocks (user_id);
create index if not exists schedule_blocks_user_day_idx on public.schedule_blocks (user_id, day_of_week);

create table if not exists public.schedule_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade not null,
  title text not null,
  notes text,
  date date not null,
  start_time text,
  end_time text,
  kind text not null default 'task' check (kind in ('job', 'task', 'personal', 'other')),
  done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists schedule_entries_user_id_idx on public.schedule_entries (user_id);
create index if not exists schedule_entries_user_date_idx on public.schedule_entries (user_id, date);

drop trigger if exists schedule_blocks_updated_at on public.schedule_blocks;
create trigger schedule_blocks_updated_at
  before update on public.schedule_blocks
  for each row execute function public.set_updated_at();

drop trigger if exists schedule_entries_updated_at on public.schedule_entries;
create trigger schedule_entries_updated_at
  before update on public.schedule_entries
  for each row execute function public.set_updated_at();
