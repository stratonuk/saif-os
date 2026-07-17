import { getStratonInvoices, getStratonClients, getStratonProjects } from "@/lib/module-data";
import { StratonInvoicesClient } from "@/components/straton/straton-invoices-client";

export default async function StratonInvoicesPage() {
  const [invoices, clients, projects] = await Promise.all([
    getStratonInvoices(), getStratonClients(), getStratonProjects(),
  ]);
  return <StratonInvoicesClient invoices={invoices} clients={clients} projects={projects} />;
}
