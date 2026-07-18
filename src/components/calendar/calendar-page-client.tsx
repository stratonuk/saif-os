"use client";

import { useMemo, useState } from "react";
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
import { ChevronLeft, ChevronRight, CheckSquare, Bell } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { REMINDER_TYPE_LABELS } from "@/lib/constants";
import { cn, formatDate } from "@/lib/utils";
import type { Reminder, Task } from "@/lib/types";

interface CalendarPageClientProps {
  tasks: Task[];
  reminders: Reminder[];
}

type DayEntry =
  | { kind: "task"; id: string; title: string; meta: string }
  | { kind: "reminder"; id: string; title: string; meta: string };

export function CalendarPageClient({ tasks, reminders }: CalendarPageClientProps) {
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState<Date>(() => new Date());

  const entriesByDay = useMemo(() => {
    const map = new Map<string, DayEntry[]>();
    const push = (date: string | null | undefined, entry: DayEntry) => {
      if (!date) return;
      const key = date.slice(0, 10);
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
    return map;
  }, [tasks, reminders]);

  const days = useMemo(() => {
    const monthStart = startOfMonth(cursor);
    const monthEnd = endOfMonth(cursor);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [cursor]);

  const selectedKey = format(selected, "yyyy-MM-dd");
  const selectedEntries = entriesByDay.get(selectedKey) ?? [];
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <>
      <PageHeader
        title="Calendar"
        description="Tasks and reminders across the month, at a glance."
        action={
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl" onClick={() => setCursor((c) => subMonths(c, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => { setCursor(new Date()); setSelected(new Date()); }}>
              Today
            </Button>
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl" onClick={() => setCursor((c) => addMonths(c, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <Card className="overflow-hidden">
          <CardContent className="p-3 sm:p-4">
            <h2 className="mb-3 px-1 text-lg font-semibold">{format(cursor, "MMMM yyyy")}</h2>
            <div className="grid grid-cols-7 gap-1">
              {weekdays.map((d) => (
                <div key={d} className="px-1 py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {d}
                </div>
              ))}
              {days.map((day) => {
                const key = format(day, "yyyy-MM-dd");
                const entries = entriesByDay.get(key) ?? [];
                const inMonth = isSameMonth(day, cursor);
                const active = isSameDay(day, selected);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelected(day)}
                    className={cn(
                      "flex min-h-[68px] flex-col rounded-xl border p-1.5 text-left transition-colors sm:min-h-[84px]",
                      active
                        ? "border-primary/40 bg-primary/10 ring-1 ring-inset ring-primary/20"
                        : "border-border/40 hover:bg-accent/50",
                      !inMonth && "opacity-40"
                    )}
                  >
                    <span
                      className={cn(
                        "mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                        isToday(day) ? "bg-primary text-primary-foreground" : "text-foreground"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                    <div className="space-y-0.5">
                      {entries.slice(0, 2).map((e) => (
                        <div
                          key={`${e.kind}-${e.id}`}
                          className={cn(
                            "truncate rounded px-1 py-0.5 text-[10px] font-medium",
                            e.kind === "task" ? "bg-violet-500/15 text-violet-400" : "bg-amber-400/15 text-amber-400"
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

        <Card className="h-fit">
          <CardContent className="p-5">
            <h3 className="font-semibold">{formatDate(selected)}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {selectedEntries.length} {selectedEntries.length === 1 ? "item" : "items"}
            </p>
            <div className="mt-4 space-y-2">
              {selectedEntries.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Nothing scheduled.</p>
              ) : (
                selectedEntries.map((e) => (
                  <div key={`${e.kind}-${e.id}`} className="flex items-start gap-3 rounded-xl bg-muted/40 px-3 py-2.5">
                    <span
                      className={cn(
                        "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                        e.kind === "task" ? "bg-violet-500/15 text-violet-400" : "bg-amber-400/15 text-amber-400"
                      )}
                    >
                      {e.kind === "task" ? <CheckSquare className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{e.title}</p>
                      <p className="text-xs capitalize text-muted-foreground">{e.kind} · {e.meta}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
