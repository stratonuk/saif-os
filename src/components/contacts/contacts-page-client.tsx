"use client";

import { useState } from "react";
import { Users, Plus, Pencil, Phone } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDelete } from "@/components/shared/confirm-delete";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { formatDate, daysUntil } from "@/lib/utils";
import { createContact, updateContact, deleteContact, markContacted } from "@/actions/contacts";
import { useRefreshAction } from "@/hooks/use-refresh-action";
import type { Contact, Project } from "@/lib/types";

export function ContactsPageClient({
  contacts,
  projects,
}: {
  contacts: Contact[];
  projects: Project[];
}) {
  const { run, isPending } = useRefreshAction();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p.name]));

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await run(() =>
      editing ? updateContact(editing.id, formData) : createContact(formData)
    );
    if (result?.error) { toast.error("Could not save"); return; }
    toast.success(editing ? "Updated" : "Added");
    setDialogOpen(false);
    setEditing(null);
  }

  return (
    <>
      <PageHeader title="Contacts" description="Personal CRM — relationships and follow-ups." action={<Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="rounded-xl"><Plus className="h-4 w-4 mr-1" /> Add Contact</Button>} />

      {contacts.length === 0 ? (
        <EmptyState icon={Users} title="No contacts" description="Add people you want to stay in touch with." action={<Button onClick={() => setDialogOpen(true)} className="rounded-xl">Add Contact</Button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {contacts.map((contact) => {
            const followUpDays = contact.next_follow_up ? daysUntil(contact.next_follow_up) : null;
            return (
              <Card key={contact.id}>
                <CardContent className="p-5">
                  <h3 className="font-semibold">{contact.name}</h3>
                  {(contact.role || contact.company) && (
                    <p className="text-sm text-muted-foreground mt-1">{[contact.role, contact.company].filter(Boolean).join(" · ")}</p>
                  )}
                  {contact.email && <p className="text-sm text-muted-foreground mt-2 truncate">{contact.email}</p>}
                  {contact.phone && <p className="text-sm text-muted-foreground">{contact.phone}</p>}
                  {contact.notes && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{contact.notes}</p>}
                  <div className="mt-4 pt-3 border-t border-border/50 text-xs space-y-1">
                    {contact.last_contacted && <p className="text-muted-foreground">Last: {formatDate(contact.last_contacted)}</p>}
                    {contact.next_follow_up && (
                      <p className={followUpDays !== null && followUpDays <= 7 ? "text-amber-400 font-medium" : "text-muted-foreground"}>
                        Follow up: {formatDate(contact.next_follow_up)}{followUpDays !== null && ` (${followUpDays}d)`}
                      </p>
                    )}
                    {contact.project_id && projectMap[contact.project_id] && (
                      <p className="text-primary">Project: {projectMap[contact.project_id]}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    <Button variant="secondary" size="sm" className="rounded-lg" onClick={async () => { await run(() => markContacted(contact.id)); toast.success("Marked as contacted today"); }}>
                      <Phone className="h-3.5 w-3.5 mr-1" /> Contacted
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { setEditing(contact); setDialogOpen(true); }}><Pencil className="h-3.5 w-3.5 mr-1" /> Edit</Button>
                    <ConfirmDelete onDelete={async () => { await run(() => deleteContact(contact.id)); toast.success("Deleted"); }} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Contact" : "New Contact"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Name</Label><Input name="name" defaultValue={editing?.name} required className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Company</Label><Input name="company" defaultValue={editing?.company ?? ""} className="mt-1" /></div>
              <div><Label>Role</Label><Input name="role" defaultValue={editing?.role ?? ""} className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Email</Label><Input name="email" type="email" defaultValue={editing?.email ?? ""} className="mt-1" /></div>
              <div><Label>Phone</Label><Input name="phone" defaultValue={editing?.phone ?? ""} className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Last contacted</Label><Input name="last_contacted" type="date" defaultValue={editing?.last_contacted ?? ""} className="mt-1" /></div>
              <div><Label>Next follow-up</Label><Input name="next_follow_up" type="date" defaultValue={editing?.next_follow_up ?? ""} className="mt-1" /></div>
            </div>
            {projects.length > 0 && (
              <div>
                <Label>Linked project</Label>
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
            <div><Label>Notes</Label><Textarea name="notes" defaultValue={editing?.notes ?? ""} className="mt-1" /></div>
            <Button type="submit" className="w-full rounded-xl" disabled={isPending}>Save</Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
