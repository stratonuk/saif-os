import { getMonthlyReviews } from "@/lib/module-data";
import { MonthlyResetPageClient } from "@/components/monthly-reset/monthly-reset-page-client";

export default async function MonthlyResetPage() {
  const reviews = await getMonthlyReviews();
  return <MonthlyResetPageClient reviews={reviews} />;
}
