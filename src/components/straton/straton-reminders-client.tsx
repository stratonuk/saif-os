"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Clock, Plus, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormSelect } from "@/components/shared/form-field";
import { STRATON_REMINDER_TYPES } from "@/lib/constants";
import { formatDate, daysUntil, cn } from "@/lib/utils";
import { createStratonReminder, completeStratonReminder } from "@/actions/straton";
import { useRefreshAction } from "@/hooks/use-refresh-action";
import type { StratonClient, StratonProject, StratonClientReminder } from "@/lib/types";

const REMINDER_LABELS: Record<string, string> = {
  follow_up: "Follow up",
  send_invoice: "Send invoice",
  chase_payment: "Chase payment",
  renew_hosting: "Renew hosting",
  renew_domain: "Renew domain",
  annual_review: "Annual review",
  custom: "Custom",
};

export function StratonRemindersClient({
  reminders,
  clients,
  projects,
}: {
  reminders: StratonClientReminder[];
  clients: StratonClient[];
  projects: StratonProject[];
}) {
  const searchParams = useSearchParams();
  const { run, isPending } = useRefreshAction();
  const [filter, setFilter] = useState<"open" | "completed" | "all">("open");
  const [dialogOpen, setDialogOpen] = useState(searchParams.get("new") === "1");

  const clientMap = useMemo(
    () => new Map(clients.map((c) => [c.id, c])),
    [clients]
  );
  const projectMap = useMemo(
    () => new Map(projects.map((p) => [p.id, p])),
    [projects]
  );

  const openReminders = reminders.filter((r) => !r.completed);
  const overdueCount = openReminders.filter((r) => daysUntil(r.due_date) < 0).length;

  const filtered = useMemo(() => {
    const sorted = [...reminders].sort(
      (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    );
    if (filter === "open") return sorted.filter((r) => !r.completed);
    if (filter === "completed") return sorted.filter((r) => r.completed);
    return sorted;
  }, [reminders, filter]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await run(() => createStratonReminder(formData));
    if (result?.error) { toast.error("Could not save"); return; }
    toast.success("Reminder created");
    setDialogOpen(false);
  }

  const clientOptions = clients.map((c) => ({ value: c.id, label: c.client_name }));
  const projectOptions = projects.map((p) => ({
    value: p.id,
    label: `${p.name} (${clientMap.get(p.client_id)?.client_name ?? "?"})`,
  }));

  return (
    <>
      <PageHeader
        title="Client Reminders"
        description="Follow-ups, invoice chases, and renewal reminders."
        action={
          <Button onClick={() => setDialogOpen(true)} className="rounded-xl" disabled={clients.length === 0}>
            <Plus className="h-4 w-4 mr-1" /> Add Reminder
          </Button>
        }
      />

      {overdueCount > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <p className="text-sm">
            <span className="font-semibold text-red-400">
              {overdueCount} overdue reminder{overdueCount > 1 ? "s" : ""}
            </span>
          </p>
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        {(["open", "completed", "all"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            className="rounded-xl capitalize"
            onClick={() => setFilter(f)}
          >
            {f === "open"
              ? `Open (${openReminders.length})`
              : f === "completed"
                ? `Completed (${reminders.length - openReminders.length})`
                : `All (${reminders.length})`}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No reminders"
          description="Set reminders for follow-ups, invoices, and renewals."
          action={
            clients.length > 0 ? (
              <Button onClick={() => setDialogOpen(true)} className="rounded-xl">Add Reminder</Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((reminder) => {
            const overdue = !reminder.completed && daysUntil(reminder.due_date) < 0;
            const client = clientMap.get(reminder.client_id);
            const project = reminder.project_id ? projectMap.get(reminder.project_id) : null;
            return (
              <Card
                key={reminder.id}
                className={cn(
                  reminder.completed && "opacity-60",
                  overdue && "border-red-500/30 bg-red-500/[0.02]"
                )}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className={cn("font-medium", reminder.completed && "line-through")}>
                        {reminder.title}
                      </h3>
                      <p className="text-sm text-primary mt-0.5">{client?.client_name}</p>
                      {project && (
                        <p className="text-xs text-muted-foreground mt-0.5">{project.name}</p>
                      )}
                    </div>
                    <Badge variant="outline" className="shrink-0 text-xs">
                      {REMINDER_LABELS[reminder.reminder_type] ?? reminder.reminder_type}
                    </Badge>
                  </div>

                  <p className={cn("text-xs mt-3", overdue ? "text-red-400 font-medium" : "text-muted-foreground")}>
                    Due {formatDate(reminder.due_date)}
                    {overdue && ` (${Math.abs(daysUntil(reminder.due_date))}d overdue)`}
                  </p>

                  {reminder.notes && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{reminder.notes}</p>
                  )}

                  {!reminder.completed && (
                    <div className="mt-4 pt-3 border-t border-border/50">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg text-xs"
                        disabled={isPending}
                        onClick={async () => {
                          await run(() => completeStratonReminder(reminder.id));
                          toast.success("Reminder completed");
                        }}
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-1" /> Complete
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Reminder</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormSelect
              label="Client"
              name="client_id"
              options={[{ value: "", label: "Select client" }, ...clientOptions]}
            />
            <FormSelect
              label="Project (optional)"
              name="project_id"
              options={[{ value: "", label: "None" }, ...projectOptions]}
            />
            <div>
              <Label>Title</Label>
              <Input name="title" required className="mt-1" />
            </div>
            <FormSelect
              label="Type"
              name="reminder_type"
              defaultValue="follow_up"
              options={STRATON_REMINDER_TYPES.map((t) => ({
                value: t,
                label: REMINDER_LABELS[t] ?? t,
              }))}
            />
            <div>
              <Label>Due date</Label>
              <Input name="due_date" type="date" required className="mt-1" />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea name="notes" className="mt-1" />
            </div>
            <Button type="submit" className="w-full rounded-xl" disabled={isPending}>
              {isPending ? "Saving…" : "Create Reminder"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
