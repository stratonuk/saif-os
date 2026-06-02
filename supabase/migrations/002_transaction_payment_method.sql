-- Add bank/cash payment method to transactions
alter table public.transactions
  add column if not exists payment_method text not null default 'bank'
  check (payment_method in ('bank', 'cash'));
