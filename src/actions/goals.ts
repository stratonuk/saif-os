"use server";

import { createClient } from "@/lib/supabase/server";
import { goalSchema } from "@/lib/validations";
import {
  isDemoMode,
  getAuthUserId,
  revalidateApp,
  withDemoStore,
  newId,
  nowIso,
} from "@/lib/action-utils";
import { emptyToNull } from "@/lib/form-helpers";
import type { Goal } from "@/lib/types";

function parseGoalForm(formData: FormData) {
  return goalSchema.safeParse({
    title: formData.get("title"),
    type: formData.get("type"),
    current_value: formData.get("current_value"),
    target_value: formData.get("target_value"),
    target_date: emptyToNull(formData.get("target_date")) || undefined,
    unit: formData.get("unit") || undefined,
  });
}

export async function createGoal(formData: FormData) {
  const parsed = parseGoalForm(formData);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const userId = await getAuthUserId();
  if (!userId) return { error: { _form: ["Not authenticated"] } };

  if (isDemoMode()) {
    await withDemoStore((store) => {
      const item: Goal = {
        id: newId(),
        user_id: userId,
        ...parsed.data,
        target_date: parsed.data.target_date ?? null,
        unit: parsed.data.unit ?? null,
        created_at: nowIso(),
        updated_at: nowIso(),
      };
      store.goals.unshift(item);
    });
    await revalidateApp("/goals", "/money", "/dashboard");
    return { success: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("goals").insert({
    ...parsed.data,
    user_id: userId,
  });
  if (error) return { error: { _form: [error.message] } };

  await revalidateApp("/goals", "/money", "/dashboard");
  return { success: true };
}

export async function updateGoal(id: string, formData: FormData) {
  const parsed = parseGoalForm(formData);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  if (isDemoMode()) {
    await withDemoStore((store) => {
      const i = store.goals.findIndex((g) => g.id === id);
      if (i === -1) return;
      store.goals[i] = {
        ...store.goals[i],
        ...parsed.data,
        target_date: parsed.data.target_date ?? null,
        unit: parsed.data.unit ?? null,
        updated_at: nowIso(),
      };
    });
    await revalidateApp("/goals", "/money", "/dashboard");
    return { success: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("goals").update(parsed.data).eq("id", id);
  if (error) return { error: { _form: [error.message] } };

  await revalidateApp("/goals", "/money", "/dashboard");
  return { success: true };
}

export async function deleteGoal(id: string) {
  if (isDemoMode()) {
    await withDemoStore((store) => {
      store.goals = store.goals.filter((g) => g.id !== id);
    });
    await revalidateApp("/goals", "/money", "/dashboard");
    return { success: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("goals").delete().eq("id", id);
  if (error) return { error: error.message };

  await revalidateApp("/goals", "/money", "/dashboard");
  return { success: true };
}

export async function updateGoalProgress(id: string, currentValue: number) {
  if (isDemoMode()) {
    await withDemoStore((store) => {
      const goal = store.goals.find((g) => g.id === id);
      if (!goal) return;
      goal.current_value = currentValue;
      goal.updated_at = nowIso();
    });
    await revalidateApp("/goals", "/money", "/dashboard");
    return { success: true };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("goals")
    .update({ current_value: currentValue })
    .eq("id", id);
  if (error) return { error: error.message };

  await revalidateApp("/goals", "/money", "/dashboard");
  return { success: true };
}
