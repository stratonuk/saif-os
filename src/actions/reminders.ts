"use server";

import { createClient } from "@/lib/supabase/server";
import { reminderSchema } from "@/lib/validations";
import {
  isDemoMode,
  getAuthUserId,
  revalidateApp,
  withDemoStore,
  newId,
  nowIso,
} from "@/lib/action-utils";
import { emptyToNull, parseRecurring } from "@/lib/form-helpers";
import type { Reminder } from "@/lib/types";

function parseReminderForm(formData: FormData) {
  return reminderSchema.safeParse({
    title: formData.get("title"),
    type: formData.get("type"),
    due_date: formData.get("due_date"),
    recurring: parseRecurring(formData),
    recurring_interval: emptyToNull(formData.get("recurring_interval")),
    notes: formData.get("notes") || undefined,
  });
}

export async function createReminder(formData: FormData) {
  const parsed = parseReminderForm(formData);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const userId = await getAuthUserId();
  if (!userId) return { error: { _form: ["Not authenticated"] } };

  if (isDemoMode()) {
    await withDemoStore((store) => {
      const item: Reminder = {
        id: newId(),
        user_id: userId,
        ...parsed.data,
        recurring_interval: parsed.data.recurring_interval ?? null,
        notes: parsed.data.notes ?? null,
        created_at: nowIso(),
        updated_at: nowIso(),
      };
      store.reminders.push(item);
      store.reminders.sort(
        (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      );
    });
    await revalidateApp("/reminders", "/dashboard");
    return { success: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("reminders").insert({
    ...parsed.data,
    user_id: userId,
  });
  if (error) return { error: { _form: [error.message] } };

  await revalidateApp("/reminders", "/dashboard");
  return { success: true };
}

export async function updateReminder(id: string, formData: FormData) {
  const parsed = parseReminderForm(formData);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  if (isDemoMode()) {
    await withDemoStore((store) => {
      const i = store.reminders.findIndex((r) => r.id === id);
      if (i === -1) return;
      store.reminders[i] = {
        ...store.reminders[i],
        ...parsed.data,
        recurring_interval: parsed.data.recurring_interval ?? null,
        notes: parsed.data.notes ?? null,
        updated_at: nowIso(),
      };
    });
    await revalidateApp("/reminders", "/dashboard");
    return { success: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("reminders").update(parsed.data).eq("id", id);
  if (error) return { error: { _form: [error.message] } };

  await revalidateApp("/reminders", "/dashboard");
  return { success: true };
}

export async function deleteReminder(id: string) {
  if (isDemoMode()) {
    await withDemoStore((store) => {
      store.reminders = store.reminders.filter((r) => r.id !== id);
    });
    await revalidateApp("/reminders", "/dashboard");
    return { success: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("reminders").delete().eq("id", id);
  if (error) return { error: error.message };

  await revalidateApp("/reminders", "/dashboard");
  return { success: true };
}
