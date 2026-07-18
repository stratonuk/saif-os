"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Server, Plus, Pencil, AlertCircle } from "lucide-react";
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
import { STRATON_HOSTING_STATUSES } from "@/lib/constants";
import { formatCurrency, formatDate, daysUntil, cn } from "@/lib/utils";
import { getHostingProfit, getHostingRenewalsInDays } from "@/lib/straton-utils";
import { createStratonHosting, updateStratonHosting } from "@/actions/straton";
import { useRefreshAction } from "@/hooks/use-refresh-action";
import type { StratonClient, StratonHosting } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  active: "text-emerald-400 bg-emerald-400/10",
  expiring_soon: "text-amber-400 bg-amber-400/10",
  expired: "text-red-400 bg-red-400/10",
  transferred: "text-teal-400 bg-teal-400/10",
  cancelled: "text-muted-foreground bg-muted",
};

function formatStatus(status: string) {
  return status.replace(/_/g, " ");
}

function HostingCard({
  hosting,
  clientName,
  onEdit,
}: {
  hosting: StratonHosting;
  clientName?: string;
  onEdit: () => void;
}) {
  const profit = getHostingProfit(hosting);
  const days = hosting.renewal_date ? daysUntil(hosting.renewal_date) : null;
  const urgent = days !== null && days >= 0 && days <= 7;
  const expired = days !== null && days < 0;

  return (
    <Card className={cn(urgent && "border-amber-500/30", expired && "border-red-500/30 bg-red-500/[0.02]")}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold truncate">{hosting.domain_name}</h3>
            {clientName && <p className="text-sm text-primary mt-0.5">{clientName}</p>}
            {hosting.hosting_provider && (
              <p className="text-xs text-muted-foreground mt-1">{hosting.hosting_provider}</p>
            )}
          </div>
          <Badge className={cn("shrink-0 border-0 capitalize", STATUS_COLORS[hosting.status])}>
            {formatStatus(hosting.status)}
          </Badge>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-lg bg-muted/40 p-2">
            <p className="text-xs text-muted-foreground">Client charge</p>
            <p className="font-medium">{formatCurrency(hosting.client_charge)}/yr</p>
          </div>
          <div className="rounded-lg bg-muted/40 p-2">
            <p className="text-xs text-muted-foreground">Your cost</p>
            <p className="font-medium">{formatCurrency(hosting.cost)}/yr</p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <span className={cn("text-sm font-semibold", profit >= 0 ? "text-emerald-400" : "text-red-400")}>
            {profit >= 0 ? "+" : ""}{formatCurrency(profit)}/yr profit
          </span>
          {days !== null && hosting.renewal_date && (
            <span className={cn(
              "text-xs font-medium",
              expired && "text-red-400",
              urgent && !expired && "text-amber-400",
              !urgent && !expired && "text-muted-foreground"
            )}>
              {expired
                ? `${Math.abs(days)}d overdue`
                : `${days}d to renewal · ${formatDate(hosting.renewal_date)}`}
            </span>
          )}
        </div>

        {hosting.auto_renew && (
          <p className="text-xs text-muted-foreground mt-2">Auto-renew enabled</p>
        )}

        <div className="mt-4 pt-3 border-t border-border/50">
          <Button variant="ghost" size="sm" className="rounded-lg" onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function StratonHostingClient({
  hosting,
  clients,
}: {
  hosting: StratonHosting[];
  clients: StratonClient[];
}) {
  const searchParams = useSearchParams();
  const { run, isPending } = useRefreshAction();
  const [dialogOpen, setDialogOpen] = useState(searchParams.get("new") === "1");
  const [editing, setEditing] = useState<StratonHosting | null>(null);

  const clientMap = useMemo(
    () => new Map(clients.map((c) => [c.id, c])),
    [clients]
  );

  const renewals7 = useMemo(() => getHostingRenewalsInDays(hosting, 7), [hosting]);
  const renewals30 = useMemo(() => getHostingRenewalsInDays(hosting, 30), [hosting]);
  const otherHosting = useMemo(() => {
    const renewalIds = new Set(renewals30.map((h) => h.id));
    return hosting.filter((h) => !renewalIds.has(h.id) && h.status !== "cancelled");
  }, [hosting, renewals30]);

  const totalProfit = hosting
    .filter((h) => h.status === "active" || h.status === "expiring_soon")
    .reduce((s, h) => s + getHostingProfit(h), 0);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await run(() =>
      editing ? updateStratonHosting(editing.id, formData) : createStratonHosting(formData)
    );
    if (result?.error) { toast.error("Could not save"); return; }
    toast.success(editing ? "Hosting updated" : "Hosting added");
    setDialogOpen(false);
    setEditing(null);
  }

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(h: StratonHosting) {
    setEditing(h);
    setDialogOpen(true);
  }

  const clientOptions = clients.map((c) => ({ value: c.id, label: c.client_name }));

  return (
    <>
      <PageHeader
        title="Hosting & Renewals"
        description="Track domains, hosting costs, and renewal dates."
        action={
          <Button onClick={openCreate} className="rounded-xl" disabled={clients.length === 0}>
            <Plus className="h-4 w-4 mr-1" /> Add Hosting
          </Button>
        }
      />

      <div className="mb-6 rounded-xl border border-border/50 bg-muted/20 p-4">
        <p className="text-sm text-muted-foreground">Annual hosting profit</p>
        <p className="text-2xl font-bold text-emerald-400">{formatCurrency(totalProfit)}</p>
      </div>

      {renewals7.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-semibold">Renewals in 7 days</h2>
            <Badge variant="outline" className="text-amber-400 border-amber-400/30">
              {renewals7.length}
            </Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {renewals7.map((h) => (
              <HostingCard
                key={h.id}
                hosting={h}
                clientName={clientMap.get(h.client_id)?.client_name}
                onEdit={() => openEdit(h)}
              />
            ))}
          </div>
        </section>
      )}

      {renewals30.filter((h) => !renewals7.some((r) => r.id === h.id)).length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Renewals in 30 days</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {renewals30
              .filter((h) => !renewals7.some((r) => r.id === h.id))
              .map((h) => (
                <HostingCard
                  key={h.id}
                  hosting={h}
                  clientName={clientMap.get(h.client_id)?.client_name}
                  onEdit={() => openEdit(h)}
                />
              ))}
          </div>
        </section>
      )}

      {hosting.length === 0 ? (
        <EmptyState
          icon={Server}
          title="No hosting records"
          description="Add domains and hosting to track renewals and profit."
          action={
            clients.length > 0 ? (
              <Button onClick={openCreate} className="rounded-xl">Add Hosting</Button>
            ) : undefined
          }
        />
      ) : otherHosting.length > 0 ? (
        <section>
          <h2 className="text-lg font-semibold mb-4">All hosting</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {otherHosting.map((h) => (
              <HostingCard
                key={h.id}
                hosting={h}
                clientName={clientMap.get(h.client_id)?.client_name}
                onEdit={() => openEdit(h)}
              />
            ))}
          </div>
        </section>
      ) : renewals7.length === 0 && renewals30.length === 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {hosting.map((h) => (
            <HostingCard
              key={h.id}
              hosting={h}
              clientName={clientMap.get(h.client_id)?.client_name}
              onEdit={() => openEdit(h)}
            />
          ))}
        </div>
      ) : null}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Hosting" : "Add Hosting"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormSelect
              label="Client"
              name="client_id"
              defaultValue={editing?.client_id ?? ""}
              options={[{ value: "", label: "Select client" }, ...clientOptions]}
            />
            <div>
              <Label>Domain name</Label>
              <Input name="domain_name" defaultValue={editing?.domain_name} required className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Registrar</Label>
                <Input name="registrar" defaultValue={editing?.registrar ?? ""} className="mt-1" />
              </div>
              <div>
                <Label>Hosting provider</Label>
                <Input name="hosting_provider" defaultValue={editing?.hosting_provider ?? ""} className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Hosting plan</Label>
              <Input name="hosting_plan" defaultValue={editing?.hosting_plan ?? ""} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Annual cost (£)</Label>
                <Input name="cost" type="number" step="0.01" min="0" defaultValue={editing?.cost ?? 0} className="mt-1" />
              </div>
              <div>
                <Label>Client charge (£/yr)</Label>
                <Input name="client_charge" type="number" step="0.01" min="0" defaultValue={editing?.client_charge ?? 0} className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Renewal date</Label>
                <Input name="renewal_date" type="date" defaultValue={editing?.renewal_date ?? ""} className="mt-1" />
              </div>
              <div>
                <Label>SSL expiry</Label>
                <Input name="ssl_expiry" type="date" defaultValue={editing?.ssl_expiry ?? ""} className="mt-1" />
              </div>
            </div>
            <FormSelect
              label="Status"
              name="status"
              defaultValue={editing?.status ?? "active"}
              options={STRATON_HOSTING_STATUSES.map((s) => ({
                value: s,
                label: formatStatus(s),
              }))}
            />
            <FormSelect
              label="Auto-renew"
              name="auto_renew"
              defaultValue={editing?.auto_renew ? "true" : "false"}
              options={[
                { value: "true", label: "Yes" },
                { value: "false", label: "No" },
              ]}
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>DNS provider</Label>
                <Input name="dns_provider" defaultValue={editing?.dns_provider ?? ""} className="mt-1" />
              </div>
              <div>
                <Label>Reminder date</Label>
                <Input name="reminder_date" type="date" defaultValue={editing?.reminder_date ?? ""} className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Nameservers</Label>
              <Input name="nameservers" defaultValue={editing?.nameservers ?? ""} className="mt-1" />
            </div>
            <div>
              <Label>Login notes</Label>
              <Textarea name="login_notes" defaultValue={editing?.login_notes ?? ""} className="mt-1" />
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
