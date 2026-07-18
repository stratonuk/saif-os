import { getTasks, getReminders, getWaitingItems } from "@/lib/data";
import { getSubscriptions, getVehicles, getParkingTickets, getStratonInvoices, getStratonHosting, getStratonReminders } from "@/lib/module-data";
import { buildInboxItems } from "@/lib/inbox-utils";
import { InboxPageClient } from "@/components/inbox/inbox-page-client";

export default async function InboxPage() {
  const [tasks, reminders, waitingItems, subscriptions, vehicles, parkingTickets, stratonInvoices, stratonHosting, stratonReminders] =
    await Promise.all([
      getTasks(), getReminders(), getWaitingItems(), getSubscriptions(),
      getVehicles(), getParkingTickets(), getStratonInvoices(), getStratonHosting(), getStratonReminders(),
    ]);
  const items = buildInboxItems({ tasks, reminders, waitingItems, subscriptions, vehicles, parkingTickets, stratonInvoices, stratonHosting, stratonReminders });
  return <InboxPageClient inboxItems={items} />;
}
