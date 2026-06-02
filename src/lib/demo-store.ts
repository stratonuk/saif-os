import "server-only";

import { promises as fs } from "fs";
import path from "path";
import {
  demoContacts,
  demoGoals,
  demoIdeas,
  demoProfile,
  demoProjects,
  demoReminders,
  demoTasks,
  demoTransactions,
} from "@/lib/demo-data";
import { DEMO_USER_ID } from "@/lib/form-helpers";
import { normalizeTransactions } from "@/lib/transaction-utils";
import type {
  Contact,
  Goal,
  Idea,
  Profile,
  Project,
  Reminder,
  Task,
  Transaction,
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
}

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
};

let memoryStore: DemoStore | null = null;

/** Vercel serverless has no persistent disk — use in-memory store only. */
const useLocalFileStore = process.env.VERCEL !== "1";

function normalizeStore(store: DemoStore): DemoStore {
  return {
    ...store,
    transactions: normalizeTransactions(store.transactions),
  };
}

export async function readDemoStore(): Promise<DemoStore> {
  if (memoryStore) return structuredClone(normalizeStore(memoryStore));

  if (useLocalFileStore) {
    try {
      const raw = await fs.readFile(STORE_FILE, "utf-8");
      memoryStore = normalizeStore(JSON.parse(raw) as DemoStore);
      return structuredClone(memoryStore);
    } catch {
      // fall through to seed
    }
  }

  memoryStore = normalizeStore(structuredClone(SEED));
  if (useLocalFileStore) {
    await writeDemoStore(memoryStore);
  }
  return structuredClone(memoryStore);
}

export async function writeDemoStore(store: DemoStore): Promise<void> {
  memoryStore = structuredClone(store);
  if (!useLocalFileStore) return;

  try {
    await fs.mkdir(STORE_DIR, { recursive: true });
    await fs.writeFile(STORE_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch {
    // ignore
  }
}
