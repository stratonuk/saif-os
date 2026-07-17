"use server";

import { insertRow, updateRow, deleteRow, selectByIdForUser } from "@/lib/db";
import { taskSchema } from "@/lib/validations";
import {
  isDemoMode,
  getAuthUserId,
  revalidateApp,
  withDemoStore,
  newId,
  nowIso,
} from "@/lib/action-utils";
import { emptyToNull } from "@/lib/form-helpers";
import type { Task } from "@/lib/types";

function parseTaskForm(formData: FormData) {
  return taskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    due_date: emptyToNull(formData.get("due_date")) || undefined,
    priority: formData.get("priority"),
    status: formData.get("status"),
    category: formData.get("category"),
    project_id: emptyToNull(formData.get("project_id")),
  });
}

export async function createTask(formData: FormData) {
  const parsed = parseTaskForm(formData);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const userId = await getAuthUserId();
  if (!userId) return { error: { _form: ["Not authenticated"] } };

  if (isDemoMode()) {
    await withDemoStore((store) => {
      const task: Task = {
        id: newId(),
        user_id: userId,
        ...parsed.data,
        description: parsed.data.description ?? null,
        due_date: parsed.data.due_date ?? null,
        project_id: parsed.data.project_id ?? null,
        created_at: nowIso(),
        updated_at: nowIso(),
      };
      store.tasks.unshift(task);
    });
    await revalidateApp("/tasks", "/dashboard", "/projects");
    return { success: true };
  }

  try {
    await insertRow("tasks", {
      ...parsed.data,
      description: parsed.data.description ?? null,
      due_date: parsed.data.due_date ?? null,
      project_id: parsed.data.project_id ?? null,
      user_id: userId,
    });
  } catch (e) {
    return { error: { _form: [e instanceof Error ? e.message : "Failed to save"] } };
  }

  await revalidateApp("/tasks", "/dashboard", "/projects");
  return { success: true };
}

export async function updateTask(id: string, formData: FormData) {
  const parsed = parseTaskForm(formData);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  if (isDemoMode()) {
    await withDemoStore((store) => {
      const i = store.tasks.findIndex((t) => t.id === id);
      if (i === -1) return;
      store.tasks[i] = {
        ...store.tasks[i],
        ...parsed.data,
        description: parsed.data.description ?? null,
        due_date: parsed.data.due_date ?? null,
        project_id: parsed.data.project_id ?? null,
        updated_at: nowIso(),
      };
    });
    await revalidateApp("/tasks", "/dashboard", "/projects");
    return { success: true };
  }

  const userId = await getAuthUserId();
  if (!userId) return { error: { _form: ["Not authenticated"] } };

  try {
    await updateRow("tasks", id, userId, {
      ...parsed.data,
      description: parsed.data.description ?? null,
      due_date: parsed.data.due_date ?? null,
      project_id: parsed.data.project_id ?? null,
    });
  } catch (e) {
    return { error: { _form: [e instanceof Error ? e.message : "Failed to update"] } };
  }

  await revalidateApp("/tasks", "/dashboard", "/projects");
  return { success: true };
}

export async function deleteTask(id: string) {
  if (isDemoMode()) {
    await withDemoStore((store) => {
      store.tasks = store.tasks.filter((t) => t.id !== id);
    });
    await revalidateApp("/tasks", "/dashboard", "/projects");
    return { success: true };
  }

  const userId = await getAuthUserId();
  if (!userId) return { error: "Not authenticated" };

  try {
    await deleteRow("tasks", id, userId);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to delete" };
  }

  await revalidateApp("/tasks", "/dashboard", "/projects");
  return { success: true };
}

export async function toggleTaskStatus(id: string) {
  if (isDemoMode()) {
    await withDemoStore((store) => {
      const task = store.tasks.find((t) => t.id === id);
      if (!task) return;
      task.status =
        task.status === "done"
          ? "todo"
          : task.status === "todo"
            ? "in_progress"
            : "done";
      task.updated_at = nowIso();
    });
    await revalidateApp("/tasks", "/dashboard");
    return { success: true };
  }

  const userId = await getAuthUserId();
  if (!userId) return { error: "Not authenticated" };

  const task = await selectByIdForUser<{ status: Task["status"] }>("tasks", id, userId);
  if (!task) return { error: "Not found" };

  const next =
    task.status === "done"
      ? "todo"
      : task.status === "todo"
        ? "in_progress"
        : "done";

  try {
    await updateRow("tasks", id, userId, { status: next });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to update" };
  }

  await revalidateApp("/tasks", "/dashboard");
  return { success: true };
}
