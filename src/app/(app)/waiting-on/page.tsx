import { getWaitingItems, getProjects } from "@/lib/data";
import { WaitingOnPageClient } from "@/components/waiting-on/waiting-on-page-client";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default async function WaitingOnPage() {
  const [items, projects] = await Promise.all([getWaitingItems(), getProjects()]);

  return (
    <Suspense fallback={<WaitingOnSkeleton />}>
      <WaitingOnPageClient items={items} projects={projects} />
    </Suspense>
  );
}

function WaitingOnSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-48" />
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    </div>
  );
}
