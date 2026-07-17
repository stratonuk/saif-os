import { DashboardContent } from "@/components/dashboard/dashboard-content";
import {
  getTasks, getReminders, getProjects, getTransactions, getGoals, getWaitingItems, getMonthlyFinance,
} from "@/lib/data";
import {
  getSubscriptions, getVehicles, getStratonInvoices,
} from "@/lib/module-data";
import { buildDailyBriefing } from "@/lib/briefing-utils";
import { buildInboxItems } from "@/lib/inbox-utils";
import { monthlySubscriptionCost, getActiveSubscriptions } from "@/lib/subscription-utils";
import { getOverdueInvoices } from "@/lib/straton-utils";
import { daysUntil } from "@/lib/utils";
import { startOfWeek, endOfWeek, isWithinInterval } from "date-fns";

export default async function DashboardPage() {
  const [
    tasks, reminders, projects, transactions, goals, waitingItems,
    subscriptions, vehicles, stratonInvoices,
  ] = await Promise.all([
    getTasks(), getReminders(), getProjects(), getTransactions(), getGoals(), getWaitingItems(),
    getSubscriptions(), getVehicles(), getStratonInvoices(),
  ]);

  const now = new Date();
  const finance = getMonthlyFinance(transactions, now.getFullYear(), now.getMonth());

  const inboxItems = buildInboxItems({
    tasks, reminders, waitingItems, subscriptions, vehicles,
    stratonInvoices, stratonHosting: [], stratonReminders: [],
  });

  const subMonthly = getActiveSubscriptions(subscriptions)
    .reduce((s, sub) => s + monthlySubscriptionCost(sub), 0);

  const carAlerts = vehicles.reduce((count, v) => {
    let c = 0;
    for (const d of [v.mot_date, v.insurance_expiry, v.tax_date]) {
      if (d && daysUntil(d) <= 30) c++;
    }
    return count + c;
  }, 0);

  const stratonOutstanding = getOverdueInvoices(stratonInvoices)
    .reduce((s, i) => s + Number(i.amount), 0);

  const briefing = buildDailyBriefing({
    tasks, reminders, projects, waitingItems,
    monthlyIncome: finance.income, monthlyExpenses: finance.expenses, netBalance: finance.net,
    inboxCount: inboxItems.length, subscriptionMonthlyTotal: subMonthly,
    carAlerts, stratonOutstanding,
  });

  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const weekTaskCount = tasks.filter((t) => {
    if (!t.due_date) return false;
    return isWithinInterval(new Date(t.due_date), { start: weekStart, end: weekEnd });
  }).length;

  return (
    <DashboardContent
      briefing={briefing} tasks={tasks} reminders={reminders}
      projects={projects} goals={goals} waitingItems={waitingItems}
      subscriptions={subscriptions} weekTaskCount={weekTaskCount}
    />
  );
}
