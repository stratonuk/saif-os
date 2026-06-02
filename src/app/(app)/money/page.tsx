import { getTransactions, getGoals } from "@/lib/data";
import { MoneyPageClient } from "@/components/money/money-page-client";

export default async function MoneyPage() {
  const [transactions, goals] = await Promise.all([
    getTransactions(),
    getGoals(),
  ]);

  return <MoneyPageClient transactions={transactions} goals={goals} />;
}
