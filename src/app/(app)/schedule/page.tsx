import {
  getScheduleBlocks,
  getScheduleEntries,
  getScheduleHolidays,
} from "@/lib/data";
import { SchedulePageClient } from "@/components/schedule/schedule-page-client";

export default async function SchedulePage() {
  const [blocks, entries, holidays] = await Promise.all([
    getScheduleBlocks(),
    getScheduleEntries(),
    getScheduleHolidays(),
  ]);
  return (
    <SchedulePageClient blocks={blocks} entries={entries} holidays={holidays} />
  );
}
