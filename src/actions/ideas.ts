"use server";

import { createClient } from "@/lib/supabase/server";
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

  const supabase = await createClient();
  const { error } = await supabase.from("ideas").insert({
    ...parsed.data,
    user_id: userId,
  });
  if (error) return { error: { _form: [error.message] } };

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

  const supabase = await createClient();
  const { error } = await supabase.from("ideas").update(parsed.data).eq("id", id);
  if (error) return { error: { _form: [error.message] } };

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

  const supabase = await createClient();
  const { error } = await supabase.from("ideas").delete().eq("id", id);
  if (error) return { error: error.message };

  await revalidateApp("/ideas");
  return { success: true };
}
