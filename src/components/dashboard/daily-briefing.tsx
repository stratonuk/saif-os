import Link from "next/link";
import {
  Target, AlertTriangle, Bell, Wallet, FolderKanban, Clock, Sparkles,
  Inbox, Car, CreditCard, Briefcase,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { REMINDER_TYPE_LABELS } from "@/lib/constants";
import { getReminderUrgencyColor } from "@/lib/reminder-utils";
import { formatPrivateCurrency, formatDate, daysUntil, cn } from "@/lib/utils";
import type { DailyBriefing } from "@/lib/briefing-utils";

interface DailyBriefingProps {
  briefing: DailyBriefing;
  showAmounts?: boolean;
  onQuickCapture?: () => void;
}

export function DailyBriefingSection({ briefing, showAmounts = false, onQuickCapture }: DailyBriefingProps) {
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-violet-500/5">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{today}</p>
            <CardTitle className="text-xl font-bold mt-1 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Daily Briefing
            </CardTitle>
          </div>
          {onQuickCapture && (
            <Button size="sm" variant="outline" className="rounded-xl shrink-0" onClick={onQuickCapture}>
              Quick Capture
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {briefing.mainFocus && (
          <div className="rounded-xl border border-primary/30 bg-primary/10 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-primary mb-1">Main focus today</p>
            <p className="text-lg font-semibold">{briefing.mainFocus.title}</p>
            <div className="mt-2 flex items-center gap-2">
              <PriorityBadge priority={briefing.mainFocus.priority} />
              {briefing.mainFocus.due_date && (
                <span className="text-xs text-muted-foreground">Due {formatDate(briefing.mainFocus.due_date)}</span>
              )}
            </div>
          </div>
        )}

        {(briefing.inboxCount > 0 || briefing.carAlerts > 0 || briefing.stratonOutstanding > 0) && (
          <div className="flex flex-wrap gap-2">
            {briefing.inboxCount > 0 && (
              <Link href="/inbox" className="flex items-center gap-2 rounded-xl border border-border/50 bg-muted/30 px-3 py-2 text-sm hover:border-primary/30 transition-colors">
                <Inbox className="h-4 w-4 text-primary" />
                <span>{briefing.inboxCount} inbox items</span>
              </Link>
            )}
            {briefing.carAlerts > 0 && (
              <Link href="/car" className="flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/5 px-3 py-2 text-sm hover:border-amber-400/50 transition-colors">
                <Car className="h-4 w-4 text-amber-400" />
                <span>{briefing.carAlerts} car alert{briefing.carAlerts > 1 ? "s" : ""}</span>
              </Link>
            )}
            {briefing.stratonOutstanding > 0 && (
              <Link href="/straton/invoices" className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm hover:border-red-500/50 transition-colors">
                <Briefcase className="h-4 w-4 text-red-400" />
                <span>{formatPrivateCurrency(briefing.stratonOutstanding, showAmounts)} overdue</span>
              </Link>
            )}
            {briefing.subscriptionMonthlyTotal > 0 && (
              <Link href="/subscriptions" className="flex items-center gap-2 rounded-xl border border-border/50 bg-muted/30 px-3 py-2 text-sm hover:border-primary/30 transition-colors">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span>{formatPrivateCurrency(briefing.subscriptionMonthlyTotal, showAmounts)}/mo subs</span>
              </Link>
            )}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <BriefingBlock
            icon={Target}
            title="Top 3 priorities"
            empty="No urgent tasks today"
            href="/tasks"
          >
            {briefing.topPriorities.map((task) => (
              <div key={task.id} className="flex items-center justify-between gap-2 rounded-lg bg-muted/50 px-3 py-2">
                <span className="text-sm truncate">{task.title}</span>
                <PriorityBadge priority={task.priority} />
              </div>
            ))}
          </BriefingBlock>

          <BriefingBlock
            icon={AlertTriangle}
            title="Overdue"
            count={briefing.overdueTasks.length}
            empty="All caught up"
            href="/tasks"
            variant="danger"
          >
            {briefing.overdueTasks.slice(0, 3).map((task) => (
              <div key={task.id} className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2">
                <p className="text-sm font-medium truncate">{task.title}</p>
                <p className="text-xs text-red-400">
                  Due {task.due_date && formatDate(task.due_date)}
                </p>
              </div>
            ))}
          </BriefingBlock>

          <BriefingBlock
            icon={Bell}
            title="Next 7 days"
            count={briefing.upcomingReminders.length}
            empty="Nothing due soon"
            href="/reminders"
          >
            {briefing.upcomingReminders.slice(0, 3).map((r) => (
              <div key={r.id} className={cn("flex items-center justify-between rounded-lg border px-3 py-2", getReminderUrgencyColor(r.due_date))}>
                <div className="min-w-0">
                  <p className="text-sm truncate">{r.title}</p>
                  <p className="text-xs opacity-80">{REMINDER_TYPE_LABELS[r.type] ?? r.type}</p>
                </div>
                <span className="text-xs font-semibold shrink-0 ml-2">
                  {daysUntil(r.due_date) === 0 ? "Today" : `${daysUntil(r.due_date)}d`}
                </span>
              </div>
            ))}
          </BriefingBlock>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Wallet className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">This month</span>
            </div>
            <p className="text-lg font-bold text-emerald-400">{formatPrivateCurrency(briefing.monthlyIncome, showAmounts)}</p>
            <p className="text-sm text-muted-foreground">income</p>
            <p className="text-lg font-bold text-red-400 mt-2">{formatPrivateCurrency(briefing.monthlyExpenses, showAmounts)}</p>
            <p className="text-sm text-muted-foreground">expenses · net {formatPrivateCurrency(briefing.netBalance, showAmounts)}</p>
          </div>

          {briefing.projectNeedingAttention && (
            <div className="rounded-xl border border-border/50 bg-muted/30 p-4 sm:col-span-1">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <FolderKanban className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Needs attention</span>
              </div>
              <p className="font-semibold">{briefing.projectNeedingAttention.name}</p>
              <p className="text-xs text-muted-foreground capitalize mt-1">
                {briefing.projectNeedingAttention.status} · {briefing.projectNeedingAttention.progress}%
              </p>
              <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all"
                  style={{ width: `${briefing.projectNeedingAttention.progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Waiting on</span>
            </div>
            <p className="text-2xl font-bold">{briefing.activeWaitingCount}</p>
            <p className="text-sm text-muted-foreground">active items</p>
            {briefing.overdueWaitingCount > 0 && (
              <p className="text-sm text-red-400 mt-1 font-medium">
                {briefing.overdueWaitingCount} overdue follow-up{briefing.overdueWaitingCount > 1 ? "s" : ""}
              </p>
            )}
            <Button variant="link" size="sm" className="px-0 mt-1 h-auto" asChild>
              <Link href="/waiting-on">View tracker →</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BriefingBlock({
  icon: Icon,
  title,
  count,
  empty,
  href,
  variant,
  children,
}: {
  icon: React.ElementType;
  title: string;
  count?: number;
  empty: string;
  href: string;
  variant?: "danger";
  children: React.ReactNode;
}) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : !!children;

  return (
    <div className={cn("rounded-xl border p-4", variant === "danger" ? "border-red-500/20" : "border-border/50")}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={cn("h-4 w-4", variant === "danger" ? "text-red-400" : "text-muted-foreground")} />
          <span className="text-sm font-semibold">{title}</span>
        </div>
        {count !== undefined && count > 0 && (
          <span className={cn("text-xs font-medium rounded-full px-2 py-0.5", variant === "danger" ? "bg-red-500/10 text-red-400" : "bg-muted text-muted-foreground")}>
            {count}
          </span>
        )}
      </div>
      <div className="space-y-2">
        {hasChildren ? children : (
          <p className="text-sm text-muted-foreground py-2">{empty}</p>
        )}
      </div>
      <Button variant="link" size="sm" className="px-0 mt-2 h-auto text-xs" asChild>
        <Link href={href}>View all →</Link>
      </Button>
    </div>
  );
}
