import type {
  Contact, Document, Goal, Idea, MonthlyReview, Note, Project, Reminder,
  SearchResult, StratonClient, StratonHosting, StratonInvoice, StratonProject,
  Subscription, Task, Vehicle, VehicleEvent, ParkingTicket, WaitingItem,
} from "./types";
import { getOverdueTasks, getTodayTasks } from "./task-utils";
import { getOverdueWaitingItems } from "./waiting-utils";
import { getRemindersInDays } from "./reminder-utils";

const PRIORITY_ORDER = { urgent: 0, high: 1, medium: 2, low: 3 };

export interface DailyBriefing {
  mainFocus: Task | null;
  topPriorities: Task[];
  overdueTasks: Task[];
  upcomingReminders: Reminder[];
  monthlyIncome: number;
  monthlyExpenses: number;
  netBalance: number;
  projectNeedingAttention: Project | null;
  overdueWaitingCount: number;
  activeWaitingCount: number;
  inboxCount: number;
  subscriptionMonthlyTotal: number;
  carAlerts: number;
  stratonOutstanding: number;
}

export function buildDailyBriefing(input: {
  tasks: Task[];
  reminders: Reminder[];
  projects: Project[];
  waitingItems: WaitingItem[];
  monthlyIncome: number;
  monthlyExpenses: number;
  netBalance: number;
  inboxCount?: number;
  subscriptionMonthlyTotal?: number;
  carAlerts?: number;
  stratonOutstanding?: number;
}): DailyBriefing {
  const openTasks = input.tasks.filter((t) => t.status !== "done");
  const todayTasks = getTodayTasks(input.tasks);
  const overdueTasks = getOverdueTasks(input.tasks);

  const priorityPool = [...todayTasks, ...overdueTasks];
  const uniquePriority = Array.from(
    new Map(priorityPool.map((t) => [t.id, t])).values()
  );

  const topPriorities = uniquePriority
    .sort(
      (a, b) =>
        (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9)
    )
    .slice(0, 3);

  const mainFocus =
    topPriorities[0] ??
    openTasks
      .sort(
        (a, b) =>
          (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9)
      )[0] ??
    null;

  const upcomingReminders = getRemindersInDays(input.reminders, 7);

  const activeProjects = input.projects.filter((p) => p.status !== "paused");
  const projectNeedingAttention =
    activeProjects
      .filter((p) => p.status === "building" || p.progress < 50)
      .sort((a, b) => a.progress - b.progress)[0] ?? null;

  const activeWaiting = input.waitingItems.filter((w) => w.status !== "resolved");

  return {
    mainFocus,
    topPriorities,
    overdueTasks,
    upcomingReminders,
    monthlyIncome: input.monthlyIncome,
    monthlyExpenses: input.monthlyExpenses,
    netBalance: input.netBalance,
    projectNeedingAttention,
    overdueWaitingCount: getOverdueWaitingItems(input.waitingItems).length,
    activeWaitingCount: activeWaiting.length,
    inboxCount: input.inboxCount ?? 0,
    subscriptionMonthlyTotal: input.subscriptionMonthlyTotal ?? 0,
    carAlerts: input.carAlerts ?? 0,
    stratonOutstanding: input.stratonOutstanding ?? 0,
  };
}

export function searchAllEntities(input: {
  query: string;
  tasks: Task[];
  reminders: Reminder[];
  projects: Project[];
  ideas: Idea[];
  goals: Goal[];
  contacts: Contact[];
  notes: Note[];
  waitingItems: WaitingItem[];
  subscriptions?: Subscription[];
  vehicles?: Vehicle[];
  vehicleEvents?: VehicleEvent[];
  parkingTickets?: ParkingTicket[];
  monthlyReviews?: MonthlyReview[];
  documents?: Document[];
  stratonClients?: StratonClient[];
  stratonProjects?: StratonProject[];
  stratonInvoices?: StratonInvoice[];
  stratonHosting?: StratonHosting[];
}): SearchResult[] {
  const q = input.query.trim().toLowerCase();
  if (!q || q.length < 2) return [];

  const results: SearchResult[] = [];

  for (const t of input.tasks) {
    if (t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)) {
      results.push({ id: t.id, type: "task", title: t.title, subtitle: t.status, href: "/tasks" });
    }
  }
  for (const r of input.reminders) {
    if (r.title.toLowerCase().includes(q) || r.notes?.toLowerCase().includes(q)) {
      results.push({ id: r.id, type: "reminder", title: r.title, subtitle: r.type, href: "/reminders" });
    }
  }
  for (const p of input.projects) {
    if (p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)) {
      results.push({ id: p.id, type: "project", title: p.name, subtitle: p.status, href: "/projects" });
    }
  }
  for (const i of input.ideas) {
    if (i.title.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q)) {
      results.push({ id: i.id, type: "idea", title: i.title, subtitle: i.category, href: "/ideas" });
    }
  }
  for (const g of input.goals) {
    if (g.title.toLowerCase().includes(q)) {
      results.push({ id: g.id, type: "goal", title: g.title, subtitle: g.type, href: "/goals" });
    }
  }
  for (const c of input.contacts) {
    if (
      c.name.toLowerCase().includes(q) ||
      c.company?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q)
    ) {
      results.push({ id: c.id, type: "contact", title: c.name, subtitle: c.company ?? undefined, href: "/contacts" });
    }
  }
  for (const n of input.notes) {
    if (
      n.title.toLowerCase().includes(q) ||
      n.content?.toLowerCase().includes(q) ||
      n.tags.some((tag) => tag.toLowerCase().includes(q))
    ) {
      results.push({ id: n.id, type: "note", title: n.title, subtitle: n.tags.join(", ") || undefined, href: "/notes" });
    }
  }
  for (const w of input.waitingItems) {
    if (w.title.toLowerCase().includes(q) || w.person?.toLowerCase().includes(q) || w.notes?.toLowerCase().includes(q)) {
      results.push({ id: w.id, type: "waiting", title: w.title, subtitle: w.person ?? undefined, href: "/waiting-on" });
    }
  }
  for (const s of input.subscriptions ?? []) {
    if (s.name.toLowerCase().includes(q) || s.provider?.toLowerCase().includes(q)) {
      results.push({ id: s.id, type: "subscription", title: s.name, subtitle: s.provider ?? undefined, href: "/subscriptions" });
    }
  }
  for (const v of input.vehicles ?? []) {
    if (`${v.make} ${v.model}`.toLowerCase().includes(q) || v.registration?.toLowerCase().includes(q)) {
      results.push({ id: v.id, type: "vehicle", title: `${v.make} ${v.model}`, subtitle: v.registration ?? undefined, href: "/car" });
    }
  }
  for (const e of input.vehicleEvents ?? []) {
    if (e.title.toLowerCase().includes(q)) {
      results.push({ id: e.id, type: "vehicle_event", title: e.title, subtitle: e.event_type, href: "/car" });
    }
  }
  for (const t of input.parkingTickets ?? []) {
    if (t.pcn_number.toLowerCase().includes(q) || t.issuer?.toLowerCase().includes(q)) {
      results.push({ id: t.id, type: "parking_ticket", title: `PCN ${t.pcn_number}`, subtitle: t.issuer ?? undefined, href: "/car" });
    }
  }
  for (const r of input.monthlyReviews ?? []) {
    if (r.biggest_win?.toLowerCase().includes(q) || r.notes?.toLowerCase().includes(q)) {
      results.push({ id: r.id, type: "monthly_review", title: `Review ${r.month}/${r.year}`, subtitle: r.biggest_win ?? undefined, href: "/monthly-reset" });
    }
  }
  for (const d of input.documents ?? []) {
    if (d.file_name.toLowerCase().includes(q) || d.tags.some((t) => t.toLowerCase().includes(q))) {
      results.push({ id: d.id, type: "document", title: d.file_name, subtitle: d.file_type ?? undefined, href: "/documents" });
    }
  }
  for (const c of input.stratonClients ?? []) {
    if (c.client_name.toLowerCase().includes(q) || c.business_name?.toLowerCase().includes(q)) {
      results.push({ id: c.id, type: "straton_client", title: c.client_name, subtitle: c.business_name ?? undefined, href: `/straton/clients/${c.id}` });
    }
  }
  for (const p of input.stratonProjects ?? []) {
    if (p.name.toLowerCase().includes(q)) {
      results.push({ id: p.id, type: "straton_project", title: p.name, subtitle: p.status, href: "/straton/projects" });
    }
  }
  for (const i of input.stratonInvoices ?? []) {
    if (i.invoice_number.toLowerCase().includes(q)) {
      results.push({ id: i.id, type: "straton_invoice", title: i.invoice_number, subtitle: `£${i.amount}`, href: "/straton/invoices" });
    }
  }
  for (const h of input.stratonHosting ?? []) {
    if (h.domain_name.toLowerCase().includes(q)) {
      results.push({ id: h.id, type: "straton_hosting", title: h.domain_name, subtitle: h.hosting_provider ?? undefined, href: "/straton/hosting" });
    }
  }

  return results.slice(0, 15);
}
