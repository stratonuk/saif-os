"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Briefcase, Plus, Pencil } from "lucide-react";
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
import { STRATON_PROJECT_STATUSES } from "@/lib/constants";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { getOutstandingBalance } from "@/lib/straton-utils";
import { createStratonProject, updateStratonProject } from "@/actions/straton";
import { useRefreshAction } from "@/hooks/use-refresh-action";
import type { StratonClient, StratonProject } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  enquiry: "text-slate-400 bg-slate-400/10",
  quoted: "text-blue-400 bg-blue-400/10",
  approved: "text-violet-400 bg-violet-400/10",
  in_progress: "text-amber-400 bg-amber-400/10",
  review: "text-cyan-400 bg-cyan-400/10",
  completed: "text-emerald-400 bg-emerald-400/10",
  cancelled: "text-muted-foreground bg-muted",
};

function formatStatus(status: string) {
  return status.replace(/_/g, " ");
}

export function StratonProjectsClient({
  projects,
  clients,
}: {
  projects: StratonProject[];
  clients: StratonClient[];
}) {
  const searchParams = useSearchParams();
  const { run, isPending } = useRefreshAction();
  const [filter, setFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(searchParams.get("new") === "1");
  const [editing, setEditing] = useState<StratonProject | null>(null);

  const clientMap = useMemo(
    () => new Map(clients.map((c) => [c.id, c])),
    [clients]
  );

  const filtered = useMemo(() => {
    if (filter === "all") return projects;
    return projects.filter((p) => p.status === filter);
  }, [projects, filter]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await run(() =>
      editing ? updateStratonProject(editing.id, formData) : createStratonProject(formData)
    );
    if (result?.error) { toast.error("Could not save"); return; }
    toast.success(editing ? "Project updated" : "Project created");
    setDialogOpen(false);
    setEditing(null);
  }

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(project: StratonProject) {
    setEditing(project);
    setDialogOpen(true);
  }

  const clientOptions = clients.map((c) => ({ value: c.id, label: c.client_name }));

  return (
    <>
      <PageHeader
        title="Projects"
        description="Track client projects, quotes, and payments."
        action={
          <Button onClick={openCreate} className="rounded-xl" disabled={clients.length === 0}>
            <Plus className="h-4 w-4 mr-1" /> New Project
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          className="rounded-xl"
          onClick={() => setFilter("all")}
        >
          All ({projects.length})
        </Button>
        {STRATON_PROJECT_STATUSES.map((s) => {
          const count = projects.filter((p) => p.status === s).length;
          if (count === 0 && filter !== s) return null;
          return (
            <Button
              key={s}
              variant={filter === s ? "default" : "outline"}
              size="sm"
              className="rounded-xl capitalize"
              onClick={() => setFilter(s)}
            >
              {formatStatus(s)} ({count})
            </Button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No projects"
          description="Create a project to track work, quotes, and outstanding balances."
          action={
            clients.length > 0 ? (
              <Button onClick={openCreate} className="rounded-xl">New Project</Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((project) => {
            const client = clientMap.get(project.client_id);
            const balance = getOutstandingBalance(project);
            return (
              <Card key={project.id} className="transition-all hover:border-primary/20">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{project.name}</h3>
                        <Badge className={cn("border-0 capitalize", STATUS_COLORS[project.status])}>
                          {formatStatus(project.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-primary mt-1">{client?.client_name ?? "Unknown client"}</p>
                      {project.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{project.description}</p>
                      )}
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                        {project.start_date && <span>Started {formatDate(project.start_date)}</span>}
                        {project.deadline && <span>Due {formatDate(project.deadline)}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <p className="text-lg font-semibold">{formatCurrency(project.price_quoted)}</p>
                        {balance > 0 ? (
                          <p className="text-sm text-amber-400 font-medium">{formatCurrency(balance)} outstanding</p>
                        ) : (
                          <p className="text-sm text-emerald-400">Paid in full</p>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" className="rounded-lg" onClick={() => openEdit(project)}>
                        <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Project" : "New Project"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormSelect
              label="Client"
              name="client_id"
              defaultValue={editing?.client_id ?? ""}
              options={[{ value: "", label: "Select client" }, ...clientOptions]}
            />
            <div>
              <Label>Project name</Label>
              <Input name="name" defaultValue={editing?.name} required className="mt-1" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea name="description" defaultValue={editing?.description ?? ""} className="mt-1" />
            </div>
            <FormSelect
              label="Status"
              name="status"
              defaultValue={editing?.status ?? "enquiry"}
              options={STRATON_PROJECT_STATUSES.map((s) => ({
                value: s,
                label: formatStatus(s),
              }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start date</Label>
                <Input name="start_date" type="date" defaultValue={editing?.start_date ?? ""} className="mt-1" />
              </div>
              <div>
                <Label>Deadline</Label>
                <Input name="deadline" type="date" defaultValue={editing?.deadline ?? ""} className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Price quoted (£)</Label>
                <Input name="price_quoted" type="number" step="0.01" min="0" defaultValue={editing?.price_quoted ?? 0} className="mt-1" />
              </div>
              <div>
                <Label>Amount paid (£)</Label>
                <Input name="amount_paid" type="number" step="0.01" min="0" defaultValue={editing?.amount_paid ?? 0} className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea name="notes" defaultValue={editing?.notes ?? ""} className="mt-1" />
            </div>
            <Button type="submit" className="w-full rounded-xl" disabled={isPending}>
              {isPending ? "Saving…" : "Save"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
