"use server";

import { z } from "zod";
import { insertRow, updateRow, deleteRow, getSql } from "@/lib/db";
import {
  SUBSCRIPTION_BILLING_CYCLES, SUBSCRIPTION_CATEGORIES, SUBSCRIPTION_STATUSES,
  PAYMENT_METHODS, VEHICLE_EVENT_TYPES, PARKING_TICKET_STATUSES,
} from "@/lib/constants";
import {
  isDemoMode, getAuthUserId, revalidateApp, withDemoStore, newId, nowIso,
} from "@/lib/action-utils";
import { emptyToNull } from "@/lib/form-helpers";
import type { Document, Subscription, Vehicle, VehicleEvent, VehicleExpense, ParkingTicket, MonthlyReview } from "@/lib/types";

// ─── Schemas ─────────────────────────────────────────────────
const subscriptionSchema = z.object({
  name: z.string().min(1), provider: z.string().optional(),
  cost: z.coerce.number().min(0), billing_cycle: z.enum(SUBSCRIPTION_BILLING_CYCLES),
  renewal_date: z.string().optional(), category: z.enum(SUBSCRIPTION_CATEGORIES),
  payment_method: z.enum(PAYMENT_METHODS), auto_renew: z.coerce.boolean(),
  status: z.enum(SUBSCRIPTION_STATUSES), reminder_days_before: z.coerce.number().default(7),
  notes: z.string().optional(),
});

const vehicleSchema = z.object({
  make: z.string().min(1), model: z.string().min(1),
  year: z.coerce.number().optional(), registration: z.string().optional(),
  mileage: z.coerce.number().default(0), fuel_type: z.string().optional(),
  insurance_provider: z.string().optional(), insurance_expiry: z.string().optional(),
  mot_date: z.string().optional(), tax_date: z.string().optional(),
  garage: z.string().optional(), notes: z.string().optional(),
});

const vehicleEventSchema = z.object({
  vehicle_id: z.string().min(1), event_type: z.enum(VEHICLE_EVENT_TYPES),
  title: z.string().min(1), event_date: z.string().min(1),
  mileage: z.coerce.number().optional(), garage: z.string().optional(),
  parts_replaced: z.string().optional(), cost: z.coerce.number().default(0),
  notes: z.string().optional(),
});

const parkingTicketSchema = z.object({
  vehicle_id: z.string().min(1),
  pcn_number: z.string().min(1),
  issuer: z.string().optional(),
  amount: z.coerce.number().min(0).default(0),
  issue_date: z.string().optional(),
  due_date: z.string().min(1),
  status: z.enum(PARKING_TICKET_STATUSES).default("unpaid"),
  notes: z.string().optional(),
});

const monthlyReviewSchema = z.object({
  year: z.coerce.number(), month: z.coerce.number().min(1).max(12),
  biggest_win: z.string().optional(), biggest_challenge: z.string().optional(),
  next_month_focus: z.string().optional(), notes: z.string().optional(),
});

// ─── Subscriptions ───────────────────────────────────────────
export async function createSubscription(formData: FormData) {
  const parsed = subscriptionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };
  const userId = await getAuthUserId();
  if (!userId) return { error: { _form: ["Not authenticated"] } };

  if (isDemoMode()) {
    await withDemoStore((store) => {
      store.subscriptions.unshift({
        id: newId(), user_id: userId, ...parsed.data,
        provider: parsed.data.provider ?? null, renewal_date: parsed.data.renewal_date ?? null,
        notes: parsed.data.notes ?? null, created_at: nowIso(), updated_at: nowIso(),
      } as Subscription);
    });
  } else {
    try {
      await insertRow("subscriptions", {
        ...parsed.data,
        provider: parsed.data.provider ?? null,
        renewal_date: parsed.data.renewal_date ?? null,
        notes: parsed.data.notes ?? null,
        user_id: userId,
      });
    } catch (e) {
      return { error: { _form: [e instanceof Error ? e.message : "Failed to save"] } };
    }
  }
  await revalidateApp("/subscriptions", "/dashboard", "/inbox");
  return { success: true };
}

export async function updateSubscription(id: string, formData: FormData) {
  const parsed = subscriptionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };
  if (isDemoMode()) {
    await withDemoStore((store) => {
      const i = store.subscriptions.findIndex((s) => s.id === id);
      if (i >= 0) store.subscriptions[i] = { ...store.subscriptions[i], ...parsed.data, updated_at: nowIso() };
    });
  } else {
    const userId = await getAuthUserId();
    if (!userId) return { error: { _form: ["Not authenticated"] } };
    await updateRow("subscriptions", id, userId, {
      ...parsed.data,
      provider: parsed.data.provider ?? null,
      renewal_date: parsed.data.renewal_date ?? null,
      notes: parsed.data.notes ?? null,
    });
  }
  await revalidateApp("/subscriptions", "/dashboard", "/inbox");
  return { success: true };
}

export async function deleteSubscription(id: string) {
  if (isDemoMode()) {
    await withDemoStore((s) => { s.subscriptions = s.subscriptions.filter((x) => x.id !== id); });
  } else {
    const userId = await getAuthUserId();
    if (!userId) return { error: "Not authenticated" };
    await deleteRow("subscriptions", id, userId);
  }
  await revalidateApp("/subscriptions");
  return { success: true };
}

// ─── Vehicles ────────────────────────────────────────────────
export async function createVehicle(formData: FormData) {
  const parsed = vehicleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };
  const userId = await getAuthUserId();
  if (!userId) return { error: { _form: ["Not authenticated"] } };
  if (isDemoMode()) {
    await withDemoStore((store) => {
      store.vehicles.unshift({
        id: newId(), user_id: userId, ...parsed.data,
        year: parsed.data.year ?? null, registration: parsed.data.registration ?? null,
        fuel_type: parsed.data.fuel_type ?? null, insurance_provider: parsed.data.insurance_provider ?? null,
        insurance_expiry: parsed.data.insurance_expiry ?? null, mot_date: parsed.data.mot_date ?? null,
        tax_date: parsed.data.tax_date ?? null, garage: parsed.data.garage ?? null,
        notes: parsed.data.notes ?? null, created_at: nowIso(), updated_at: nowIso(),
      } as Vehicle);
    });
  } else {
    await insertRow("vehicles", {
      ...parsed.data,
      year: parsed.data.year ?? null,
      registration: parsed.data.registration ?? null,
      fuel_type: parsed.data.fuel_type ?? null,
      insurance_provider: parsed.data.insurance_provider ?? null,
      insurance_expiry: parsed.data.insurance_expiry ?? null,
      mot_date: parsed.data.mot_date ?? null,
      tax_date: parsed.data.tax_date ?? null,
      garage: parsed.data.garage ?? null,
      notes: parsed.data.notes ?? null,
      user_id: userId,
    });
  }
  await revalidateApp("/car", "/dashboard", "/inbox");
  return { success: true };
}

export async function updateVehicle(id: string, formData: FormData) {
  const parsed = vehicleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };
  if (isDemoMode()) {
    await withDemoStore((store) => {
      const i = store.vehicles.findIndex((v) => v.id === id);
      if (i >= 0) store.vehicles[i] = { ...store.vehicles[i], ...parsed.data, updated_at: nowIso() };
    });
  } else {
    const userId = await getAuthUserId();
    if (!userId) return { error: { _form: ["Not authenticated"] } };
    await updateRow("vehicles", id, userId, {
      ...parsed.data,
      year: parsed.data.year ?? null,
      registration: parsed.data.registration ?? null,
      fuel_type: parsed.data.fuel_type ?? null,
      insurance_provider: parsed.data.insurance_provider ?? null,
      insurance_expiry: parsed.data.insurance_expiry ?? null,
      mot_date: parsed.data.mot_date ?? null,
      tax_date: parsed.data.tax_date ?? null,
      garage: parsed.data.garage ?? null,
      notes: parsed.data.notes ?? null,
    });
  }
  await revalidateApp("/car", "/dashboard", "/inbox");
  return { success: true };
}

export async function createVehicleEvent(formData: FormData) {
  const parsed = vehicleEventSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };
  const userId = await getAuthUserId();
  if (!userId) return { error: { _form: ["Not authenticated"] } };
  if (isDemoMode()) {
    await withDemoStore((store) => {
      store.vehicle_events.unshift({
        id: newId(), user_id: userId, ...parsed.data,
        mileage: parsed.data.mileage ?? null, garage: parsed.data.garage ?? null,
        parts_replaced: parsed.data.parts_replaced ?? null, notes: parsed.data.notes ?? null,
        created_at: nowIso(), updated_at: nowIso(),
      } as VehicleEvent);
    });
  } else {
    await insertRow("vehicle_events", {
      ...parsed.data,
      mileage: parsed.data.mileage ?? null,
      garage: parsed.data.garage ?? null,
      parts_replaced: parsed.data.parts_replaced ?? null,
      notes: parsed.data.notes ?? null,
      user_id: userId,
    });
  }
  await revalidateApp("/car");
  return { success: true };
}

export async function createVehicleExpense(formData: FormData) {
  const userId = await getAuthUserId();
  if (!userId) return { error: { _form: ["Not authenticated"] } };
  const data = {
    vehicle_id: formData.get("vehicle_id") as string,
    title: formData.get("title") as string,
    amount: Number(formData.get("amount")),
    category: (formData.get("category") as string) || "other",
    expense_date: formData.get("expense_date") as string,
    notes: emptyToNull(formData.get("notes")),
  };
  if (isDemoMode()) {
    await withDemoStore((store) => {
      store.vehicle_expenses.unshift({
        id: newId(), user_id: userId, ...data,
        notes: data.notes, created_at: nowIso(),
      } as VehicleExpense);
    });
  } else {
    await insertRow("vehicle_expenses", { ...data, user_id: userId });
  }
  await revalidateApp("/car");
  return { success: true };
}

// ─── Parking tickets ─────────────────────────────────────────
export async function createParkingTicket(formData: FormData) {
  const parsed = parkingTicketSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };
  const userId = await getAuthUserId();
  if (!userId) return { error: { _form: ["Not authenticated"] } };
  const row = {
    ...parsed.data,
    issuer: parsed.data.issuer ?? null,
    issue_date: parsed.data.issue_date || null,
    notes: parsed.data.notes ?? null,
    paid_date: null,
  };
  if (isDemoMode()) {
    await withDemoStore((store) => {
      store.parking_tickets.unshift({
        id: newId(), user_id: userId, ...row,
        created_at: nowIso(), updated_at: nowIso(),
      } as ParkingTicket);
    });
  } else {
    await insertRow("parking_tickets", { ...row, user_id: userId });
  }
  await revalidateApp("/car", "/dashboard", "/inbox");
  return { success: true };
}

export async function updateParkingTicketStatus(id: string, status: ParkingTicket["status"]) {
  const paid_date = status === "paid" ? nowIso().slice(0, 10) : null;
  if (isDemoMode()) {
    await withDemoStore((store) => {
      const t = store.parking_tickets.find((x) => x.id === id);
      if (t) { t.status = status; t.paid_date = paid_date; t.updated_at = nowIso(); }
    });
  } else {
    const userId = await getAuthUserId();
    if (!userId) return { error: { _form: ["Not authenticated"] } };
    await updateRow("parking_tickets", id, userId, { status, paid_date });
  }
  await revalidateApp("/car", "/dashboard", "/inbox");
  return { success: true };
}

export async function deleteParkingTicket(id: string) {
  if (isDemoMode()) {
    await withDemoStore((s) => { s.parking_tickets = s.parking_tickets.filter((t) => t.id !== id); });
  } else {
    const userId = await getAuthUserId();
    if (!userId) return { error: "Not authenticated" };
    await deleteRow("parking_tickets", id, userId);
  }
  await revalidateApp("/car", "/dashboard", "/inbox");
  return { success: true };
}

// ─── Documents ───────────────────────────────────────────────
export async function uploadDocument(formData: FormData) {
  const userId = await getAuthUserId();
  if (!userId) return { error: { _form: ["Not authenticated"] } };
  const file = formData.get("file") as File | null;
  const file_name = file?.name ?? (formData.get("file_name") as string);
  const linked_entity_type = emptyToNull(formData.get("linked_entity_type"));
  const linked_entity_id = emptyToNull(formData.get("linked_entity_id"));
  const tagsRaw = formData.get("tags")?.toString() ?? "";
  const tags = tagsRaw.split(",").map((t) => t.trim()).filter(Boolean);

  const doc: Omit<Document, "id" | "created_at" | "updated_at"> = {
    user_id: userId, file_name, file_type: file?.type ?? null,
    file_size: file?.size ?? 0, storage_path: null, file_url: null,
    linked_entity_type: linked_entity_type as Document["linked_entity_type"],
    linked_entity_id, tags,
  };

  if (isDemoMode()) {
    await withDemoStore((store) => {
      store.documents.unshift({ ...doc, id: newId(), created_at: nowIso(), updated_at: nowIso() } as Document);
    });
  } else {
    await insertRow("documents", doc);
  }
  await revalidateApp("/documents", "/straton/documents");
  return { success: true };
}

export async function deleteDocument(id: string) {
  if (isDemoMode()) {
    await withDemoStore((s) => { s.documents = s.documents.filter((d) => d.id !== id); });
  } else {
    const userId = await getAuthUserId();
    if (!userId) return { error: "Not authenticated" };
    await deleteRow("documents", id, userId);
  }
  await revalidateApp("/documents");
  return { success: true };
}

// ─── Monthly Reviews ─────────────────────────────────────────
export async function generateMonthlyReview(year: number, month: number) {
  const userId = await getAuthUserId();
  if (!userId) return { error: { _form: ["Not authenticated"] } };

  const { getTasks, getTransactions, getProjects, getGoals, getMonthlyFinance } = await import("@/lib/data");
  const [tasks, transactions, projects, goals] = await Promise.all([
    getTasks(), getTransactions(), getProjects(), getGoals(),
  ]);
  const finance = getMonthlyFinance(transactions, year, month - 1);
  const monthTasks = tasks.filter((t) => {
    if (!t.due_date) return false;
    const d = new Date(t.due_date);
    return d.getFullYear() === year && d.getMonth() === month - 1;
  });
  const largest = finance.transactions
    .filter((t) => t.type === "expense")
    .sort((a, b) => Number(b.amount) - Number(a.amount))[0];

  const review: Omit<MonthlyReview, "id" | "created_at" | "updated_at"> = {
    user_id: userId, year, month,
    income_total: finance.income, expense_total: finance.expenses, net_balance: finance.net,
    largest_expense: largest?.title ?? null, largest_expense_amount: largest ? Number(largest.amount) : 0,
    tasks_completed: monthTasks.filter((t) => t.status === "done").length,
    overdue_tasks: monthTasks.filter((t) => t.status !== "done").length,
    projects_progressed: projects.filter((p) => p.status === "building").length,
    goals_progress: goals.map((g) => `${g.title}: ${Math.round((g.current_value / g.target_value) * 100)}%`).join(", "),
    biggest_win: null, biggest_challenge: null, next_month_focus: null, notes: null, archived: false,
  };

  if (isDemoMode()) {
    await withDemoStore((store) => {
      const existing = store.monthly_reviews.findIndex((r) => r.year === year && r.month === month);
      const entry = { ...review, id: newId(), created_at: nowIso(), updated_at: nowIso() } as MonthlyReview;
      if (existing >= 0) store.monthly_reviews[existing] = entry;
      else store.monthly_reviews.unshift(entry);
    });
  } else {
    const db = getSql();
    await db`
      INSERT INTO monthly_reviews (
        user_id, year, month, income_total, expense_total, net_balance,
        largest_expense, largest_expense_amount, tasks_completed, overdue_tasks,
        projects_progressed, goals_progress, biggest_win, biggest_challenge,
        next_month_focus, notes, archived
      ) VALUES (
        ${review.user_id}, ${review.year}, ${review.month}, ${review.income_total},
        ${review.expense_total}, ${review.net_balance}, ${review.largest_expense},
        ${review.largest_expense_amount}, ${review.tasks_completed}, ${review.overdue_tasks},
        ${review.projects_progressed}, ${review.goals_progress}, ${review.biggest_win},
        ${review.biggest_challenge}, ${review.next_month_focus}, ${review.notes}, ${review.archived}
      )
      ON CONFLICT (user_id, year, month) DO UPDATE SET
        income_total = EXCLUDED.income_total,
        expense_total = EXCLUDED.expense_total,
        net_balance = EXCLUDED.net_balance,
        largest_expense = EXCLUDED.largest_expense,
        largest_expense_amount = EXCLUDED.largest_expense_amount,
        tasks_completed = EXCLUDED.tasks_completed,
        overdue_tasks = EXCLUDED.overdue_tasks,
        projects_progressed = EXCLUDED.projects_progressed,
        goals_progress = EXCLUDED.goals_progress
    `;
  }
  await revalidateApp("/monthly-reset", "/dashboard");
  return { success: true };
}

export async function updateMonthlyReview(id: string, formData: FormData) {
  const parsed = monthlyReviewSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };
  const extra = {
    biggest_win: formData.get("biggest_win")?.toString() || null,
    biggest_challenge: formData.get("biggest_challenge")?.toString() || null,
    next_month_focus: formData.get("next_month_focus")?.toString() || null,
    notes: formData.get("notes")?.toString() || null,
  };
  if (isDemoMode()) {
    await withDemoStore((store) => {
      const i = store.monthly_reviews.findIndex((r) => r.id === id);
      if (i >= 0) store.monthly_reviews[i] = { ...store.monthly_reviews[i], ...parsed.data, ...extra, updated_at: nowIso() };
    });
  } else {
    const userId = await getAuthUserId();
    if (!userId) return { error: { _form: ["Not authenticated"] } };
    await updateRow("monthly_reviews", id, userId, { ...parsed.data, ...extra });
  }
  await revalidateApp("/monthly-reset");
  return { success: true };
}

export async function archiveMonthlyReview(id: string) {
  if (isDemoMode()) {
    await withDemoStore((store) => {
      const r = store.monthly_reviews.find((x) => x.id === id);
      if (r) { r.archived = true; r.updated_at = nowIso(); }
    });
  } else {
    const userId = await getAuthUserId();
    if (!userId) return { error: "Not authenticated" };
    await updateRow("monthly_reviews", id, userId, { archived: true });
  }
  await revalidateApp("/monthly-reset");
  return { success: true };
}
