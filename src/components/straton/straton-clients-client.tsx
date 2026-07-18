"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Users, Plus, Pencil, Mail, Phone, Globe } from "lucide-react";
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
import { STRATON_CLIENT_STATUSES, STRATON_CLIENT_STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { createStratonClient, updateStratonClient } from "@/actions/straton";
import { useRefreshAction } from "@/hooks/use-refresh-action";
import type { StratonClient } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  lead: "text-violet-400 bg-violet-400/10",
  active: "text-emerald-400 bg-emerald-400/10",
  paused: "text-amber-400 bg-amber-400/10",
  completed: "text-violet-400 bg-violet-400/10",
  archived: "text-muted-foreground bg-muted",
};

export function StratonClientsClient({ clients }: { clients: StratonClient[] }) {
  const searchParams = useSearchParams();
  const { run, isPending } = useRefreshAction();
  const [filter, setFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(searchParams.get("new") === "1");
  const [editing, setEditing] = useState<StratonClient | null>(null);

  const filtered = useMemo(() => {
    if (filter === "all") return clients;
    return clients.filter((c) => c.status === filter);
  }, [clients, filter]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await run(() =>
      editing ? updateStratonClient(editing.id, formData) : createStratonClient(formData)
    );
    if (result?.error) { toast.error("Could not save"); return; }
    toast.success(editing ? "Client updated" : "Client added");
    setDialogOpen(false);
    setEditing(null);
  }

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(client: StratonClient, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setEditing(client);
    setDialogOpen(true);
  }

  return (
    <>
      <PageHeader
        title="Clients"
        description="Manage your Straton client relationships."
        action={
          <Button onClick={openCreate} className="rounded-xl">
            <Plus className="h-4 w-4 mr-1" /> Add Client
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
          All ({clients.length})
        </Button>
        {STRATON_CLIENT_STATUSES.map((s) => {
          const count = clients.filter((c) => c.status === s).length;
          if (count === 0 && filter !== s) return null;
          return (
            <Button
              key={s}
              variant={filter === s ? "default" : "outline"}
              size="sm"
              className="rounded-xl"
              onClick={() => setFilter(s)}
            >
              {STRATON_CLIENT_STATUS_LABELS[s]} ({count})
            </Button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No clients yet"
          description="Add your first client to start tracking projects, invoices, and hosting."
          action={<Button onClick={openCreate} className="rounded-xl">Add Client</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((client) => (
            <Link key={client.id} href={`/straton/clients/${client.id}`}>
              <Card className="h-full transition-all hover:border-primary/30 active:scale-[0.98] touch-manipulation">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold truncate">{client.client_name}</h3>
                      {client.business_name && (
                        <p className="text-sm text-muted-foreground truncate mt-0.5">
                          {client.business_name}
                        </p>
                      )}
                    </div>
                    <Badge className={cn("shrink-0 border-0", STATUS_COLORS[client.status])}>
                      {STRATON_CLIENT_STATUS_LABELS[client.status]}
                    </Badge>
                  </div>

                  <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                    {client.contact_person && (
                      <p className="truncate">{client.contact_person}</p>
                    )}
                    {client.email && (
                      <p className="flex items-center gap-1.5 truncate">
                        <Mail className="h-3 w-3 shrink-0" /> {client.email}
                      </p>
                    )}
                    {client.phone && (
                      <p className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3 shrink-0" /> {client.phone}
                      </p>
                    )}
                    {client.website_url && (
                      <p className="flex items-center gap-1.5 truncate">
                        <Globe className="h-3 w-3 shrink-0" /> {client.website_url}
                      </p>
                    )}
                  </div>

                  {client.industry && (
                    <p className="text-xs text-primary mt-3">{client.industry}</p>
                  )}

                  <div className="mt-4 pt-3 border-t border-border/50">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-lg text-xs"
                      onClick={(e) => openEdit(client, e)}
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Client" : "New Client"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Client name</Label>
              <Input name="client_name" defaultValue={editing?.client_name} required className="mt-1" />
            </div>
            <div>
              <Label>Business name</Label>
              <Input name="business_name" defaultValue={editing?.business_name ?? ""} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Contact person</Label>
                <Input name="contact_person" defaultValue={editing?.contact_person ?? ""} className="mt-1" />
              </div>
              <div>
                <Label>Industry</Label>
                <Input name="industry" defaultValue={editing?.industry ?? ""} className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Email</Label>
                <Input name="email" type="email" defaultValue={editing?.email ?? ""} className="mt-1" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input name="phone" defaultValue={editing?.phone ?? ""} className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Website</Label>
              <Input name="website_url" defaultValue={editing?.website_url ?? ""} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start date</Label>
                <Input name="start_date" type="date" defaultValue={editing?.start_date ?? ""} className="mt-1" />
              </div>
              <FormSelect
                label="Status"
                name="status"
                defaultValue={editing?.status ?? "lead"}
                options={STRATON_CLIENT_STATUSES.map((s) => ({
                  value: s,
                  label: STRATON_CLIENT_STATUS_LABELS[s],
                }))}
              />
            </div>
            <div>
              <Label>Key info</Label>
              <Textarea name="key_info" defaultValue={editing?.key_info ?? ""} className="mt-1" />
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
