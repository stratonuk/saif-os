import "server-only";

import { createClient } from "@/lib/supabase/server";
import { readDemoStore } from "@/lib/demo-store";
import { isDemoMode } from "@/lib/form-helpers";
import { normalizeTransactions } from "@/lib/transaction-utils";
import type {
  Contact,
  Goal,
  Idea,
  Profile,
  Project,
  Reminder,
  Task,
  Transaction,
} from "@/lib/types";

export async function getProfile(): Promise<Profile | null> {
  if (isDemoMode()) {
    const store = await readDemoStore();
    return store.profile;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return data;
}

export async function getTasks(): Promise<Task[]> {
  if (isDemoMode()) {
    const store = await readDemoStore();
    return store.tasks;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select("*")
    .order("due_date", { ascending: true, nullsFirst: false });

  return data ?? [];
}

export async function getReminders(): Promise<Reminder[]> {
  if (isDemoMode()) {
    const store = await readDemoStore();
    return store.reminders;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("reminders")
    .select("*")
    .order("due_date", { ascending: true });

  return data ?? [];
}

export async function getTransactions(): Promise<Transaction[]> {
  if (isDemoMode()) {
    const store = await readDemoStore();
    return store.transactions;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("transactions")
    .select("*")
    .order("date", { ascending: false });

  return normalizeTransactions(data ?? []);
}

export async function getProjects(): Promise<Project[]> {
  if (isDemoMode()) {
    const store = await readDemoStore();
    return store.projects;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("*")
    .order("updated_at", { ascending: false });

  return data ?? [];
}

export async function getIdeas(): Promise<Idea[]> {
  if (isDemoMode()) {
    const store = await readDemoStore();
    return store.ideas;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("ideas")
    .select("*")
    .order("priority_score", { ascending: false });

  return data ?? [];
}

export async function getGoals(): Promise<Goal[]> {
  if (isDemoMode()) {
    const store = await readDemoStore();
    return store.goals;
  }

  const supabase = await createClient();
  const { data } = await supabase.from("goals").select("*");

  return data ?? [];
}

export async function getContacts(): Promise<Contact[]> {
  if (isDemoMode()) {
    const store = await readDemoStore();
    return store.contacts;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("contacts")
    .select("*")
    .order("name", { ascending: true });

  return data ?? [];
}

export function getMonthlyFinance(
  transactions: Transaction[],
  year: number,
  month: number
) {
  const filtered = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const income = filtered
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount), 0);
  const expenses = filtered
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);

  return { income, expenses, net: income - expenses, transactions: filtered };
}

export function getChartDataFromTransactions(transactions: Transaction[]) {
  const months: { key: string; label: string; income: number; expenses: number }[] =
    [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const finance = getMonthlyFinance(transactions, d.getFullYear(), d.getMonth());
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString("en-GB", { month: "short" }),
      income: finance.income,
      expenses: finance.expenses,
    });
  }

  return months;
}

export { isTaskOverdue, getTodayTasks, getOverdueTasks } from "./task-utils";

export function getActiveProjects(projects: Project[]) {
  return projects.filter((p) => p.status !== "paused");
}

export function getUpcomingReminders(reminders: Reminder[], limit = 5) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return reminders
    .filter((r) => {
      const d = new Date(r.due_date);
      d.setHours(0, 0, 0, 0);
      return d >= today;
    })
    .sort(
      (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    )
    .slice(0, limit);
}
