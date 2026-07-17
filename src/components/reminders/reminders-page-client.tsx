"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Shield, Plus, Pencil, Calendar } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDelete } from "@/components/shared/confirm-delete";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { FormSelect } from "@/components/shared/form-field";
import { REMINDER_TYPES, REMINDER_TYPE_LABELS, RECURRING_INTERVALS } from "@/lib/constants";
import { getReminderUrgency, getReminderUrgencyColor } from "@/lib/reminder-utils";
import { formatDate, daysUntil, cn } from "@/lib/utils";
import { createReminder, updateReminder, deleteReminder } from "@/actions/reminders";
import { useRefreshAction } from "@/hooks/use-refresh-action";
import { useCommandPalette } from "@/components/command-palette/command-palette-provider";
import type { Reminder } from "@/lib/types";

const ADMIN_CATEGORIES = [
  "tax",
  "company_accounts",
  "mot",
  "insurance",
  "warranty",
  "subscription",
  "bill",
  "birthday",
  "personal",
] as const;

export function RemindersPageClient({ reminders }: { reminders: Reminder[] }) {
  const searchParams = useSearchParams();
  const { run, isPending } = useRefreshAction();
  const { openCapture } = useCommandPalette();
  const [filterType, setFilterType] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(searchParams.get("new") === "1");
  const [editing, setEditing] = useState<Reminder | null>(null);
  const [recurring, setRecurring] = useState(false);

  const filtered = useMemo(
    () => (filterType === "all" ? reminders : reminders.filter((r) => r.type === filterType)),
    [reminders, filterType]
  );

  const overdueCount = reminders.filter((r) => daysUntil(r.due_date) < 0).length;
  const urgentCount = reminders.filter((r) => {
    const d = daysUntil(r.due_date);
    return d >= 0 && d <= 7;
  }).length;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await run(() =>
      editing ? updateReminder(editing.id, formData) : createReminder(formData)
    );
    if (result?.error) { toast.error("Could not save"); return; }
    toast.success(editing ? "Reminder updated" : "Reminder created");
    setDialogOpen(false);
    setEditing(null);
  }

  function openCreate() {
    setEditing(null);
    setRecurring(false);
    setDialogOpen(true);
  }

  function openEdit(r: Reminder) {
    setEditing(r);
    setRecurring(r.recurring);
    setDialogOpen(true);
  }

  return (
    <>
      <PageHeader
        title="Life Admin"
        description="Tax, MOT, insurance, bills, birthdays and everything that needs tracking."
        action={<Button onClick={openCreate} className="rounded-xl"><Plus className="h-4 w-4 mr-1" /> Add Reminder</Button>}
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border/50 bg-muted/30 px-4 py-3">
          <p className="text-2xl font-bold">{reminders.length}</p>
          <p className="text-xs text-muted-foreground">Total reminders</p>
        </div>
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
          <p className="text-2xl font-bold text-red-400">{overdueCount}</p>
          <p className="text-xs text-muted-foreground">Overdue</p>
        </div>
        <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3">
          <p className="text-2xl font-bold text-amber-400">{urgentCount}</p>
          <p className="text-xs text-muted-foreground">Due within 7 days</p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Button variant={filterType === "all" ? "default" : "outline"} size="sm" className="rounded-xl" onClick={() => setFilterType("all")}>All</Button>
        {ADMIN_CATEGORIES.map((t) => (
          <Button key={t} variant={filterType === t ? "default" : "outline"} size="sm" className="rounded-xl" onClick={() => setFilterType(t)}>
            {REMINDER_TYPE_LABELS[t] ?? t}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="No reminders yet"
          description="Stay on top of tax deadlines, MOT, insurance renewals, subscriptions and birthdays."
          action={
            <div className="flex flex-wrap gap-2 justify-center">
              <Button onClick={openCreate} className="rounded-xl">Add Reminder</Button>
              <Button variant="outline" onClick={() => openCapture("reminder")} className="rounded-xl">Quick Capture</Button>
            </div>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered
            .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
            .map((reminder) => {
            const days = daysUntil(reminder.due_date);
            const urgency = getReminderUrgency(reminder.due_date);
            return (
              <Card
                key={reminder.id}
                className={cn(
                  "transition-all active:scale-[0.98] touch-manipulation",
                  urgency === "overdue" && "border-red-500/30",
                  urgency === "critical" && "border-red-500/20"
                )}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium">{reminder.title}</h3>
                      <Badge variant="outline" className="mt-2 border-0 bg-muted">
                        {REMINDER_TYPE_LABELS[reminder.type] ?? reminder.type}
                      </Badge>
                    </div>
                    <div className={cn("flex flex-col items-center rounded-xl px-3 py-2 min-w-[64px] border", getReminderUrgencyColor(reminder.due_date))}>
                      <Calendar className="h-4 w-4 mb-1 opacity-70" />
                      <span className="text-lg font-semibold">
                        {days < 0 ? Math.abs(days) : days <= 0 ? "!" : days}
                      </span>
                      <span className="text-[10px] opacity-80">
                        {days < 0 ? "overdue" : days === 0 ? "today" : "days"}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">Due {formatDate(reminder.due_date)}</p>
                  {reminder.recurring && <p className="text-xs text-primary mt-1 capitalize">Recurring · {reminder.recurring_interval}</p>}
                  {reminder.notes && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{reminder.notes}</p>}
                  <div className="flex gap-1 mt-3 pt-3 border-t border-border/50">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(reminder)}><Pencil className="h-3.5 w-3.5 mr-1" /> Edit</Button>
                    <ConfirmDelete onDelete={async () => { await run(() => deleteReminder(reminder.id)); toast.success("Deleted"); }} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Reminder" : "New Reminder"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Title</Label><Input name="title" defaultValue={editing?.title} required className="mt-1" /></div>
            <FormSelect
              label="Category"
              name="type"
              defaultValue={editing?.type ?? "custom"}
              options={REMINDER_TYPES.map((t) => ({ value: t, label: REMINDER_TYPE_LABELS[t] ?? t }))}
            />
            <input type="hidden" name="recurring" value={recurring ? "true" : "false"} />
            <div><Label>Due date</Label><Input name="due_date" type="date" defaultValue={editing?.due_date} required className="mt-1" /></div>
            <div className="flex items-center justify-between"><Label>Recurring</Label><Switch checked={recurring} onCheckedChange={setRecurring} /></div>
            {recurring && (
              <FormSelect label="Interval" name="recurring_interval" defaultValue={editing?.recurring_interval ?? "monthly"} options={RECURRING_INTERVALS.map((i) => ({ value: i, label: i }))} />
            )}
            <div><Label>Notes</Label><Textarea name="notes" defaultValue={editing?.notes ?? ""} className="mt-1" /></div>
            <Button type="submit" className="w-full rounded-xl" disabled={isPending}>{isPending ? "Saving…" : "Save"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
