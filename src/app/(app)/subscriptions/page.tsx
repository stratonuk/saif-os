import { getSubscriptions } from "@/lib/module-data";
import { SubscriptionsPageClient } from "@/components/subscriptions/subscriptions-page-client";

export default async function SubscriptionsPage() {
  const subscriptions = await getSubscriptions();
  return <SubscriptionsPageClient subscriptions={subscriptions} />;
}
