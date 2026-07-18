"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { ConfirmDelete } from "@/components/shared/confirm-delete";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormSelect } from "@/components/shared/form-field";
import { NativeSelect } from "@/components/ui/native-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TRANSACTION_CATEGORIES, PAYMENT_METHOD_LABELS } from "@/lib/constants";
import {
  filterTransactions,
  getAvailableMonths,
  getCategoryBreakdown,
  getTrendChartData,
  monthLabel,
  parseMonthKey,
  sumByType,
  sumByTypeAndPayment,
  toMonthKey,
  type MonthKey,
} from "@/lib/finance-utils";
import { PaymentMethodBadge } from "@/components/money/payment-method-badge";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "@/actions/transactions";
import { useRefreshAction } from "@/hooks/use-refresh-action";
import type { Transaction, Goal, PaymentMethod } from "@/lib/types";

const TrendBarChart = dynamic(
  () => import("@/components/money/money-charts").then((m) => m.TrendBarChart),
  { ssr: false, loading: () => <ChartSkeleton height={300} /> }
);

const CategoryPieChart = dynamic(
  () => import("@/components/money/money-charts").then((m) => m.CategoryPieChart),
  { ssr: false, loading: () => <ChartSkeleton height={220} /> }
);

function ChartSkeleton({ height }: { height: number }) {
  return (
    <div
      className="w-full animate-pulse rounded-xl bg-muted"
      style={{ height }}
    />
  );
}

interface MoneyPageClientProps {
  transactions: Transaction[];
  goals: Goal[];
}

export function MoneyPageClient({ transactions, goals }: MoneyPageClientProps) {
  const searchParams = useSearchParams();
  const { run, isPending } = useRefreshAction();
  const now = new Date();

  const [selectedMonth, setSelectedMonth] = useState<MonthKey>(
    toMonthKey(now.getFullYear(), now.getMonth())
  );
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPayment, setFilterPayment] = useState<"all" | PaymentMethod>("all");
  const [search, setSearch] = useState("");
  const [chartRange, setChartRange] = useState<"6" | "12">("6");
  const [dialogOpen, setDialogOpen] = useState(searchParams.get("new") === "1");
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [txType, setTxType] = useState<"income" | "expense">("expense");

  const { year, month } = parseMonthKey(selectedMonth);
  const availableMonths = useMemo(
    () => getAvailableMonths(transactions),
    [transactions]
  );

  const monthTransactions = useMemo(
    () => filterTransactions(transactions, { year, month, type: "all" }),
    [transactions, year, month]
  );

  const monthTotals = useMemo(() => sumByType(monthTransactions), [monthTransactions]);

  const monthByPayment = useMemo(
    () => sumByTypeAndPayment(monthTransactions),
    [monthTransactions]
  );

  const trendData = useMemo(
    () => getTrendChartData(transactions, chartRange === "6" ? 6 : 12),
    [transactions, chartRange]
  );

  const expenseByCategory = useMemo(() => {
    const monthTx = filterTransactions(transactions, { year, month, type: "expense" });
    return getCategoryBreakdown(monthTx, "expense");
  }, [transactions, year, month]);

  const incomeByCategory = useMemo(() => {
    const monthTx = filterTransactions(transactions, { year, month, type: "income" });
    return getCategoryBreakdown(monthTx, "income");
  }, [transactions, year, month]);

  const categoriesInMonth = useMemo(
    () => {
      const set = new Set<string>();
      filterTransactions(transactions, { year, month }).forEach((t) =>
        set.add(t.category)
      );
      return Array.from(set).sort();
    },
    [transactions, year, month]
  );

  const filteredList = useMemo(
    () =>
      filterTransactions(transactions, {
        year,
        month,
        type: filterType,
        category: filterCategory,
        paymentMethod: filterPayment,
        search,
      }),
    [transactions, year, month, filterType, filterCategory, filterPayment, search]
  );

  const filteredTotals = useMemo(() => sumByType(filteredList), [filteredList]);

  const financialGoals = goals.filter((g) => g.type === "financial");
  const today = new Date().toISOString().split("T")[0];
  const periodLabel = monthLabel(year, month, "long");

  function shiftMonth(delta: number) {
    const d = new Date(year, month + delta, 1);
    setSelectedMonth(toMonthKey(d.getFullYear(), d.getMonth()));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await run(() =>
      editing ? updateTransaction(editing.id, formData) : createTransaction(formData)
    );
    if (result?.error) {
      toast.error("Could not save");
      return;
    }
    toast.success(editing ? "Updated" : "Added");
    setDialogOpen(false);
    setEditing(null);
  }

  function openCreate(type: "income" | "expense") {
    setEditing(null);
    setTxType(type);
    setDialogOpen(true);
  }

  function openEdit(tx: Transaction) {
    setEditing(tx);
    setTxType(tx.type);
    setDialogOpen(true);
  }

  return (
    <>
      <PageHeader
        title="Money"
        description="Monthly income, expenses, and trends."
        action={
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => openCreate("income")}>
              <Plus className="h-4 w-4 mr-1" /> Income
            </Button>
            <Button className="rounded-xl" onClick={() => openCreate("expense")}>
              <Plus className="h-4 w-4 mr-1" /> Expense
            </Button>
          </div>
        }
      />

      {/* Month navigator */}
      <Card className="mb-6">
        <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="rounded-xl shrink-0" onClick={() => shiftMonth(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <NativeSelect
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value as MonthKey)}
              className="min-w-[160px] font-medium"
              options={availableMonths.map((key) => {
                const { year: y, month: m } = parseMonthKey(key);
                return { value: key, label: monthLabel(y, m, "long") };
              })}
            />
            <Button variant="outline" size="icon" className="rounded-xl shrink-0" onClick={() => shiftMonth(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl text-muted-foreground"
              onClick={() => setSelectedMonth(toMonthKey(now.getFullYear(), now.getMonth()))}
            >
              Today
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {filteredList.length} transaction{filteredList.length !== 1 ? "s" : ""} in view
          </p>
        </CardContent>
      </Card>

      {/* Monthly totals */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <StatCard
          title="Monthly Income"
          value={formatCurrency(monthTotals.income)}
          icon={TrendingUp}
          trend="up"
          subtitle={periodLabel}
        />
        <StatCard
          title="Monthly Expenses"
          value={formatCurrency(monthTotals.expenses)}
          icon={TrendingDown}
          trend="down"
          subtitle={periodLabel}
        />
        <StatCard
          title="Net Balance"
          value={formatCurrency(monthTotals.net)}
          icon={Wallet}
          trend={monthTotals.net >= 0 ? "up" : "down"}
          subtitle={periodLabel}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
              Income by payment method
            </p>
            <div className="flex justify-between text-sm">
              <span className="text-teal-400">
                Bank {formatCurrency(monthByPayment.income.bank)}
              </span>
              <span className="text-amber-400">
                Cash {formatCurrency(monthByPayment.income.cash)}
              </span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden flex">
              <div
                className="h-full bg-teal-500"
                style={{
                  width: `${
                    monthByPayment.income.total
                      ? (monthByPayment.income.bank / monthByPayment.income.total) * 100
                      : 50
                  }%`,
                }}
              />
              <div
                className="h-full bg-amber-500"
                style={{
                  width: `${
                    monthByPayment.income.total
                      ? (monthByPayment.income.cash / monthByPayment.income.total) * 100
                      : 50
                  }%`,
                }}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
              Expenses by payment method
            </p>
            <div className="flex justify-between text-sm">
              <span className="text-teal-400">
                Bank {formatCurrency(monthByPayment.expense.bank)}
              </span>
              <span className="text-amber-400">
                Cash {formatCurrency(monthByPayment.expense.cash)}
              </span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden flex">
              <div
                className="h-full bg-teal-500"
                style={{
                  width: `${
                    monthByPayment.expense.total
                      ? (monthByPayment.expense.bank / monthByPayment.expense.total) * 100
                      : 50
                  }%`,
                }}
              />
              <div
                className="h-full bg-amber-500"
                style={{
                  width: `${
                    monthByPayment.expense.total
                      ? (monthByPayment.expense.cash / monthByPayment.expense.total) * 100
                      : 50
                  }%`,
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Income vs Expenses</CardTitle>
            <div className="flex gap-1">
              <Button
                variant={chartRange === "6" ? "secondary" : "ghost"}
                size="sm"
                className="rounded-lg h-7 text-xs"
                onClick={() => setChartRange("6")}
              >
                6 mo
              </Button>
              <Button
                variant={chartRange === "12" ? "secondary" : "ghost"}
                size="sm"
                className="rounded-lg h-7 text-xs"
                onClick={() => setChartRange("12")}
              >
                12 mo
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <TrendBarChart data={trendData} />
            <p className="text-xs text-muted-foreground text-center mt-2">
              Highlighted month: <span className="text-foreground font-medium">{periodLabel}</span>
              {" · "}
              Income {formatCurrency(monthTotals.income)} · Expenses{" "}
              {formatCurrency(monthTotals.expenses)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Breakdown — {periodLabel}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="expenses">
              <TabsList className="w-full rounded-xl mb-4">
                <TabsTrigger value="expenses" className="flex-1 rounded-lg">
                  Expenses ({formatCurrency(monthTotals.expenses)})
                </TabsTrigger>
                <TabsTrigger value="income" className="flex-1 rounded-lg">
                  Income ({formatCurrency(monthTotals.income)})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="expenses">
                {expenseByCategory.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No expenses this month</p>
                ) : (
                  <CategoryPieChart data={expenseByCategory} />
                )}
              </TabsContent>
              <TabsContent value="income">
                {incomeByCategory.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No income this month</p>
                ) : (
                  <CategoryPieChart data={incomeByCategory} colorOffset={2} />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Goals row */}
      {financialGoals.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Financial Goals</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {financialGoals.map((goal) => {
              const pct = Math.min(
                100,
                Math.round((goal.current_value / goal.target_value) * 100)
              );
              return (
                <div key={goal.id} className="rounded-xl bg-muted/30 p-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">{goal.title}</span>
                    <span className="text-muted-foreground">{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-success/70 to-success"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatCurrency(goal.current_value)} / {formatCurrency(goal.target_value)}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Filters + transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Transactions — {periodLabel}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search transactions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 rounded-xl"
              />
            </div>
            <NativeSelect
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as typeof filterType)}
              className="sm:w-[140px]"
              options={[
                { value: "all", label: "All types" },
                { value: "income", label: "Income only" },
                { value: "expense", label: "Expenses only" },
              ]}
            />
            <NativeSelect
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="sm:w-[160px]"
              options={[
                { value: "all", label: "All categories" },
                ...categoriesInMonth.map((c) => ({ value: c, label: c })),
              ]}
            />
            <NativeSelect
              value={filterPayment}
              onChange={(e) =>
                setFilterPayment(e.target.value as typeof filterPayment)
              }
              className="sm:w-[130px]"
              options={[
                { value: "all", label: "Bank & cash" },
                { value: "bank", label: "Bank only" },
                { value: "cash", label: "Cash only" },
              ]}
            />
          </div>

          {(filterType !== "all" ||
            filterCategory !== "all" ||
            filterPayment !== "all" ||
            search) && (
            <div className="flex flex-wrap gap-3 mb-4 p-3 rounded-xl bg-muted/40 text-sm">
              <span>
                Filtered:{" "}
                <strong className="text-emerald-400">
                  +{formatCurrency(filteredTotals.income)}
                </strong>
                {" · "}
                <strong className="text-red-400">
                  -{formatCurrency(filteredTotals.expenses)}
                </strong>
                {" · "}
                <strong
                  className={filteredTotals.net >= 0 ? "text-emerald-400" : "text-red-400"}
                >
                  {formatCurrency(filteredTotals.net)} net
                </strong>
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto py-0 px-2 text-xs"
                onClick={() => {
                  setFilterType("all");
                  setFilterCategory("all");
                  setFilterPayment("all");
                  setSearch("");
                }}
              >
                Clear filters
              </Button>
            </div>
          )}

          {filteredList.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">
              No transactions match your filters for {periodLabel}.
            </p>
          ) : (
            <div className="space-y-2">
              {filteredList.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded-xl bg-muted/30 px-4 py-3 gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{tx.title}</p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs border-0 capitalize",
                          tx.type === "income"
                            ? "bg-emerald-400/10 text-emerald-400"
                            : "bg-red-400/10 text-red-400"
                        )}
                      >
                        {tx.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs border-0 bg-muted">
                        {tx.category}
                      </Badge>
                      <PaymentMethodBadge method={tx.payment_method} />
                      <span className="text-xs text-muted-foreground">
                        {formatDate(tx.date)}
                      </span>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "font-semibold tabular-nums shrink-0",
                      tx.type === "income" ? "text-emerald-400" : "text-red-400"
                    )}
                  >
                    {tx.type === "income" ? "+" : "-"}
                    {formatCurrency(tx.amount)}
                  </span>
                  <div className="flex shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(tx)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <ConfirmDelete
                      onDelete={async () => {
                        await run(() => deleteTransaction(tx.id));
                        toast.success("Deleted");
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit" : "Add"} {txType === "income" ? "Income" : "Expense"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="type" value={txType} />
            <div>
              <Label>Title</Label>
              <Input name="title" defaultValue={editing?.title} required className="mt-1" />
            </div>
            <div>
              <Label>Amount (£)</Label>
              <Input
                name="amount"
                type="number"
                step="0.01"
                min="0"
                defaultValue={editing?.amount}
                required
                className="mt-1"
              />
            </div>
            <FormSelect
              label="Category"
              name="category"
              defaultValue={editing?.category ?? "Other"}
              options={TRANSACTION_CATEGORIES.map((c) => ({ value: c, label: c }))}
            />
            <div>
              <Label>Payment method</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {(["bank", "cash"] as PaymentMethod[]).map((method) => (
                  <label
                    key={method}
                    className={cn(
                      "flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/10",
                      "border-border hover:bg-muted/50"
                    )}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value={method}
                      defaultChecked={(editing?.payment_method ?? "bank") === method}
                      className="sr-only"
                    />
                    {PAYMENT_METHOD_LABELS[method]}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label>Date</Label>
              <Input
                name="date"
                type="date"
                defaultValue={editing?.date ?? today}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea name="notes" defaultValue={editing?.notes ?? ""} className="mt-1" />
            </div>
            <Button type="submit" className="w-full rounded-xl" disabled={isPending}>
              Save
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
