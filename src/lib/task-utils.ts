import type { Task } from "./types";

export function isTaskOverdue(task: Task) {
  if (!task.due_date || task.status === "done") return false;
  return new Date(task.due_date) < new Date(new Date().toDateString());
}

export function getTodayTasks(tasks: Task[]) {
  const today = new Date().toISOString().split("T")[0];
  return tasks.filter(
    (t) => t.due_date === today && t.status !== "done"
  );
}

export function getOverdueTasks(tasks: Task[]) {
  return tasks.filter(isTaskOverdue);
}
