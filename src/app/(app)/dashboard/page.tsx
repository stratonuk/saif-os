import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { PageHeader } from "@/components/shared/page-header";
import {
  getTasks,
  getReminders,
  getProjects,
  getTransactions,
  getTodayTasks,
  getOverdueTasks,
  getActiveProjects,
  getUpcomingReminders,
  getMonthlyFinance,
} from "@/lib/data";
import { startOfWeek, endOfWeek, isWithinInterval } from "date-fns";

export default async function DashboardPage() {
  const [tasks, reminders, projects, transactions] = await Promise.all([
    getTasks(),
    getReminders(),
    getProjects(),
    getTransactions(),
  ]);

  const now = new Date();
  const finance = getMonthlyFinance(
    transactions,
    now.getFullYear(),
    now.getMonth()
  );

  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const weekTaskCount = tasks.filter((t) => {
    if (!t.due_date) return false;
    const d = new Date(t.due_date);
    return isWithinInterval(d, { start: weekStart, end: weekEnd });
  }).length;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Your life at a glance — tasks, money, and momentum."
      />
      <DashboardContent
        todayTasks={getTodayTasks(tasks)}
        overdueTasks={getOverdueTasks(tasks)}
        upcomingReminders={getUpcomingReminders(reminders)}
        activeProjects={getActiveProjects(projects)}
        monthlyIncome={finance.income}
        monthlyExpenses={finance.expenses}
        netBalance={finance.net}
        weekTaskCount={weekTaskCount}
      />
    </>
  );
}
