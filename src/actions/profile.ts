"use server";

import { createClient } from "@/lib/supabase/server";
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

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.full_name,
      email: parsed.data.email,
    })
    .eq("id", userId);

  if (error) return { error: { _form: [error.message] } };

  await revalidateApp("/settings", "/dashboard");
  return { success: true };
}
