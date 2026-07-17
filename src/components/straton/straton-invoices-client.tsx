"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Receipt, Plus, CheckCircle, AlertCircle } from "lucide-react";
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
import { STRATON_INVOICE_STATUSES, STRATON_INVOICE_STATUS_COLORS } from "@/lib/constants";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { getUnpaidInvoices, getOverdueInvoices } from "@/lib/straton-utils";
import { createStratonInvoice, markInvoicePaid } from "@/actions/straton";
import { useRefreshAction } from "@/hooks/use-refresh-action";
import type { StratonClient, StratonProject, StratonInvoice } from "@/lib/types";

export function StratonInvoicesClient({
  invoices,
  clients,
  projects,
}: {
  invoices: StratonInvoice[];
  clients: StratonClient[];
  projects: StratonProject[];
}) {
  const searchParams = useSearchParams();
  const { run, isPending } = useRefreshAction();
  const [filter, setFilter] = useState<"all" | "unpaid" | "overdue">("all");
  const [dialogOpen, setDialogOpen] = useState(searchParams.get("new") === "1");

  const clientMap = useMemo(
    () => new Map(clients.map((c) => [c.id, c])),
    [clients]
  );
  const unpaid = useMemo(() => getUnpaidInvoices(invoices), [invoices]);
  const overdue = useMemo(() => getOverdueInvoices(invoices), [invoices]);
  const outstandingTotal = unpaid.reduce((s, i) => s + i.amount, 0);

  const filtered = useMemo(() => {
    if (filter === "unpaid") return unpaid;
    if (filter === "overdue") return overdue;
    return [...invoices].sort(
      (a, b) => new Date(b.issue_date).getTime() - new Date(a.issue_date).getTime()
    );
  }, [invoices, unpaid, overdue, filter]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await run(() => createStratonInvoice(formData));
    if (result?.error) { toast.error("Could not save"); return; }
    toast.success("Invoice created");
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
        title="Invoices"
        description="Track sent invoices and outstanding payments."
        action={
          <Button onClick={() => setDialogOpen(true)} className="rounded-xl" disabled={clients.length === 0}>
            <Plus className="h-4 w-4 mr-1" /> New Invoice
          </Button>
        }
      />

      <div className="mb-6 rounded-xl border border-border/50 bg-muted/20 p-4 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Total outstanding</p>
            <p className="text-3xl font-bold text-amber-400">{formatCurrency(outstandingTotal)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {unpaid.length} unpaid · {overdue.length} overdue
            </p>
          </div>
          {overdue.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-red-400">
              <AlertCircle className="h-4 w-4" />
              {formatCurrency(overdue.reduce((s, i) => s + i.amount, 0))} overdue
            </div>
          )}
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {(["all", "unpaid", "overdue"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            className="rounded-xl capitalize"
            onClick={() => setFilter(f)}
          >
            {f === "unpaid" ? `Unpaid (${unpaid.length})` : f === "overdue" ? `Overdue (${overdue.length})` : `All (${invoices.length})`}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No invoices"
          description="Create invoices to track what clients owe you."
          action={
            clients.length > 0 ? (
              <Button onClick={() => setDialogOpen(true)} className="rounded-xl">New Invoice</Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto rounded-xl border border-border/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="text-left p-3 font-medium">Invoice</th>
                  <th className="text-left p-3 font-medium">Client</th>
                  <th className="text-left p-3 font-medium">Issued</th>
                  <th className="text-left p-3 font-medium">Due</th>
                  <th className="text-right p-3 font-medium">Amount</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => {
                  const isOverdue = overdue.some((o) => o.id === inv.id);
                  const client = clientMap.get(inv.client_id);
                  return (
                    <tr
                      key={inv.id}
                      className={cn(
                        "border-b border-border/30 hover:bg-muted/20",
                        isOverdue && "bg-red-500/[0.03]"
                      )}
                    >
                      <td className="p-3 font-medium">{inv.invoice_number}</td>
                      <td className="p-3 text-muted-foreground">{client?.client_name ?? "—"}</td>
                      <td className="p-3 text-muted-foreground">{formatDate(inv.issue_date)}</td>
                      <td className={cn("p-3", isOverdue && "text-red-400 font-medium")}>
                        {inv.due_date ? formatDate(inv.due_date) : "—"}
                      </td>
                      <td className="p-3 text-right font-semibold">{formatCurrency(inv.amount)}</td>
                      <td className="p-3">
                        <Badge className={cn("border-0 capitalize", STRATON_INVOICE_STATUS_COLORS[inv.status])}>
                          {inv.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        {(inv.status === "sent" || inv.status === "overdue") && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-lg text-xs"
                            disabled={isPending}
                            onClick={async () => {
                              await run(() => markInvoicePaid(inv.id));
                              toast.success("Marked as paid");
                            }}
                          >
                            <CheckCircle className="h-3.5 w-3.5 mr-1" /> Paid
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {filtered.map((inv) => {
              const isOverdue = overdue.some((o) => o.id === inv.id);
              const client = clientMap.get(inv.client_id);
              return (
                <Card
                  key={inv.id}
                  className={cn(isOverdue && "border-red-500/30 bg-red-500/[0.02]")}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between gap-2">
                      <div>
                        <p className="font-semibold">{inv.invoice_number}</p>
                        <p className="text-sm text-primary">{client?.client_name}</p>
                      </div>
                      <p className="text-lg font-bold">{formatCurrency(inv.amount)}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <Badge className={cn("border-0 capitalize", STRATON_INVOICE_STATUS_COLORS[inv.status])}>
                        {inv.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(inv.issue_date)}
                        {inv.due_date && ` · due ${formatDate(inv.due_date)}`}
                      </span>
                    </div>
                    {(inv.status === "sent" || inv.status === "overdue") && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg mt-3 w-full"
                        disabled={isPending}
                        onClick={async () => {
                          await run(() => markInvoicePaid(inv.id));
                          toast.success("Marked as paid");
                        }}
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-1" /> Mark paid
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Invoice</DialogTitle>
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
              <Label>Invoice number</Label>
              <Input name="invoice_number" required className="mt-1" placeholder="INV-001" />
            </div>
            <div>
              <Label>Amount (£)</Label>
              <Input name="amount" type="number" step="0.01" min="0" required className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Issue date</Label>
                <Input name="issue_date" type="date" required className="mt-1" />
              </div>
              <div>
                <Label>Due date</Label>
                <Input name="due_date" type="date" className="mt-1" />
              </div>
            </div>
            <FormSelect
              label="Status"
              name="status"
              defaultValue="sent"
              options={STRATON_INVOICE_STATUSES.map((s) => ({ value: s, label: s }))}
            />
            <div>
              <Label>Notes</Label>
              <Textarea name="notes" className="mt-1" />
            </div>
            <Button type="submit" className="w-full rounded-xl" disabled={isPending}>
              {isPending ? "Saving…" : "Create Invoice"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
