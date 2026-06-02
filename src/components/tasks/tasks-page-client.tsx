"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Pencil, CheckSquare, Circle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDelete } from "@/components/shared/confirm-delete";
import { PriorityBadge, StatusBadge } from "@/components/shared/priority-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormSelect } from "@/components/shared/form-field";
import { NativeSelect } from "@/components/ui/native-select";
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  TASK_CATEGORIES,
} from "@/lib/constants";
import { formatDate, cn } from "@/lib/utils";
import { isTaskOverdue } from "@/lib/task-utils";
import { createTask, updateTask, deleteTask, toggleTaskStatus } from "@/actions/tasks";
import { useRefreshAction } from "@/hooks/use-refresh-action";
import type { Task, Project } from "@/lib/types";

interface TasksPageClientProps {
  tasks: Task[];
  projects: Project[];
}

export function TasksPageClient({ tasks, projects }: TasksPageClientProps) {
  const searchParams = useSearchParams();
  const { run, isPending } = useRefreshAction();
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(searchParams.get("new") === "1");
  const [editing, setEditing] = useState<Task | null>(null);

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (filterPriority !== "all" && t.priority !== filterPriority) return false;
      if (filterStatus !== "all" && t.status !== filterStatus) return false;
      if (filterCategory !== "all" && t.category !== filterCategory) return false;
      return true;
    });
  }, [tasks, filterPriority, filterStatus, filterCategory]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await run(() =>
      editing ? updateTask(editing.id, formData) : createTask(formData)
    );
    if (result?.error) {
      toast.error("Could not save task");
      return;
    }
    toast.success(editing ? "Task updated" : "Task created");
    setDialogOpen(false);
    setEditing(null);
  }

  async function handleDelete(id: string) {
    const result = await run(() => deleteTask(id));
    if (result && "error" in result && result.error) {
      toast.error("Could not delete");
      return;
    }
    toast.success("Task deleted");
  }

  async function handleToggle(id: string) {
    await run(() => toggleTaskStatus(id));
  }

  return (
    <>
      <PageHeader
        title="Tasks"
        description="Manage your to-dos with priority and categories."
        action={
          <Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="rounded-xl">
            <Plus className="h-4 w-4 mr-1" /> Add Task
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-[140px] rounded-xl"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {TASK_PRIORITIES.map((p) => (
              <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px] rounded-xl"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {TASK_STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[140px] rounded-xl"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {TASK_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={CheckSquare} title="No tasks found" description="Create a task or adjust filters." action={<Button onClick={() => setDialogOpen(true)} className="rounded-xl">Add Task</Button>} />
      ) : (
        <div className="space-y-3">
          {filtered.map((task) => {
            const overdue = isTaskOverdue(task);
            const StatusIcon = task.status === "done" ? CheckCircle2 : Circle;
            return (
              <Card key={task.id} className={cn(overdue && "border-red-500/30", task.status === "done" && "opacity-60")}>
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex gap-3 flex-1 min-w-0">
                    <button type="button" onClick={() => handleToggle(task.id)} className="shrink-0 mt-0.5 text-muted-foreground hover:text-primary" disabled={isPending}>
                      <StatusIcon className={cn("h-5 w-5", task.status === "done" && "text-emerald-400")} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className={cn("font-medium", task.status === "done" && "line-through text-muted-foreground")}>{task.title}</h3>
                        {overdue && <span className="text-xs text-red-400 font-medium">Overdue</span>}
                      </div>
                      {task.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{task.description}</p>}
                      <div className="flex flex-wrap gap-2 mt-2">
                        <PriorityBadge priority={task.priority} />
                        <StatusBadge status={task.status} />
                        <span className="text-xs text-muted-foreground capitalize px-2 py-0.5 rounded-lg bg-muted">{task.category}</span>
                        {task.due_date && <span className="text-xs text-muted-foreground">Due {formatDate(task.due_date)}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0 pl-8 sm:pl-0">
                    <Button variant="ghost" size="icon" onClick={() => { setEditing(task); setDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                    <ConfirmDelete onDelete={() => handleDelete(task.id)} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Task" : "New Task"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label htmlFor="title">Title</Label><Input id="title" name="title" defaultValue={editing?.title} required className="mt-1" /></div>
            <div><Label htmlFor="description">Description</Label><Textarea id="description" name="description" defaultValue={editing?.description ?? ""} className="mt-1" /></div>
            <div><Label htmlFor="due_date">Due date</Label><Input id="due_date" name="due_date" type="date" defaultValue={editing?.due_date ?? ""} className="mt-1" /></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FormSelect label="Priority" name="priority" defaultValue={editing?.priority ?? "medium"} options={TASK_PRIORITIES.map((p) => ({ value: p, label: p }))} />
              <FormSelect label="Status" name="status" defaultValue={editing?.status ?? "todo"} options={TASK_STATUSES.map((s) => ({ value: s, label: s.replace("_", " ") }))} />
              <FormSelect label="Category" name="category" defaultValue={editing?.category ?? "personal"} options={TASK_CATEGORIES.map((c) => ({ value: c, label: c }))} />
            </div>
            {projects.length > 0 && (
              <div>
                <Label>Project</Label>
                <NativeSelect
                  name="project_id"
                  defaultValue={editing?.project_id ?? "none"}
                  className="mt-1"
                  options={[
                    { value: "none", label: "None" },
                    ...projects.map((p) => ({ value: p.id, label: p.name })),
                  ]}
                />
              </div>
            )}
            <Button type="submit" className="w-full rounded-xl" disabled={isPending}>{isPending ? "Saving..." : editing ? "Update" : "Create"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
