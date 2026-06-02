import { revalidatePath } from "next/cache";
import { readDemoStore, writeDemoStore } from "@/lib/demo-store";
import {
  isDemoMode,
  newId,
  nowIso,
  DEMO_USER_ID,
} from "@/lib/form-helpers";

export { isDemoMode, newId, nowIso, DEMO_USER_ID };

export async function getAuthUserId(): Promise<string | null> {
  if (isDemoMode()) return DEMO_USER_ID;

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function revalidateApp(...paths: string[]) {
  const all = new Set([
    ...paths,
    "/dashboard",
    "/tasks",
    "/reminders",
    "/money",
    "/projects",
    "/ideas",
    "/goals",
    "/contacts",
    "/settings",
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
