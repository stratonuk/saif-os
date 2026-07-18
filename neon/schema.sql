-- Saif OS schema for Neon Postgres

create extension if not exists pgcrypto;

-- Auth users (replaces Supabase auth.users)
create table public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  full_name text not null default '',
  pin_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Profiles (extends users)
create table public.profiles (
  id uuid references public.users (id) on delete cascade primary key,
  email text not null,
  full_name text not null default '',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Projects (before tasks for FK)
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade not null,
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

-- Tasks
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade not null,
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

-- Reminders (expanded types from migration 003)
create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade not null,
  title text not null,
  type text not null default 'custom' check (type in (
    'birthday', 'tax', 'mot', 'insurance', 'subscription', 'bill', 'custom',
    'warranty', 'company_accounts', 'personal'
  )),
  due_date date not null,
  recurring boolean not null default false,
  recurring_interval text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Transactions
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade not null,
  title text not null,
  amount numeric not null,
  type text not null check (type in ('income', 'expense')),
  category text not null,
  payment_method text not null default 'bank' check (payment_method in ('bank', 'cash')),
  date date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);

-- Ideas
create table public.ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade not null,
  title text not null,
  description text,
  category text not null default 'personal' check (category in ('business', 'app', 'content', 'investment', 'personal')),
  priority_score integer not null default 5 check (priority_score >= 1 and priority_score <= 10),
  status text not null default 'raw' check (status in ('raw', 'reviewing', 'planned', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Goals
create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade not null,
  title text not null,
  type text not null check (type in ('financial', 'personal', 'business')),
  current_value numeric not null default 0,
  target_value numeric not null,
  target_date date,
  unit text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Contacts
create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade not null,
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

-- Waiting On tracker
create table public.waiting_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade not null,
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

-- AI-ready notes
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade not null,
  title text not null,
  content text,
  tags text[] not null default '{}',
  linked_entity_type text check (linked_entity_type in ('project', 'contact', 'idea', 'goal', 'none')),
  linked_entity_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Reusable documents / file uploads
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade not null,
  file_name text not null,
  file_type text,
  file_size integer default 0,
  storage_path text,
  file_url text,
  linked_entity_type text,
  linked_entity_id text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Subscriptions
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade not null,
  name text not null,
  provider text,
  cost numeric not null default 0,
  billing_cycle text not null default 'monthly' check (billing_cycle in ('weekly', 'monthly', 'yearly')),
  renewal_date date,
  category text not null default 'other' check (category in ('personal', 'business', 'software', 'hosting', 'entertainment', 'utilities', 'other')),
  payment_method text default 'bank' check (payment_method in ('bank', 'cash')),
  auto_renew boolean not null default true,
  status text not null default 'active' check (status in ('active', 'paused', 'cancelled')),
  reminder_days_before integer default 7,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Vehicles / Car Hub
create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade not null,
  make text not null,
  model text not null,
  year integer,
  registration text,
  mileage integer default 0,
  fuel_type text,
  insurance_provider text,
  insurance_expiry date,
  mot_date date,
  tax_date date,
  garage text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.vehicle_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade not null,
  vehicle_id uuid references public.vehicles on delete cascade not null,
  event_type text not null check (event_type in ('service', 'repair', 'mot', 'insurance', 'tax', 'tyres', 'parts', 'other')),
  title text not null,
  event_date date not null,
  mileage integer,
  garage text,
  parts_replaced text,
  cost numeric default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.vehicle_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade not null,
  vehicle_id uuid references public.vehicles on delete cascade not null,
  title text not null,
  amount numeric not null default 0,
  category text default 'other',
  expense_date date not null,
  notes text,
  created_at timestamptz not null default now()
);

create table public.parking_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade not null,
  vehicle_id uuid references public.vehicles on delete cascade not null,
  pcn_number text not null,
  issuer text,
  amount numeric not null default 0,
  issue_date date,
  due_date date not null,
  status text not null default 'unpaid' check (status in ('unpaid', 'paid', 'appealed', 'cancelled')),
  paid_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Monthly reviews
create table public.monthly_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade not null,
  year integer not null,
  month integer not null check (month >= 1 and month <= 12),
  income_total numeric default 0,
  expense_total numeric default 0,
  net_balance numeric default 0,
  largest_expense text,
  largest_expense_amount numeric default 0,
  tasks_completed integer default 0,
  overdue_tasks integer default 0,
  projects_progressed integer default 0,
  goals_progress text,
  biggest_win text,
  biggest_challenge text,
  next_month_focus text,
  notes text,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, year, month)
);

-- Straton client workspace
create table public.straton_clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade not null,
  client_name text not null,
  business_name text,
  contact_person text,
  email text,
  phone text,
  website_url text,
  industry text,
  status text not null default 'lead' check (status in ('lead', 'active', 'paused', 'completed', 'archived')),
  start_date date,
  key_info text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.straton_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade not null,
  client_id uuid references public.straton_clients on delete cascade not null,
  name text not null,
  description text,
  status text not null default 'enquiry' check (status in ('enquiry', 'quoted', 'approved', 'in_progress', 'review', 'completed', 'cancelled')),
  start_date date,
  deadline date,
  price_quoted numeric default 0,
  amount_paid numeric default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.straton_invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade not null,
  client_id uuid references public.straton_clients on delete cascade not null,
  project_id uuid references public.straton_projects on delete set null,
  invoice_number text not null,
  amount numeric not null default 0,
  issue_date date not null,
  due_date date,
  paid_date date,
  status text not null default 'draft' check (status in ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  document_id uuid references public.documents on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.straton_hosting (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade not null,
  client_id uuid references public.straton_clients on delete cascade not null,
  domain_name text not null,
  registrar text,
  hosting_provider text,
  hosting_plan text,
  renewal_date date,
  cost numeric default 0,
  client_charge numeric default 0,
  auto_renew boolean not null default true,
  ssl_expiry date,
  dns_provider text,
  nameservers text,
  login_notes text,
  reminder_date date,
  status text not null default 'active' check (status in ('active', 'expiring_soon', 'expired', 'transferred', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.straton_client_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade not null,
  client_id uuid references public.straton_clients on delete cascade not null,
  project_id uuid references public.straton_projects on delete set null,
  title text not null,
  reminder_type text not null default 'custom' check (reminder_type in ('follow_up', 'send_invoice', 'chase_payment', 'renew_hosting', 'renew_domain', 'annual_review', 'custom')),
  due_date date not null,
  completed boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.straton_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade not null,
  client_id uuid references public.straton_clients on delete cascade not null,
  activity_type text not null,
  title text not null,
  description text,
  entity_type text,
  entity_id text,
  created_at timestamptz not null default now()
);

-- Updated_at helper
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

create trigger tasks_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

create trigger reminders_updated_at
  before update on public.reminders
  for each row execute function public.set_updated_at();

create trigger ideas_updated_at
  before update on public.ideas
  for each row execute function public.set_updated_at();

create trigger goals_updated_at
  before update on public.goals
  for each row execute function public.set_updated_at();

create trigger contacts_updated_at
  before update on public.contacts
  for each row execute function public.set_updated_at();

create trigger waiting_items_updated_at
  before update on public.waiting_items
  for each row execute function public.set_updated_at();

create trigger notes_updated_at
  before update on public.notes
  for each row execute function public.set_updated_at();

create trigger documents_updated_at
  before update on public.documents
  for each row execute function public.set_updated_at();

create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

create trigger vehicles_updated_at
  before update on public.vehicles
  for each row execute function public.set_updated_at();

create trigger vehicle_events_updated_at
  before update on public.vehicle_events
  for each row execute function public.set_updated_at();

create trigger parking_tickets_updated_at
  before update on public.parking_tickets
  for each row execute function public.set_updated_at();

create trigger monthly_reviews_updated_at
  before update on public.monthly_reviews
  for each row execute function public.set_updated_at();

create trigger straton_clients_updated_at
  before update on public.straton_clients
  for each row execute function public.set_updated_at();

create trigger straton_projects_updated_at
  before update on public.straton_projects
  for each row execute function public.set_updated_at();

create trigger straton_invoices_updated_at
  before update on public.straton_invoices
  for each row execute function public.set_updated_at();

create trigger straton_hosting_updated_at
  before update on public.straton_hosting
  for each row execute function public.set_updated_at();

create trigger straton_client_reminders_updated_at
  before update on public.straton_client_reminders
  for each row execute function public.set_updated_at();

-- Login email 2FA challenges
create table public.login_challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade not null,
  email text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index login_challenges_user_id_idx on public.login_challenges (user_id);
create index login_challenges_expires_at_idx on public.login_challenges (expires_at);
