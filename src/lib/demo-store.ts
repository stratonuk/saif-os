import "server-only";

import { promises as fs } from "fs";
import path from "path";
import {
  demoContacts,
  demoGoals,
  demoIdeas,
  demoNotes,
  demoProfile,
  demoProjects,
  demoReminders,
  demoTasks,
  demoTransactions,
  demoWaitingItems,
} from "@/lib/demo-data";
import {
  demoDocuments,
  demoMonthlyReviews,
  demoStratonActivity,
  demoStratonClients,
  demoStratonHosting,
  demoStratonInvoices,
  demoStratonProjects,
  demoStratonReminders,
  demoSubscriptions,
  demoVehicleEvents,
  demoVehicleExpenses,
  demoVehicles,
  demoParkingTickets,
} from "@/lib/demo-modules-data";
import { DEMO_USER_ID } from "@/lib/form-helpers";
import { normalizeTransactions } from "@/lib/transaction-utils";
import type {
  Contact,
  Document,
  Goal,
  Idea,
  MonthlyReview,
  Note,
  Profile,
  Project,
  Reminder,
  StratonActivity,
  StratonClient,
  StratonClientReminder,
  StratonHosting,
  StratonInvoice,
  StratonProject,
  Subscription,
  Task,
  Transaction,
  Vehicle,
  VehicleEvent,
  VehicleExpense,
  ParkingTicket,
  WaitingItem,
} from "@/lib/types";

export { DEMO_USER_ID };

export interface DemoStore {
  profile: Profile;
  tasks: Task[];
  reminders: Reminder[];
  transactions: Transaction[];
  projects: Project[];
  ideas: Idea[];
  goals: Goal[];
  contacts: Contact[];
  waiting_items: WaitingItem[];
  notes: Note[];
  subscriptions: Subscription[];
  vehicles: Vehicle[];
  vehicle_events: VehicleEvent[];
  vehicle_expenses: VehicleExpense[];
  parking_tickets: ParkingTicket[];
  documents: Document[];
  monthly_reviews: MonthlyReview[];
  straton_clients: StratonClient[];
  straton_projects: StratonProject[];
  straton_invoices: StratonInvoice[];
  straton_hosting: StratonHosting[];
  straton_client_reminders: StratonClientReminder[];
  straton_activity: StratonActivity[];
  store_version?: number;
}

const STORE_VERSION = 1;

const STORE_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(STORE_DIR, "saif-store.json");

const SEED: DemoStore = {
  profile: demoProfile,
  tasks: demoTasks,
  reminders: demoReminders,
  transactions: demoTransactions,
  projects: demoProjects,
  ideas: demoIdeas,
  goals: demoGoals,
  contacts: demoContacts,
  waiting_items: demoWaitingItems,
  notes: demoNotes,
  subscriptions: demoSubscriptions,
  vehicles: demoVehicles,
  vehicle_events: demoVehicleEvents,
  vehicle_expenses: demoVehicleExpenses,
  parking_tickets: demoParkingTickets,
  documents: demoDocuments,
  monthly_reviews: demoMonthlyReviews,
  straton_clients: demoStratonClients,
  straton_projects: demoStratonProjects,
  straton_invoices: demoStratonInvoices,
  straton_hosting: demoStratonHosting,
  straton_client_reminders: demoStratonReminders,
  straton_activity: demoStratonActivity,
};

let memoryStore: DemoStore | null = null;
const useLocalFileStore = process.env.VERCEL !== "1";

const ARRAY_DEFAULTS: (keyof DemoStore)[] = [
  "waiting_items", "notes", "subscriptions", "vehicles", "vehicle_events",
  "vehicle_expenses", "parking_tickets", "documents", "monthly_reviews", "straton_clients",
  "straton_projects", "straton_invoices", "straton_hosting",
  "straton_client_reminders", "straton_activity",
];

function normalizeStore(store: DemoStore): DemoStore {
  const normalized = { ...store, transactions: normalizeTransactions(store.transactions) };
  for (const key of ARRAY_DEFAULTS) {
    if (!normalized[key]) {
      (normalized as unknown as Record<string, unknown>)[key] = structuredClone(SEED[key] ?? []);
    }
  }
  return normalized;
}

/** Backfill demo seed data for module arrays that were added after an existing local store was created. */
function migrateStore(store: DemoStore): { store: DemoStore; changed: boolean } {
  const version = store.store_version ?? 0;
  if (version >= STORE_VERSION) return { store, changed: false };

  const migrated = normalizeStore({ ...store });
  for (const key of ARRAY_DEFAULTS) {
    const current = migrated[key] as unknown[];
    const seed = SEED[key] as unknown[];
    if (Array.isArray(current) && current.length === 0 && seed.length > 0) {
      (migrated as unknown as Record<string, unknown>)[key] = structuredClone(seed);
    }
  }
  migrated.store_version = STORE_VERSION;
  return { store: migrated, changed: true };
}

export async function readDemoStore(): Promise<DemoStore> {
  if (memoryStore) return structuredClone(normalizeStore(memoryStore));
  if (useLocalFileStore) {
    try {
      const raw = await fs.readFile(STORE_FILE, "utf-8");
      const { store, changed } = migrateStore(JSON.parse(raw) as DemoStore);
      memoryStore = store;
      if (changed) await writeDemoStore(memoryStore);
      return structuredClone(memoryStore);
    } catch { /* fall through */ }
  }
  memoryStore = normalizeStore(structuredClone(SEED));
  if (useLocalFileStore) await writeDemoStore(memoryStore);
  return structuredClone(memoryStore);
}

export async function writeDemoStore(store: DemoStore): Promise<void> {
  memoryStore = structuredClone(store);
  if (!useLocalFileStore) return;
  try {
    await fs.mkdir(STORE_DIR, { recursive: true });
    await fs.writeFile(STORE_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch { /* ignore */ }
}
