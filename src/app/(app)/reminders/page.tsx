import { Suspense } from "react";
import { getReminders } from "@/lib/data";
import { RemindersPageClient } from "@/components/reminders/reminders-page-client";

export default async function RemindersPage() {
  const reminders = await getReminders();
  return (
    <Suspense fallback={<div className="animate-pulse h-96 rounded-2xl bg-muted" />}>
      <RemindersPageClient reminders={reminders} />
    </Suspense>
  );
}
