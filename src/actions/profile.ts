"use server";

import { getSql } from "@/lib/db";
import { profileSchema } from "@/lib/validations";
import {
  isDemoMode,
  getAuthUserId,
  revalidateApp,
  withDemoStore,
  nowIso,
} from "@/lib/action-utils";

export async function updateProfile(formData: FormData) {
  const parsed = profileSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
  });

  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const userId = await getAuthUserId();
  if (!userId) return { error: { _form: ["Not authenticated"] } };

  if (isDemoMode()) {
    await withDemoStore((store) => {
      store.profile = {
        ...store.profile,
        full_name: parsed.data.full_name,
        email: parsed.data.email,
        updated_at: nowIso(),
      };
    });
    await revalidateApp("/settings", "/dashboard");
    return { success: true };
  }

  try {
    const db = getSql();
    await db`
      UPDATE profiles
      SET full_name = ${parsed.data.full_name}, email = ${parsed.data.email}
      WHERE id = ${userId}
    `;
  } catch (e) {
    return { error: { _form: [e instanceof Error ? e.message : "Failed to update"] } };
  }

  await revalidateApp("/settings", "/dashboard");
  return { success: true };
}
