import type { PaymentMethod, Transaction } from "./types";

export type MonthKey = `${number}-${number}`;

export function toMonthKey(year: number, month: number): MonthKey {
  return `${year}-${month}`;
}

export function parseMonthKey(key: MonthKey): { year: number; month: number } {
  const [y, m] = key.split("-").map(Number);
  return { year: y, month: m };
}

export function monthLabel(year: number, month: number, style: "short" | "long" = "short") {
  return new Date(year, month, 1).toLocaleDateString("en-GB", {
    month: style,
    year: style === "long" ? "numeric" : undefined,
  });
}

export function getTransactionMonth(tx: Transaction) {
  const d = new Date(tx.date);
  return toMonthKey(d.getFullYear(), d.getMonth());
}

export function filterByMonth(transactions: Transaction[], year: number, month: number) {
  return transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });
}

export function sumByType(transactions: Transaction[]) {
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount), 0);
  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);
  return { income, expenses, net: income - expenses };
}

export function sumByPaymentMethod(transactions: Transaction[]) {
  const bank = transactions
    .filter((t) => t.payment_method === "bank")
    .reduce((s, t) => s + Number(t.amount), 0);
  const cash = transactions
    .filter((t) => t.payment_method === "cash")
    .reduce((s, t) => s + Number(t.amount), 0);
  return { bank, cash };
}

export function sumByTypeAndPayment(transactions: Transaction[]) {
  const result = {
    income: { bank: 0, cash: 0, total: 0 },
    expense: { bank: 0, cash: 0, total: 0 },
  };
  transactions.forEach((t) => {
    const amount = Number(t.amount);
    const bucket = t.type === "income" ? result.income : result.expense;
    bucket[t.payment_method] += amount;
    bucket.total += amount;
  });
  return result;
}

export function getAvailableMonths(transactions: Transaction[]): MonthKey[] {
  const keys = new Set<MonthKey>();
  const now = new Date();
  keys.add(toMonthKey(now.getFullYear(), now.getMonth()));

  transactions.forEach((t) => keys.add(getTransactionMonth(t)));

  return Array.from(keys).sort((a, b) => {
    const pa = parseMonthKey(a);
    const pb = parseMonthKey(b);
    return pa.year !== pb.year ? pb.year - pa.year : pb.month - pa.month;
  });
}

export function getTrendChartData(transactions: Transaction[], months = 6) {
  const now = new Date();
  const data: {
    key: MonthKey;
    label: string;
    fullLabel: string;
    income: number;
    expenses: number;
    net: number;
  }[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const monthTx = filterByMonth(transactions, year, month);
    const { income, expenses, net } = sumByType(monthTx);
    data.push({
      key: toMonthKey(year, month),
      label: monthLabel(year, month, "short"),
      fullLabel: monthLabel(year, month, "long"),
      income,
      expenses,
      net,
    });
  }

  return data;
}

export function getCategoryBreakdown(
  transactions: Transaction[],
  type: "income" | "expense"
) {
  const map = new Map<string, number>();
  transactions
    .filter((t) => t.type === type)
    .forEach((t) => {
      map.set(t.category, (map.get(t.category) ?? 0) + Number(t.amount));
    });

  return Array.from(map.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export function filterTransactions(
  transactions: Transaction[],
  opts: {
    year: number;
    month: number;
    type?: "all" | "income" | "expense";
    category?: string;
    paymentMethod?: "all" | PaymentMethod;
    search?: string;
  }
) {
  let list = filterByMonth(transactions, opts.year, opts.month);

  if (opts.type && opts.type !== "all") {
    list = list.filter((t) => t.type === opts.type);
  }
  if (opts.category && opts.category !== "all") {
    list = list.filter((t) => t.category === opts.category);
  }
  if (opts.paymentMethod && opts.paymentMethod !== "all") {
    list = list.filter((t) => t.payment_method === opts.paymentMethod);
  }
  if (opts.search?.trim()) {
    const q = opts.search.toLowerCase();
    list = list.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.notes?.toLowerCase().includes(q)
    );
  }

  return list.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getCategoriesInMonth(
  transactions: Transaction[],
  year: number,
  month: number
) {
  const monthTx = filterByMonth(transactions, year, month);
  return [...new Set(monthTx.map((t) => t.category))].sort();
}
