import type {
  Reminder, StratonClientReminder, StratonHosting, StratonInvoice,
  Subscription, Task, Vehicle, WaitingItem, InboxItem,
} from "./types";
import { daysUntil } from "./utils";
import { isTaskOverdue } from "./task-utils";
import { isWaitingOverdue } from "./waiting-utils";

function urgencyFromDays(days: number): InboxItem["urgency"] {
  if (days < 0) return "overdue";
  if (days <= 3) return "critical";
  if (days <= 7) return "warning";
  return "normal";
}

export function buildInboxItems(input: {
  tasks: Task[];
  reminders: Reminder[];
  waitingItems: WaitingItem[];
  subscriptions: Subscription[];
  vehicles: Vehicle[];
  stratonInvoices: StratonInvoice[];
  stratonHosting: StratonHosting[];
  stratonReminders: StratonClientReminder[];
}): InboxItem[] {
  const items: InboxItem[] = [];

  for (const t of input.tasks.filter(isTaskOverdue)) {
    items.push({
      id: `task-${t.id}`, type: "task", title: t.title,
      subtitle: `Overdue · ${t.priority}`, urgency: "overdue",
      href: "/tasks", due_date: t.due_date ?? undefined,
    });
  }

  for (const r of input.reminders) {
    const days = daysUntil(r.due_date);
    if (days <= 14) {
      items.push({
        id: `reminder-${r.id}`, type: "reminder", title: r.title,
        subtitle: r.type, urgency: urgencyFromDays(days),
        href: "/reminders", due_date: r.due_date,
      });
    }
  }

  for (const w of input.waitingItems.filter(isWaitingOverdue)) {
    items.push({
      id: `waiting-${w.id}`, type: "waiting", title: w.title,
      subtitle: w.person ?? undefined, urgency: "overdue",
      href: "/waiting-on", due_date: w.follow_up_date ?? undefined,
    });
  }

  for (const s of input.subscriptions.filter((s) => s.status === "active" && s.renewal_date)) {
    const days = daysUntil(s.renewal_date!);
    if (days <= s.reminder_days_before) {
      items.push({
        id: `sub-${s.id}`, type: "subscription", title: `${s.name} renews`,
        subtitle: `£${s.cost}/${s.billing_cycle}`, urgency: urgencyFromDays(days),
        href: "/subscriptions", due_date: s.renewal_date!,
      });
    }
  }

  for (const v of input.vehicles) {
    for (const [label, date] of [["MOT", v.mot_date], ["Insurance", v.insurance_expiry], ["Road tax", v.tax_date]] as const) {
      if (!date) continue;
      const days = daysUntil(date);
      if (days <= 30) {
        items.push({
          id: `car-${v.id}-${label}`, type: "vehicle", title: `${label} — ${v.make} ${v.model}`,
          subtitle: v.registration ?? undefined, urgency: urgencyFromDays(days),
          href: "/car", due_date: date,
        });
      }
    }
  }

  for (const inv of input.stratonInvoices.filter((i) => i.status === "overdue" || (i.status === "sent" && i.due_date && daysUntil(i.due_date) < 0))) {
    items.push({
      id: `inv-${inv.id}`, type: "invoice", title: `Invoice ${inv.invoice_number}`,
      subtitle: `£${inv.amount}`, urgency: "overdue",
      href: "/straton/invoices", due_date: inv.due_date ?? undefined,
    });
  }

  for (const h of input.stratonHosting.filter((h) => h.renewal_date && daysUntil(h.renewal_date) <= 30)) {
    const days = daysUntil(h.renewal_date!);
    items.push({
      id: `host-${h.id}`, type: "hosting", title: `${h.domain_name} renewal`,
      subtitle: h.hosting_provider ?? undefined, urgency: urgencyFromDays(days),
      href: "/straton/hosting", due_date: h.renewal_date!,
    });
  }

  for (const r of input.stratonReminders.filter((r) => !r.completed && daysUntil(r.due_date) <= 14)) {
    const days = daysUntil(r.due_date);
    items.push({
      id: `sr-${r.id}`, type: "straton_reminder", title: r.title,
      subtitle: r.reminder_type, urgency: urgencyFromDays(days),
      href: "/straton/reminders", due_date: r.due_date,
    });
  }

  const order = { overdue: 0, critical: 1, warning: 2, normal: 3 };
  return items.sort((a, b) => order[a.urgency] - order[b.urgency]);
}
