-- Saif OS initial schema

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text not null default '',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Projects (before tasks for FK)
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  description text,
  status text not null default 'idea' check (status in ('idea', 'planning', 'building', 'launched', 'paused')),
  revenue numeric not null default 0,
  expenses numeric not null default 0,
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects enable row level security;
create policy "Users manage own projects" on public.projects for all using (auth.uid() = user_id);

-- Tasks
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text,
  due_date date,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  category text not null default 'personal' check (category in ('personal', 'money', 'project', 'admin', 'health')),
  project_id uuid references public.projects on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tasks enable row level security;
create policy "Users manage own tasks" on public.tasks for all using (auth.uid() = user_id);

-- Reminders
create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  type text not null default 'custom' check (type in ('birthday', 'tax', 'mot', 'insurance', 'subscription', 'bill', 'custom')),
  due_date date not null,
  recurring boolean not null default false,
  recurring_interval text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.reminders enable row level security;
create policy "Users manage own reminders" on public.reminders for all using (auth.uid() = user_id);

-- Transactions
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  amount numeric not null,
  type text not null check (type in ('income', 'expense')),
  category text not null,
  payment_method text not null default 'bank' check (payment_method in ('bank', 'cash')),
  date date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.transactions enable row level security;
create policy "Users manage own transactions" on public.transactions for all using (auth.uid() = user_id);

-- Ideas
create table public.ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text,
  category text not null default 'personal' check (category in ('business', 'app', 'content', 'investment', 'personal')),
  priority_score integer not null default 5 check (priority_score >= 1 and priority_score <= 10),
  status text not null default 'raw' check (status in ('raw', 'reviewing', 'planned', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ideas enable row level security;
create policy "Users manage own ideas" on public.ideas for all using (auth.uid() = user_id);

-- Goals
create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  type text not null check (type in ('financial', 'personal', 'business')),
  current_value numeric not null default 0,
  target_value numeric not null,
  target_date date,
  unit text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.goals enable row level security;
create policy "Users manage own goals" on public.goals for all using (auth.uid() = user_id);

-- Contacts
create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  company text,
  role text,
  phone text,
  email text,
  notes text,
  last_contacted date,
  next_follow_up date,
  project_id uuid references public.projects on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.contacts enable row level security;
create policy "Users manage own contacts" on public.contacts for all using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Updated_at triggers
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();
create trigger tasks_updated_at before update on public.tasks
  for each row execute procedure public.set_updated_at();
create trigger reminders_updated_at before update on public.reminders
  for each row execute procedure public.set_updated_at();
create trigger projects_updated_at before update on public.projects
  for each row execute procedure public.set_updated_at();
create trigger ideas_updated_at before update on public.ideas
  for each row execute procedure public.set_updated_at();
create trigger goals_updated_at before update on public.goals
  for each row execute procedure public.set_updated_at();
create trigger contacts_updated_at before update on public.contacts
  for each row execute procedure public.set_updated_at();
