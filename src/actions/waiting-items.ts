"use server";

import { insertRow, updateRow, deleteRow } from "@/lib/db";
import { waitingItemSchema } from "@/lib/validations";
import {
  isDemoMode,
  getAuthUserId,
  revalidateApp,
  withDemoStore,
  newId,
  nowIso,
} from "@/lib/action-utils";
import { emptyToNull } from "@/lib/form-helpers";
import type { WaitingItem } from "@/lib/types";

function parseWaitingForm(formData: FormData) {
  return waitingItemSchema.safeParse({
    title: formData.get("title"),
    person: formData.get("person") || undefined,
    project_id: emptyToNull(formData.get("project_id")),
    date_requested: emptyToNull(formData.get("date_requested")) || undefined,
    follow_up_date: emptyToNull(formData.get("follow_up_date")) || undefined,
    status: formData.get("status"),
    notes: formData.get("notes") || undefined,
  });
}

export async function createWaitingItem(formData: FormData) {
  const parsed = parseWaitingForm(formData);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const userId = await getAuthUserId();
  if (!userId) return { error: { _form: ["Not authenticated"] } };

  if (isDemoMode()) {
    await withDemoStore((store) => {
      const item: WaitingItem = {
        id: newId(),
        user_id: userId,
        ...parsed.data,
        person: parsed.data.person ?? null,
        project_id: parsed.data.project_id ?? null,
        date_requested: parsed.data.date_requested ?? null,
        follow_up_date: parsed.data.follow_up_date ?? null,
        notes: parsed.data.notes ?? null,
        created_at: nowIso(),
        updated_at: nowIso(),
      };
      store.waiting_items.unshift(item);
    });
    await revalidateApp("/waiting-on", "/dashboard");
    return { success: true };
  }

  try {
    await insertRow("waiting_items", {
      ...parsed.data,
      person: parsed.data.person ?? null,
      project_id: parsed.data.project_id ?? null,
      date_requested: parsed.data.date_requested ?? null,
      follow_up_date: parsed.data.follow_up_date ?? null,
      notes: parsed.data.notes ?? null,
      user_id: userId,
    });
  } catch (e) {
    return { error: { _form: [e instanceof Error ? e.message : "Failed to save"] } };
  }

  await revalidateApp("/waiting-on", "/dashboard");
  return { success: true };
}

export async function updateWaitingItem(id: string, formData: FormData) {
  const parsed = parseWaitingForm(formData);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  if (isDemoMode()) {
    await withDemoStore((store) => {
      const i = store.waiting_items.findIndex((w) => w.id === id);
      if (i === -1) return;
      store.waiting_items[i] = {
        ...store.waiting_items[i],
        ...parsed.data,
        person: parsed.data.person ?? null,
        project_id: parsed.data.project_id ?? null,
        date_requested: parsed.data.date_requested ?? null,
        follow_up_date: parsed.data.follow_up_date ?? null,
        notes: parsed.data.notes ?? null,
        updated_at: nowIso(),
      };
    });
    await revalidateApp("/waiting-on", "/dashboard");
    return { success: true };
  }

  const userId = await getAuthUserId();
  if (!userId) return { error: { _form: ["Not authenticated"] } };

  try {
    await updateRow("waiting_items", id, userId, {
      ...parsed.data,
      person: parsed.data.person ?? null,
      project_id: parsed.data.project_id ?? null,
      date_requested: parsed.data.date_requested ?? null,
      follow_up_date: parsed.data.follow_up_date ?? null,
      notes: parsed.data.notes ?? null,
    });
  } catch (e) {
    return { error: { _form: [e instanceof Error ? e.message : "Failed to update"] } };
  }

  await revalidateApp("/waiting-on", "/dashboard");
  return { success: true };
}

export async function deleteWaitingItem(id: string) {
  if (isDemoMode()) {
    await withDemoStore((store) => {
      store.waiting_items = store.waiting_items.filter((w) => w.id !== id);
    });
    await revalidateApp("/waiting-on", "/dashboard");
    return { success: true };
  }

  const userId = await getAuthUserId();
  if (!userId) return { error: "Not authenticated" };

  try {
    await deleteRow("waiting_items", id, userId);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to delete" };
  }

  await revalidateApp("/waiting-on", "/dashboard");
  return { success: true };
}

export async function updateWaitingStatus(id: string, status: WaitingItem["status"]) {
  if (isDemoMode()) {
    await withDemoStore((store) => {
      const item = store.waiting_items.find((w) => w.id === id);
      if (!item) return;
      item.status = status;
      item.updated_at = nowIso();
    });
    await revalidateApp("/waiting-on", "/dashboard");
    return { success: true };
  }

  const userId = await getAuthUserId();
  if (!userId) return { error: "Not authenticated" };

  try {
    await updateRow("waiting_items", id, userId, { status });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to update" };
  }

  await revalidateApp("/waiting-on", "/dashboard");
  return { success: true };
}
