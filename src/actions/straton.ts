"use server";

import { z } from "zod";
import { insertRow, updateRow } from "@/lib/db";
import {
  STRATON_CLIENT_STATUSES, STRATON_PROJECT_STATUSES, STRATON_INVOICE_STATUSES,
  STRATON_HOSTING_STATUSES, STRATON_REMINDER_TYPES,
} from "@/lib/constants";
import {
  isDemoMode, getAuthUserId, revalidateApp, withDemoStore, newId, nowIso,
} from "@/lib/action-utils";
import { emptyToNull } from "@/lib/form-helpers";
import type {
  StratonClient, StratonProject, StratonInvoice, StratonHosting,
  StratonClientReminder, StratonActivity,
} from "@/lib/types";

function logActivity(
  store: { straton_activity: StratonActivity[] },
  entry: Omit<StratonActivity, "id" | "created_at">
) {
  store.straton_activity.unshift({ ...entry, id: newId(), created_at: nowIso() });
}

const clientSchema = z.object({
  client_name: z.string().min(1), business_name: z.string().optional(),
  contact_person: z.string().optional(), email: z.string().optional(),
  phone: z.string().optional(), website_url: z.string().optional(),
  industry: z.string().optional(), status: z.enum(STRATON_CLIENT_STATUSES),
  start_date: z.string().optional(), key_info: z.string().optional(), notes: z.string().optional(),
});

const projectSchema = z.object({
  client_id: z.string().min(1), name: z.string().min(1), description: z.string().optional(),
  status: z.enum(STRATON_PROJECT_STATUSES), start_date: z.string().optional(),
  deadline: z.string().optional(), price_quoted: z.coerce.number().default(0),
  amount_paid: z.coerce.number().default(0), notes: z.string().optional(),
});

const invoiceSchema = z.object({
  client_id: z.string().min(1), project_id: z.string().optional().nullable(),
  invoice_number: z.string().min(1), amount: z.coerce.number().min(0),
  issue_date: z.string().min(1), due_date: z.string().optional(),
  paid_date: z.string().optional(), status: z.enum(STRATON_INVOICE_STATUSES), notes: z.string().optional(),
});

const hostingSchema = z.object({
  client_id: z.string().min(1), domain_name: z.string().min(1),
  registrar: z.string().optional(), hosting_provider: z.string().optional(),
  hosting_plan: z.string().optional(), renewal_date: z.string().optional(),
  cost: z.coerce.number().default(0), client_charge: z.coerce.number().default(0),
  auto_renew: z.coerce.boolean(), ssl_expiry: z.string().optional(),
  dns_provider: z.string().optional(), nameservers: z.string().optional(),
  login_notes: z.string().optional(), reminder_date: z.string().optional(),
  status: z.enum(STRATON_HOSTING_STATUSES),
});

const reminderSchema = z.object({
  client_id: z.string().min(1), project_id: z.string().optional().nullable(),
  title: z.string().min(1), reminder_type: z.enum(STRATON_REMINDER_TYPES),
  due_date: z.string().min(1), notes: z.string().optional(),
});

function nullifyClientFields(data: z.infer<typeof clientSchema>) {
  return {
    ...data,
    business_name: data.business_name ?? null,
    contact_person: data.contact_person ?? null,
    email: data.email ?? null,
    phone: data.phone ?? null,
    website_url: data.website_url ?? null,
    industry: data.industry ?? null,
    start_date: data.start_date ?? null,
    key_info: data.key_info ?? null,
    notes: data.notes ?? null,
  };
}

function nullifyProjectFields(data: z.infer<typeof projectSchema>) {
  return {
    ...data,
    description: data.description ?? null,
    start_date: data.start_date ?? null,
    deadline: data.deadline ?? null,
    notes: data.notes ?? null,
  };
}

function nullifyInvoiceFields(data: z.infer<typeof invoiceSchema>) {
  return {
    ...data,
    project_id: data.project_id ?? null,
    due_date: data.due_date ?? null,
    paid_date: data.paid_date ?? null,
    notes: data.notes ?? null,
  };
}

function nullifyHostingFields(data: z.infer<typeof hostingSchema>) {
  return {
    ...data,
    registrar: data.registrar ?? null,
    hosting_provider: data.hosting_provider ?? null,
    hosting_plan: data.hosting_plan ?? null,
    renewal_date: data.renewal_date ?? null,
    ssl_expiry: data.ssl_expiry ?? null,
    dns_provider: data.dns_provider ?? null,
    nameservers: data.nameservers ?? null,
    login_notes: data.login_notes ?? null,
    reminder_date: data.reminder_date ?? null,
  };
}

// ─── Clients ─────────────────────────────────────────────────
export async function createStratonClient(formData: FormData) {
  const parsed = clientSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };
  const userId = await getAuthUserId();
  if (!userId) return { error: { _form: ["Not authenticated"] } };
  const id = newId();
  if (isDemoMode()) {
    await withDemoStore((store) => {
      store.straton_clients.unshift({
        id, user_id: userId, ...parsed.data,
        business_name: parsed.data.business_name ?? null, contact_person: parsed.data.contact_person ?? null,
        email: parsed.data.email ?? null, phone: parsed.data.phone ?? null,
        website_url: parsed.data.website_url ?? null, industry: parsed.data.industry ?? null,
        start_date: parsed.data.start_date ?? null, key_info: parsed.data.key_info ?? null,
        notes: parsed.data.notes ?? null, created_at: nowIso(), updated_at: nowIso(),
      } as StratonClient);
      logActivity(store, { user_id: userId, client_id: id, activity_type: "client_created", title: "Client added", description: parsed.data.client_name });
    });
  } else {
    const fields = nullifyClientFields(parsed.data);
    await insertRow("straton_clients", { id, ...fields, user_id: userId });
    await insertRow("straton_activity", {
      user_id: userId,
      client_id: id,
      activity_type: "client_created",
      title: "Client added",
      description: parsed.data.client_name,
    });
  }
  await revalidateApp("/straton", "/straton/clients");
  return { success: true };
}

export async function updateStratonClient(id: string, formData: FormData) {
  const parsed = clientSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };
  if (isDemoMode()) {
    await withDemoStore((store) => {
      const i = store.straton_clients.findIndex((c) => c.id === id);
      if (i >= 0) store.straton_clients[i] = { ...store.straton_clients[i], ...parsed.data, updated_at: nowIso() };
    });
  } else {
    const userId = await getAuthUserId();
    if (!userId) return { error: { _form: ["Not authenticated"] } };
    await updateRow("straton_clients", id, userId, nullifyClientFields(parsed.data));
  }
  await revalidateApp("/straton/clients");
  return { success: true };
}

// ─── Projects ────────────────────────────────────────────────
export async function createStratonProject(formData: FormData) {
  const parsed = projectSchema.safeParse({ ...Object.fromEntries(formData), project_id: emptyToNull(formData.get("project_id")) });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };
  const userId = await getAuthUserId();
  if (!userId) return { error: { _form: ["Not authenticated"] } };
  const id = newId();
  if (isDemoMode()) {
    await withDemoStore((store) => {
      store.straton_projects.unshift({
        id, user_id: userId, ...parsed.data,
        description: parsed.data.description ?? null, start_date: parsed.data.start_date ?? null,
        deadline: parsed.data.deadline ?? null, notes: parsed.data.notes ?? null,
        created_at: nowIso(), updated_at: nowIso(),
      } as StratonProject);
      logActivity(store, { user_id: userId, client_id: parsed.data.client_id, activity_type: "project_added", title: "Project created", description: parsed.data.name, entity_type: "project", entity_id: id });
    });
  } else {
    const fields = nullifyProjectFields(parsed.data);
    await insertRow("straton_projects", { id, ...fields, user_id: userId });
    await insertRow("straton_activity", {
      user_id: userId,
      client_id: parsed.data.client_id,
      activity_type: "project_added",
      title: "Project created",
      description: parsed.data.name,
      entity_type: "project",
      entity_id: id,
    });
  }
  await revalidateApp("/straton", "/straton/projects");
  return { success: true };
}

export async function updateStratonProject(id: string, formData: FormData) {
  const parsed = projectSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };
  if (isDemoMode()) {
    await withDemoStore((store) => {
      const i = store.straton_projects.findIndex((p) => p.id === id);
      if (i >= 0) store.straton_projects[i] = { ...store.straton_projects[i], ...parsed.data, updated_at: nowIso() };
    });
  } else {
    const userId = await getAuthUserId();
    if (!userId) return { error: { _form: ["Not authenticated"] } };
    await updateRow("straton_projects", id, userId, nullifyProjectFields(parsed.data));
  }
  await revalidateApp("/straton/projects");
  return { success: true };
}

// ─── Invoices ────────────────────────────────────────────────
export async function createStratonInvoice(formData: FormData) {
  const parsed = invoiceSchema.safeParse({ ...Object.fromEntries(formData), project_id: emptyToNull(formData.get("project_id")) });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };
  const userId = await getAuthUserId();
  if (!userId) return { error: { _form: ["Not authenticated"] } };
  const id = newId();
  if (isDemoMode()) {
    await withDemoStore((store) => {
      store.straton_invoices.unshift({
        id, user_id: userId, ...parsed.data, project_id: parsed.data.project_id ?? null,
        due_date: parsed.data.due_date ?? null, paid_date: parsed.data.paid_date ?? null,
        document_id: null, notes: parsed.data.notes ?? null, created_at: nowIso(), updated_at: nowIso(),
      } as StratonInvoice);
      logActivity(store, { user_id: userId, client_id: parsed.data.client_id, activity_type: "invoice_uploaded", title: "Invoice created", description: `${parsed.data.invoice_number} — £${parsed.data.amount}`, entity_type: "invoice", entity_id: id });
    });
  } else {
    await insertRow("straton_invoices", {
      id,
      ...nullifyInvoiceFields(parsed.data),
      document_id: null,
      user_id: userId,
    });
  }
  await revalidateApp("/straton", "/straton/invoices", "/dashboard", "/inbox");
  return { success: true };
}

export async function markInvoicePaid(id: string) {
  if (isDemoMode()) {
    await withDemoStore((store) => {
      const inv = store.straton_invoices.find((i) => i.id === id);
      if (inv) {
        inv.status = "paid"; inv.paid_date = new Date().toISOString().split("T")[0]; inv.updated_at = nowIso();
        logActivity(store, { user_id: inv.user_id, client_id: inv.client_id, activity_type: "invoice_paid", title: "Invoice paid", description: `${inv.invoice_number} — £${inv.amount}`, entity_type: "invoice", entity_id: id });
      }
    });
  } else {
    const userId = await getAuthUserId();
    if (!userId) return { error: "Not authenticated" };
    await updateRow("straton_invoices", id, userId, {
      status: "paid",
      paid_date: new Date().toISOString().split("T")[0],
    });
  }
  await revalidateApp("/straton/invoices", "/dashboard", "/inbox");
  return { success: true };
}

// ─── Hosting ─────────────────────────────────────────────────
export async function createStratonHosting(formData: FormData) {
  const parsed = hostingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };
  const userId = await getAuthUserId();
  if (!userId) return { error: { _form: ["Not authenticated"] } };
  const id = newId();
  if (isDemoMode()) {
    await withDemoStore((store) => {
      store.straton_hosting.unshift({
        id, user_id: userId, ...parsed.data,
        registrar: parsed.data.registrar ?? null, hosting_provider: parsed.data.hosting_provider ?? null,
        hosting_plan: parsed.data.hosting_plan ?? null, renewal_date: parsed.data.renewal_date ?? null,
        ssl_expiry: parsed.data.ssl_expiry ?? null, dns_provider: parsed.data.dns_provider ?? null,
        nameservers: parsed.data.nameservers ?? null, login_notes: parsed.data.login_notes ?? null,
        reminder_date: parsed.data.reminder_date ?? null, created_at: nowIso(), updated_at: nowIso(),
      } as StratonHosting);
      logActivity(store, { user_id: userId, client_id: parsed.data.client_id, activity_type: "hosting_added", title: "Hosting added", description: parsed.data.domain_name, entity_type: "hosting", entity_id: id });
    });
  } else {
    await insertRow("straton_hosting", { id, ...nullifyHostingFields(parsed.data), user_id: userId });
  }
  await revalidateApp("/straton/hosting", "/dashboard", "/inbox");
  return { success: true };
}

export async function updateStratonHosting(id: string, formData: FormData) {
  const parsed = hostingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };
  if (isDemoMode()) {
    await withDemoStore((store) => {
      const i = store.straton_hosting.findIndex((h) => h.id === id);
      if (i >= 0) store.straton_hosting[i] = { ...store.straton_hosting[i], ...parsed.data, updated_at: nowIso() };
    });
  } else {
    const userId = await getAuthUserId();
    if (!userId) return { error: { _form: ["Not authenticated"] } };
    await updateRow("straton_hosting", id, userId, nullifyHostingFields(parsed.data));
  }
  await revalidateApp("/straton/hosting");
  return { success: true };
}

// ─── Reminders ───────────────────────────────────────────────
export async function createStratonReminder(formData: FormData) {
  const parsed = reminderSchema.safeParse({ ...Object.fromEntries(formData), project_id: emptyToNull(formData.get("project_id")) });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };
  const userId = await getAuthUserId();
  if (!userId) return { error: { _form: ["Not authenticated"] } };
  if (isDemoMode()) {
    await withDemoStore((store) => {
      store.straton_client_reminders.unshift({
        id: newId(), user_id: userId, ...parsed.data, project_id: parsed.data.project_id ?? null,
        completed: false, notes: parsed.data.notes ?? null, created_at: nowIso(), updated_at: nowIso(),
      } as StratonClientReminder);
    });
  } else {
    await insertRow("straton_client_reminders", {
      ...parsed.data,
      project_id: parsed.data.project_id ?? null,
      completed: false,
      notes: parsed.data.notes ?? null,
      user_id: userId,
    });
  }
  await revalidateApp("/straton/reminders", "/inbox");
  return { success: true };
}

export async function completeStratonReminder(id: string) {
  if (isDemoMode()) {
    await withDemoStore((store) => {
      const r = store.straton_client_reminders.find((x) => x.id === id);
      if (r) { r.completed = true; r.updated_at = nowIso();
        logActivity(store, { user_id: r.user_id, client_id: r.client_id, activity_type: "reminder_completed", title: "Reminder completed", description: r.title });
      }
    });
  } else {
    const userId = await getAuthUserId();
    if (!userId) return { error: "Not authenticated" };
    await updateRow("straton_client_reminders", id, userId, { completed: true });
  }
  await revalidateApp("/straton/reminders", "/inbox");
  return { success: true };
}
