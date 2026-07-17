import { Skeleton } from "@/components/ui/skeleton";

export default function CalendarLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-40" />
      <Skeleton className="h-[32rem] w-full rounded-2xl" />
    </div>
  );
}
