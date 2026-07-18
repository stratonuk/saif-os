-- Reusable documents / file uploads
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
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
alter table public.documents enable row level security;
create policy "Users manage own documents" on public.documents for all using (auth.uid() = user_id);
create trigger documents_updated_at before update on public.documents for each row execute function public.set_updated_at();

-- Subscriptions
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  provider text,
  cost numeric not null default 0,
  billing_cycle text not null default 'monthly' check (billing_cycle in ('weekly', 'monthly', 'yearly')),
  renewal_date date,
  renewal_day integer check (renewal_day is null or (renewal_day >= 1 and renewal_day <= 31)),
  category text not null default 'other' check (category in ('personal', 'business', 'software', 'hosting', 'entertainment', 'utilities', 'other')),
  payment_method text default 'hsbc' check (payment_method in ('cash', 'revolut', 'amex', 'hsbc', 'monzo', 'tsb', 'chase')),
  auto_renew boolean not null default true,
  status text not null default 'active' check (status in ('active', 'paused', 'cancelled')),
  reminder_days_before integer default 7,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.subscriptions enable row level security;
create policy "Users manage own subscriptions" on public.subscriptions for all using (auth.uid() = user_id);
create trigger subscriptions_updated_at before update on public.subscriptions for each row execute function public.set_updated_at();

-- Vehicles / Car Hub
create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
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
alter table public.vehicles enable row level security;
create policy "Users manage own vehicles" on public.vehicles for all using (auth.uid() = user_id);
create trigger vehicles_updated_at before update on public.vehicles for each row execute function public.set_updated_at();

create table public.vehicle_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
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
alter table public.vehicle_events enable row level security;
create policy "Users manage own vehicle events" on public.vehicle_events for all using (auth.uid() = user_id);
create trigger vehicle_events_updated_at before update on public.vehicle_events for each row execute function public.set_updated_at();

create table public.vehicle_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  vehicle_id uuid references public.vehicles on delete cascade not null,
  title text not null,
  amount numeric not null default 0,
  category text default 'other',
  expense_date date not null,
  notes text,
  created_at timestamptz not null default now()
);
alter table public.vehicle_expenses enable row level security;
create policy "Users manage own vehicle expenses" on public.vehicle_expenses for all using (auth.uid() = user_id);

-- Monthly reviews
create table public.monthly_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
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
alter table public.monthly_reviews enable row level security;
create policy "Users manage own monthly reviews" on public.monthly_reviews for all using (auth.uid() = user_id);
create trigger monthly_reviews_updated_at before update on public.monthly_reviews for each row execute function public.set_updated_at();

-- Straton client workspace
create table public.straton_clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
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
alter table public.straton_clients enable row level security;
create policy "Users manage own straton clients" on public.straton_clients for all using (auth.uid() = user_id);
create trigger straton_clients_updated_at before update on public.straton_clients for each row execute function public.set_updated_at();

create table public.straton_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
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
alter table public.straton_projects enable row level security;
create policy "Users manage own straton projects" on public.straton_projects for all using (auth.uid() = user_id);
create trigger straton_projects_updated_at before update on public.straton_projects for each row execute function public.set_updated_at();

create table public.straton_invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
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
alter table public.straton_invoices enable row level security;
create policy "Users manage own straton invoices" on public.straton_invoices for all using (auth.uid() = user_id);
create trigger straton_invoices_updated_at before update on public.straton_invoices for each row execute function public.set_updated_at();

create table public.straton_hosting (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
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
alter table public.straton_hosting enable row level security;
create policy "Users manage own straton hosting" on public.straton_hosting for all using (auth.uid() = user_id);
create trigger straton_hosting_updated_at before update on public.straton_hosting for each row execute function public.set_updated_at();

create table public.straton_client_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
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
alter table public.straton_client_reminders enable row level security;
create policy "Users manage own straton reminders" on public.straton_client_reminders for all using (auth.uid() = user_id);
create trigger straton_client_reminders_updated_at before update on public.straton_client_reminders for each row execute function public.set_updated_at();

create table public.straton_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  client_id uuid references public.straton_clients on delete cascade not null,
  activity_type text not null,
  title text not null,
  description text,
  entity_type text,
  entity_id text,
  created_at timestamptz not null default now()
);
alter table public.straton_activity enable row level security;
create policy "Users manage own straton activity" on public.straton_activity for all using (auth.uid() = user_id);

-- Storage bucket for documents (run in Supabase dashboard or via API)
-- insert into storage.buckets (id, name, public) values ('documents', 'documents', false);
