import {
  getStratonClients, getStratonProjects, getStratonInvoices,
  getStratonHosting, getStratonReminders, getStratonActivity,
} from "@/lib/module-data";
import { StratonDashboardClient } from "@/components/straton/straton-dashboard-client";

export default async function StratonDashboardPage() {
  const [clients, projects, invoices, hosting, reminders, activity] = await Promise.all([
    getStratonClients(), getStratonProjects(), getStratonInvoices(),
    getStratonHosting(), getStratonReminders(), getStratonActivity(),
  ]);
  return (
    <StratonDashboardClient
      clients={clients} projects={projects} invoices={invoices}
      hosting={hosting} reminders={reminders} activity={activity}
    />
  );
}
