-- Waiting On tracker
create table public.waiting_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  person text,
  project_id uuid references public.projects on delete set null,
  date_requested date,
  follow_up_date date,
  status text not null default 'waiting' check (status in ('waiting', 'chased', 'resolved')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.waiting_items enable row level security;
create policy "Users manage own waiting items" on public.waiting_items for all using (auth.uid() = user_id);

create trigger waiting_items_updated_at
  before update on public.waiting_items
  for each row execute function public.set_updated_at();

-- AI-ready notes
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  content text,
  tags text[] not null default '{}',
  linked_entity_type text check (linked_entity_type in ('project', 'contact', 'idea', 'goal', 'none')),
  linked_entity_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.notes enable row level security;
create policy "Users manage own notes" on public.notes for all using (auth.uid() = user_id);

create trigger notes_updated_at
  before update on public.notes
  for each row execute function public.set_updated_at();

-- Expand reminder categories for life admin
alter table public.reminders drop constraint if exists reminders_type_check;
alter table public.reminders add constraint reminders_type_check
  check (type in (
    'birthday', 'tax', 'mot', 'insurance', 'subscription', 'bill', 'custom',
    'warranty', 'company_accounts', 'personal'
  ));
