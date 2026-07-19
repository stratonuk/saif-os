-- Time-off / holiday ranges that suppress job hours

create table if not exists public.schedule_holidays (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade not null,
  title text not null,
  start_date date not null,
  end_date date not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create index if not exists schedule_holidays_user_id_idx on public.schedule_holidays (user_id);
create index if not exists schedule_holidays_user_start_idx on public.schedule_holidays (user_id, start_date);

drop trigger if exists schedule_holidays_updated_at on public.schedule_holidays;
create trigger schedule_holidays_updated_at
  before update on public.schedule_holidays
  for each row execute function public.set_updated_at();
