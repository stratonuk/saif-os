import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  CheckSquare,
  Bell,
  Wallet,
  FolderKanban,
  Lightbulb,
  Target,
  Users,
  Settings,
} from "lucide-react";

export const APP_NAME = "Saif OS";

export const NAV_ITEMS: {
  href: string;
  label: string;
  icon: LucideIcon;
}[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/reminders", label: "Reminders", icon: Bell },
  { href: "/money", label: "Money", icon: Wallet },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/ideas", label: "Ideas", icon: Lightbulb },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

export const TASK_PRIORITIES = [
  "low",
  "medium",
  "high",
  "urgent",
] as const;
export const TASK_STATUSES = ["todo", "in_progress", "done"] as const;
export const TASK_CATEGORIES = [
  "personal",
  "money",
  "project",
  "admin",
  "health",
] as const;

export const REMINDER_TYPES = [
  "birthday",
  "tax",
  "mot",
  "insurance",
  "subscription",
  "bill",
  "custom",
] as const;

export const PROJECT_STATUSES = [
  "idea",
  "planning",
  "building",
  "launched",
  "paused",
] as const;

export const IDEA_CATEGORIES = [
  "business",
  "app",
  "content",
  "investment",
  "personal",
] as const;

export const IDEA_STATUSES = ["raw", "reviewing", "planned", "archived"] as const;

export const GOAL_TYPES = ["financial", "personal", "business"] as const;

export const PAYMENT_METHODS = ["bank", "cash"] as const;

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  bank: "Bank",
  cash: "Cash",
};

export const TRANSACTION_CATEGORIES = [
  "Consulting",
  "Product",
  "Investments",
  "Housing",
  "Food",
  "Software",
  "Health",
  "Business",
  "Transport",
  "Entertainment",
  "Other",
] as const;

export const RECURRING_INTERVALS = [
  "weekly",
  "monthly",
  "quarterly",
  "yearly",
] as const;

export const PRIORITY_COLORS: Record<string, string> = {
  low: "text-slate-400 bg-slate-400/10",
  medium: "text-blue-400 bg-blue-400/10",
  high: "text-amber-400 bg-amber-400/10",
  urgent: "text-red-400 bg-red-400/10",
};

export const STATUS_COLORS: Record<string, string> = {
  todo: "text-slate-400 bg-slate-400/10",
  in_progress: "text-blue-400 bg-blue-400/10",
  done: "text-emerald-400 bg-emerald-400/10",
};
