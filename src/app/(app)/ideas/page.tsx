import { getIdeas } from "@/lib/data";
import { IdeasPageClient } from "@/components/ideas/ideas-page-client";

export default async function IdeasPage() {
  const ideas = await getIdeas();
  return <IdeasPageClient ideas={ideas} />;
}
