"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CreditCard, Plus, Pencil, Calendar } from "lucide-react";
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
import {
  SUBSCRIPTION_BILLING_CYCLES,
  SUBSCRIPTION_CATEGORIES,
  SUBSCRIPTION_STATUSES,
  SUBSCRIPTION_CATEGORY_LABELS,
  PAYMENT_METHODS,
} from "@/lib/constants";
import { monthlySubscriptionCost, annualSubscriptionCost } from "@/lib/subscription-utils";
import { formatCurrency, formatDate, daysUntil, cn } from "@/lib/utils";
import { createSubscription, updateSubscription, deleteSubscription } from "@/actions/modules";
import { useRefreshAction } from "@/hooks/use-refresh-action";
import type { Subscription } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  active: "text-emerald-400 bg-emerald-400/10",
  paused: "text-amber-400 bg-amber-400/10",
  cancelled: "text-muted-foreground bg-muted",
};

export function SubscriptionsPageClient({ subscriptions }: { subscriptions: Subscription[] }) {
  const searchParams = useSearchParams();
  const { run, isPending } = useRefreshAction();
  const [filter, setFilter] = useState<"all" | "active">("all");
  const [dialogOpen, setDialogOpen] = useState(searchParams.get("new") === "1");
  const [editing, setEditing] = useState<Subscription | null>(null);
  const [autoRenew, setAutoRenew] = useState(true);

  const filtered = useMemo(
    () => (filter === "active" ? subscriptions.filter((s) => s.status === "active") : subscriptions),
    [subscriptions, filter]
  );

  const monthlyTotal = useMemo(
    () => subscriptions.reduce((sum, s) => sum + monthlySubscriptionCost(s), 0),
    [subscriptions]
  );
  const annualTotal = useMemo(
    () => subscriptions.reduce((sum, s) => sum + annualSubscriptionCost(s), 0),
    [subscriptions]
  );

  const upcomingCount = subscriptions.filter(
    (s) => s.status === "active" && s.renewal_date && daysUntil(s.renewal_date) <= 30 && daysUntil(s.renewal_date) >= 0
  ).length;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await run(() =>
      editing ? updateSubscription(editing.id, formData) : createSubscription(formData)
    );
    if (result?.error) { toast.error("Could not save"); return; }
    toast.success(editing ? "Subscription updated" : "Subscription added");
    setDialogOpen(false);
    setEditing(null);
  }

  function openCreate() {
    setEditing(null);
    setAutoRenew(true);
    setDialogOpen(true);
  }

  function openEdit(sub: Subscription) {
    setEditing(sub);
    setAutoRenew(sub.auto_renew);
    setDialogOpen(true);
  }

  return (
    <>
      <PageHeader
        title="Subscriptions"
        description="Track recurring costs, renewal dates, and monthly spend."
        action={
          <Button onClick={openCreate} className="rounded-xl">
            <Plus className="h-4 w-4 mr-1" /> Add Subscription
          </Button>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border/50 bg-muted/30 px-4 py-3">
          <p className="text-2xl font-bold">{formatCurrency(monthlyTotal)}</p>
          <p className="text-xs text-muted-foreground">Monthly total</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-muted/30 px-4 py-3">
          <p className="text-2xl font-bold">{formatCurrency(annualTotal)}</p>
          <p className="text-xs text-muted-foreground">Annual total</p>
        </div>
        <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3">
          <p className="text-2xl font-bold text-amber-400">{upcomingCount}</p>
          <p className="text-xs text-muted-foreground">Renewing in 30 days</p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {(["all", "active"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            className="rounded-xl capitalize"
            onClick={() => setFilter(f)}
          >
            {f}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No subscriptions yet"
          description="Add your streaming services, software, hosting, and other recurring costs to track spend and renewals."
          action={<Button onClick={openCreate} className="rounded-xl">Add Subscription</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered
            .sort((a, b) => {
              if (!a.renewal_date) return 1;
              if (!b.renewal_date) return -1;
              return new Date(a.renewal_date).getTime() - new Date(b.renewal_date).getTime();
            })
            .map((sub) => {
              const days = sub.renewal_date ? daysUntil(sub.renewal_date) : null;
              return (
                <Card
                  key={sub.id}
                  className={cn(
                    "transition-all active:scale-[0.98] touch-manipulation",
                    days !== null && days < 0 && "border-red-500/30",
                    days !== null && days >= 0 && days <= 7 && "border-amber-400/20"
                  )}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium">{sub.name}</h3>
                        {sub.provider && (
                          <p className="text-sm text-muted-foreground mt-0.5">{sub.provider}</p>
                        )}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <Badge variant="outline" className="border-0 bg-muted">
                            {SUBSCRIPTION_CATEGORY_LABELS[sub.category] ?? sub.category}
                          </Badge>
                          <Badge className={cn("border-0 capitalize", STATUS_COLORS[sub.status])}>
                            {sub.status}
                          </Badge>
                        </div>
                      </div>
                      {sub.renewal_date && days !== null && (
                        <div className={cn(
                          "flex flex-col items-center rounded-xl px-3 py-2 min-w-[64px] border",
                          days < 0 ? "border-red-500/30 bg-red-500/5 text-red-400" :
                          days <= 7 ? "border-amber-400/30 bg-amber-400/5 text-amber-400" :
                          "border-border/50 bg-muted/30"
                        )}>
                          <Calendar className="h-4 w-4 mb-1 opacity-70" />
                          <span className="text-lg font-semibold">
                            {days < 0 ? Math.abs(days) : days <= 0 ? "!" : days}
                          </span>
                          <span className="text-[10px] opacity-80">
                            {days < 0 ? "overdue" : days === 0 ? "today" : "days"}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-3 text-sm">
                      <span className="font-semibold">
                        {formatCurrency(sub.cost)}
                        <span className="text-muted-foreground font-normal">/{sub.billing_cycle}</span>
                      </span>
                      {sub.renewal_date && (
                        <span className="text-muted-foreground">Renews {formatDate(sub.renewal_date)}</span>
                      )}
                    </div>

                    {sub.auto_renew && (
                      <p className="text-xs text-primary mt-1">Auto-renew enabled</p>
                    )}
                    {sub.notes && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{sub.notes}</p>
                    )}

                    <div className="flex gap-1 mt-3 pt-3 border-t border-border/50">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(sub)}>
                        <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                      </Button>
                      <ConfirmDelete
                        onDelete={async () => {
                          await run(() => deleteSubscription(sub.id));
                          toast.success("Deleted");
                        }}
                      />
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
            <DialogTitle>{editing ? "Edit Subscription" : "New Subscription"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Name</Label><Input name="name" defaultValue={editing?.name} required className="mt-1" /></div>
            <div><Label>Provider</Label><Input name="provider" defaultValue={editing?.provider ?? ""} className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Cost (£)</Label><Input name="cost" type="number" step="0.01" min="0" defaultValue={editing?.cost ?? ""} required className="mt-1" /></div>
              <FormSelect
                label="Billing cycle"
                name="billing_cycle"
                defaultValue={editing?.billing_cycle ?? "monthly"}
                options={SUBSCRIPTION_BILLING_CYCLES.map((c) => ({ value: c, label: c }))}
              />
            </div>
            <div><Label>Renewal date</Label><Input name="renewal_date" type="date" defaultValue={editing?.renewal_date ?? ""} className="mt-1" /></div>
            <FormSelect
              label="Category"
              name="category"
              defaultValue={editing?.category ?? "personal"}
              options={SUBSCRIPTION_CATEGORIES.map((c) => ({ value: c, label: SUBSCRIPTION_CATEGORY_LABELS[c] ?? c }))}
            />
            <FormSelect
              label="Payment method"
              name="payment_method"
              defaultValue={editing?.payment_method ?? "bank"}
              options={PAYMENT_METHODS.map((m) => ({ value: m, label: m }))}
            />
            <FormSelect
              label="Status"
              name="status"
              defaultValue={editing?.status ?? "active"}
              options={SUBSCRIPTION_STATUSES.map((s) => ({ value: s, label: s }))}
            />
            <div><Label>Remind days before</Label><Input name="reminder_days_before" type="number" min="1" defaultValue={editing?.reminder_days_before ?? 7} className="mt-1" /></div>
            <input type="hidden" name="auto_renew" value={autoRenew ? "true" : "false"} />
            <div className="flex items-center justify-between">
              <Label>Auto-renew</Label>
              <Switch checked={autoRenew} onCheckedChange={setAutoRenew} />
            </div>
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
