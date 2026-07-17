import { getDocuments } from "@/lib/module-data";
import { StratonDocumentsClient } from "@/components/straton/straton-documents-client";

export default async function StratonDocumentsPage() {
  const documents = await getDocuments();
  return <StratonDocumentsClient documents={documents} />;
}
