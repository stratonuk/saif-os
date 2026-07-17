import { notFound } from "next/navigation";
import {
  getStratonClient, getStratonProjects, getStratonInvoices,
  getStratonHosting, getStratonReminders, getStratonActivity, getDocuments,
} from "@/lib/module-data";
import { StratonClientDetailClient } from "@/components/straton/straton-client-detail-client";

export default async function StratonClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await getStratonClient(id);
  if (!client) notFound();
  const [projects, invoices, hosting, reminders, activity, documents] = await Promise.all([
    getStratonProjects(), getStratonInvoices(), getStratonHosting(),
    getStratonReminders(), getStratonActivity(id), getDocuments(),
  ]);
  return (
    <StratonClientDetailClient
      client={client}
      projects={projects.filter((p) => p.client_id === id)}
      invoices={invoices.filter((i) => i.client_id === id)}
      hosting={hosting.filter((h) => h.client_id === id)}
      reminders={reminders.filter((r) => r.client_id === id)}
      activity={activity}
      documents={documents.filter((d) => d.linked_entity_id === id)}
    />
  );
}
