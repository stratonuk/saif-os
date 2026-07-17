"use server";

import { createTask } from "@/actions/tasks";
import { createReminder } from "@/actions/reminders";
import { createTransaction } from "@/actions/transactions";
import { createIdea } from "@/actions/ideas";
import { createContact } from "@/actions/contacts";
import { createNote } from "@/actions/notes";

export async function quickCaptureTask(formData: FormData) {
  formData.set("status", "todo");
  formData.set("description", "");
  formData.set("project_id", "");
  if (!formData.get("priority")) formData.set("priority", "medium");
  if (!formData.get("category")) formData.set("category", "personal");
  return createTask(formData);
}

export async function quickCaptureReminder(formData: FormData) {
  formData.set("recurring", "false");
  formData.set("notes", "");
  if (!formData.get("type")) formData.set("type", "custom");
  return createReminder(formData);
}

export async function quickCaptureTransaction(formData: FormData) {
  if (!formData.get("payment_method")) formData.set("payment_method", "bank");
  if (!formData.get("type")) formData.set("type", "expense");
  if (!formData.get("category")) formData.set("category", "Other");
  if (!formData.get("date")) formData.set("date", new Date().toISOString().split("T")[0]);
  formData.set("notes", "");
  return createTransaction(formData);
}

export async function quickCaptureIdea(formData: FormData) {
  formData.set("description", "");
  formData.set("priority_score", "5");
  formData.set("status", "raw");
  if (!formData.get("category")) formData.set("category", "business");
  return createIdea(formData);
}

export async function quickCaptureContact(formData: FormData) {
  formData.set("role", "");
  formData.set("phone", "");
  formData.set("notes", "");
  formData.set("project_id", "");
  return createContact(formData);
}

export async function quickCaptureNote(formData: FormData) {
  formData.set("linked_entity_type", "none");
  formData.set("linked_entity_id", "");
  if (!formData.get("tags")) formData.set("tags", "");
  return createNote(formData);
}
