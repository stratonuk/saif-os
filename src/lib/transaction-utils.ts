import type { PaymentMethod, Transaction } from "./types";

export function normalizeTransaction(
  tx: Transaction & { payment_method?: PaymentMethod }
): Transaction {
  return {
    ...tx,
    payment_method: tx.payment_method === "cash" ? "cash" : "bank",
  };
}

export function normalizeTransactions(
  transactions: (Transaction & { payment_method?: PaymentMethod })[]
): Transaction[] {
  return transactions.map(normalizeTransaction);
}
