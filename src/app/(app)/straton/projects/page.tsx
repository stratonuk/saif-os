import { getStratonProjects, getStratonClients } from "@/lib/module-data";
import { StratonProjectsClient } from "@/components/straton/straton-projects-client";

export default async function StratonProjectsPage() {
  const [projects, clients] = await Promise.all([getStratonProjects(), getStratonClients()]);
  return <StratonProjectsClient projects={projects} clients={clients} />;
}
