import "server-only";

import { readDemoStore } from "@/lib/demo-store";
import { isDemoMode } from "@/lib/form-helpers";
import { getAuthUserId } from "@/lib/action-utils";
import { selectForUser, type UserTable } from "@/lib/db";
import type {
  Document, MonthlyReview, StratonActivity, StratonClient, StratonClientReminder,
  StratonHosting, StratonInvoice, StratonProject, Subscription, Vehicle,
  VehicleEvent, VehicleExpense, ParkingTicket,
} from "@/lib/types";

type StoreKey =
  | "subscriptions" | "vehicles" | "vehicle_events" | "vehicle_expenses" | "parking_tickets"
  | "documents" | "monthly_reviews" | "straton_clients" | "straton_projects"
  | "straton_invoices" | "straton_hosting" | "straton_client_reminders" | "straton_activity";

async function getFromStore<T>(key: StoreKey, orderBy?: { col: string; asc?: boolean }): Promise<T[]> {
  const store = await readDemoStore();
  const items = [...(store[key] as T[])];
  if (orderBy) {
    items.sort((a, b) => {
      const av = (a as Record<string, unknown>)[orderBy.col];
      const bv = (b as Record<string, unknown>)[orderBy.col];
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return orderBy.asc === false ? -cmp : cmp;
    });
  }
  return items;
}

async function getFromNeon<T>(table: UserTable, orderBy: { col: string; asc?: boolean }): Promise<T[]> {
  const userId = await getAuthUserId();
  if (!userId) return [];
  return selectForUser<T>(table, userId, orderBy);
}

export async function getSubscriptions(): Promise<Subscription[]> {
  return isDemoMode()
    ? getFromStore<Subscription>("subscriptions", { col: "renewal_date" })
    : getFromNeon<Subscription>("subscriptions", { col: "renewal_date" });
}

export async function getVehicles(): Promise<Vehicle[]> {
  return isDemoMode()
    ? getFromStore<Vehicle>("vehicles", { col: "created_at", asc: false })
    : getFromNeon<Vehicle>("vehicles", { col: "created_at", asc: false });
}

export async function getVehicleEvents(): Promise<VehicleEvent[]> {
  return isDemoMode()
    ? getFromStore<VehicleEvent>("vehicle_events", { col: "event_date", asc: false })
    : getFromNeon<VehicleEvent>("vehicle_events", { col: "event_date", asc: false });
}

export async function getVehicleExpenses(): Promise<VehicleExpense[]> {
  return isDemoMode()
    ? getFromStore<VehicleExpense>("vehicle_expenses", { col: "expense_date", asc: false })
    : getFromNeon<VehicleExpense>("vehicle_expenses", { col: "expense_date", asc: false });
}

export async function getParkingTickets(): Promise<ParkingTicket[]> {
  return isDemoMode()
    ? getFromStore<ParkingTicket>("parking_tickets", { col: "due_date" })
    : getFromNeon<ParkingTicket>("parking_tickets", { col: "due_date" });
}

export async function getDocuments(): Promise<Document[]> {
  return isDemoMode()
    ? getFromStore<Document>("documents", { col: "created_at", asc: false })
    : getFromNeon<Document>("documents", { col: "created_at", asc: false });
}

export async function getMonthlyReviews(): Promise<MonthlyReview[]> {
  return isDemoMode()
    ? getFromStore<MonthlyReview>("monthly_reviews", { col: "year", asc: false })
    : getFromNeon<MonthlyReview>("monthly_reviews", { col: "year", asc: false });
}

export async function getStratonClients(): Promise<StratonClient[]> {
  return isDemoMode()
    ? getFromStore<StratonClient>("straton_clients", { col: "client_name" })
    : getFromNeon<StratonClient>("straton_clients", { col: "client_name" });
}

export async function getStratonProjects(): Promise<StratonProject[]> {
  return isDemoMode()
    ? getFromStore<StratonProject>("straton_projects", { col: "updated_at", asc: false })
    : getFromNeon<StratonProject>("straton_projects", { col: "updated_at", asc: false });
}

export async function getStratonInvoices(): Promise<StratonInvoice[]> {
  return isDemoMode()
    ? getFromStore<StratonInvoice>("straton_invoices", { col: "issue_date", asc: false })
    : getFromNeon<StratonInvoice>("straton_invoices", { col: "issue_date", asc: false });
}

export async function getStratonHosting(): Promise<StratonHosting[]> {
  return isDemoMode()
    ? getFromStore<StratonHosting>("straton_hosting", { col: "renewal_date" })
    : getFromNeon<StratonHosting>("straton_hosting", { col: "renewal_date" });
}

export async function getStratonReminders(): Promise<StratonClientReminder[]> {
  return isDemoMode()
    ? getFromStore<StratonClientReminder>("straton_client_reminders", { col: "due_date" })
    : getFromNeon<StratonClientReminder>("straton_client_reminders", { col: "due_date" });
}

export async function getStratonActivity(clientId?: string): Promise<StratonActivity[]> {
  if (isDemoMode()) {
    const items = await getFromStore<StratonActivity>("straton_activity", { col: "created_at", asc: false });
    return clientId ? items.filter((a) => a.client_id === clientId) : items;
  }
  const items = await getFromNeon<StratonActivity>("straton_activity", {
    col: "created_at",
    asc: false,
  });
  return clientId ? items.filter((a) => a.client_id === clientId) : items;
}

export async function getStratonClient(id: string): Promise<StratonClient | null> {
  const clients = await getStratonClients();
  return clients.find((c) => c.id === id) ?? null;
}
