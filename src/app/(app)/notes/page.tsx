import {
  getNotes,
  getProjects,
  getContacts,
  getIdeas,
  getGoals,
} from "@/lib/data";
import { NotesPageClient } from "@/components/notes/notes-page-client";

export default async function NotesPage() {
  const [notes, projects, contacts, ideas, goals] = await Promise.all([
    getNotes(),
    getProjects(),
    getContacts(),
    getIdeas(),
    getGoals(),
  ]);

  return (
    <NotesPageClient
      notes={notes}
      projects={projects}
      contacts={contacts}
      ideas={ideas}
      goals={goals}
    />
  );
}
