"use client";

import { useState } from "react";
import { FolderKanban, Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDelete } from "@/components/shared/confirm-delete";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormSelect } from "@/components/shared/form-field";
import { PROJECT_STATUSES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { createProject, updateProject, deleteProject } from "@/actions/projects";
import { useRefreshAction } from "@/hooks/use-refresh-action";
import type { Project, Task } from "@/lib/types";

export function ProjectsPageClient({
  projects,
  tasks,
}: {
  projects: Project[];
  tasks: Task[];
}) {
  const { run, isPending } = useRefreshAction();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);

  const byStatus = PROJECT_STATUSES.reduce(
    (acc, status) => {
      acc[status] = projects.filter((p) => p.status === status);
      return acc;
    },
    {} as Record<string, Project[]>
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await run(() =>
      editing ? updateProject(editing.id, formData) : createProject(formData)
    );
    if (result?.error) { toast.error("Could not save"); return; }
    toast.success(editing ? "Updated" : "Created");
    setDialogOpen(false);
    setEditing(null);
  }

  return (
    <>
      <PageHeader title="Projects" description="Side businesses and personal ventures." action={<Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="rounded-xl"><Plus className="h-4 w-4 mr-1" /> New Project</Button>} />

      {projects.length === 0 ? (
        <EmptyState icon={FolderKanban} title="No projects" description="Start tracking your ventures." action={<Button onClick={() => setDialogOpen(true)} className="rounded-xl">New Project</Button>} />
      ) : (
        <>
          <div className="flex gap-4 overflow-x-auto pb-4 mb-8">
            {PROJECT_STATUSES.map((status) => (
              <div key={status} className="flex-shrink-0 w-72 rounded-2xl bg-muted/30 p-3">
                <h3 className="text-sm font-semibold capitalize mb-3 px-1 flex justify-between">{status}<span className="text-xs text-muted-foreground font-normal">{byStatus[status]?.length ?? 0}</span></h3>
                <div className="space-y-3">
                  {(byStatus[status] ?? []).map((project) => {
                    const linked = tasks.filter((t) => t.project_id === project.id);
                    const profit = Number(project.revenue) - Number(project.expenses);
                    return (
                      <Card key={project.id} className="shadow-sm cursor-pointer hover:border-primary/30" onClick={() => { setEditing(project); setDialogOpen(true); }}>
                        <CardContent className="p-4">
                          <h4 className="font-medium text-sm">{project.name}</h4>
                          <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full bg-gradient-to-r from-success/70 to-success rounded-full" style={{ width: `${project.progress}%` }} /></div>
                          <p className={cnProfit(profit)}>{formatCurrency(profit)} net · {linked.length} tasks</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {projects.map((project) => (
              <Card key={project.id}>
                <CardContent className="p-5">
                  <div className="flex justify-between items-start">
                    <div><h4 className="font-semibold">{project.name}</h4><p className="text-sm text-muted-foreground capitalize">{project.status}</p></div>
                    <span className="text-2xl font-semibold text-primary">{project.progress}%</span>
                  </div>
                  {project.description && <p className="text-sm text-muted-foreground mt-2">{project.description}</p>}
                  <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                    <div className="rounded-lg bg-muted/50 p-2"><p className="text-xs text-muted-foreground">Revenue</p><p className="font-medium text-emerald-400">{formatCurrency(project.revenue)}</p></div>
                    <div className="rounded-lg bg-muted/50 p-2"><p className="text-xs text-muted-foreground">Expenses</p><p className="font-medium text-red-400">{formatCurrency(project.expenses)}</p></div>
                  </div>
                  <div className="flex gap-1 mt-3">
                    <Button variant="ghost" size="sm" onClick={() => { setEditing(project); setDialogOpen(true); }}><Pencil className="h-3.5 w-3.5 mr-1" /> Edit</Button>
                    <ConfirmDelete onDelete={async () => { await run(() => deleteProject(project.id)); toast.success("Deleted"); }} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Project" : "New Project"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Name</Label><Input name="name" defaultValue={editing?.name} required className="mt-1" /></div>
            <div><Label>Description</Label><Textarea name="description" defaultValue={editing?.description ?? ""} className="mt-1" /></div>
            <FormSelect label="Status" name="status" defaultValue={editing?.status ?? "idea"} options={PROJECT_STATUSES.map((s) => ({ value: s, label: s }))} />
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Revenue (£)</Label><Input name="revenue" type="number" min="0" defaultValue={editing?.revenue ?? 0} className="mt-1" /></div>
              <div><Label>Expenses (£)</Label><Input name="expenses" type="number" min="0" defaultValue={editing?.expenses ?? 0} className="mt-1" /></div>
            </div>
            <div><Label>Progress (%)</Label><Input name="progress" type="number" min="0" max="100" defaultValue={editing?.progress ?? 0} className="mt-1" /></div>
            <div><Label>Notes</Label><Textarea name="notes" defaultValue={editing?.notes ?? ""} className="mt-1" /></div>
            <Button type="submit" className="w-full rounded-xl" disabled={isPending}>Save</Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function cnProfit(profit: number) {
  return `text-xs mt-2 ${profit >= 0 ? "text-emerald-400" : "text-red-400"}`;
}
