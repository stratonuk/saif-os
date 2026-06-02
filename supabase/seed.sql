-- Seed data for Saif (run after creating auth user with id matching DEMO_USER_ID)
-- Replace :user_id with actual auth.users id when seeding in Supabase SQL editor

-- Example: use auth.uid() in a logged-in session, or paste a fixed UUID

-- Profile is auto-created on signup; update name:
-- update public.profiles set full_name = 'Saif' where email = 'saif@example.com';

-- Projects
insert into public.projects (user_id, name, description, status, revenue, expenses, progress, notes) values
  (:user_id, 'Consulting Studio', 'Freelance strategy and product consulting', 'launched', 42000, 8500, 75, 'Main income stream'),
  (:user_id, 'SaaS Micro-tool', 'Lightweight productivity app for founders', 'building', 2400, 12000, 45, 'MVP in beta'),
  (:user_id, 'Content Brand', 'YouTube + newsletter on building in public', 'planning', 800, 2200, 20, 'Launch Q3'),
  (:user_id, 'Property Side Hustle', 'Short-term rental optimization', 'idea', 0, 500, 5, 'Research phase');

-- Tasks (link to projects after insert - use subqueries in real seed)
-- Run projects first, then tasks with project_id from select

-- Reminders
insert into public.reminders (user_id, title, type, due_date, recurring, recurring_interval, notes) values
  (:user_id, 'Mum''s Birthday', 'birthday', '2026-08-15', true, 'yearly', 'Get flowers early'),
  (:user_id, 'Self Assessment Tax', 'tax', '2026-01-31', true, 'yearly', 'HMRC deadline'),
  (:user_id, 'Car MOT', 'mot', '2026-09-22', true, 'yearly', 'Book garage 2 weeks before'),
  (:user_id, 'Home Insurance Renewal', 'insurance', '2026-11-01', true, 'yearly', 'Compare quotes'),
  (:user_id, 'Netflix', 'subscription', '2026-06-12', true, 'monthly', '£15.99'),
  (:user_id, 'Council Tax', 'bill', '2026-06-28', true, 'monthly', 'Direct debit'),
  (:user_id, 'Review investment portfolio', 'custom', '2026-06-15', false, null, 'Quarterly check');

-- Transactions (June 2026 sample month)
insert into public.transactions (user_id, title, amount, type, category, payment_method, date) values
  (:user_id, 'Consulting retainer - Acme Corp', 8500, 'income', 'Consulting', 'bank', '2026-06-01'),
  (:user_id, 'SaaS subscriptions revenue', 1200, 'income', 'Product', 'bank', '2026-06-05'),
  (:user_id, 'Workshop facilitation', 2200, 'income', 'Consulting', 'bank', '2026-06-12'),
  (:user_id, 'Rent', 1850, 'expense', 'Housing', 'bank', '2026-06-01'),
  (:user_id, 'Groceries', 420, 'expense', 'Food', 'cash', '2026-06-08'),
  (:user_id, 'AWS & Vercel', 180, 'expense', 'Software', 'bank', '2026-06-03'),
  (:user_id, 'Gym membership', 65, 'expense', 'Health', 'bank', '2026-06-01'),
  (:user_id, 'Client dinner', 95, 'expense', 'Business', 'cash', '2026-06-14'),
  (:user_id, 'Dividend income', 350, 'income', 'Investments', 'bank', '2026-06-20');

-- Ideas
insert into public.ideas (user_id, title, description, category, priority_score, status) values
  (:user_id, 'AI invoice assistant for freelancers', 'Auto-categorise and chase payments', 'app', 9, 'reviewing'),
  (:user_id, 'Premium Notion templates pack', 'Life OS + finance dashboards', 'business', 7, 'planned'),
  (:user_id, 'Documentary: immigrant founders UK', 'Long-form YouTube series', 'content', 8, 'raw'),
  (:user_id, 'Index fund DCA automation', 'Monthly invest on payday', 'investment', 6, 'planned'),
  (:user_id, 'Learn Portuguese', '30 min daily for Portugal trip', 'personal', 5, 'raw');

-- Goals
insert into public.goals (user_id, title, type, current_value, target_value, target_date, unit) values
  (:user_id, 'Emergency fund', 'financial', 18500, 30000, '2026-12-31', 'GBP'),
  (:user_id, 'Annual revenue', 'business', 52000, 100000, '2026-12-31', 'GBP'),
  (:user_id, 'Run half marathon', 'personal', 8, 21, '2026-10-15', 'km'),
  (:user_id, 'SaaS MRR', 'business', 1200, 5000, '2026-12-31', 'GBP');

-- Contacts
insert into public.contacts (user_id, name, company, role, phone, email, notes, last_contacted, next_follow_up) values
  (:user_id, 'James Mitchell', 'Acme Corp', 'Head of Product', '+44 7700 900123', 'james@acme.io', 'Retainer client, very responsive', '2026-06-01', '2026-06-20'),
  (:user_id, 'Sarah Chen', 'Venture Lane', 'Partner', '+44 7700 900456', 'sarah@venturelane.com', 'Introduced 3 portfolio founders', '2026-05-15', '2026-06-18'),
  (:user_id, 'Omar Hassan', 'DevShop Ltd', 'CTO', 'omar@devshop.co.uk', null, 'Potential SaaS co-founder', '2026-04-20', '2026-06-25');
