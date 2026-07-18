import { DEFAULT_PAYMENT_METHOD, PAYMENT_METHODS } from "./constants";
import type { PaymentMethod, Transaction } from "./types";

const VALID = new Set<string>(PAYMENT_METHODS);

/** Map legacy / unknown values onto the current payment-method list. */
export function normalizePaymentMethod(
  method?: string | null
): PaymentMethod {
  if (!method) return DEFAULT_PAYMENT_METHOD;
  if (method === "bank") return "hsbc";
  if (VALID.has(method)) return method as PaymentMethod;
  return DEFAULT_PAYMENT_METHOD;
}

export function normalizeTransaction(
  tx: Transaction & { payment_method?: string }
): Transaction {
  return {
    ...tx,
    payment_method: normalizePaymentMethod(tx.payment_method),
  };
}

export function normalizeTransactions(
  transactions: (Transaction & { payment_method?: string })[]
): Transaction[] {
  return transactions.map(normalizeTransaction);
}
