"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Users,
  Receipt,
  Server,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { ActivityFeed } from "@/components/shared/activity-feed";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  STRATON_INVOICE_STATUS_COLORS,
} from "@/lib/constants";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import {
  getUnpaidInvoices,
  getOverdueInvoices,
  getMonthlyRecurringRevenue,
  getHostingRenewalsInDays,
  getOutstandingBalance,
} from "@/lib/straton-utils";
import type {
  StratonClient,
  StratonProject,
  StratonInvoice,
  StratonHosting,
  StratonClientReminder,
  StratonActivity,
} from "@/lib/types";

export function StratonDashboardClient({
  clients,
  projects,
  invoices,
  hosting,
  reminders,
  activity,
}: {
  clients: StratonClient[];
  projects: StratonProject[];
  invoices: StratonInvoice[];
  hosting: StratonHosting[];
  reminders: StratonClientReminder[];
  activity: StratonActivity[];
}) {
  const activeClients = clients.filter((c) => c.status === "active").length;
  const unpaid = useMemo(() => getUnpaidInvoices(invoices), [invoices]);
  const overdue = useMemo(() => getOverdueInvoices(invoices), [invoices]);
  const outstandingTotal = unpaid.reduce((sum, i) => sum + i.amount, 0);
  const mrr = getMonthlyRecurringRevenue(hosting);
  const renewalsSoon = getHostingRenewalsInDays(hosting, 7);
  const inProgress = projects.filter((p) => p.status === "in_progress");
  const pendingReminders = reminders.filter((r) => !r.completed);

  const clientMap = useMemo(
    () => new Map(clients.map((c) => [c.id, c])),
    [clients]
  );

  return (
    <>
      <PageHeader
        title="Straton Workspace"
        description="Client work, invoices, hosting, and renewals at a glance."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        <StatCard title="Active Clients" value={String(activeClients)} icon={Users} />
        <StatCard
          title="Outstanding"
          value={formatCurrency(outstandingTotal)}
          subtitle={unpaid.length > 0 ? `${unpaid.length} unpaid invoice${unpaid.length > 1 ? "s" : ""}` : "All clear"}
          icon={Receipt}
          trend={outstandingTotal > 0 ? "down" : "neutral"}
        />
        <StatCard
          title="Hosting MRR"
          value={formatCurrency(mrr)}
          subtitle="From active hosting"
          icon={Server}
          trend="up"
        />
        <StatCard
          title="Renewals (7d)"
          value={String(renewalsSoon.length)}
          subtitle={renewalsSoon.length > 0 ? "Due this week" : "None due soon"}
          icon={Server}
        />
      </div>

      {overdue.length > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <p className="text-sm">
            <span className="font-semibold text-red-400">
              {overdue.length} overdue invoice{overdue.length > 1 ? "s" : ""}
            </span>
            {" — "}
            {formatCurrency(overdue.reduce((s, i) => s + i.amount, 0))} outstanding.
          </p>
          <Button variant="outline" size="sm" className="ml-auto rounded-lg shrink-0" asChild>
            <Link href="/straton/invoices">View</Link>
          </Button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Unpaid Invoices</CardTitle>
            <Button variant="ghost" size="sm" className="rounded-lg" asChild>
              <Link href="/straton/invoices">
                All <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {unpaid.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No unpaid invoices</p>
            ) : (
              <div className="space-y-3">
                {unpaid.slice(0, 5).map((inv) => {
                  const isOverdue = overdue.some((o) => o.id === inv.id);
                  const client = clientMap.get(inv.client_id);
                  return (
                    <div
                      key={inv.id}
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-muted/20 px-4 py-3",
                        isOverdue && "border-red-500/30 bg-red-500/[0.03]"
                      )}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{inv.invoice_number}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {client?.client_name ?? "Unknown client"}
                          {inv.due_date && ` · due ${formatDate(inv.due_date)}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-semibold">{formatCurrency(inv.amount)}</span>
                        <Badge className={cn("border-0 capitalize text-xs", STRATON_INVOICE_STATUS_COLORS[inv.status])}>
                          {inv.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Projects In Progress</CardTitle>
            <Button variant="ghost" size="sm" className="rounded-lg" asChild>
              <Link href="/straton/projects">
                All <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {inProgress.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No active projects</p>
            ) : (
              <div className="space-y-3">
                {inProgress.slice(0, 5).map((project) => {
                  const client = clientMap.get(project.client_id);
                  const balance = getOutstandingBalance(project);
                  return (
                    <div
                      key={project.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-muted/20 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{project.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {client?.client_name ?? "Unknown client"}
                          {project.deadline && ` · due ${formatDate(project.deadline)}`}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold">{formatCurrency(project.price_quoted)}</p>
                        {balance > 0 && (
                          <p className="text-xs text-amber-400">{formatCurrency(balance)} due</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
            {pendingReminders.length > 0 && (
              <Button variant="ghost" size="sm" className="rounded-lg" asChild>
                <Link href="/straton/reminders">
                  {pendingReminders.length} reminder{pendingReminders.length > 1 ? "s" : ""}
                </Link>
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <ActivityFeed activities={activity.slice(0, 10)} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
