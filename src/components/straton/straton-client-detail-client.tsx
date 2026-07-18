"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  Globe,
  ArrowLeft,
  Briefcase,
  Receipt,
  Server,
  FileText,
  Clock,
  Activity,
} from "lucide-react";
import { ActivityFeed } from "@/components/shared/activity-feed";
import { FileUploadForm } from "@/components/shared/file-upload-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  STRATON_CLIENT_STATUS_LABELS,
  STRATON_INVOICE_STATUS_COLORS,
} from "@/lib/constants";
import { formatCurrency, formatDate, daysUntil, cn } from "@/lib/utils";
import {
  getOutstandingBalance,
  getHostingProfit,
  getOverdueInvoices,
} from "@/lib/straton-utils";
import type {
  StratonClient,
  StratonProject,
  StratonInvoice,
  StratonHosting,
  StratonClientReminder,
  StratonActivity,
  Document,
} from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  lead: "text-violet-400 bg-violet-400/10",
  active: "text-emerald-400 bg-emerald-400/10",
  paused: "text-amber-400 bg-amber-400/10",
  completed: "text-violet-400 bg-violet-400/10",
  archived: "text-muted-foreground bg-muted",
};

function formatStatus(status: string) {
  return status.replace(/_/g, " ");
}

export function StratonClientDetailClient({
  client,
  projects,
  invoices,
  hosting,
  reminders,
  activity,
  documents,
}: {
  client: StratonClient;
  projects: StratonProject[];
  invoices: StratonInvoice[];
  hosting: StratonHosting[];
  reminders: StratonClientReminder[];
  activity: StratonActivity[];
  documents: Document[];
}) {
  const overdueInvoices = useMemo(() => getOverdueInvoices(invoices), [invoices]);
  const pendingReminders = reminders.filter((r) => !r.completed);
  const totalOutstanding = projects.reduce((s, p) => s + getOutstandingBalance(p), 0);

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" className="rounded-lg mb-4 -ml-2" asChild>
          <Link href="/straton/clients">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to clients
          </Link>
        </Button>

        <div className="rounded-2xl border border-border/50 bg-muted/20 p-6 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight">{client.client_name}</h1>
                <Badge className={cn("border-0", STATUS_COLORS[client.status])}>
                  {STRATON_CLIENT_STATUS_LABELS[client.status]}
                </Badge>
              </div>
              {client.business_name && (
                <p className="text-muted-foreground mt-1">{client.business_name}</p>
              )}
              {client.contact_person && (
                <p className="text-sm mt-2">{client.contact_person}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {client.email && (
                <a href={`mailto:${client.email}`} className="flex items-center gap-1.5 hover:text-foreground">
                  <Mail className="h-4 w-4" /> {client.email}
                </a>
              )}
              {client.phone && (
                <a href={`tel:${client.phone}`} className="flex items-center gap-1.5 hover:text-foreground">
                  <Phone className="h-4 w-4" /> {client.phone}
                </a>
              )}
              {client.website_url && (
                <a
                  href={client.website_url.startsWith("http") ? client.website_url : `https://${client.website_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-foreground"
                >
                  <Globe className="h-4 w-4" /> {client.website_url}
                </a>
              )}
            </div>
          </div>

          {(client.key_info || client.notes) && (
            <div className="mt-4 pt-4 border-t border-border/50 grid gap-3 sm:grid-cols-2 text-sm">
              {client.key_info && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Key info</p>
                  <p className="whitespace-pre-wrap">{client.key_info}</p>
                </div>
              )}
              {client.notes && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Notes</p>
                  <p className="whitespace-pre-wrap text-muted-foreground">{client.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full flex flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
          <TabsTrigger value="projects" className="rounded-lg gap-1">
            <Briefcase className="h-3.5 w-3.5 hidden sm:inline" /> Projects ({projects.length})
          </TabsTrigger>
          <TabsTrigger value="invoices" className="rounded-lg gap-1">
            <Receipt className="h-3.5 w-3.5 hidden sm:inline" /> Invoices ({invoices.length})
          </TabsTrigger>
          <TabsTrigger value="hosting" className="rounded-lg gap-1">
            <Server className="h-3.5 w-3.5 hidden sm:inline" /> Hosting ({hosting.length})
          </TabsTrigger>
          <TabsTrigger value="documents" className="rounded-lg gap-1">
            <FileText className="h-3.5 w-3.5 hidden sm:inline" /> Docs ({documents.length})
          </TabsTrigger>
          <TabsTrigger value="reminders" className="rounded-lg gap-1">
            <Clock className="h-3.5 w-3.5 hidden sm:inline" /> Reminders ({pendingReminders.length})
          </TabsTrigger>
          <TabsTrigger value="activity" className="rounded-lg gap-1">
            <Activity className="h-3.5 w-3.5 hidden sm:inline" /> Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Projects</p>
                <p className="text-2xl font-semibold mt-1">{projects.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Outstanding</p>
                <p className="text-2xl font-semibold mt-1 text-amber-400">{formatCurrency(totalOutstanding)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Hosting domains</p>
                <p className="text-2xl font-semibold mt-1">{hosting.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Open reminders</p>
                <p className="text-2xl font-semibold mt-1">{pendingReminders.length}</p>
              </CardContent>
            </Card>
          </div>
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityFeed activities={activity.slice(0, 8)} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects">
          {projects.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No projects for this client</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {projects.map((project) => {
                const balance = getOutstandingBalance(project);
                return (
                  <Card key={project.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between gap-2">
                        <h3 className="font-medium">{project.name}</h3>
                        <Badge variant="outline" className="capitalize text-xs shrink-0">
                          {formatStatus(project.status)}
                        </Badge>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3 text-sm">
                        <span>{formatCurrency(project.price_quoted)} quoted</span>
                        {balance > 0 && (
                          <span className="text-amber-400">{formatCurrency(balance)} outstanding</span>
                        )}
                      </div>
                      {project.deadline && (
                        <p className="text-xs text-muted-foreground mt-2">Due {formatDate(project.deadline)}</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="invoices">
          {invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No invoices for this client</p>
          ) : (
            <div className="space-y-3">
              {invoices.map((inv) => {
                const isOverdue = overdueInvoices.some((o) => o.id === inv.id);
                return (
                  <Card
                    key={inv.id}
                    className={cn(isOverdue && "border-red-500/30 bg-red-500/[0.02]")}
                  >
                    <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{inv.invoice_number}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Issued {formatDate(inv.issue_date)}
                          {inv.due_date && ` · Due ${formatDate(inv.due_date)}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{formatCurrency(inv.amount)}</span>
                        <Badge className={cn("border-0 capitalize", STRATON_INVOICE_STATUS_COLORS[inv.status])}>
                          {inv.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="hosting">
          {hosting.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No hosting for this client</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {hosting.map((h) => {
                const profit = getHostingProfit(h);
                const days = h.renewal_date ? daysUntil(h.renewal_date) : null;
                return (
                  <Card key={h.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between gap-2">
                        <h3 className="font-medium">{h.domain_name}</h3>
                        <Badge variant="outline" className="capitalize text-xs shrink-0">
                          {formatStatus(h.status)}
                        </Badge>
                      </div>
                      {h.hosting_provider && (
                        <p className="text-xs text-muted-foreground mt-1">{h.hosting_provider}</p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-3 text-sm">
                        <span className="text-emerald-400">+{formatCurrency(profit)}/yr profit</span>
                        {days !== null && (
                          <span className={cn(days <= 7 && "text-amber-400", days < 0 && "text-red-400")}>
                            {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d to renewal`}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="documents">
          <Card className="mb-4">
            <CardContent className="p-4">
              <FileUploadForm entityType="straton_client" entityId={client.id} />
            </CardContent>
          </Card>
          {documents.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No documents uploaded</p>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <Card key={doc.id}>
                  <CardContent className="p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{doc.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(doc.created_at)}
                        {doc.file_size > 0 && ` · ${(doc.file_size / 1024).toFixed(0)} KB`}
                      </p>
                    </div>
                    {doc.file_url && (
                      <Button variant="outline" size="sm" className="rounded-lg shrink-0" asChild>
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer">View</a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reminders">
          {reminders.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No reminders for this client</p>
          ) : (
            <div className="space-y-3">
              {reminders.map((r) => {
                const overdue = !r.completed && daysUntil(r.due_date) < 0;
                return (
                  <Card
                    key={r.id}
                    className={cn(
                      r.completed && "opacity-60",
                      overdue && "border-red-500/30 bg-red-500/[0.02]"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between gap-2">
                        <h3 className={cn("font-medium", r.completed && "line-through")}>{r.title}</h3>
                        <Badge variant="outline" className="capitalize text-xs shrink-0">
                          {r.reminder_type.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <p className={cn("text-xs mt-1", overdue ? "text-red-400" : "text-muted-foreground")}>
                        Due {formatDate(r.due_date)}
                        {r.completed && " · Completed"}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardContent className="p-4">
              <ActivityFeed activities={activity} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
