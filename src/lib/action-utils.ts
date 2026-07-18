import { cache } from "react";
import {
  isDemoMode,
  newId,
  nowIso,
  DEMO_USER_ID,
} from "@/lib/form-helpers";
import { readDemoStore, writeDemoStore } from "@/lib/demo-store";
import { revalidatePath } from "next/cache";

export { isDemoMode, newId, nowIso, DEMO_USER_ID };

/** One auth() decode per RSC request — shared by layout + every data getter. */
export const getSession = cache(async () => {
  if (isDemoMode()) return null;
  const { auth } = await import("@/lib/auth");
  return auth();
});

export const getAuthUserId = cache(async (): Promise<string | null> => {
  if (isDemoMode()) return DEMO_USER_ID;
  const session = await getSession();
  return session?.user?.id ?? null;
});

export async function revalidateApp(...paths: string[]) {
  const all = new Set([
    ...paths,
    "/dashboard", "/inbox", "/tasks", "/reminders", "/waiting-on",
    "/money", "/projects", "/ideas", "/goals", "/contacts", "/notes",
    "/documents", "/car", "/subscriptions", "/monthly-reset",
    "/straton", "/straton/clients", "/straton/projects", "/straton/invoices",
    "/straton/hosting", "/straton/documents", "/straton/reminders", "/settings",
  ]);
  for (const p of all) {
    revalidatePath(p);
  }
}

export async function withDemoStore<T>(
  fn: (store: Awaited<ReturnType<typeof readDemoStore>>) => T | Promise<T>
): Promise<T> {
  const store = await readDemoStore();
  const result = await fn(store);
  await writeDemoStore(store);
  return result;
}
