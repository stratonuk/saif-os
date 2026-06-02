import { Suspense } from "react";
import { getTasks, getProjects } from "@/lib/data";
import { TasksPageClient } from "@/components/tasks/tasks-page-client";

export default async function TasksPage() {
  const [tasks, projects] = await Promise.all([getTasks(), getProjects()]);

  return (
    <Suspense fallback={<div className="animate-pulse h-96 rounded-2xl bg-muted" />}>
      <TasksPageClient tasks={tasks} projects={projects} />
    </Suspense>
  );
}
