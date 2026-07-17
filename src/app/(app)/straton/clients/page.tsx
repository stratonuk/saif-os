import { getStratonClients } from "@/lib/module-data";
import { StratonClientsClient } from "@/components/straton/straton-clients-client";

export default async function StratonClientsPage() {
  const clients = await getStratonClients();
  return <StratonClientsClient clients={clients} />;
}
