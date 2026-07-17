import { Skeleton } from "@/components/ui/skeleton";

export default function WaitingOnLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-12 w-full max-w-md" />
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-48 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
