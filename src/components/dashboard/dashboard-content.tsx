import Link from "next/link";
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Wallet,
  AlertTriangle,
  FolderKanban,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/stat-card";
import { PriorityBadge } from "@/components/shared/priority-badge";
import {
  formatCurrency,
  formatDate,
  daysUntil,
  cn,
} from "@/lib/utils";
import type { Project, Reminder, Task } from "@/lib/types";

interface DashboardContentProps {
  todayTasks: Task[];
  overdueTasks: Task[];
  upcomingReminders: Reminder[];
  activeProjects: Project[];
  monthlyIncome: number;
  monthlyExpenses: number;
  netBalance: number;
  weekTaskCount: number;
}

export function DashboardContent({
  todayTasks,
  overdueTasks,
  upcomingReminders,
  activeProjects,
  monthlyIncome,
  monthlyExpenses,
  netBalance,
  weekTaskCount,
}: DashboardContentProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Monthly Income"
          value={formatCurrency(monthlyIncome)}
          icon={TrendingUp}
          trend="up"
          subtitle="This month"
        />
        <StatCard
          title="Monthly Expenses"
          value={formatCurrency(monthlyExpenses)}
          icon={TrendingDown}
          trend="down"
          subtitle="This month"
        />
        <StatCard
          title="Net Balance"
          value={formatCurrency(netBalance)}
          icon={Wallet}
          trend={netBalance >= 0 ? "up" : "down"}
          subtitle={netBalance >= 0 ? "Positive" : "Negative"}
        />
        <StatCard
          title="This Week"
          value={String(weekTaskCount)}
          icon={Calendar}
          subtitle="Tasks scheduled"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">
              Today&apos;s Tasks
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/tasks">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No tasks due today. Enjoy your day!
              </p>
            ) : (
              todayTasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2.5"
                >
                  <span className="text-sm font-medium truncate pr-2">
                    {task.title}
                  </span>
                  <PriorityBadge priority={task.priority} />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Overdue
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              {overdueTasks.length} tasks
            </span>
          </CardHeader>
          <CardContent className="space-y-3">
            {overdueTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                All caught up!
              </p>
            ) : (
              overdueTasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-red-400">
                      Due {task.due_date && formatDate(task.due_date)}
                    </p>
                  </div>
                  <PriorityBadge priority={task.priority} />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">
              Upcoming Reminders
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/reminders">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingReminders.map((reminder) => {
              const days = daysUntil(reminder.due_date);
              return (
                <div
                  key={reminder.id}
                  className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium">{reminder.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {reminder.type}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium rounded-lg px-2 py-1",
                      days <= 7
                        ? "bg-amber-400/10 text-amber-400"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {days === 0 ? "Today" : `${days}d`}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FolderKanban className="h-4 w-4 text-primary" />
            Active Projects
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/projects">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {activeProjects.map((project) => (
              <div
                key={project.id}
                className="rounded-xl border border-border/50 bg-muted/30 p-4"
              >
                <p className="font-medium text-sm">{project.name}</p>
                <p className="text-xs text-muted-foreground capitalize mt-1">
                  {project.status}
                </p>
                <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {project.progress}% complete
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="secondary" className="rounded-xl">
          <Link href="/tasks?new=1">+ Task</Link>
        </Button>
        <Button asChild variant="secondary" className="rounded-xl">
          <Link href="/money?new=1">+ Transaction</Link>
        </Button>
        <Button asChild variant="secondary" className="rounded-xl">
          <Link href="/reminders?new=1">+ Reminder</Link>
        </Button>
        <Button asChild variant="secondary" className="rounded-xl">
          <Link href="/ideas?new=1">+ Idea</Link>
        </Button>
      </div>
    </div>
  );
}
