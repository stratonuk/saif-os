"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Lightbulb, Search, Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDelete } from "@/components/shared/confirm-delete";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormSelect } from "@/components/shared/form-field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IDEA_CATEGORIES, IDEA_STATUSES } from "@/lib/constants";
import { createIdea, updateIdea, deleteIdea } from "@/actions/ideas";
import { useRefreshAction } from "@/hooks/use-refresh-action";
import type { Idea } from "@/lib/types";

export function IdeasPageClient({ ideas }: { ideas: Idea[] }) {
  const searchParams = useSearchParams();
  const { run, isPending } = useRefreshAction();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(searchParams.get("new") === "1");
  const [editing, setEditing] = useState<Idea | null>(null);

  const filtered = useMemo(() => {
    return ideas.filter((idea) => {
      if (category !== "all" && idea.category !== category) return false;
      if (status !== "all" && idea.status !== status) return false;
      if (search && !idea.title.toLowerCase().includes(search.toLowerCase()) && !idea.description?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [ideas, search, category, status]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await run(() =>
      editing ? updateIdea(editing.id, formData) : createIdea(formData)
    );
    if (result?.error) { toast.error("Could not save"); return; }
    toast.success(editing ? "Updated" : "Captured");
    setDialogOpen(false);
    setEditing(null);
  }

  return (
    <>
      <PageHeader title="Ideas Vault" description="Capture, score and organise your best ideas." action={<Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="rounded-xl"><Plus className="h-4 w-4 mr-1" /> Capture Idea</Button>} />

      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search ideas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-[160px] rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All categories</SelectItem>{IDEA_CATEGORIES.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-[160px] rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All statuses</SelectItem>{IDEA_STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Lightbulb} title="No ideas" description="Capture your next big idea." action={<Button onClick={() => setDialogOpen(true)} className="rounded-xl">Capture Idea</Button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((idea) => (
            <Card key={idea.id} className="cursor-pointer hover:border-primary/30" onClick={() => { setEditing(idea); setDialogOpen(true); }}>
              <CardContent className="p-5">
                <div className="flex justify-between gap-2">
                  <h3 className="font-medium">{idea.title}</h3>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-sm font-bold text-amber-400">{idea.priority_score}</div>
                </div>
                {idea.description && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{idea.description}</p>}
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="outline" className="capitalize border-0 bg-muted">{idea.category}</Badge>
                  <Badge variant="outline" className="capitalize border-0">{idea.status}</Badge>
                </div>
                <div className="flex gap-1 mt-3 pt-3 border-t border-border/50" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" onClick={() => { setEditing(idea); setDialogOpen(true); }}><Pencil className="h-3.5 w-3.5 mr-1" /> Edit</Button>
                  <ConfirmDelete onDelete={async () => { await run(() => deleteIdea(idea.id)); toast.success("Deleted"); }} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Idea" : "Capture Idea"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Title</Label><Input name="title" defaultValue={editing?.title} required className="mt-1" /></div>
            <div><Label>Description</Label><Textarea name="description" defaultValue={editing?.description ?? ""} className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <FormSelect label="Category" name="category" defaultValue={editing?.category ?? "personal"} options={IDEA_CATEGORIES.map((c) => ({ value: c, label: c }))} />
              <div><Label>Priority (1-10)</Label><Input name="priority_score" type="number" min="1" max="10" defaultValue={editing?.priority_score ?? 5} className="mt-1" /></div>
            </div>
            <FormSelect label="Status" name="status" defaultValue={editing?.status ?? "raw"} options={IDEA_STATUSES.map((s) => ({ value: s, label: s }))} />
            <Button type="submit" className="w-full rounded-xl" disabled={isPending}>Save</Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
