"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from "date-fns";
import { Bell, Briefcase, CheckSquare, ChevronLeft, ChevronRight, Clock, Sun } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { REMINDER_TYPE_LABELS } from "@/lib/constants";
import { cn, formatDate, toDateKey } from "@/lib/utils";
import { formatTimeRange, itemsForDate, recurringLabel } from "@/lib/schedule-utils";
import type { Reminder, ScheduleBlock, ScheduleEntry, ScheduleHoliday, Task } from "@/lib/types";

interface CalendarPageClientProps {
  tasks: Task[];
  reminders: Reminder[];
  blocks: ScheduleBlock[];
  scheduleEntries: ScheduleEntry[];
  holidays: ScheduleHoliday[];
}

type DayEntry =
  | { kind: "task"; id: string; title: string; meta: string }
  | { kind: "reminder"; id: string; title: string; meta: string }
  | { kind: "schedule"; id: string; title: string; meta: string; scheduleKind: string; recurring: boolean }
  | { kind: "holiday"; id: string; title: string; meta: string };

const KIND_STYLES: Record<DayEntry["kind"], string> = {
  task: "bg-violet-500/15 text-violet-400",
  reminder: "bg-amber-400/15 text-amber-400",
  schedule: "bg-sky-500/15 text-sky-400",
  holiday: "bg-emerald-500/15 text-emerald-400",
};

export function CalendarPageClient({
  tasks,
  reminders,
  blocks,
  scheduleEntries,
  holidays,
}: CalendarPageClientProps) {
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState<Date>(() => new Date());

  const days = useMemo(() => {
    const monthStart = startOfMonth(cursor);
    const monthEnd = endOfMonth(cursor);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [cursor]);

  const entriesByDay = useMemo(() => {
    const map = new Map<string, DayEntry[]>();
    const push = (date: string | Date | null | undefined, entry: DayEntry) => {
      const key = toDateKey(date);
      if (!key) return;
      const list = map.get(key) ?? [];
      list.push(entry);
      map.set(key, list);
    };

    for (const t of tasks) {
      if (t.status === "done") continue;
      push(t.due_date, { kind: "task", id: t.id, title: t.title, meta: t.priority });
    }
    for (const r of reminders) {
      push(r.due_date, {
        kind: "reminder",
        id: r.id,
        title: r.title,
        meta: REMINDER_TYPE_LABELS[r.type] ?? r.type,
      });
    }

    for (const day of days) {
      const key = format(day, "yyyy-MM-dd");
      const scheduleItems = itemsForDate(day, blocks, scheduleEntries, holidays).filter(
        (i) => !i.done
      );
      for (const item of scheduleItems) {
        const list = map.get(key) ?? [];
        if (item.source === "holiday") {
          list.push({
            kind: "holiday",
            id: item.key,
            title: item.title,
            meta: "All day · holiday",
          });
        } else {
          const range = formatTimeRange(item.start_time, item.end_time);
          const repeat = item.recurring
            ? recurringLabel(item.recurring_interval) ?? "weekly"
            : "schedule";
          const meta = [repeat, range].filter(Boolean).join(" · ");
          list.push({
            kind: "schedule",
            id: item.key,
            title: item.title,
            meta,
            scheduleKind: item.kind,
            recurring: item.recurring,
          });
        }
        map.set(key, list);
      }
    }

    return map;
  }, [tasks, reminders, blocks, scheduleEntries, holidays, days]);

  const selectedKey = format(selected, "yyyy-MM-dd");
  const selectedEntries = entriesByDay.get(selectedKey) ?? [];
  const weekdays = ["M", "T", "W", "T", "F", "S", "S"];
  const weekdaysFull = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <>
      <PageHeader
        title="Calendar"
        description="Tasks, reminders, and your weekly schedule — month view."
        action={
          <div className="grid w-full grid-cols-[1fr_auto_auto_auto] gap-1 sm:flex sm:w-auto sm:items-center">
            <Button variant="outline" size="sm" className="rounded-xl px-2 sm:px-3" asChild>
              <Link href="/schedule">
                <span className="sm:hidden">Week</span>
                <span className="hidden sm:inline">Week schedule</span>
              </Link>
            </Button>
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl" onClick={() => setCursor((c) => subMonths(c, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl px-2.5" onClick={() => { setCursor(new Date()); setSelected(new Date()); }}>
              Today
            </Button>
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl" onClick={() => setCursor((c) => addMonths(c, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      <div className="mb-3 flex flex-wrap gap-x-3 gap-y-1.5 text-[11px] text-muted-foreground sm:mb-4">
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-violet-400" /> Tasks</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400" /> Reminders</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-sky-400" /> Schedule</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Holiday</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_20rem] lg:gap-6">
        {/* On mobile show day detail first after selecting — grid then detail below */}
        <Card className="overflow-hidden order-1">
          <CardContent className="p-2 sm:p-4">
            <h2 className="mb-2 px-1 text-base font-semibold sm:mb-3 sm:text-lg">{format(cursor, "MMMM yyyy")}</h2>
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
              {weekdaysFull.map((d, i) => (
                <div key={d} className="px-0.5 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 sm:px-1 sm:py-2 sm:text-[11px]">
                  <span className="sm:hidden">{weekdays[i]}</span>
                  <span className="hidden sm:inline">{d}</span>
                </div>
              ))}
              {days.map((day) => {
                const key = format(day, "yyyy-MM-dd");
                const entries = entriesByDay.get(key) ?? [];
                const inMonth = isSameMonth(day, cursor);
                const active = isSameDay(day, selected);
                const hasHoliday = entries.some((e) => e.kind === "holiday");
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelected(day)}
                    className={cn(
                      "flex min-h-[44px] flex-col items-center rounded-lg border p-1 text-left transition-colors sm:min-h-[84px] sm:items-stretch sm:rounded-xl sm:p-1.5",
                      active
                        ? "border-primary/40 bg-primary/10 ring-1 ring-inset ring-primary/20"
                        : "border-border/40 hover:bg-accent/50",
                      !inMonth && "opacity-40",
                      hasHoliday && !active && "border-emerald-500/30"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium sm:mb-1",
                        isToday(day) ? "bg-primary text-primary-foreground" : "text-foreground"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                    {/* Mobile: colour dots only */}
                    <div className="mt-0.5 flex max-w-full flex-wrap justify-center gap-0.5 sm:hidden">
                      {entries.slice(0, 3).map((e) => (
                        <span
                          key={`${e.kind}-${e.id}`}
                          className={cn(
                            "h-1 w-1 rounded-full",
                            e.kind === "task" && "bg-violet-400",
                            e.kind === "reminder" && "bg-amber-400",
                            e.kind === "schedule" && "bg-sky-400",
                            e.kind === "holiday" && "bg-emerald-400"
                          )}
                        />
                      ))}
                    </div>
                    {/* Desktop: titles */}
                    <div className="mt-auto hidden w-full space-y-0.5 sm:block">
                      {entries.slice(0, 2).map((e) => (
                        <div
                          key={`${e.kind}-${e.id}`}
                          className={cn(
                            "truncate rounded px-1 py-0.5 text-[10px] font-medium",
                            KIND_STYLES[e.kind]
                          )}
                        >
                          {e.title}
                        </div>
                      ))}
                      {entries.length > 2 && (
                        <div className="px-1 text-[10px] text-muted-foreground">+{entries.length - 2} more</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit order-2">
          <CardContent className="p-4 sm:p-5">
            <h3 className="font-semibold">{formatDate(selected)}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {selectedEntries.length} {selectedEntries.length === 1 ? "item" : "items"}
            </p>
            <div className="mt-4 space-y-2">
              {selectedEntries.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground sm:py-8">Nothing scheduled.</p>
              ) : (
                selectedEntries.map((e) => (
                  <div key={`${e.kind}-${e.id}`} className="flex items-start gap-3 rounded-xl bg-muted/40 px-3 py-2.5">
                    <span
                      className={cn(
                        "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                        KIND_STYLES[e.kind]
                      )}
                    >
                      {e.kind === "task" && <CheckSquare className="h-3.5 w-3.5" />}
                      {e.kind === "reminder" && <Bell className="h-3.5 w-3.5" />}
                      {e.kind === "holiday" && <Sun className="h-3.5 w-3.5" />}
                      {e.kind === "schedule" && (
                        e.scheduleKind === "job" || e.recurring
                          ? <Briefcase className="h-3.5 w-3.5" />
                          : <Clock className="h-3.5 w-3.5" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{e.title}</p>
                      <p className="text-xs capitalize text-muted-foreground">{e.kind} · {e.meta}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Button variant="outline" size="sm" className="mt-4 w-full rounded-xl" asChild>
              <Link href="/schedule">Open week schedule</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
