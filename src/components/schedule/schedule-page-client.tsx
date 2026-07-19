"use client";

import { useMemo, useState } from "react";
import {
  addWeeks,
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  isToday,
  startOfWeek,
  subWeeks,
} from "date-fns";
import {
  Briefcase,
  Check,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Repeat,
  Sun,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormSelect } from "@/components/shared/form-field";
import {
  HOLIDAY_ITEM_COLOR,
  SCHEDULE_KIND_COLORS,
  SCHEDULE_KIND_LABELS,
  SCHEDULE_KINDS,
  SCHEDULE_RECURRING_INTERVALS,
  SCHEDULE_RECURRING_LABELS,
  SCHEDULE_WEEKDAYS,
} from "@/lib/constants";
import { cn, toDateKey } from "@/lib/utils";
import {
  formatHolidayRange,
  formatTimeRange,
  itemsForDate,
  jobBlocksSummary,
  recurringLabel,
  type WeekScheduleItem,
} from "@/lib/schedule-utils";
import {
  createScheduleEntry,
  createScheduleHoliday,
  deleteScheduleEntry,
  deleteScheduleHoliday,
  saveJobHours,
  toggleScheduleEntryDone,
  updateScheduleEntry,
} from "@/actions/schedule";
import { useRefreshAction } from "@/hooks/use-refresh-action";
import type { ScheduleBlock, ScheduleEntry, ScheduleHoliday } from "@/lib/types";

interface SchedulePageClientProps {
  blocks: ScheduleBlock[];
  entries: ScheduleEntry[];
  holidays: ScheduleHoliday[];
}

export function SchedulePageClient({
  blocks,
  entries,
  holidays,
}: SchedulePageClientProps) {
  const { run, isPending } = useRefreshAction();
  const [cursor, setCursor] = useState(() => new Date());
  const [entryOpen, setEntryOpen] = useState(false);
  const [jobOpen, setJobOpen] = useState(false);
  const [editing, setEditing] = useState<ScheduleEntry | null>(null);
  const [draftDate, setDraftDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [recurring, setRecurring] = useState(false);
  const [holidayStart, setHolidayStart] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [holidayEnd, setHolidayEnd] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [selectedDay, setSelectedDay] = useState(() => new Date());

  const days = useMemo(() => {
    const weekStart = startOfWeek(cursor, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(cursor, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, [cursor]);

  // Keep selected day inside the visible week (mobile day picker)
  const activeDay = useMemo(() => {
    const match = days.find((d) => isSameDay(d, selectedDay));
    if (match) return match;
    return days.find((d) => isToday(d)) ?? days[0];
  }, [days, selectedDay]);

  const weekStart = days[0];
  const weekEnd = days[6];

  const jobSummary = useMemo(() => jobBlocksSummary(blocks), [blocks]);
  const jobDaySet = useMemo(
    () => new Set(jobSummary?.days ?? [1, 2, 3, 4, 5]),
    [jobSummary]
  );

  const upcomingHolidays = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    return [...holidays]
      .filter((h) => (toDateKey(h.end_date) ?? "") >= today)
      .sort((a, b) => (toDateKey(a.start_date) ?? "").localeCompare(toDateKey(b.start_date) ?? ""));
  }, [holidays]);

  function openCreate(date: Date) {
    setEditing(null);
    setDraftDate(format(date, "yyyy-MM-dd"));
    setRecurring(false);
    setEntryOpen(true);
  }

  function openEdit(item: WeekScheduleItem) {
    if (item.source !== "entry") return;
    const entry = entries.find((e) => e.id === item.id);
    if (!entry) return;
    setEditing(entry);
    setDraftDate(toDateKey(entry.date) ?? format(new Date(), "yyyy-MM-dd"));
    setRecurring(Boolean(entry.recurring));
    setEntryOpen(true);
  }

  async function handleEntrySubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await run(() =>
      editing
        ? updateScheduleEntry(editing.id, formData)
        : createScheduleEntry(formData)
    );
    if (result?.error) {
      toast.error("Could not save");
      return;
    }
    toast.success(
      editing
        ? "Updated"
        : recurring
          ? "Added — will repeat automatically"
          : "Added to schedule"
    );
    setEntryOpen(false);
    setEditing(null);
  }

  async function handleJobSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await run(() => saveJobHours(formData));
    if (result?.error) {
      toast.error("Could not save job hours");
      return;
    }
    toast.success("Job hours updated — applied every week");
    setJobOpen(false);
  }

  async function handleHolidaySubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await run(() => createScheduleHoliday(formData));
    if (result?.error) {
      toast.error("Could not add holiday");
      return;
    }
    toast.success("Holiday added — job hours hidden for those days");
    const form = e.currentTarget;
    form.reset();
    setHolidayStart(format(new Date(), "yyyy-MM-dd"));
    setHolidayEnd(format(new Date(), "yyyy-MM-dd"));
  }

  async function handleDeleteHoliday(id: string) {
    if (!confirm("Remove this holiday?")) return;
    const result = await run(() => deleteScheduleHoliday(id));
    if (result?.error) toast.error("Could not delete");
    else toast.success("Holiday removed");
  }

  async function handleToggle(item: WeekScheduleItem) {
    if (item.source !== "entry") return;
    const result = await run(() => toggleScheduleEntryDone(item.id, !item.done));
    if (result?.error) toast.error("Could not update");
  }

  async function handleDelete(id: string) {
    const result = await run(() => deleteScheduleEntry(id));
    if (result?.error) toast.error("Could not delete");
    else toast.success("Removed");
  }

  const weekLabel = `${format(weekStart, "d MMM")} – ${format(weekEnd, "d MMM yyyy")}`;

  function renderDayItems(day: Date, compact = false) {
    const items = itemsForDate(day, blocks, entries, holidays);
    return (
      <ul className={cn("space-y-1.5 p-2", compact ? "min-h-0" : "min-h-[8rem]")}>
        {items.length === 0 && (
          <li className="px-1 py-6 text-center text-xs text-muted-foreground/70">
            Free
          </li>
        )}
        {items.map((item) => {
          const range = item.allDay
            ? "All day"
            : formatTimeRange(item.start_time, item.end_time);
          const repeat = item.recurring
            ? recurringLabel(item.recurring_interval) ?? "Repeats"
            : null;
          const itemColor =
            item.source === "holiday"
              ? HOLIDAY_ITEM_COLOR
              : SCHEDULE_KIND_COLORS[item.kind] ?? SCHEDULE_KIND_COLORS.other;
          return (
            <li
              key={item.key}
              className={cn(
                "group rounded-lg border px-2.5 py-2 text-xs transition-opacity sm:px-2 sm:py-1.5",
                itemColor,
                item.done && "opacity-50"
              )}
            >
              <div className="flex items-start gap-2">
                {item.source === "entry" && !item.recurring ? (
                  <button
                    type="button"
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border sm:h-3.5 sm:w-3.5",
                      item.done
                        ? "border-emerald-400 bg-emerald-400 text-background"
                        : "border-current/40"
                    )}
                    onClick={() => handleToggle(item)}
                    disabled={isPending}
                    aria-label={item.done ? "Mark not done" : "Mark done"}
                  >
                    {item.done && <Check className="h-3 w-3 sm:h-2.5 sm:w-2.5" />}
                  </button>
                ) : item.source === "holiday" ? (
                  <Sun className="mt-0.5 h-4 w-4 shrink-0 opacity-70 sm:h-3 sm:w-3" />
                ) : (
                  <Repeat className="mt-0.5 h-4 w-4 shrink-0 opacity-70 sm:h-3 sm:w-3" />
                )}
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "font-medium leading-snug text-sm sm:text-xs",
                      item.done && "line-through"
                    )}
                  >
                    {item.title}
                  </p>
                  {(range || repeat) && (
                    <p className="mt-0.5 text-[11px] opacity-70 sm:text-[10px]">
                      {[range, repeat].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
                {item.source === "entry" && (
                  <div className="flex shrink-0 items-center gap-0.5 opacity-100 md:opacity-0 md:transition-opacity md:group-hover:opacity-100 md:focus-within:opacity-100">
                    <button
                      type="button"
                      className="rounded-lg p-1.5 hover:bg-background/30 md:p-0.5"
                      onClick={() => openEdit(item)}
                      aria-label="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5 md:h-3 md:w-3" />
                    </button>
                    <button
                      type="button"
                      className="rounded-lg p-1.5 text-destructive hover:bg-background/30 md:p-0.5"
                      onClick={() => {
                        if (confirm("Remove this item?")) handleDelete(item.id);
                      }}
                      aria-label="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5 md:h-3 md:w-3" />
                    </button>
                  </div>
                )}
                {item.source === "holiday" && (
                  <button
                    type="button"
                    className="shrink-0 rounded-lg p-1.5 text-destructive hover:bg-background/30 md:p-0.5 md:opacity-0 md:group-hover:opacity-100"
                    onClick={() => handleDeleteHoliday(item.id)}
                    aria-label="Remove holiday"
                  >
                    <Trash2 className="h-3.5 w-3.5 md:h-3 md:w-3" />
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    );
  }

  function renderDayCard(day: Date, opts?: { showAdd?: boolean }) {
    const items = itemsForDate(day, blocks, entries, holidays);
    const today = isToday(day);
    const onHoliday = items.some((i) => i.source === "holiday");
    return (
      <Card
        className={cn(
          "overflow-hidden",
          today && "ring-1 ring-primary/40",
          onHoliday && "ring-1 ring-emerald-500/30"
        )}
      >
        <CardContent className="p-0">
          <div
            className={cn(
              "flex items-center justify-between border-b border-border/50 px-3 py-2.5",
              today && "bg-primary/5"
            )}
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {format(day, "EEEE")}
              </p>
              <p className={cn("text-lg font-semibold leading-none", today && "text-primary")}>
                {format(day, "d MMM")}
              </p>
            </div>
            {(opts?.showAdd ?? true) && (
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl sm:h-8 sm:w-8 sm:rounded-lg"
                onClick={() => openCreate(day)}
                title="Add to this day"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
          {renderDayItems(day)}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <PageHeader
        title="Schedule"
        description="Monday–Sunday planner. Job hours repeat every week automatically."
        action={
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setJobOpen(true)}
            >
              <Briefcase className="mr-1.5 h-4 w-4" />
              <span className="truncate">Job hours</span>
            </Button>
            <Button
              className="rounded-xl"
              onClick={() => openCreate(activeDay)}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add item
            </Button>
          </div>
        }
      />

      {jobSummary && (
        <div className="mb-4 flex gap-3 rounded-xl border border-sky-500/25 bg-sky-500/5 px-3 py-3 text-sm sm:mb-6 sm:px-4">
          <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
          <p className="min-w-0 leading-relaxed">
            <span className="font-medium text-sky-300">{jobSummary.title}</span>
            <span className="text-muted-foreground"> · </span>
            {jobSummary.start_time}–{jobSummary.end_time}
            <span className="text-muted-foreground"> · </span>
            {jobSummary.days
              .map((d) => SCHEDULE_WEEKDAYS.find((w) => w.value === d)?.short)
              .filter(Boolean)
              .join("–")}
            <span className="text-muted-foreground"> — weekly</span>
          </p>
        </div>
      )}

      {upcomingHolidays.length > 0 && (
        <div className="mb-4 flex gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/5 px-3 py-3 text-sm sm:mb-6 sm:px-4">
          <Sun className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
          <p className="min-w-0 leading-relaxed text-emerald-200/90">
            <span className="font-medium text-emerald-300">
              {upcomingHolidays[0].title}
            </span>
            <span className="text-muted-foreground"> · </span>
            {formatHolidayRange(upcomingHolidays[0])}
            {upcomingHolidays.length > 1 && (
              <span className="text-muted-foreground">
                {" "}
                · +{upcomingHolidays.length - 1} more
              </span>
            )}
          </p>
        </div>
      )}

      <div className="mb-3 flex flex-col gap-3 sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-xl sm:h-9 sm:w-9"
            onClick={() => setCursor((c) => subWeeks(c, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-10 flex-1 rounded-xl sm:h-9 sm:flex-none"
            onClick={() => {
              const now = new Date();
              setCursor(now);
              setSelectedDay(now);
            }}
          >
            This week
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-xl sm:h-9 sm:w-9"
            onClick={() => setCursor((c) => addWeeks(c, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-center text-sm font-medium text-muted-foreground sm:text-right">
          {weekLabel}
        </p>
      </div>

      {/* Mobile: day strip + single day */}
      <div className="md:hidden">
        <div className="-mx-1 mb-3 flex gap-1.5 overflow-x-auto px-1 pb-1 touch-pan-x">
          {days.map((day) => {
            const count = itemsForDate(day, blocks, entries, holidays).length;
            const active = isSameDay(day, activeDay);
            const today = isToday(day);
            const onHoliday = Boolean(
              itemsForDate(day, blocks, entries, holidays).some((i) => i.source === "holiday")
            );
            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={cn(
                  "flex min-w-[3.25rem] shrink-0 flex-col items-center rounded-2xl border px-2 py-2.5 transition-colors",
                  active
                    ? "border-primary/40 bg-primary/10 ring-1 ring-inset ring-primary/20"
                    : "border-border/50 bg-card/40",
                  onHoliday && !active && "border-emerald-500/30",
                  today && !active && "border-primary/25"
                )}
              >
                <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {format(day, "EEE")}
                </span>
                <span
                  className={cn(
                    "mt-1 flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold",
                    today && "bg-primary text-primary-foreground"
                  )}
                >
                  {format(day, "d")}
                </span>
                <span
                  className={cn(
                    "mt-1.5 h-1 w-1 rounded-full",
                    count > 0 ? (onHoliday ? "bg-emerald-400" : "bg-sky-400") : "bg-transparent"
                  )}
                />
              </button>
            );
          })}
        </div>
        {renderDayCard(activeDay)}
      </div>

      {/* Desktop / tablet: multi-day grid (same as before) */}
      <div className="hidden gap-3 md:grid md:grid-cols-2 xl:grid-cols-7">
        {days.map((day) => {
          const today = isToday(day);
          const onHoliday = itemsForDate(day, blocks, entries, holidays).some(
            (i) => i.source === "holiday"
          );
          return (
            <Card
              key={day.toISOString()}
              className={cn(
                "overflow-hidden",
                today && "ring-1 ring-primary/40",
                onHoliday && "ring-1 ring-emerald-500/30"
              )}
            >
              <CardContent className="p-0">
                <div
                  className={cn(
                    "flex items-center justify-between border-b border-border/50 px-3 py-2.5",
                    today && "bg-primary/5"
                  )}
                >
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {format(day, "EEE")}
                    </p>
                    <p className={cn("text-lg font-semibold leading-none", today && "text-primary")}>
                      {format(day, "d")}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={() => openCreate(day)}
                    title="Add to this day"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {renderDayItems(day)}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add / edit entry */}
      <Dialog open={entryOpen} onOpenChange={setEntryOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit item" : "Add to schedule"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEntrySubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                required
                className="mt-1"
                defaultValue={editing?.title ?? ""}
                placeholder="What are you doing?"
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="date">{recurring ? "Starts on" : "Date"}</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  required
                  className="mt-1"
                  value={draftDate}
                  onChange={(e) => setDraftDate(e.target.value)}
                />
              </div>
              <FormSelect
                label="Type"
                name="kind"
                defaultValue={editing?.kind ?? "task"}
                options={SCHEDULE_KINDS.filter((k) => k !== "job").map((k) => ({
                  value: k,
                  label: SCHEDULE_KIND_LABELS[k],
                }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="start_time">Start</Label>
                <Input
                  id="start_time"
                  name="start_time"
                  type="time"
                  className="mt-1"
                  defaultValue={editing?.start_time ?? ""}
                />
              </div>
              <div>
                <Label htmlFor="end_time">End</Label>
                <Input
                  id="end_time"
                  name="end_time"
                  type="time"
                  className="mt-1"
                  defaultValue={editing?.end_time ?? ""}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                className="mt-1"
                rows={2}
                defaultValue={editing?.notes ?? ""}
              />
            </div>
            <div className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-3">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  name="recurring"
                  value="true"
                  checked={recurring}
                  onChange={(e) => setRecurring(e.target.checked)}
                  className="accent-sky-400"
                />
                <Repeat className="h-3.5 w-3.5 text-muted-foreground" />
                Repeats
              </label>
              {recurring && (
                <div key={editing?.id ?? "new-recurring"}>
                  <FormSelect
                    label="How often"
                    name="recurring_interval"
                    defaultValue={editing?.recurring_interval ?? "weekly"}
                    options={SCHEDULE_RECURRING_INTERVALS.map((interval) => ({
                      value: interval,
                      label: SCHEDULE_RECURRING_LABELS[interval],
                    }))}
                  />
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    Starts from the date above, then auto-adds on Schedule and Calendar every period.
                  </p>
                </div>
              )}
            </div>
            {editing && !recurring && (
              <input type="hidden" name="done" value={editing.done ? "true" : "false"} />
            )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => setEntryOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl" disabled={isPending}>
                {editing ? "Save" : "Add"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Job hours + holidays */}
      <Dialog open={jobOpen} onOpenChange={setJobOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Job hours</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            These blocks are added to every matching weekday automatically — no need to re-enter each week.
          </p>
          <form onSubmit={handleJobSubmit} className="space-y-4">
            <div>
              <Label htmlFor="job_title">Label</Label>
              <Input
                id="job_title"
                name="title"
                required
                className="mt-1"
                defaultValue={jobSummary?.title ?? "Work"}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="job_start">Start</Label>
                <Input
                  id="job_start"
                  name="start_time"
                  type="time"
                  required
                  className="mt-1"
                  defaultValue={jobSummary?.start_time ?? "09:00"}
                />
              </div>
              <div>
                <Label htmlFor="job_end">End</Label>
                <Input
                  id="job_end"
                  name="end_time"
                  type="time"
                  required
                  className="mt-1"
                  defaultValue={jobSummary?.end_time ?? "17:00"}
                />
              </div>
            </div>
            <fieldset>
              <legend className="text-sm font-medium">Days</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {SCHEDULE_WEEKDAYS.map((d) => (
                  <label
                    key={d.value}
                    className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border/60 px-2.5 py-1.5 text-xs has-[:checked]:border-sky-500/50 has-[:checked]:bg-sky-500/10"
                  >
                    <input
                      type="checkbox"
                      name="days"
                      value={d.value}
                      defaultChecked={jobDaySet.has(d.value)}
                      className="accent-sky-400"
                    />
                    {d.short}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="enabled"
                value="true"
                defaultChecked={Boolean(jobSummary)}
                className="accent-sky-400"
              />
              Show on schedule every week
            </label>
            <div className="flex justify-end gap-2">
              <Button type="submit" className="rounded-xl" disabled={isPending}>
                Save job hours
              </Button>
            </div>
          </form>

          <div className="my-2 border-t border-border/50" />

          <div className="space-y-3">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Sun className="h-4 w-4 text-emerald-400" />
                Holidays / time off
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Add a date range (e.g. Mon–Fri). Those days show as all-day holiday and hide job hours.
              </p>
            </div>

            {holidays.length > 0 && (
              <ul className="space-y-2">
                {[...holidays]
                  .sort((a, b) =>
                    (toDateKey(a.start_date) ?? "").localeCompare(toDateKey(b.start_date) ?? "")
                  )
                  .map((h) => (
                    <li
                      key={h.id}
                      className="flex items-start justify-between gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-emerald-200">{h.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatHolidayRange(h)}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="shrink-0 rounded p-1 text-destructive hover:bg-background/30"
                        onClick={() => handleDeleteHoliday(h.id)}
                        aria-label="Delete holiday"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
              </ul>
            )}

            <form onSubmit={handleHolidaySubmit} className="space-y-3 rounded-xl border border-border/60 p-3">
              <div>
                <Label htmlFor="holiday_title">Title</Label>
                <Input
                  id="holiday_title"
                  name="title"
                  required
                  className="mt-1"
                  placeholder="Annual leave"
                  defaultValue="Holiday"
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="holiday_start">From</Label>
                  <Input
                    id="holiday_start"
                    name="start_date"
                    type="date"
                    required
                    className="mt-1"
                    value={holidayStart}
                    onChange={(e) => {
                      setHolidayStart(e.target.value);
                      if (e.target.value > holidayEnd) setHolidayEnd(e.target.value);
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="holiday_end">To</Label>
                  <Input
                    id="holiday_end"
                    name="end_date"
                    type="date"
                    required
                    className="mt-1"
                    value={holidayEnd}
                    min={holidayStart}
                    onChange={(e) => setHolidayEnd(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="holiday_notes">Notes</Label>
                <Input
                  id="holiday_notes"
                  name="notes"
                  className="mt-1"
                  placeholder="Optional"
                />
              </div>
              <Button type="submit" variant="outline" className="w-full rounded-xl" disabled={isPending}>
                <Plus className="mr-1 h-4 w-4" />
                Add holiday
              </Button>
            </form>
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => setJobOpen(false)}
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
