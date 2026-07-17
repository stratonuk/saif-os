import { getStratonHosting, getStratonClients } from "@/lib/module-data";
import { StratonHostingClient } from "@/components/straton/straton-hosting-client";

export default async function StratonHostingPage() {
  const [hosting, clients] = await Promise.all([getStratonHosting(), getStratonClients()]);
  return <StratonHostingClient hosting={hosting} clients={clients} />;
}
