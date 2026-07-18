"use server";

import { insertRow, updateRow, deleteRow } from "@/lib/db";
import { transactionSchema } from "@/lib/validations";
import {
  isDemoMode,
  getAuthUserId,
  revalidateApp,
  withDemoStore,
  newId,
  nowIso,
} from "@/lib/action-utils";
import type { Transaction } from "@/lib/types";

function parseTransactionForm(formData: FormData) {
  return transactionSchema.safeParse({
    title: formData.get("title"),
    amount: formData.get("amount"),
    type: formData.get("type"),
    category: formData.get("category"),
    payment_method: formData.get("payment_method") ?? "hsbc",
    date: formData.get("date"),
    notes: formData.get("notes") || undefined,
  });
}

export async function createTransaction(formData: FormData) {
  const parsed = parseTransactionForm(formData);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const userId = await getAuthUserId();
  if (!userId) return { error: { _form: ["Not authenticated"] } };

  if (isDemoMode()) {
    await withDemoStore((store) => {
      const item: Transaction = {
        id: newId(),
        user_id: userId,
        ...parsed.data,
        notes: parsed.data.notes ?? null,
        created_at: nowIso(),
      };
      store.transactions.unshift(item);
    });
    await revalidateApp("/money", "/dashboard");
    return { success: true };
  }

  try {
    await insertRow("transactions", {
      ...parsed.data,
      notes: parsed.data.notes ?? null,
      user_id: userId,
    });
  } catch (e) {
    return { error: { _form: [e instanceof Error ? e.message : "Failed to save"] } };
  }

  await revalidateApp("/money", "/dashboard");
  return { success: true };
}

export async function updateTransaction(id: string, formData: FormData) {
  const parsed = parseTransactionForm(formData);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  if (isDemoMode()) {
    await withDemoStore((store) => {
      const i = store.transactions.findIndex((t) => t.id === id);
      if (i === -1) return;
      store.transactions[i] = {
        ...store.transactions[i],
        ...parsed.data,
        notes: parsed.data.notes ?? null,
      };
    });
    await revalidateApp("/money", "/dashboard");
    return { success: true };
  }

  const userId = await getAuthUserId();
  if (!userId) return { error: { _form: ["Not authenticated"] } };

  try {
    await updateRow("transactions", id, userId, {
      ...parsed.data,
      notes: parsed.data.notes ?? null,
    });
  } catch (e) {
    return { error: { _form: [e instanceof Error ? e.message : "Failed to update"] } };
  }

  await revalidateApp("/money", "/dashboard");
  return { success: true };
}

export async function deleteTransaction(id: string) {
  if (isDemoMode()) {
    await withDemoStore((store) => {
      store.transactions = store.transactions.filter((t) => t.id !== id);
    });
    await revalidateApp("/money", "/dashboard");
    return { success: true };
  }

  const userId = await getAuthUserId();
  if (!userId) return { error: "Not authenticated" };

  try {
    await deleteRow("transactions", id, userId);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to delete" };
  }

  await revalidateApp("/money", "/dashboard");
  return { success: true };
}
