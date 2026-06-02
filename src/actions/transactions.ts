"use server";

import { createClient } from "@/lib/supabase/server";
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
    payment_method: formData.get("payment_method") ?? "bank",
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

  const supabase = await createClient();
  const { error } = await supabase.from("transactions").insert({
    ...parsed.data,
    user_id: userId,
  });
  if (error) return { error: { _form: [error.message] } };

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

  const supabase = await createClient();
  const { error } = await supabase.from("transactions").update(parsed.data).eq("id", id);
  if (error) return { error: { _form: [error.message] } };

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

  const supabase = await createClient();
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) return { error: error.message };

  await revalidateApp("/money", "/dashboard");
  return { success: true };
}
