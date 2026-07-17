"use server";

import { insertRow, updateRow, deleteRow } from "@/lib/db";
import { ideaSchema } from "@/lib/validations";
import {
  isDemoMode,
  getAuthUserId,
  revalidateApp,
  withDemoStore,
  newId,
  nowIso,
} from "@/lib/action-utils";
import type { Idea } from "@/lib/types";

function parseIdeaForm(formData: FormData) {
  return ideaSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    category: formData.get("category"),
    priority_score: formData.get("priority_score"),
    status: formData.get("status"),
  });
}

export async function createIdea(formData: FormData) {
  const parsed = parseIdeaForm(formData);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const userId = await getAuthUserId();
  if (!userId) return { error: { _form: ["Not authenticated"] } };

  if (isDemoMode()) {
    await withDemoStore((store) => {
      const item: Idea = {
        id: newId(),
        user_id: userId,
        ...parsed.data,
        description: parsed.data.description ?? null,
        created_at: nowIso(),
        updated_at: nowIso(),
      };
      store.ideas.unshift(item);
    });
    await revalidateApp("/ideas");
    return { success: true };
  }

  try {
    await insertRow("ideas", {
      ...parsed.data,
      description: parsed.data.description ?? null,
      user_id: userId,
    });
  } catch (e) {
    return { error: { _form: [e instanceof Error ? e.message : "Failed to save"] } };
  }

  await revalidateApp("/ideas");
  return { success: true };
}

export async function updateIdea(id: string, formData: FormData) {
  const parsed = parseIdeaForm(formData);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  if (isDemoMode()) {
    await withDemoStore((store) => {
      const i = store.ideas.findIndex((x) => x.id === id);
      if (i === -1) return;
      store.ideas[i] = {
        ...store.ideas[i],
        ...parsed.data,
        description: parsed.data.description ?? null,
        updated_at: nowIso(),
      };
    });
    await revalidateApp("/ideas");
    return { success: true };
  }

  const userId = await getAuthUserId();
  if (!userId) return { error: { _form: ["Not authenticated"] } };

  try {
    await updateRow("ideas", id, userId, {
      ...parsed.data,
      description: parsed.data.description ?? null,
    });
  } catch (e) {
    return { error: { _form: [e instanceof Error ? e.message : "Failed to update"] } };
  }

  await revalidateApp("/ideas");
  return { success: true };
}

export async function deleteIdea(id: string) {
  if (isDemoMode()) {
    await withDemoStore((store) => {
      store.ideas = store.ideas.filter((x) => x.id !== id);
    });
    await revalidateApp("/ideas");
    return { success: true };
  }

  const userId = await getAuthUserId();
  if (!userId) return { error: "Not authenticated" };

  try {
    await deleteRow("ideas", id, userId);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to delete" };
  }

  await revalidateApp("/ideas");
  return { success: true };
}
