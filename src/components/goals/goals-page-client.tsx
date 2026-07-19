"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Target, Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDelete } from "@/components/shared/confirm-delete";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormSelect } from "@/components/shared/form-field";
import { GOAL_TYPES, GOAL_TYPE_LABELS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import { createGoal, updateGoal, deleteGoal, updateGoalProgress } from "@/actions/goals";
import { useRefreshAction } from "@/hooks/use-refresh-action";
import type { Goal, GoalType } from "@/lib/types";

function isMoneyUnit(unit?: string | null) {
  if (!unit) return false;
  const u = unit.trim().toUpperCase();
  return u === "GBP" || u === "£" || u === "USD" || u === "$" || u === "EUR" || u === "€";
}

function formatGoalProgress(goal: Goal) {
  if (isMoneyUnit(goal.unit)) {
    return `${formatCurrency(goal.current_value)} / ${formatCurrency(goal.target_value)}`;
  }
  const unit = goal.unit?.trim();
  return unit
    ? `${goal.current_value} / ${goal.target_value} ${unit}`
    : `${goal.current_value} / ${goal.target_value}`;
}

export function GoalsPageClient({ goals }: { goals: Goal[] }) {
  const searchParams = useSearchParams();
  const { run, isPending } = useRefreshAction();
  const [dialogOpen, setDialogOpen] = useState(searchParams.get("new") === "1");
  const [editing, setEditing] = useState<Goal | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<string, Goal[]>();
    for (const type of GOAL_TYPES) map.set(type, []);
    for (const goal of goals) {
      const key = GOAL_TYPES.includes(goal.type as GoalType) ? goal.type : "other";
      const list = map.get(key) ?? [];
      list.push(goal);
      map.set(key, list);
    }
    return map;
  }, [goals]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await run(() =>
      editing ? updateGoal(editing.id, formData) : createGoal(formData)
    );
    if (result?.error) { toast.error("Could not save"); return; }
    toast.success(editing ? "Updated" : "Created");
    setDialogOpen(false);
    setEditing(null);
  }

  async function quickUpdateProgress(goal: Goal, delta: number) {
    const next = Math.max(0, goal.current_value + delta);
    await run(() => updateGoalProgress(goal.id, next));
    toast.success("Progress updated");
  }

  return (
    <>
      <PageHeader
        title="Goals"
        description="Track anything — fitness, learning, habits, money, or custom targets."
        action={
          <Button
            onClick={() => { setEditing(null); setDialogOpen(true); }}
            className="rounded-xl"
          >
            <Plus className="h-4 w-4 mr-1" /> New Goal
          </Button>
        }
      />

      {goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No goals"
          description="Set any target you care about and track progress."
          action={<Button onClick={() => setDialogOpen(true)} className="rounded-xl">New Goal</Button>}
        />
      ) : (
        <div className="space-y-8">
          {GOAL_TYPES.map((type) => {
            const items = grouped.get(type) ?? [];
            if (items.length === 0) return null;
            return (
              <section key={type}>
                <h2 className="text-lg font-semibold mb-4">{GOAL_TYPE_LABELS[type] ?? type}</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {items.map((goal) => {
                    const pct = Math.min(100, Math.round((goal.current_value / goal.target_value) * 100));
                    const money = isMoneyUnit(goal.unit);
                    const step = money ? 500 : 1;
                    return (
                      <Card key={goal.id}>
                        <CardContent className="p-5">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="font-medium">{goal.title}</h3>
                            <Badge variant="outline" className="border-0">{pct}%</Badge>
                          </div>
                          <Progress value={pct} className="h-2" />
                          <p className="text-sm text-muted-foreground mt-3">
                            {formatGoalProgress(goal)}
                          </p>
                          {goal.target_date && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Target: {formatDate(goal.target_date)}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-2 mt-4">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="rounded-lg"
                              onClick={() => quickUpdateProgress(goal, step)}
                            >
                              +{money ? formatCurrency(step) : step}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-lg"
                              onClick={() => quickUpdateProgress(goal, -step)}
                            >
                              -
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { setEditing(goal); setDialogOpen(true); }}
                            >
                              <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                            </Button>
                            <ConfirmDelete
                              onDelete={async () => {
                                await run(() => deleteGoal(goal.id));
                                toast.success("Deleted");
                              }}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Goal" : "New Goal"}</DialogTitle>
          </DialogHeader>
          <form key={editing?.id ?? "new"} onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                name="title"
                defaultValue={editing?.title}
                required
                className="mt-1"
                placeholder="e.g. Read 12 books, Run 5k, Emergency fund"
              />
            </div>
            <FormSelect
              label="Category"
              name="type"
              defaultValue={editing?.type ?? "personal"}
              options={GOAL_TYPES.map((t) => ({
                value: t,
                label: GOAL_TYPE_LABELS[t] ?? t,
              }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Current</Label>
                <Input
                  name="current_value"
                  type="number"
                  min="0"
                  step="any"
                  defaultValue={editing?.current_value ?? 0}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Target</Label>
                <Input
                  name="target_value"
                  type="number"
                  min="1"
                  step="any"
                  defaultValue={editing?.target_value ?? 1}
                  required
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Target date</Label>
                <Input
                  name="target_date"
                  type="date"
                  defaultValue={editing?.target_date ?? ""}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Unit</Label>
                <Input
                  name="unit"
                  placeholder="books, km, workouts, £…"
                  defaultValue={editing?.unit ?? ""}
                  className="mt-1"
                />
              </div>
            </div>
            <Button type="submit" className="w-full rounded-xl" disabled={isPending}>
              Save
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
