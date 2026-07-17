import "server-only";

import { readDemoStore } from "@/lib/demo-store";
import { isDemoMode } from "@/lib/form-helpers";
import { getAuthUserId } from "@/lib/action-utils";
import { getSql, selectForUser } from "@/lib/db";
import { normalizeTransactions } from "@/lib/transaction-utils";
import type {
  Contact,
  Goal,
  Idea,
  Note,
  Profile,
  Project,
  Reminder,
  Task,
  Transaction,
  WaitingItem,
} from "@/lib/types";

export async function getProfile(): Promise<Profile | null> {
  if (isDemoMode()) {
    const store = await readDemoStore();
    return store.profile;
  }

  const userId = await getAuthUserId();
  if (!userId) return null;

  const db = getSql();
  const rows = await db`
    SELECT * FROM profiles WHERE id = ${userId} LIMIT 1
  `;
  return (rows[0] as Profile) ?? null;
}

export async function getTasks(): Promise<Task[]> {
  if (isDemoMode()) {
    const store = await readDemoStore();
    return store.tasks;
  }
  const userId = await getAuthUserId();
  if (!userId) return [];
  return selectForUser<Task>("tasks", userId, { col: "due_date", asc: true });
}

export async function getReminders(): Promise<Reminder[]> {
  if (isDemoMode()) {
    const store = await readDemoStore();
    return store.reminders;
  }
  const userId = await getAuthUserId();
  if (!userId) return [];
  return selectForUser<Reminder>("reminders", userId, { col: "due_date", asc: true });
}

export async function getTransactions(): Promise<Transaction[]> {
  if (isDemoMode()) {
    const store = await readDemoStore();
    return store.transactions;
  }
  const userId = await getAuthUserId();
  if (!userId) return [];
  const rows = await selectForUser<Transaction>("transactions", userId, {
    col: "date",
    asc: false,
  });
  return normalizeTransactions(rows);
}

export async function getProjects(): Promise<Project[]> {
  if (isDemoMode()) {
    const store = await readDemoStore();
    return store.projects;
  }
  const userId = await getAuthUserId();
  if (!userId) return [];
  return selectForUser<Project>("projects", userId, { col: "updated_at", asc: false });
}

export async function getIdeas(): Promise<Idea[]> {
  if (isDemoMode()) {
    const store = await readDemoStore();
    return store.ideas;
  }
  const userId = await getAuthUserId();
  if (!userId) return [];
  return selectForUser<Idea>("ideas", userId, { col: "priority_score", asc: false });
}

export async function getGoals(): Promise<Goal[]> {
  if (isDemoMode()) {
    const store = await readDemoStore();
    return store.goals;
  }
  const userId = await getAuthUserId();
  if (!userId) return [];
  return selectForUser<Goal>("goals", userId);
}

export async function getContacts(): Promise<Contact[]> {
  if (isDemoMode()) {
    const store = await readDemoStore();
    return store.contacts;
  }
  const userId = await getAuthUserId();
  if (!userId) return [];
  return selectForUser<Contact>("contacts", userId, { col: "name", asc: true });
}

export async function getWaitingItems(): Promise<WaitingItem[]> {
  if (isDemoMode()) {
    const store = await readDemoStore();
    return store.waiting_items;
  }
  const userId = await getAuthUserId();
  if (!userId) return [];
  return selectForUser<WaitingItem>("waiting_items", userId, {
    col: "follow_up_date",
    asc: true,
  });
}

export async function getNotes(): Promise<Note[]> {
  if (isDemoMode()) {
    const store = await readDemoStore();
    return store.notes;
  }
  const userId = await getAuthUserId();
  if (!userId) return [];
  return selectForUser<Note>("notes", userId, { col: "updated_at", asc: false });
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

export function getUpcomingReminders(reminders: Reminder[], limit = 5, withinDays = 30) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return reminders
    .filter((r) => {
      const d = new Date(r.due_date);
      d.setHours(0, 0, 0, 0);
      const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diff >= 0 && diff <= withinDays;
    })
    .sort(
      (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    )
    .slice(0, limit);
}
