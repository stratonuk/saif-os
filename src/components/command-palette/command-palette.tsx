"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  CheckSquare,
  Bell,
  Wallet,
  Lightbulb,
  Users,
  StickyNote,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormSelect } from "@/components/shared/form-field";
import { useCommandPalette } from "./command-palette-provider";
import { globalSearch } from "@/actions/search";
import {
  quickCaptureTask,
  quickCaptureReminder,
  quickCaptureTransaction,
  quickCaptureIdea,
  quickCaptureContact,
  quickCaptureNote,
} from "@/actions/quick-capture";
import {
  TASK_PRIORITIES,
  TASK_CATEGORIES,
  REMINDER_TYPES,
  REMINDER_TYPE_LABELS,
  TRANSACTION_CATEGORIES,
  IDEA_CATEGORIES,
  SEARCH_ENTITY_LABELS,
  QUICK_CAPTURE_TYPES,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  DEFAULT_PAYMENT_METHOD,
} from "@/lib/constants";
import type { SearchResult } from "@/lib/types";
import { cn } from "@/lib/utils";

const CAPTURE_ICONS = {
  task: CheckSquare,
  reminder: Bell,
  transaction: Wallet,
  idea: Lightbulb,
  contact: Users,
  note: StickyNote,
};

const CAPTURE_LABELS: Record<string, string> = {
  task: "Task",
  reminder: "Reminder",
  transaction: "Transaction",
  idea: "Idea",
  contact: "Contact",
  note: "Note",
};

export function CommandPalette() {
  const { open, setOpen, captureType } = useCommandPalette();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [mode, setMode] = useState<"search" | "capture">("search");
  const [activeCapture, setActiveCapture] = useState("task");
  const [isSearching, startSearch] = useTransition();
  const [isSaving, startSave] = useTransition();

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setMode("search");
      return;
    }
    if (captureType) {
      setMode("capture");
      setActiveCapture(captureType);
    }
  }, [open, captureType]);

  useEffect(() => {
    if (mode !== "search" || query.length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => {
      startSearch(async () => {
        const res = await globalSearch(query);
        setResults(res);
      });
    }, 200);
    return () => clearTimeout(timer);
  }, [query, mode]);

  function handleClose() {
    setOpen(false);
  }

  function navigate(href: string) {
    handleClose();
    router.push(href);
  }

  async function handleCaptureSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const actions: Record<string, (fd: FormData) => Promise<{ success?: boolean; error?: unknown }>> = {
      task: quickCaptureTask,
      reminder: quickCaptureReminder,
      transaction: quickCaptureTransaction,
      idea: quickCaptureIdea,
      contact: quickCaptureContact,
      note: quickCaptureNote,
    };

    startSave(async () => {
      const result = await actions[activeCapture](formData);
      if (result?.error) {
        toast.error("Could not save — check your input");
        return;
      }
      toast.success(`${CAPTURE_LABELS[activeCapture]} added`);
      handleClose();
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="sr-only">Command palette</DialogTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search or capture…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (e.target.value.length >= 2) setMode("search");
              }}
              className="pl-9 rounded-xl border-0 bg-muted/50 focus-visible:ring-1"
              autoFocus
            />
          </div>
        </DialogHeader>

        <div className="flex gap-1 px-4 pt-3">
          <Button
            size="sm"
            variant={mode === "search" ? "default" : "ghost"}
            className="rounded-lg text-xs"
            onClick={() => setMode("search")}
          >
            Search
          </Button>
          <Button
            size="sm"
            variant={mode === "capture" ? "default" : "ghost"}
            className="rounded-lg text-xs"
            onClick={() => setMode("capture")}
          >
            Quick Capture
          </Button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4">
          {mode === "search" && (
            <>
              {query.length < 2 && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground mb-2 px-1">Quick actions</p>
                  {QUICK_CAPTURE_TYPES.map((type) => {
                    const Icon = CAPTURE_ICONS[type];
                    return (
                      <button
                        key={type}
                        type="button"
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-muted transition-colors"
                        onClick={() => {
                          setMode("capture");
                          setActiveCapture(type);
                          setQuery("");
                        }}
                      >
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        New {CAPTURE_LABELS[type]}
                      </button>
                    );
                  })}
                </div>
              )}
              {query.length >= 2 && (
                <>
                  {isSearching && (
                    <div className="flex items-center justify-center py-8 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  )}
                  {!isSearching && results.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">No results for &ldquo;{query}&rdquo;</p>
                  )}
                  {!isSearching && results.map((r) => (
                    <button
                      key={`${r.type}-${r.id}`}
                      type="button"
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm hover:bg-muted transition-colors"
                      onClick={() => navigate(r.href)}
                    >
                      <div className="text-left min-w-0">
                        <p className="font-medium truncate">{r.title}</p>
                        {r.subtitle && <p className="text-xs text-muted-foreground truncate">{r.subtitle}</p>}
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0 ml-2">
                        {SEARCH_ENTITY_LABELS[r.type]}
                      </span>
                    </button>
                  ))}
                </>
              )}
            </>
          )}

          {mode === "capture" && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-1">
                {QUICK_CAPTURE_TYPES.map((type) => {
                  const Icon = CAPTURE_ICONS[type];
                  return (
                    <Button
                      key={type}
                      size="sm"
                      variant={activeCapture === type ? "default" : "outline"}
                      className="rounded-lg text-xs gap-1"
                      onClick={() => setActiveCapture(type)}
                    >
                      <Icon className="h-3 w-3" />
                      {CAPTURE_LABELS[type]}
                    </Button>
                  );
                })}
              </div>

              <form onSubmit={handleCaptureSubmit} className="space-y-3">
                {activeCapture === "task" && (
                  <>
                    <div><Label>Title</Label><Input name="title" required className="mt-1" placeholder="What needs doing?" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <FormSelect label="Priority" name="priority" defaultValue="medium" options={TASK_PRIORITIES.map((p) => ({ value: p, label: p }))} />
                      <FormSelect label="Category" name="category" defaultValue="personal" options={TASK_CATEGORIES.map((c) => ({ value: c, label: c }))} />
                    </div>
                    <div><Label>Due date</Label><Input name="due_date" type="date" className="mt-1" /></div>
                  </>
                )}
                {activeCapture === "reminder" && (
                  <>
                    <div><Label>Title</Label><Input name="title" required className="mt-1" placeholder="What to remember?" /></div>
                    <FormSelect label="Category" name="type" defaultValue="custom" options={REMINDER_TYPES.map((t) => ({ value: t, label: REMINDER_TYPE_LABELS[t] ?? t }))} />
                    <div><Label>Due date</Label><Input name="due_date" type="date" required className="mt-1" /></div>
                  </>
                )}
                {activeCapture === "transaction" && (
                  <>
                    <div><Label>Title</Label><Input name="title" required className="mt-1" placeholder="What was it for?" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>Amount</Label><Input name="amount" type="number" step="0.01" required className="mt-1" /></div>
                      <FormSelect label="Type" name="type" defaultValue="expense" options={[{ value: "income", label: "Income" }, { value: "expense", label: "Expense" }]} />
                    </div>
                    <FormSelect label="Category" name="category" defaultValue="Other" options={TRANSACTION_CATEGORIES.map((c) => ({ value: c, label: c }))} />
                    <FormSelect
                      label="Payment method"
                      name="payment_method"
                      defaultValue={DEFAULT_PAYMENT_METHOD}
                      options={PAYMENT_METHODS.map((m) => ({
                        value: m,
                        label: PAYMENT_METHOD_LABELS[m] ?? m,
                      }))}
                    />
                  </>
                )}
                {activeCapture === "idea" && (
                  <>
                    <div><Label>Title</Label><Input name="title" required className="mt-1" placeholder="What's the idea?" /></div>
                    <FormSelect label="Category" name="category" defaultValue="business" options={IDEA_CATEGORIES.map((c) => ({ value: c, label: c }))} />
                  </>
                )}
                {activeCapture === "contact" && (
                  <>
                    <div><Label>Name</Label><Input name="name" required className="mt-1" /></div>
                    <div><Label>Company</Label><Input name="company" className="mt-1" /></div>
                    <div><Label>Email</Label><Input name="email" type="email" className="mt-1" /></div>
                  </>
                )}
                {activeCapture === "note" && (
                  <>
                    <div><Label>Title</Label><Input name="title" required className="mt-1" placeholder="Note title" /></div>
                    <div><Label>Content</Label><Textarea name="content" className="mt-1 min-h-[80px]" placeholder="Write your note…" /></div>
                    <div><Label>Tags</Label><Input name="tags" className="mt-1" placeholder="comma, separated, tags" /></div>
                  </>
                )}
                <Button type="submit" className="w-full rounded-xl" disabled={isSaving}>
                  {isSaving ? "Saving…" : `Add ${CAPTURE_LABELS[activeCapture]}`}
                </Button>
              </form>
            </div>
          )}
        </div>

        <div className="border-t border-border/50 px-4 py-2 text-xs text-muted-foreground flex items-center justify-between">
          <span>⌘K to toggle</span>
          <span className="hidden sm:inline">Search across everything</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function QuickCaptureButton({
  children,
  type,
  className,
}: {
  children: React.ReactNode;
  type?: string;
  className?: string;
}) {
  const { openCapture } = useCommandPalette();
  return (
    <button type="button" className={cn(className)} onClick={() => openCapture(type)}>
      {children}
    </button>
  );
}
