import { getContacts, getProjects } from "@/lib/data";
import { ContactsPageClient } from "@/components/contacts/contacts-page-client";

export default async function ContactsPage() {
  const [contacts, projects] = await Promise.all([
    getContacts(),
    getProjects(),
  ]);
  return <ContactsPageClient contacts={contacts} projects={projects} />;
}
