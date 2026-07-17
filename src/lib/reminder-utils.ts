import type { Reminder } from "./types";
import { REMINDER_URGENCY_COLORS } from "./constants";
import { daysUntil } from "./utils";

export type ReminderUrgency = keyof typeof REMINDER_URGENCY_COLORS;

export function getReminderUrgency(dueDate: string): ReminderUrgency {
  const days = daysUntil(dueDate);
  if (days < 0) return "overdue";
  if (days <= 3) return "critical";
  if (days <= 7) return "warning";
  if (days <= 14) return "soon";
  return "normal";
}

export function getReminderUrgencyColor(dueDate: string): string {
  return REMINDER_URGENCY_COLORS[getReminderUrgency(dueDate)];
}

export function getRemindersInDays(reminders: Reminder[], days: number) {
  return reminders
    .filter((r) => {
      const d = daysUntil(r.due_date);
      return d >= 0 && d <= days;
    })
    .sort(
      (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    );
}

export function groupRemindersByType(reminders: Reminder[]) {
  const groups: Record<string, Reminder[]> = {};
  for (const r of reminders) {
    if (!groups[r.type]) groups[r.type] = [];
    groups[r.type].push(r);
  }
  return groups;
}
