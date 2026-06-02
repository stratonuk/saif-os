export function emptyToNull(v: FormDataEntryValue | null): string | null {
  if (v === null || v === undefined || v === "" || v === "none") return null;
  return String(v);
}

export function parseRecurring(formData: FormData): boolean {
  return (
    formData.get("recurring") === "on" || formData.get("recurring") === "true"
  );
}

/** True when running without Supabase (local file store or Vercel in-memory demo). */
export function isDemoMode() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") return true;
  return (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function newId() {
  return crypto.randomUUID();
}

export function nowIso() {
  return new Date().toISOString();
}

export const DEMO_USER_ID = "00000000-0000-4000-8000-000000000001";
