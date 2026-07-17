"use server";

import { insertRow, updateRow, deleteRow } from "@/lib/db";
import { noteSchema } from "@/lib/validations";
import {
  isDemoMode,
  getAuthUserId,
  revalidateApp,
  withDemoStore,
  newId,
  nowIso,
} from "@/lib/action-utils";
import { emptyToNull } from "@/lib/form-helpers";
import type { Note } from "@/lib/types";

function parseTags(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function parseNoteForm(formData: FormData) {
  const tagsRaw = formData.get("tags")?.toString();
  return noteSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content") || undefined,
    tags: tagsRaw,
    linked_entity_type: emptyToNull(formData.get("linked_entity_type")) || "none",
    linked_entity_id: emptyToNull(formData.get("linked_entity_id")),
  });
}

export async function createNote(formData: FormData) {
  const parsed = parseNoteForm(formData);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const userId = await getAuthUserId();
  if (!userId) return { error: { _form: ["Not authenticated"] } };

  const tags = parseTags(parsed.data.tags);
  const linkedType = parsed.data.linked_entity_type === "none" ? null : parsed.data.linked_entity_type;

  if (isDemoMode()) {
    await withDemoStore((store) => {
      const note: Note = {
        id: newId(),
        user_id: userId,
        title: parsed.data.title,
        content: parsed.data.content ?? null,
        tags,
        linked_entity_type: linkedType,
        linked_entity_id: parsed.data.linked_entity_id ?? null,
        created_at: nowIso(),
        updated_at: nowIso(),
      };
      store.notes.unshift(note);
    });
    await revalidateApp("/notes", "/dashboard");
    return { success: true };
  }

  try {
    await insertRow("notes", {
      title: parsed.data.title,
      content: parsed.data.content ?? null,
      tags,
      linked_entity_type: linkedType,
      linked_entity_id: parsed.data.linked_entity_id ?? null,
      user_id: userId,
    });
  } catch (e) {
    return { error: { _form: [e instanceof Error ? e.message : "Failed to save"] } };
  }

  await revalidateApp("/notes", "/dashboard");
  return { success: true };
}

export async function updateNote(id: string, formData: FormData) {
  const parsed = parseNoteForm(formData);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const tags = parseTags(parsed.data.tags);
  const linkedType = parsed.data.linked_entity_type === "none" ? null : parsed.data.linked_entity_type;

  if (isDemoMode()) {
    await withDemoStore((store) => {
      const i = store.notes.findIndex((n) => n.id === id);
      if (i === -1) return;
      store.notes[i] = {
        ...store.notes[i],
        title: parsed.data.title,
        content: parsed.data.content ?? null,
        tags,
        linked_entity_type: linkedType,
        linked_entity_id: parsed.data.linked_entity_id ?? null,
        updated_at: nowIso(),
      };
    });
    await revalidateApp("/notes", "/dashboard");
    return { success: true };
  }

  const userId = await getAuthUserId();
  if (!userId) return { error: { _form: ["Not authenticated"] } };

  try {
    await updateRow("notes", id, userId, {
      title: parsed.data.title,
      content: parsed.data.content ?? null,
      tags,
      linked_entity_type: linkedType,
      linked_entity_id: parsed.data.linked_entity_id ?? null,
    });
  } catch (e) {
    return { error: { _form: [e instanceof Error ? e.message : "Failed to update"] } };
  }

  await revalidateApp("/notes", "/dashboard");
  return { success: true };
}

export async function deleteNote(id: string) {
  if (isDemoMode()) {
    await withDemoStore((store) => {
      store.notes = store.notes.filter((n) => n.id !== id);
    });
    await revalidateApp("/notes", "/dashboard");
    return { success: true };
  }

  const userId = await getAuthUserId();
  if (!userId) return { error: "Not authenticated" };

  try {
    await deleteRow("notes", id, userId);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to delete" };
  }

  await revalidateApp("/notes", "/dashboard");
  return { success: true };
}
