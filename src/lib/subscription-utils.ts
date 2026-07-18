import type { Subscription, SubscriptionBillingCycle } from "./types";
import { daysUntil } from "./utils";

export function monthlySubscriptionCost(sub: Subscription): number {
  if (sub.status !== "active") return 0;
  switch (sub.billing_cycle) {
    case "weekly":
      return sub.cost * 4.33;
    case "yearly":
      return sub.cost / 12;
    default:
      return sub.cost;
  }
}

export function annualSubscriptionCost(sub: Subscription): number {
  if (sub.status !== "active") return 0;
  switch (sub.billing_cycle) {
    case "weekly":
      return sub.cost * 52;
    case "monthly":
      return sub.cost * 12;
    default:
      return sub.cost;
  }
}

export function getActiveSubscriptions(subs: Subscription[]) {
  return subs.filter((s) => s.status === "active");
}

/** Ordinal label: 1 → 1st, 2 → 2nd, 15 → 15th */
export function formatRenewalDay(day: number): string {
  const j = day % 10;
  const k = day % 100;
  const suffix =
    j === 1 && k !== 11
      ? "st"
      : j === 2 && k !== 12
        ? "nd"
        : j === 3 && k !== 13
          ? "rd"
          : "th";
  return `${day}${suffix}`;
}

function clampDay(year: number, monthIndex: number, day: number): number {
  const last = new Date(year, monthIndex + 1, 0).getDate();
  return Math.min(Math.max(1, day), last);
}

function toISODateLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Prefer explicit renewal_day; fall back to day-of-month from renewal_date. */
export function getSubscriptionRenewalDay(sub: Subscription): number | null {
  if (sub.renewal_day != null && sub.renewal_day >= 1 && sub.renewal_day <= 31) {
    return sub.renewal_day;
  }
  if (sub.renewal_date) {
    const d = new Date(`${sub.renewal_date}T12:00:00`);
    if (!Number.isNaN(d.getTime())) return d.getDate();
  }
  return null;
}

/**
 * Next calendar date this subscription renews, based on renewal day + billing cycle.
 * Keeps inbox/dashboard correct even after a stored renewal_date has passed.
 */
export function computeNextRenewalDate(opts: {
  renewalDay: number;
  billingCycle: SubscriptionBillingCycle;
  from?: Date;
  /** 0–11, used for yearly renewals */
  renewalMonth?: number;
}): string {
  const from = opts.from ? new Date(opts.from) : startOfToday();
  from.setHours(0, 0, 0, 0);
  const day = opts.renewalDay;

  if (opts.billingCycle === "yearly") {
    const month = opts.renewalMonth ?? from.getMonth();
    let year = from.getFullYear();
    let candidate = new Date(year, month, clampDay(year, month, day));
    candidate.setHours(0, 0, 0, 0);
    if (candidate < from) {
      year += 1;
      candidate = new Date(year, month, clampDay(year, month, day));
      candidate.setHours(0, 0, 0, 0);
    }
    return toISODateLocal(candidate);
  }

  // monthly (default) — also used when weekly picks a day-of-month style renewal
  let year = from.getFullYear();
  let month = from.getMonth();
  let candidate = new Date(year, month, clampDay(year, month, day));
  candidate.setHours(0, 0, 0, 0);
  if (candidate < from) {
    month += 1;
    if (month > 11) {
      month = 0;
      year += 1;
    }
    candidate = new Date(year, month, clampDay(year, month, day));
    candidate.setHours(0, 0, 0, 0);
  }
  return toISODateLocal(candidate);
}

export function getEffectiveRenewalDate(
  sub: Subscription,
  from: Date = startOfToday()
): string | null {
  const day = getSubscriptionRenewalDay(sub);
  if (day == null) return sub.renewal_date ?? null;

  let renewalMonth: number | undefined;
  if (sub.billing_cycle === "yearly" && sub.renewal_date) {
    renewalMonth = new Date(`${sub.renewal_date}T12:00:00`).getMonth();
  }

  if (sub.billing_cycle === "weekly" && sub.renewal_date) {
    // Keep weekly on a rolling 7-day cycle from the stored date.
    const anchor = new Date(`${sub.renewal_date}T12:00:00`);
    anchor.setHours(0, 0, 0, 0);
    const cursor = new Date(anchor);
    while (cursor < from) {
      cursor.setDate(cursor.getDate() + 7);
    }
    return toISODateLocal(cursor);
  }

  return computeNextRenewalDate({
    renewalDay: day,
    billingCycle: sub.billing_cycle === "weekly" ? "monthly" : sub.billing_cycle,
    from,
    renewalMonth,
  });
}

export function formatSubscriptionRenewal(sub: Subscription): string {
  const day = getSubscriptionRenewalDay(sub);
  const next = getEffectiveRenewalDate(sub);
  if (day != null && (sub.billing_cycle === "monthly" || sub.billing_cycle === "yearly")) {
    const dayLabel = formatRenewalDay(day);
    if (sub.billing_cycle === "yearly" && next) {
      const month = new Date(`${next}T12:00:00`).toLocaleDateString("en-GB", { month: "long" });
      return `Renews on the ${dayLabel} of ${month}`;
    }
    return `Renews on the ${dayLabel}`;
  }
  if (next) return `Renews ${new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${next}T12:00:00`))}`;
  return "No renewal date";
}

export function getUpcomingRenewals(subs: Subscription[], days = 30) {
  return getActiveSubscriptions(subs)
    .map((s) => ({ sub: s, date: getEffectiveRenewalDate(s) }))
    .filter((x): x is { sub: Subscription; date: string } => Boolean(x.date))
    .filter(({ date }) => {
      const d = daysUntil(date);
      return d >= 0 && d <= days;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(({ sub }) => sub);
}

/** Options for the day-of-month picker (1–31). */
export const RENEWAL_DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => {
  const day = i + 1;
  return { value: String(day), label: formatRenewalDay(day) };
});
