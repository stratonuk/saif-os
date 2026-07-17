"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { StickyNote, Plus, Pencil, Tag } from "lucide-react";
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
import { FormSelect } from "@/components/shared/form-field";
import { NOTE_ENTITY_TYPES, NOTE_ENTITY_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { createNote, updateNote, deleteNote } from "@/actions/notes";
import { useRefreshAction } from "@/hooks/use-refresh-action";
import { useCommandPalette } from "@/components/command-palette/command-palette-provider";
import type { Contact, Goal, Idea, Note, Project, NoteEntityType } from "@/lib/types";

export function NotesPageClient({
  notes,
  projects,
  contacts,
  ideas,
  goals,
}: {
  notes: Note[];
  projects: Project[];
  contacts: Contact[];
  ideas: Idea[];
  goals: Goal[];
}) {
  const searchParams = useSearchParams();
  const { run, isPending } = useRefreshAction();
  const { openCapture } = useCommandPalette();
  const [dialogOpen, setDialogOpen] = useState(searchParams.get("new") === "1");
  const [editing, setEditing] = useState<Note | null>(null);
  const [entityType, setEntityType] = useState<NoteEntityType>(editing?.linked_entity_type ?? "none");

  const entityMap = useMemo(() => {
    const map: Record<string, { id: string; label: string }[]> = {
      project: projects.map((p) => ({ id: p.id, label: p.name })),
      contact: contacts.map((c) => ({ id: c.id, label: c.name })),
      idea: ideas.map((i) => ({ id: i.id, label: i.title })),
      goal: goals.map((g) => ({ id: g.id, label: g.title })),
    };
    return map;
  }, [projects, contacts, ideas, goals]);

  function getLinkedLabel(note: Note) {
    if (!note.linked_entity_type || !note.linked_entity_id) return null;
    const items = entityMap[note.linked_entity_type] ?? [];
    return items.find((i) => i.id === note.linked_entity_id)?.label;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await run(() =>
      editing ? updateNote(editing.id, formData) : createNote(formData)
    );
    if (result?.error) { toast.error("Could not save"); return; }
    toast.success(editing ? "Note updated" : "Note created");
    setDialogOpen(false);
    setEditing(null);
  }

  function openCreate() {
    setEditing(null);
    setEntityType("none");
    setDialogOpen(true);
  }

  function openEdit(note: Note) {
    setEditing(note);
    setEntityType(note.linked_entity_type ?? "none");
    setDialogOpen(true);
  }

  return (
    <>
      <PageHeader
        title="Notes"
        description="AI-ready notes linked to projects, contacts, ideas and goals."
        action={
          <Button onClick={openCreate} className="rounded-xl">
            <Plus className="h-4 w-4 mr-1" /> New Note
          </Button>
        }
      />

      {notes.length === 0 ? (
        <EmptyState
          icon={StickyNote}
          title="No notes yet"
          description="Capture meeting notes, ideas, and context — link them to anything in your life OS."
          action={
            <div className="flex flex-wrap gap-2 justify-center">
              <Button onClick={openCreate} className="rounded-xl">Create Note</Button>
              <Button variant="outline" onClick={() => openCapture("note")} className="rounded-xl">Quick Capture</Button>
            </div>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => {
            const linked = getLinkedLabel(note);
            return (
              <Card key={note.id} className="transition-all active:scale-[0.98] touch-manipulation hover:border-primary/20">
                <CardContent className="p-5">
                  <h3 className="font-medium">{note.title}</h3>
                  {linked && note.linked_entity_type && (
                    <p className="text-xs text-primary mt-1">
                      {NOTE_ENTITY_LABELS[note.linked_entity_type]} · {linked}
                    </p>
                  )}
                  {note.content && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{note.content}</p>
                  )}
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {note.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs border-0 bg-muted gap-1">
                          <Tag className="h-3 w-3" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-3">
                    Updated {formatDate(note.updated_at)}
                  </p>
                  <div className="flex gap-1 mt-3 pt-3 border-t border-border/50">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(note)}>
                      <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                    </Button>
                    <ConfirmDelete onDelete={async () => { await run(() => deleteNote(note.id)); toast.success("Deleted"); }} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Note" : "New Note"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Title</Label><Input name="title" defaultValue={editing?.title} required className="mt-1" /></div>
            <div><Label>Content</Label><Textarea name="content" defaultValue={editing?.content ?? ""} className="mt-1 min-h-[120px]" placeholder="Write freely — this is AI-ready context." /></div>
            <div><Label>Tags</Label><Input name="tags" defaultValue={editing?.tags.join(", ") ?? ""} className="mt-1" placeholder="comma, separated" /></div>
            <FormSelect
              label="Link to"
              name="linked_entity_type"
              defaultValue={editing?.linked_entity_type ?? "none"}
              options={NOTE_ENTITY_TYPES.map((t) => ({ value: t, label: NOTE_ENTITY_LABELS[t] }))}
              onChange={(e) => setEntityType(e.target.value as NoteEntityType)}
            />
            {entityType && entityType !== "none" && (
              <FormSelect
                label={`Select ${NOTE_ENTITY_LABELS[entityType]}`}
                name="linked_entity_id"
                defaultValue={editing?.linked_entity_id ?? ""}
                options={[
                  { value: "", label: "None" },
                  ...(entityMap[entityType] ?? []).map((i) => ({ value: i.id, label: i.label })),
                ]}
              />
            )}
            <Button type="submit" className="w-full rounded-xl" disabled={isPending}>
              {isPending ? "Saving…" : "Save"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
