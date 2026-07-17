"use server";

import { insertRow, updateRow, deleteRow } from "@/lib/db";
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

  try {
    await insertRow("reminders", {
      ...parsed.data,
      recurring_interval: parsed.data.recurring_interval ?? null,
      notes: parsed.data.notes ?? null,
      user_id: userId,
    });
  } catch (e) {
    return { error: { _form: [e instanceof Error ? e.message : "Failed to save"] } };
  }

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

  const userId = await getAuthUserId();
  if (!userId) return { error: { _form: ["Not authenticated"] } };

  try {
    await updateRow("reminders", id, userId, {
      ...parsed.data,
      recurring_interval: parsed.data.recurring_interval ?? null,
      notes: parsed.data.notes ?? null,
    });
  } catch (e) {
    return { error: { _form: [e instanceof Error ? e.message : "Failed to update"] } };
  }

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

  const userId = await getAuthUserId();
  if (!userId) return { error: "Not authenticated" };

  try {
    await deleteRow("reminders", id, userId);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to delete" };
  }

  await revalidateApp("/reminders", "/dashboard");
  return { success: true };
}
