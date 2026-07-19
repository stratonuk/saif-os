import {
  getTasks,
  getReminders,
  getScheduleBlocks,
  getScheduleEntries,
  getScheduleHolidays,
} from "@/lib/data";
import { CalendarPageClient } from "@/components/calendar/calendar-page-client";

export default async function CalendarPage() {
  const [tasks, reminders, blocks, scheduleEntries, holidays] = await Promise.all([
    getTasks(),
    getReminders(),
    getScheduleBlocks(),
    getScheduleEntries(),
    getScheduleHolidays(),
  ]);
  return (
    <CalendarPageClient
      tasks={tasks}
      reminders={reminders}
      blocks={blocks}
      scheduleEntries={scheduleEntries}
      holidays={holidays}
    />
  );
}
