import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Inbox,
  CheckSquare,
  Bell,
  Wallet,
  FolderKanban,
  Lightbulb,
  Target,
  Users,
  Settings,
  StickyNote,
  FileText,
  Car,
  CreditCard,
  CalendarDays,
  Briefcase,
  LayoutGrid,
  Receipt,
  Server,
  Clock,
} from "lucide-react";

export const APP_NAME = "JARVIS";

export const NAV_ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/reminders", label: "Reminders", icon: Bell },
  { href: "/money", label: "Money", icon: Wallet },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/ideas", label: "Ideas", icon: Lightbulb },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/notes", label: "Notes", icon: StickyNote },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/car", label: "Car Hub", icon: Car },
  { href: "/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/monthly-reset", label: "Monthly Reset", icon: CalendarDays },
  { href: "/settings", label: "Settings", icon: Settings },
];

export const STRATON_NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/straton", label: "Dashboard", icon: LayoutGrid },
  { href: "/straton/clients", label: "Clients", icon: Users },
  { href: "/straton/projects", label: "Projects", icon: Briefcase },
  { href: "/straton/invoices", label: "Invoices", icon: Receipt },
  { href: "/straton/hosting", label: "Hosting & Renewals", icon: Server },
  { href: "/straton/documents", label: "Documents", icon: FileText },
  { href: "/straton/reminders", label: "Reminders", icon: Clock },
];

export const MOBILE_NAV = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/money", label: "Money", icon: Wallet },
] as const;

export const MOBILE_MORE_ITEMS = [
  { href: "/reminders", label: "Reminders", icon: Bell },
  { href: "/waiting-on", label: "Waiting On", icon: Clock },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/ideas", label: "Ideas", icon: Lightbulb },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/notes", label: "Notes", icon: StickyNote },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/car", label: "Car Hub", icon: Car },
  { href: "/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/monthly-reset", label: "Monthly Reset", icon: CalendarDays },
  { href: "/straton", label: "Straton", icon: Briefcase },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

// ─── Existing constants (preserved) ──────────────────────────
export const TASK_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export const TASK_STATUSES = ["todo", "in_progress", "done"] as const;
export const TASK_CATEGORIES = ["personal", "money", "project", "admin", "health"] as const;

export const REMINDER_TYPES = [
  "tax", "company_accounts", "mot", "insurance", "warranty", "subscription",
  "bill", "birthday", "personal", "custom",
] as const;

export const REMINDER_TYPE_LABELS: Record<string, string> = {
  tax: "Tax", company_accounts: "Company Accounts", mot: "MOT", insurance: "Insurance",
  warranty: "Warranty", subscription: "Subscription", bill: "Bills", birthday: "Birthdays",
  personal: "Personal", custom: "Custom",
};

export const REMINDER_URGENCY_COLORS = {
  overdue: "text-red-400 bg-red-500/10 border-red-500/20",
  critical: "text-red-400 bg-red-500/10 border-red-500/20",
  warning: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  soon: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  normal: "text-muted-foreground bg-muted border-border/50",
} as const;

export const WAITING_STATUSES = ["waiting", "chased", "resolved"] as const;
export const WAITING_STATUS_LABELS: Record<string, string> = { waiting: "Waiting", chased: "Chased", resolved: "Resolved" };
export const WAITING_STATUS_COLORS: Record<string, string> = {
  waiting: "text-violet-400 bg-violet-400/10", chased: "text-amber-400 bg-amber-400/10", resolved: "text-emerald-400 bg-emerald-400/10",
};

export const NOTE_ENTITY_TYPES = ["none", "project", "contact", "idea", "goal"] as const;
export const NOTE_ENTITY_LABELS: Record<string, string> = { none: "No link", project: "Project", contact: "Contact", idea: "Idea", goal: "Goal" };

export const PROJECT_STATUSES = ["idea", "planning", "building", "launched", "paused"] as const;
export const IDEA_CATEGORIES = ["business", "app", "content", "investment", "personal"] as const;
export const IDEA_STATUSES = ["raw", "reviewing", "planned", "archived"] as const;
export const GOAL_TYPES = [
  "personal",
  "health",
  "fitness",
  "learning",
  "career",
  "business",
  "financial",
  "habit",
  "other",
] as const;

export const GOAL_TYPE_LABELS: Record<string, string> = {
  personal: "Personal",
  health: "Health",
  fitness: "Fitness",
  learning: "Learning",
  career: "Career",
  business: "Business",
  financial: "Financial",
  habit: "Habit",
  other: "Other",
};
export const PAYMENT_METHODS = [
  "cash",
  "revolut",
  "amex",
  "hsbc",
  "monzo",
  "tsb",
  "chase",
] as const;

export const DEFAULT_PAYMENT_METHOD = "hsbc" as const;

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: "Cash",
  revolut: "Revolut",
  amex: "Amex",
  hsbc: "HSBC",
  monzo: "Monzo",
  tsb: "TSB",
  chase: "Chase",
  // legacy
  bank: "HSBC",
};

export const PAYMENT_METHOD_COLORS: Record<string, string> = {
  cash: "bg-amber-400/10 text-amber-400",
  revolut: "bg-violet-400/10 text-violet-400",
  amex: "bg-blue-400/10 text-blue-400",
  hsbc: "bg-red-400/10 text-red-400",
  monzo: "bg-pink-400/10 text-pink-400",
  tsb: "bg-sky-400/10 text-sky-400",
  chase: "bg-teal-400/10 text-teal-400",
};

export const TRANSACTION_CATEGORIES = [
  "Consulting", "Product", "Investments", "Housing", "Food", "Software",
  "Health", "Business", "Transport", "Entertainment", "Other",
] as const;

export const RECURRING_INTERVALS = ["weekly", "monthly", "quarterly", "yearly"] as const;

export const PRIORITY_COLORS: Record<string, string> = {
  low: "text-slate-400 bg-slate-400/10", medium: "text-teal-400 bg-teal-400/10",
  high: "text-amber-400 bg-amber-400/10", urgent: "text-red-400 bg-red-400/10",
};
export const STATUS_COLORS: Record<string, string> = {
  todo: "text-slate-400 bg-slate-400/10", in_progress: "text-violet-400 bg-violet-400/10", done: "text-emerald-400 bg-emerald-400/10",
};

export const QUICK_CAPTURE_TYPES = ["task", "reminder", "transaction", "idea", "contact", "note"] as const;

export const SEARCH_ENTITY_LABELS: Record<string, string> = {
  task: "Task", reminder: "Reminder", project: "Project", idea: "Idea", goal: "Goal",
  contact: "Contact", note: "Note", waiting: "Waiting On", subscription: "Subscription",
  vehicle: "Vehicle", vehicle_event: "Car Event", parking_ticket: "Parking Ticket", monthly_review: "Monthly Review",
  straton_client: "Client", straton_project: "Straton Project", straton_invoice: "Invoice",
  straton_hosting: "Hosting", document: "Document",
};

// ─── New module constants ─────────────────────────────────────
export const SUBSCRIPTION_BILLING_CYCLES = ["weekly", "monthly", "yearly"] as const;
export const SUBSCRIPTION_CATEGORIES = ["personal", "business", "software", "hosting", "entertainment", "utilities", "other"] as const;
export const SUBSCRIPTION_STATUSES = ["active", "paused", "cancelled"] as const;
export const SUBSCRIPTION_CATEGORY_LABELS: Record<string, string> = {
  personal: "Personal", business: "Business", software: "Software", hosting: "Hosting",
  entertainment: "Entertainment", utilities: "Utilities", other: "Other",
};

export const VEHICLE_EVENT_TYPES = ["service", "repair", "mot", "insurance", "tax", "tyres", "parts", "other"] as const;
export const VEHICLE_EVENT_LABELS: Record<string, string> = {
  service: "Service", repair: "Repair", mot: "MOT", insurance: "Insurance",
  tax: "Road Tax", tyres: "Tyres", parts: "Parts", other: "Other",
};

export const PARKING_TICKET_STATUSES = ["unpaid", "paid", "appealed", "cancelled"] as const;
export const PARKING_TICKET_STATUS_LABELS: Record<string, string> = {
  unpaid: "Unpaid", paid: "Paid", appealed: "Appealed", cancelled: "Cancelled",
};
export const PARKING_TICKET_STATUS_COLORS: Record<string, string> = {
  unpaid: "text-red-400 bg-red-400/10", paid: "text-emerald-400 bg-emerald-400/10",
  appealed: "text-amber-400 bg-amber-400/10", cancelled: "text-muted-foreground bg-muted",
};

export const STRATON_CLIENT_STATUSES = ["lead", "active", "paused", "completed", "archived"] as const;
export const STRATON_PROJECT_STATUSES = ["enquiry", "quoted", "approved", "in_progress", "review", "completed", "cancelled"] as const;
export const STRATON_INVOICE_STATUSES = ["draft", "sent", "paid", "overdue", "cancelled"] as const;
export const STRATON_HOSTING_STATUSES = ["active", "expiring_soon", "expired", "transferred", "cancelled"] as const;
export const STRATON_REMINDER_TYPES = ["follow_up", "send_invoice", "chase_payment", "renew_hosting", "renew_domain", "annual_review", "custom"] as const;

export const STRATON_CLIENT_STATUS_LABELS: Record<string, string> = {
  lead: "Lead", active: "Active", paused: "Paused", completed: "Completed", archived: "Archived",
};
export const STRATON_INVOICE_STATUS_COLORS: Record<string, string> = {
  draft: "text-slate-400 bg-slate-400/10", sent: "text-violet-400 bg-violet-400/10",
  paid: "text-emerald-400 bg-emerald-400/10", overdue: "text-red-400 bg-red-400/10", cancelled: "text-muted-foreground bg-muted",
};

export const DOCUMENT_ENTITY_TYPES = [
  "general", "client", "project", "invoice", "vehicle", "subscription", "note",
  "straton_client", "straton_project", "straton_invoice",
] as const;

export const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// ─── Weekly schedule ─────────────────────────────────────────
export const SCHEDULE_KINDS = ["job", "task", "personal", "other"] as const;
export const SCHEDULE_KIND_LABELS: Record<string, string> = {
  job: "Job",
  task: "Task",
  personal: "Personal",
  other: "Other",
};
export const SCHEDULE_KIND_COLORS: Record<string, string> = {
  job: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  task: "border-teal-500/30 bg-teal-500/10 text-teal-300",
  personal: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  other: "border-border/60 bg-muted/40 text-muted-foreground",
};
export const SCHEDULE_WEEKDAYS = [
  { value: 1, label: "Monday", short: "Mon" },
  { value: 2, label: "Tuesday", short: "Tue" },
  { value: 3, label: "Wednesday", short: "Wed" },
  { value: 4, label: "Thursday", short: "Thu" },
  { value: 5, label: "Friday", short: "Fri" },
  { value: 6, label: "Saturday", short: "Sat" },
  { value: 7, label: "Sunday", short: "Sun" },
] as const;

export const SCHEDULE_RECURRING_INTERVALS = ["daily", "weekly", "monthly", "yearly"] as const;
export const SCHEDULE_RECURRING_LABELS: Record<string, string> = {
  daily: "Every day",
  weekly: "Every week",
  monthly: "Every month",
  yearly: "Every year",
};

export const HOLIDAY_ITEM_COLOR = "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
