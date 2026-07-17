"use server";

import { insertRow, updateRow, deleteRow } from "@/lib/db";
import { projectSchema } from "@/lib/validations";
import {
  isDemoMode,
  getAuthUserId,
  revalidateApp,
  withDemoStore,
  newId,
  nowIso,
} from "@/lib/action-utils";
import type { Project } from "@/lib/types";

function parseProjectForm(formData: FormData) {
  return projectSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    status: formData.get("status"),
    revenue: formData.get("revenue"),
    expenses: formData.get("expenses"),
    progress: formData.get("progress"),
    notes: formData.get("notes") || undefined,
  });
}

export async function createProject(formData: FormData) {
  const parsed = parseProjectForm(formData);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const userId = await getAuthUserId();
  if (!userId) return { error: { _form: ["Not authenticated"] } };

  if (isDemoMode()) {
    await withDemoStore((store) => {
      const item: Project = {
        id: newId(),
        user_id: userId,
        ...parsed.data,
        description: parsed.data.description ?? null,
        notes: parsed.data.notes ?? null,
        created_at: nowIso(),
        updated_at: nowIso(),
      };
      store.projects.unshift(item);
    });
    await revalidateApp("/projects", "/dashboard", "/tasks", "/contacts");
    return { success: true };
  }

  try {
    await insertRow("projects", {
      ...parsed.data,
      description: parsed.data.description ?? null,
      notes: parsed.data.notes ?? null,
      user_id: userId,
    });
  } catch (e) {
    return { error: { _form: [e instanceof Error ? e.message : "Failed to save"] } };
  }

  await revalidateApp("/projects", "/dashboard", "/tasks", "/contacts");
  return { success: true };
}

export async function updateProject(id: string, formData: FormData) {
  const parsed = parseProjectForm(formData);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  if (isDemoMode()) {
    await withDemoStore((store) => {
      const i = store.projects.findIndex((p) => p.id === id);
      if (i === -1) return;
      store.projects[i] = {
        ...store.projects[i],
        ...parsed.data,
        description: parsed.data.description ?? null,
        notes: parsed.data.notes ?? null,
        updated_at: nowIso(),
      };
    });
    await revalidateApp("/projects", "/dashboard", "/tasks", "/contacts");
    return { success: true };
  }

  const userId = await getAuthUserId();
  if (!userId) return { error: { _form: ["Not authenticated"] } };

  try {
    await updateRow("projects", id, userId, {
      ...parsed.data,
      description: parsed.data.description ?? null,
      notes: parsed.data.notes ?? null,
    });
  } catch (e) {
    return { error: { _form: [e instanceof Error ? e.message : "Failed to update"] } };
  }

  await revalidateApp("/projects", "/dashboard", "/tasks", "/contacts");
  return { success: true };
}

export async function deleteProject(id: string) {
  if (isDemoMode()) {
    await withDemoStore((store) => {
      store.projects = store.projects.filter((p) => p.id !== id);
      store.tasks.forEach((t) => {
        if (t.project_id === id) t.project_id = null;
      });
      store.contacts.forEach((c) => {
        if (c.project_id === id) c.project_id = null;
      });
    });
    await revalidateApp("/projects", "/dashboard", "/tasks", "/contacts");
    return { success: true };
  }

  const userId = await getAuthUserId();
  if (!userId) return { error: "Not authenticated" };

  try {
    await deleteRow("projects", id, userId);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to delete" };
  }

  await revalidateApp("/projects", "/dashboard", "/tasks", "/contacts");
  return { success: true };
}
