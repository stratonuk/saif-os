-- Recurring fields on schedule entries

alter table public.schedule_entries
  add column if not exists recurring boolean not null default false;

alter table public.schedule_entries
  add column if not exists recurring_interval text
  check (
    recurring_interval is null
    or recurring_interval in ('daily', 'weekly', 'monthly', 'yearly')
  );
