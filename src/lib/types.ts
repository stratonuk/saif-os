export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskCategory =
  | "personal"
  | "money"
  | "project"
  | "admin"
  | "health";

export type ReminderType =
  | "birthday"
  | "tax"
  | "mot"
  | "insurance"
  | "subscription"
  | "bill"
  | "custom"
  | "warranty"
  | "company_accounts"
  | "personal";

export type WaitingItemStatus = "waiting" | "chased" | "resolved";

export type NoteEntityType = "project" | "contact" | "idea" | "goal" | "none";

export type TransactionType = "income" | "expense";
export type PaymentMethod =
  | "cash"
  | "revolut"
  | "amex"
  | "hsbc"
  | "monzo"
  | "tsb"
  | "chase";

export type ProjectStatus =
  | "idea"
  | "planning"
  | "building"
  | "launched"
  | "paused";

export type IdeaCategory =
  | "business"
  | "app"
  | "content"
  | "investment"
  | "personal";

export type IdeaStatus = "raw" | "reviewing" | "planned" | "archived";

export type GoalType =
  | "personal"
  | "health"
  | "fitness"
  | "learning"
  | "career"
  | "business"
  | "financial"
  | "habit"
  | "other";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  due_date?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  category: TaskCategory;
  project_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  type: ReminderType;
  due_date: string;
  recurring: boolean;
  recurring_interval?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  payment_method: PaymentMethod;
  date: string;
  notes?: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  revenue: number;
  expenses: number;
  progress: number;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Idea {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  category: IdeaCategory;
  priority_score: number;
  status: IdeaStatus;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  type: GoalType;
  current_value: number;
  target_value: number;
  target_date?: string | null;
  unit?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  user_id: string;
  name: string;
  company?: string | null;
  role?: string | null;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
  last_contacted?: string | null;
  next_follow_up?: string | null;
  project_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface WaitingItem {
  id: string;
  user_id: string;
  title: string;
  person?: string | null;
  project_id?: string | null;
  date_requested?: string | null;
  follow_up_date?: string | null;
  status: WaitingItemStatus;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content?: string | null;
  tags: string[];
  linked_entity_type?: NoteEntityType | null;
  linked_entity_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SearchResult {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  href: string;
}

export type {
  Subscription,
  SubscriptionBillingCycle,
  SubscriptionCategory,
  SubscriptionStatus,
  Document,
  DocumentEntityType,
  Vehicle,
  VehicleEvent,
  VehicleEventType,
  VehicleExpense,
  ParkingTicket,
  ParkingTicketStatus,
  MonthlyReview,
  StratonClient,
  StratonProject,
  StratonInvoice,
  StratonHosting,
  StratonClientReminder,
  StratonActivity,
  StratonClientStatus,
  StratonProjectStatus,
  StratonInvoiceStatus,
  StratonHostingStatus,
  StratonReminderType,
  InboxItem,
  ScheduleBlock,
  ScheduleEntry,
  ScheduleHoliday,
  ScheduleDayOfWeek,
  ScheduleKind,
  ScheduleRecurringInterval,
} from "./module-types";
