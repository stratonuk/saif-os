// ─── Subscriptions ───────────────────────────────────────────
export type SubscriptionBillingCycle = "weekly" | "monthly" | "yearly";
export type SubscriptionCategory =
  | "personal" | "business" | "software" | "hosting" | "entertainment" | "utilities" | "other";
export type SubscriptionStatus = "active" | "paused" | "cancelled";

export interface Subscription {
  id: string;
  user_id: string;
  name: string;
  provider?: string | null;
  cost: number;
  billing_cycle: SubscriptionBillingCycle;
  /** Day of month the subscription renews (1–31). */
  renewal_day?: number | null;
  /** Next (or last-known) renewal date — kept in sync from renewal_day. */
  renewal_date?: string | null;
  category: SubscriptionCategory;
  payment_method: import("./types").PaymentMethod;
  auto_renew: boolean;
  status: SubscriptionStatus;
  reminder_days_before: number;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Documents ───────────────────────────────────────────────
export type DocumentEntityType =
  | "client" | "project" | "invoice" | "vehicle" | "subscription" | "note"
  | "straton_client" | "straton_project" | "straton_invoice" | "general";

export interface Document {
  id: string;
  user_id: string;
  file_name: string;
  file_type?: string | null;
  file_size: number;
  storage_path?: string | null;
  file_url?: string | null;
  linked_entity_type?: DocumentEntityType | null;
  linked_entity_id?: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

// ─── Vehicles / Car Hub ──────────────────────────────────────
export type VehicleEventType =
  | "service" | "repair" | "mot" | "insurance" | "tax" | "tyres" | "parts" | "other";

export interface Vehicle {
  id: string;
  user_id: string;
  make: string;
  model: string;
  year?: number | null;
  registration?: string | null;
  mileage: number;
  fuel_type?: string | null;
  insurance_provider?: string | null;
  insurance_expiry?: string | null;
  mot_date?: string | null;
  tax_date?: string | null;
  garage?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface VehicleEvent {
  id: string;
  user_id: string;
  vehicle_id: string;
  event_type: VehicleEventType;
  title: string;
  event_date: string;
  mileage?: number | null;
  garage?: string | null;
  parts_replaced?: string | null;
  cost: number;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface VehicleExpense {
  id: string;
  user_id: string;
  vehicle_id: string;
  title: string;
  amount: number;
  category: string;
  expense_date: string;
  notes?: string | null;
  created_at: string;
}

export type ParkingTicketStatus = "unpaid" | "paid" | "appealed" | "cancelled";

export interface ParkingTicket {
  id: string;
  user_id: string;
  vehicle_id: string;
  pcn_number: string;
  issuer?: string | null;
  amount: number;
  issue_date?: string | null;
  due_date: string;
  status: ParkingTicketStatus;
  paid_date?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Monthly Reviews ─────────────────────────────────────────
export interface MonthlyReview {
  id: string;
  user_id: string;
  year: number;
  month: number;
  income_total: number;
  expense_total: number;
  net_balance: number;
  largest_expense?: string | null;
  largest_expense_amount: number;
  tasks_completed: number;
  overdue_tasks: number;
  projects_progressed: number;
  goals_progress?: string | null;
  biggest_win?: string | null;
  biggest_challenge?: string | null;
  next_month_focus?: string | null;
  notes?: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Straton ─────────────────────────────────────────────────
export type StratonClientStatus = "lead" | "active" | "paused" | "completed" | "archived";
export type StratonProjectStatus =
  | "enquiry" | "quoted" | "approved" | "in_progress" | "review" | "completed" | "cancelled";
export type StratonInvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";
export type StratonHostingStatus = "active" | "expiring_soon" | "expired" | "transferred" | "cancelled";
export type StratonReminderType =
  | "follow_up" | "send_invoice" | "chase_payment" | "renew_hosting" | "renew_domain" | "annual_review" | "custom";

export interface StratonClient {
  id: string;
  user_id: string;
  client_name: string;
  business_name?: string | null;
  contact_person?: string | null;
  email?: string | null;
  phone?: string | null;
  website_url?: string | null;
  industry?: string | null;
  status: StratonClientStatus;
  start_date?: string | null;
  key_info?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface StratonProject {
  id: string;
  user_id: string;
  client_id: string;
  name: string;
  description?: string | null;
  status: StratonProjectStatus;
  start_date?: string | null;
  deadline?: string | null;
  price_quoted: number;
  amount_paid: number;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface StratonInvoice {
  id: string;
  user_id: string;
  client_id: string;
  project_id?: string | null;
  invoice_number: string;
  amount: number;
  issue_date: string;
  due_date?: string | null;
  paid_date?: string | null;
  status: StratonInvoiceStatus;
  document_id?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface StratonHosting {
  id: string;
  user_id: string;
  client_id: string;
  domain_name: string;
  registrar?: string | null;
  hosting_provider?: string | null;
  hosting_plan?: string | null;
  renewal_date?: string | null;
  cost: number;
  client_charge: number;
  auto_renew: boolean;
  ssl_expiry?: string | null;
  dns_provider?: string | null;
  nameservers?: string | null;
  login_notes?: string | null;
  reminder_date?: string | null;
  status: StratonHostingStatus;
  created_at: string;
  updated_at: string;
}

export interface StratonClientReminder {
  id: string;
  user_id: string;
  client_id: string;
  project_id?: string | null;
  title: string;
  reminder_type: StratonReminderType;
  due_date: string;
  completed: boolean;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface StratonActivity {
  id: string;
  user_id: string;
  client_id: string;
  activity_type: string;
  title: string;
  description?: string | null;
  entity_type?: string | null;
  entity_id?: string | null;
  created_at: string;
}

export interface InboxItem {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  urgency: "overdue" | "critical" | "warning" | "normal";
  href: string;
  due_date?: string;
}

// ─── Weekly schedule ─────────────────────────────────────────
/** 1 = Monday … 7 = Sunday (ISO / date-fns weekStartsOn: 1). */
export type ScheduleDayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type ScheduleKind = "job" | "task" | "personal" | "other";
export type ScheduleRecurringInterval = "daily" | "weekly" | "monthly" | "yearly";

/** Recurring weekly template — e.g. job hours that appear every Mon–Fri. */
export interface ScheduleBlock {
  id: string;
  user_id: string;
  title: string;
  notes?: string | null;
  day_of_week: ScheduleDayOfWeek;
  start_time: string;
  end_time: string;
  kind: ScheduleKind;
  active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Schedule item on a date. When `recurring` is true, `date` is the start/anchor
 * and occurrences are expanded by `recurring_interval`.
 */
export interface ScheduleEntry {
  id: string;
  user_id: string;
  title: string;
  notes?: string | null;
  date: string;
  start_time?: string | null;
  end_time?: string | null;
  kind: ScheduleKind;
  done: boolean;
  recurring: boolean;
  recurring_interval?: ScheduleRecurringInterval | null;
  created_at: string;
  updated_at: string;
}

/** Time off range — suppresses job hours and shows as a full-day holiday. */
export interface ScheduleHoliday {
  id: string;
  user_id: string;
  title: string;
  start_date: string;
  end_date: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}
