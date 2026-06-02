import { getProjects, getTasks } from "@/lib/data";
import { ProjectsPageClient } from "@/components/projects/projects-page-client";

export default async function ProjectsPage() {
  const [projects, tasks] = await Promise.all([getProjects(), getTasks()]);
  return <ProjectsPageClient projects={projects} tasks={tasks} />;
}
