import type { WaitingItem } from "./types";
import { daysUntil } from "./utils";

export function isWaitingOverdue(item: WaitingItem) {
  if (!item.follow_up_date || item.status === "resolved") return false;
  return daysUntil(item.follow_up_date) < 0;
}

export function getActiveWaitingItems(items: WaitingItem[]) {
  return items.filter((i) => i.status !== "resolved");
}

export function getOverdueWaitingItems(items: WaitingItem[]) {
  return getActiveWaitingItems(items).filter(isWaitingOverdue);
}

export function sortWaitingByUrgency(items: WaitingItem[]) {
  return [...items].sort((a, b) => {
    if (a.status === "resolved" && b.status !== "resolved") return 1;
    if (b.status === "resolved" && a.status !== "resolved") return -1;
    const aDays = a.follow_up_date ? daysUntil(a.follow_up_date) : 999;
    const bDays = b.follow_up_date ? daysUntil(b.follow_up_date) : 999;
    return aDays - bDays;
  });
}
