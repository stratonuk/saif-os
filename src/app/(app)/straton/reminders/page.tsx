import { getStratonReminders, getStratonClients, getStratonProjects } from "@/lib/module-data";
import { StratonRemindersClient } from "@/components/straton/straton-reminders-client";

export default async function StratonRemindersPage() {
  const [reminders, clients, projects] = await Promise.all([
    getStratonReminders(), getStratonClients(), getStratonProjects(),
  ]);
  return <StratonRemindersClient reminders={reminders} clients={clients} projects={projects} />;
}
