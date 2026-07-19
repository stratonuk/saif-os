import {
  format,
  getDate,
  getISODay,
  getMonth,
  parseISO,
  isBefore,
  startOfDay,
} from "date-fns";
import { SCHEDULE_RECURRING_LABELS } from "@/lib/constants";
import { toDateKey } from "@/lib/utils";
import type {
  ScheduleBlock,
  ScheduleEntry,
  ScheduleHoliday,
  ScheduleKind,
  ScheduleRecurringInterval,
} from "@/lib/types";

export type WeekItemSource = "block" | "entry" | "holiday";

export interface WeekScheduleItem {
  /** block:{id}, entry:{id}, or holiday:{id} */
  key: string;
  source: WeekItemSource;
  id: string;
  title: string;
  notes?: string | null;
  start_time: string | null;
  end_time: string | null;
  kind: ScheduleKind | "holiday";
  done: boolean;
  recurring: boolean;
  recurring_interval?: ScheduleRecurringInterval | null;
  allDay?: boolean;
}

function timeSortKey(time: string | null | undefined, allDay?: boolean) {
  if (allDay) return "00:00";
  if (!time) return "99:99";
  return time;
}

export function compareScheduleTimes(
  a: { start_time?: string | null; allDay?: boolean },
  b: { start_time?: string | null; allDay?: boolean }
) {
  return timeSortKey(a.start_time, a.allDay).localeCompare(
    timeSortKey(b.start_time, b.allDay)
  );
}

function parseAnchor(dateValue: string | Date) {
  const key = toDateKey(dateValue);
  if (!key) return null;
  return startOfDay(parseISO(key));
}

/** Whether a schedule entry should appear on `date` (one-off or recurring). */
export function entryOccursOn(entry: ScheduleEntry, date: Date): boolean {
  const anchor = parseAnchor(entry.date);
  if (!anchor) return false;

  const day = startOfDay(date);
  if (isBefore(day, anchor)) return false;

  if (!entry.recurring || !entry.recurring_interval) {
    return toDateKey(entry.date) === format(day, "yyyy-MM-dd");
  }

  switch (entry.recurring_interval) {
    case "daily":
      return true;
    case "weekly":
      return getISODay(day) === getISODay(anchor);
    case "monthly":
      return getDate(day) === getDate(anchor);
    case "yearly":
      return getMonth(day) === getMonth(anchor) && getDate(day) === getDate(anchor);
    default:
      return toDateKey(entry.date) === format(day, "yyyy-MM-dd");
  }
}

export function recurringLabel(interval?: ScheduleRecurringInterval | null) {
  if (!interval) return null;
  return SCHEDULE_RECURRING_LABELS[interval] ?? interval;
}

/** First holiday covering this calendar date, if any. */
export function holidayForDate(
  date: Date,
  holidays: ScheduleHoliday[]
): ScheduleHoliday | null {
  const key = format(date, "yyyy-MM-dd");
  for (const h of holidays) {
    const start = toDateKey(h.start_date);
    const end = toDateKey(h.end_date);
    if (!start || !end) continue;
    if (key >= start && key <= end) return h;
  }
  return null;
}

export function formatHolidayRange(holiday: ScheduleHoliday) {
  const start = toDateKey(holiday.start_date);
  const end = toDateKey(holiday.end_date);
  if (!start || !end) return "";
  if (start === end) {
    return format(parseISO(start), "d MMM yyyy");
  }
  return `${format(parseISO(start), "d MMM")} – ${format(parseISO(end), "d MMM yyyy")}`;
}

/** Map blocks, entries, and holidays onto a specific calendar date. */
export function itemsForDate(
  date: Date,
  blocks: ScheduleBlock[],
  entries: ScheduleEntry[],
  holidays: ScheduleHoliday[] = []
): WeekScheduleItem[] {
  const dow = getISODay(date) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
  const holiday = holidayForDate(date, holidays);

  const fromHolidays: WeekScheduleItem[] = holiday
    ? [
        {
          key: `holiday:${holiday.id}:${format(date, "yyyy-MM-dd")}`,
          source: "holiday",
          id: holiday.id,
          title: holiday.title || "Holiday",
          notes: holiday.notes,
          start_time: null,
          end_time: null,
          kind: "holiday",
          done: false,
          recurring: false,
          allDay: true,
        },
      ]
    : [];

  const fromBlocks: WeekScheduleItem[] = blocks
    .filter((b) => b.active && b.day_of_week === dow)
    .filter((b) => !(holiday && b.kind === "job"))
    .map((b) => ({
      key: `block:${b.id}`,
      source: "block" as const,
      id: b.id,
      title: b.title,
      notes: b.notes,
      start_time: b.start_time,
      end_time: b.end_time,
      kind: b.kind,
      done: false,
      recurring: true,
      recurring_interval: "weekly" as const,
    }));

  const fromEntries: WeekScheduleItem[] = entries
    .filter((e) => entryOccursOn(e, date))
    .map((e) => ({
      key: `entry:${e.id}`,
      source: "entry" as const,
      id: e.id,
      title: e.title,
      notes: e.notes,
      start_time: e.start_time ?? null,
      end_time: e.end_time ?? null,
      kind: e.kind,
      done: e.recurring ? false : e.done,
      recurring: Boolean(e.recurring),
      recurring_interval: e.recurring_interval ?? null,
    }));

  return [...fromHolidays, ...fromBlocks, ...fromEntries].sort(compareScheduleTimes);
}

export function formatTimeRange(start?: string | null, end?: string | null) {
  if (start && end) return `${start}–${end}`;
  if (start) return start;
  if (end) return `until ${end}`;
  return null;
}

export function jobBlocksSummary(blocks: ScheduleBlock[]) {
  const jobs = blocks.filter((b) => b.kind === "job" && b.active);
  if (jobs.length === 0) return null;
  const sample = jobs[0];
  const days = [...new Set(jobs.map((b) => b.day_of_week))].sort((a, b) => a - b);
  return {
    title: sample.title,
    start_time: sample.start_time,
    end_time: sample.end_time,
    days,
  };
}

export function parseDateKey(dateKey: string) {
  return parseISO(dateKey);
}
