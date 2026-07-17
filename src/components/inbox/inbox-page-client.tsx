"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Inbox, Sparkles, ChevronRight, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SEARCH_ENTITY_LABELS } from "@/lib/constants";
import { formatDate, daysUntil, cn } from "@/lib/utils";
import { useCommandPalette } from "@/components/command-palette/command-palette-provider";
import type { InboxItem } from "@/lib/types";

const URGENCY_ORDER = ["overdue", "critical", "warning", "normal"] as const;

const URGENCY_CONFIG: Record<
  InboxItem["urgency"],
  { label: string; sectionClass: string; cardClass: string; badgeClass: string }
> = {
  overdue: {
    label: "Overdue",
    sectionClass: "text-red-400",
    cardClass: "border-red-500/30 bg-red-500/[0.02]",
    badgeClass: "bg-red-500/10 text-red-400 border-0",
  },
  critical: {
    label: "Critical",
    sectionClass: "text-red-400",
    cardClass: "border-red-500/20",
    badgeClass: "bg-red-500/10 text-red-400 border-0",
  },
  warning: {
    label: "Due soon",
    sectionClass: "text-amber-400",
    cardClass: "border-amber-400/20",
    badgeClass: "bg-amber-400/10 text-amber-400 border-0",
  },
  normal: {
    label: "Upcoming",
    sectionClass: "text-muted-foreground",
    cardClass: "",
    badgeClass: "bg-muted border-0",
  },
};

export function InboxPageClient({ inboxItems }: { inboxItems: InboxItem[] }) {
  const { openCapture } = useCommandPalette();

  const grouped = useMemo(() => {
    const map: Record<InboxItem["urgency"], InboxItem[]> = {
      overdue: [],
      critical: [],
      warning: [],
      normal: [],
    };
    for (const item of inboxItems) {
      map[item.urgency].push(item);
    }
    return map;
  }, [inboxItems]);

  const overdueCount = grouped.overdue.length;
  const totalCount = inboxItems.length;

  return (
    <>
      <PageHeader
        title="Inbox"
        description="Everything that needs your attention — overdue tasks, upcoming renewals, and follow-ups."
      />

      {totalCount > 0 && (
        <div className="mb-6 grid gap-3 sm:grid-cols-4">
          {URGENCY_ORDER.map((urgency) => (
            <div
              key={urgency}
              className={cn(
                "rounded-xl border border-border/50 bg-muted/30 px-4 py-3",
                urgency === "overdue" && grouped[urgency].length > 0 && "border-red-500/20 bg-red-500/5"
              )}
            >
              <p className={cn("text-2xl font-bold", URGENCY_CONFIG[urgency].sectionClass)}>
                {grouped[urgency].length}
              </p>
              <p className="text-xs text-muted-foreground">{URGENCY_CONFIG[urgency].label}</p>
            </div>
          ))}
        </div>
      )}

      {overdueCount > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <p className="text-sm">
            <span className="font-semibold text-red-400">
              {overdueCount} overdue item{overdueCount > 1 ? "s" : ""}
            </span>
            {" — "}tackle these first.
          </p>
        </div>
      )}

      {totalCount === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Inbox zero"
          description="You're all caught up. Tasks, reminders, renewals, and follow-ups will appear here when they need attention."
          className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-violet-500/5"
          action={
            <div className="flex flex-wrap gap-2 justify-center">
              <Button onClick={() => openCapture("task")} className="rounded-xl gap-2">
                <Sparkles className="h-4 w-4" /> Quick Capture
              </Button>
              <Button variant="outline" asChild className="rounded-xl">
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            </div>
          }
        />
      ) : (
        <div className="space-y-8">
          {URGENCY_ORDER.map((urgency) => {
            const items = grouped[urgency];
            if (items.length === 0) return null;
            const config = URGENCY_CONFIG[urgency];
            return (
              <section key={urgency}>
                <h2 className={cn("text-sm font-semibold uppercase tracking-wider mb-3", config.sectionClass)}>
                  {config.label} ({items.length})
                </h2>
                <div className="grid gap-3">
                  {items.map((item) => {
                    const days = item.due_date ? daysUntil(item.due_date) : null;
                    return (
                      <Link key={item.id} href={item.href} className="block">
                        <Card
                          className={cn(
                            "transition-all active:scale-[0.98] touch-manipulation hover:border-primary/30",
                            config.cardClass
                          )}
                        >
                          <CardContent className="p-4 flex items-center gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-medium truncate">{item.title}</h3>
                                <Badge variant="outline" className={cn("text-[10px] capitalize shrink-0", config.badgeClass)}>
                                  {SEARCH_ENTITY_LABELS[item.type] ?? item.type}
                                </Badge>
                              </div>
                              {item.subtitle && (
                                <p className="text-sm text-muted-foreground mt-0.5 truncate">{item.subtitle}</p>
                              )}
                              {item.due_date && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatDate(item.due_date)}
                                  {days !== null && days < 0 && ` · ${Math.abs(days)}d overdue`}
                                  {days !== null && days >= 0 && days <= 7 && ` · ${days === 0 ? "today" : `${days}d left`}`}
                                </p>
                              )}
                            </div>
                            {days !== null && (
                              <div className={cn("flex flex-col items-center rounded-xl px-3 py-2 min-w-[56px] border shrink-0", config.cardClass || "border-border/50 bg-muted/30")}>
                                <span className="text-lg font-semibold">
                                  {days < 0 ? Math.abs(days) : days <= 0 ? "!" : days}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  {days < 0 ? "overdue" : days === 0 ? "today" : "days"}
                                </span>
                              </div>
                            )}
                            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
