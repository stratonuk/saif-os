-- Add bank/cash payment method to transactions
alter table public.transactions
  add column if not exists payment_method text not null default 'hsbc'
  check (payment_method in ('cash', 'revolut', 'amex', 'hsbc', 'monzo', 'tsb', 'chase'));
