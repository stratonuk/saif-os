import type { Subscription } from "./types";
import { daysUntil } from "./utils";

export function monthlySubscriptionCost(sub: Subscription): number {
  if (sub.status !== "active") return 0;
  switch (sub.billing_cycle) {
    case "weekly": return sub.cost * 4.33;
    case "yearly": return sub.cost / 12;
    default: return sub.cost;
  }
}

export function annualSubscriptionCost(sub: Subscription): number {
  if (sub.status !== "active") return 0;
  switch (sub.billing_cycle) {
    case "weekly": return sub.cost * 52;
    case "monthly": return sub.cost * 12;
    default: return sub.cost;
  }
}

export function getActiveSubscriptions(subs: Subscription[]) {
  return subs.filter((s) => s.status === "active");
}

export function getUpcomingRenewals(subs: Subscription[], days = 30) {
  return subs
    .filter((s) => s.status === "active" && s.renewal_date)
    .filter((s) => {
      const d = daysUntil(s.renewal_date!);
      return d >= 0 && d <= days;
    })
    .sort((a, b) => new Date(a.renewal_date!).getTime() - new Date(b.renewal_date!).getTime());
}
