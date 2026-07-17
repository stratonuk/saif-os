import { getDocuments } from "@/lib/module-data";
import { DocumentsPageClient } from "@/components/documents/documents-page-client";

export default async function DocumentsPage() {
  const documents = await getDocuments();
  return <DocumentsPageClient documents={documents} />;
}
