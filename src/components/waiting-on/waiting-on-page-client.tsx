"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Clock, Plus, Pencil, AlertCircle } from "lucide-react";
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
import { FormSelect } from "@/components/shared/form-field";
import { WAITING_STATUSES, WAITING_STATUS_LABELS, WAITING_STATUS_COLORS } from "@/lib/constants";
import { formatDate, daysUntil, cn } from "@/lib/utils";
import { isWaitingOverdue, sortWaitingByUrgency } from "@/lib/waiting-utils";
import { createWaitingItem, updateWaitingItem, deleteWaitingItem, updateWaitingStatus } from "@/actions/waiting-items";
import { useRefreshAction } from "@/hooks/use-refresh-action";
import { useCommandPalette } from "@/components/command-palette/command-palette-provider";
import type { Project, WaitingItem } from "@/lib/types";

export function WaitingOnPageClient({
  items,
  projects,
}: {
  items: WaitingItem[];
  projects: Project[];
}) {
  const searchParams = useSearchParams();
  const { run, isPending } = useRefreshAction();
  const { openCapture } = useCommandPalette();
  const [filter, setFilter] = useState<"all" | "active" | "overdue">("all");
  const [dialogOpen, setDialogOpen] = useState(searchParams.get("new") === "1");
  const [editing, setEditing] = useState<WaitingItem | null>(null);

  const sorted = useMemo(() => sortWaitingByUrgency(items), [items]);

  const filtered = useMemo(() => {
    if (filter === "active") return sorted.filter((i) => i.status !== "resolved");
    if (filter === "overdue") return sorted.filter(isWaitingOverdue);
    return sorted;
  }, [sorted, filter]);

  const overdueCount = items.filter(isWaitingOverdue).length;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await run(() =>
      editing ? updateWaitingItem(editing.id, formData) : createWaitingItem(formData)
    );
    if (result?.error) { toast.error("Could not save"); return; }
    toast.success(editing ? "Updated" : "Added to waiting list");
    setDialogOpen(false);
    setEditing(null);
  }

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(item: WaitingItem) {
    setEditing(item);
    setDialogOpen(true);
  }

  const projectOptions = projects.map((p) => ({ value: p.id, label: p.name }));

  return (
    <>
      <PageHeader
        title="Waiting On"
        description="Track what you're waiting for from other people."
        action={
          <Button onClick={openCreate} className="rounded-xl">
            <Plus className="h-4 w-4 mr-1" /> Add Item
          </Button>
        }
      />

      {overdueCount > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <p className="text-sm">
            <span className="font-semibold text-red-400">{overdueCount} overdue follow-up{overdueCount > 1 ? "s" : ""}</span>
            {" — "}time to chase these up.
          </p>
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        {(["all", "active", "overdue"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            className="rounded-xl capitalize"
            onClick={() => setFilter(f)}
          >
            {f === "overdue" && overdueCount > 0 ? `Overdue (${overdueCount})` : f}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="Nothing waiting on"
          description="Track contracts, replies, and deliverables you're waiting for from others."
          action={
            <div className="flex flex-wrap gap-2 justify-center">
              <Button onClick={openCreate} className="rounded-xl">Add Item</Button>
              <Button variant="outline" onClick={() => openCapture("task")} className="rounded-xl">Quick Capture</Button>
            </div>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((item) => {
            const overdue = isWaitingOverdue(item);
            const project = projects.find((p) => p.id === item.project_id);
            return (
              <Card
                key={item.id}
                className={cn(
                  "transition-all active:scale-[0.98] touch-manipulation",
                  overdue && "border-red-500/30 bg-red-500/[0.02]"
                )}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium">{item.title}</h3>
                      {item.person && (
                        <p className="text-sm text-muted-foreground mt-0.5">{item.person}</p>
                      )}
                    </div>
                    <Badge className={cn("shrink-0 border-0 capitalize", WAITING_STATUS_COLORS[item.status])}>
                      {WAITING_STATUS_LABELS[item.status]}
                    </Badge>
                  </div>

                  {project && (
                    <p className="text-xs text-primary mt-2">{project.name}</p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {item.date_requested && (
                      <span>Requested {formatDate(item.date_requested)}</span>
                    )}
                    {item.follow_up_date && (
                      <span className={cn(overdue && "text-red-400 font-medium")}>
                        Follow up {formatDate(item.follow_up_date)}
                        {overdue && ` (${Math.abs(daysUntil(item.follow_up_date))}d overdue)`}
                      </span>
                    )}
                  </div>

                  {item.notes && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{item.notes}</p>
                  )}

                  <div className="flex flex-wrap gap-1 mt-4 pt-3 border-t border-border/50">
                    {item.status !== "chased" && item.status !== "resolved" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg text-xs"
                        disabled={isPending}
                        onClick={async () => {
                          await run(() => updateWaitingStatus(item.id, "chased"));
                          toast.success("Marked as chased");
                        }}
                      >
                        Mark chased
                      </Button>
                    )}
                    {item.status !== "resolved" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg text-xs"
                        disabled={isPending}
                        onClick={async () => {
                          await run(() => updateWaitingStatus(item.id, "resolved"));
                          toast.success("Resolved!");
                        }}
                      >
                        Resolve
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                      <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                    </Button>
                    <ConfirmDelete onDelete={async () => { await run(() => deleteWaitingItem(item.id)); toast.success("Deleted"); }} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Item" : "New Waiting Item"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Title</Label><Input name="title" defaultValue={editing?.title} required className="mt-1" /></div>
            <div><Label>Person / Company</Label><Input name="person" defaultValue={editing?.person ?? ""} className="mt-1" /></div>
            <FormSelect
              label="Related project"
              name="project_id"
              defaultValue={editing?.project_id ?? ""}
              options={[{ value: "", label: "None" }, ...projectOptions]}
            />
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date requested</Label><Input name="date_requested" type="date" defaultValue={editing?.date_requested ?? ""} className="mt-1" /></div>
              <div><Label>Follow-up date</Label><Input name="follow_up_date" type="date" defaultValue={editing?.follow_up_date ?? ""} className="mt-1" /></div>
            </div>
            <FormSelect
              label="Status"
              name="status"
              defaultValue={editing?.status ?? "waiting"}
              options={WAITING_STATUSES.map((s) => ({ value: s, label: WAITING_STATUS_LABELS[s] }))}
            />
            <div><Label>Notes</Label><Textarea name="notes" defaultValue={editing?.notes ?? ""} className="mt-1" /></div>
            <Button type="submit" className="w-full rounded-xl" disabled={isPending}>
              {isPending ? "Saving…" : "Save"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
