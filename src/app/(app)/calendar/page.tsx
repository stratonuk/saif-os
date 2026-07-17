import { getTasks, getReminders } from "@/lib/data";
import { CalendarPageClient } from "@/components/calendar/calendar-page-client";

export default async function CalendarPage() {
  const [tasks, reminders] = await Promise.all([getTasks(), getReminders()]);
  return <CalendarPageClient tasks={tasks} reminders={reminders} />;
}
