import { Suspense } from "react";
import { getGoals } from "@/lib/data";
import { GoalsPageClient } from "@/components/goals/goals-page-client";

export default async function GoalsPage() {
  const goals = await getGoals();
  return (
    <Suspense fallback={<div className="animate-pulse h-96 rounded-2xl bg-muted" />}>
      <GoalsPageClient goals={goals} />
    </Suspense>
  );
}
