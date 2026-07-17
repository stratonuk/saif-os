import type { StratonHosting, StratonInvoice, StratonProject } from "./types";
import { daysUntil } from "./utils";

export function getOutstandingBalance(project: StratonProject) {
  return Math.max(0, project.price_quoted - project.amount_paid);
}

export function getUnpaidInvoices(invoices: StratonInvoice[]) {
  return invoices.filter((i) => i.status === "sent" || i.status === "overdue");
}

export function getOverdueInvoices(invoices: StratonInvoice[]) {
  return invoices.filter((i) => i.status === "overdue" || (i.status === "sent" && i.due_date && daysUntil(i.due_date) < 0));
}

export function getHostingProfit(hosting: StratonHosting) {
  return hosting.client_charge - hosting.cost;
}

export function getHostingRenewalsInDays(hosting: StratonHosting[], days: number) {
  return hosting
    .filter((h) => h.renewal_date && h.status !== "cancelled")
    .filter((h) => { const d = daysUntil(h.renewal_date!); return d >= 0 && d <= days; })
    .sort((a, b) => new Date(a.renewal_date!).getTime() - new Date(b.renewal_date!).getTime());
}

export function getMonthlyRecurringRevenue(hosting: StratonHosting[]) {
  return hosting
    .filter((h) => h.status === "active" || h.status === "expiring_soon")
    .reduce((sum, h) => sum + h.client_charge / 12, 0);
}

export async function logStratonActivity(
  store: { straton_activity: import("./types").StratonActivity[] },
  entry: Omit<import("./types").StratonActivity, "id" | "created_at">
) {
  const { newId, nowIso } = await import("./form-helpers");
  store.straton_activity.unshift({
    ...entry,
    id: newId(),
    created_at: nowIso(),
  });
}
