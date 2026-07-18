import Link from "next/link";
import {
  ArrowRight,
  Wallet,
  CheckSquare,
  FolderKanban,
  Bell,
  Target,
  Clock,
  TrendingUp,
  TrendingDown,
  Calendar,
  CreditCard,
  Briefcase,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/stat-card";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { formatCurrency, formatPrivateCurrency, daysUntil, cn } from "@/lib/utils";
import { getReminderUrgencyColor } from "@/lib/reminder-utils";
import type { DailyBriefing } from "@/lib/briefing-utils";
import { monthlySubscriptionCost, getActiveSubscriptions } from "@/lib/subscription-utils";
import type { Goal, Project, Reminder, Subscription, Task, WaitingItem } from "@/lib/types";

interface DashboardWidgetsProps {
  briefing: DailyBriefing;
  tasks: Task[];
  reminders: Reminder[];
  projects: Project[];
  goals: Goal[];
  waitingItems: WaitingItem[];
  subscriptions: Subscription[];
  showAmounts?: boolean;
}

export function DashboardWidgets({
  briefing, tasks, reminders, projects, goals, waitingItems, subscriptions, showAmounts = false,
}: DashboardWidgetsProps) {
  const openTasks = tasks.filter((t) => t.status !== "done").length;
  const activeWaiting = waitingItems.filter((w) => w.status !== "resolved");
  const activeSubs = getActiveSubscriptions(subscriptions);
  const subMonthly = activeSubs.reduce((s, sub) => s + monthlySubscriptionCost(sub), 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <WidgetCard
          title="Money"
          icon={Wallet}
          href="/money"
          accent="from-emerald-500/10 to-emerald-500/5"
        >
          <div className="space-y-1">
            <p className="numeric text-2xl font-bold">{formatPrivateCurrency(briefing.netBalance, showAmounts)}</p>
            <p className="text-xs text-muted-foreground">net this month</p>
            <div className="flex gap-4 mt-3 text-sm">
              <span className="numeric text-success">
                {showAmounts ? `+${formatCurrency(briefing.monthlyIncome)}` : "£••••"}
              </span>
              <span className="numeric text-destructive">
                {showAmounts ? `-${formatCurrency(briefing.monthlyExpenses)}` : "£••••"}
              </span>
            </div>
          </div>
        </WidgetCard>

        <WidgetCard title="Tasks" icon={CheckSquare} href="/tasks" accent="from-violet-500/10 to-violet-500/5">
          <p className="numeric text-2xl font-bold">{openTasks}</p>
          <p className="text-xs text-muted-foreground">open tasks</p>
          {briefing.overdueTasks.length > 0 && (
            <p className="text-sm text-red-400 mt-2">{briefing.overdueTasks.length} overdue</p>
          )}
          <div className="mt-3 space-y-1.5">
            {tasks.filter((t) => t.status !== "done").slice(0, 2).map((t) => (
              <div key={t.id} className="flex items-center justify-between text-sm">
                <span className="truncate pr-2">{t.title}</span>
                <PriorityBadge priority={t.priority} />
              </div>
            ))}
          </div>
        </WidgetCard>

        <WidgetCard title="Projects" icon={FolderKanban} href="/projects" accent="from-violet-500/10 to-violet-500/5">
          <p className="numeric text-2xl font-bold">{projects.filter((p) => p.status !== "paused").length}</p>
          <p className="text-xs text-muted-foreground">active projects</p>
          {briefing.projectNeedingAttention && (
            <div className="mt-3">
              <p className="text-sm font-medium truncate">{briefing.projectNeedingAttention.name}</p>
              <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-success/70 to-success"
                  style={{ width: `${briefing.projectNeedingAttention.progress}%` }}
                />
              </div>
            </div>
          )}
        </WidgetCard>

        <WidgetCard title="Reminders" icon={Bell} href="/reminders" accent="from-amber-500/10 to-amber-500/5">
          <p className="numeric text-2xl font-bold">{briefing.upcomingReminders.length}</p>
          <p className="text-xs text-muted-foreground">due in 7 days</p>
          <div className="mt-3 space-y-1.5">
            {reminders.slice(0, 2).map((r) => (
              <div key={r.id} className={cn("flex justify-between text-sm rounded-lg px-2 py-1", getReminderUrgencyColor(r.due_date))}>
                <span className="truncate pr-2">{r.title}</span>
                <span className="text-xs shrink-0">{daysUntil(r.due_date)}d</span>
              </div>
            ))}
          </div>
        </WidgetCard>

        <WidgetCard title="Goals" icon={Target} href="/goals" accent="from-pink-500/10 to-pink-500/5">
          <p className="numeric text-2xl font-bold">{goals.length}</p>
          <p className="text-xs text-muted-foreground">tracked goals</p>
          <div className="mt-3 space-y-2">
            {goals.slice(0, 2).map((g) => {
              const pct = Math.min(100, Math.round((g.current_value / g.target_value) * 100));
              return (
                <div key={g.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="truncate pr-2">{g.title}</span>
                    <span className="text-muted-foreground">{pct}%</span>
                  </div>
                  <div className="h-1 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-pink-500/70" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </WidgetCard>

        <WidgetCard title="Waiting On" icon={Clock} href="/waiting-on" accent="from-orange-500/10 to-orange-500/5">
          <p className="numeric text-2xl font-bold">{activeWaiting.length}</p>
          <p className="text-xs text-muted-foreground">pending items</p>
          {briefing.overdueWaitingCount > 0 && (
            <p className="text-sm text-red-400 mt-2 font-medium">{briefing.overdueWaitingCount} need chasing</p>
          )}
        </WidgetCard>

        <WidgetCard title="Subscriptions" icon={CreditCard} href="/subscriptions" accent="from-cyan-500/10 to-cyan-500/5">
          <p className="numeric text-2xl font-bold">{formatPrivateCurrency(subMonthly, showAmounts)}</p>
          <p className="text-xs text-muted-foreground">{activeSubs.length} active · per month</p>
        </WidgetCard>

        <WidgetCard title="Straton" icon={Briefcase} href="/straton" accent="from-teal-500/10 to-teal-500/5">
          <p className="numeric text-2xl font-bold">{formatPrivateCurrency(briefing.stratonOutstanding, showAmounts)}</p>
          <p className="text-xs text-muted-foreground">outstanding invoices</p>
          {briefing.carAlerts > 0 && (
            <Link href="/car" className="text-xs text-amber-400 mt-2 block hover:underline">{briefing.carAlerts} car alerts</Link>
          )}
        </WidgetCard>
      </div>
    </div>
  );
}

function WidgetCard({
  title,
  icon: Icon,
  href,
  accent,
  children,
}: {
  title: string;
  icon: React.ElementType;
  href: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <Card className={cn("group transition-all hover:shadow-md hover:border-primary/20 bg-gradient-to-br", accent)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" asChild>
          <Link href={href}>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function DashboardStats({
  briefing,
  weekTaskCount,
  showAmounts = false,
}: {
  briefing: DailyBriefing;
  weekTaskCount: number;
  showAmounts?: boolean;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard title="Monthly Income" value={formatPrivateCurrency(briefing.monthlyIncome, showAmounts)} icon={TrendingUp} trend="up" subtitle="This month" />
      <StatCard title="Monthly Expenses" value={formatPrivateCurrency(briefing.monthlyExpenses, showAmounts)} icon={TrendingDown} trend="down" subtitle="This month" />
      <StatCard title="Net Balance" value={formatPrivateCurrency(briefing.netBalance, showAmounts)} icon={Wallet} trend={briefing.netBalance >= 0 ? "up" : "down"} subtitle={briefing.netBalance >= 0 ? "Positive" : "Negative"} />
      <StatCard title="This Week" value={String(weekTaskCount)} icon={Calendar} subtitle="Tasks scheduled" />
    </div>
  );
}
