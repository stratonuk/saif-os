"use server";

import { createClient } from "@/lib/supabase/server";
import { contactSchema } from "@/lib/validations";
import {
  isDemoMode,
  getAuthUserId,
  revalidateApp,
  withDemoStore,
  newId,
  nowIso,
} from "@/lib/action-utils";
import { emptyToNull } from "@/lib/form-helpers";
import type { Contact } from "@/lib/types";

function parseContactForm(formData: FormData) {
  const email = formData.get("email");
  return contactSchema.safeParse({
    name: formData.get("name"),
    company: formData.get("company") || undefined,
    role: formData.get("role") || undefined,
    phone: formData.get("phone") || undefined,
    email: email === "" ? "" : email,
    notes: formData.get("notes") || undefined,
    last_contacted: emptyToNull(formData.get("last_contacted")) || undefined,
    next_follow_up: emptyToNull(formData.get("next_follow_up")) || undefined,
    project_id: emptyToNull(formData.get("project_id")),
  });
}

export async function createContact(formData: FormData) {
  const parsed = parseContactForm(formData);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const userId = await getAuthUserId();
  if (!userId) return { error: { _form: ["Not authenticated"] } };

  const payload = {
    ...parsed.data,
    email: parsed.data.email || null,
    company: parsed.data.company ?? null,
    role: parsed.data.role ?? null,
    phone: parsed.data.phone ?? null,
    notes: parsed.data.notes ?? null,
    last_contacted: parsed.data.last_contacted ?? null,
    next_follow_up: parsed.data.next_follow_up ?? null,
    project_id: parsed.data.project_id ?? null,
  };

  if (isDemoMode()) {
    await withDemoStore((store) => {
      const item: Contact = {
        id: newId(),
        user_id: userId,
        ...payload,
        created_at: nowIso(),
        updated_at: nowIso(),
      };
      store.contacts.push(item);
      store.contacts.sort((a, b) => a.name.localeCompare(b.name));
    });
    await revalidateApp("/contacts");
    return { success: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contacts").insert({
    ...payload,
    user_id: userId,
  });
  if (error) return { error: { _form: [error.message] } };

  await revalidateApp("/contacts");
  return { success: true };
}

export async function updateContact(id: string, formData: FormData) {
  const parsed = parseContactForm(formData);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const payload = {
    ...parsed.data,
    email: parsed.data.email || null,
    company: parsed.data.company ?? null,
    role: parsed.data.role ?? null,
    phone: parsed.data.phone ?? null,
    notes: parsed.data.notes ?? null,
    last_contacted: parsed.data.last_contacted ?? null,
    next_follow_up: parsed.data.next_follow_up ?? null,
    project_id: parsed.data.project_id ?? null,
  };

  if (isDemoMode()) {
    await withDemoStore((store) => {
      const i = store.contacts.findIndex((c) => c.id === id);
      if (i === -1) return;
      store.contacts[i] = {
        ...store.contacts[i],
        ...payload,
        updated_at: nowIso(),
      };
    });
    await revalidateApp("/contacts");
    return { success: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contacts").update(payload).eq("id", id);
  if (error) return { error: { _form: [error.message] } };

  await revalidateApp("/contacts");
  return { success: true };
}

export async function deleteContact(id: string) {
  if (isDemoMode()) {
    await withDemoStore((store) => {
      store.contacts = store.contacts.filter((c) => c.id !== id);
    });
    await revalidateApp("/contacts");
    return { success: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contacts").delete().eq("id", id);
  if (error) return { error: error.message };

  await revalidateApp("/contacts");
  return { success: true };
}

export async function markContacted(id: string) {
  const today = new Date().toISOString().split("T")[0];

  if (isDemoMode()) {
    await withDemoStore((store) => {
      const contact = store.contacts.find((c) => c.id === id);
      if (!contact) return;
      contact.last_contacted = today;
      contact.updated_at = nowIso();
    });
    await revalidateApp("/contacts");
    return { success: true };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("contacts")
    .update({ last_contacted: today })
    .eq("id", id);
  if (error) return { error: error.message };

  await revalidateApp("/contacts");
  return { success: true };
}
