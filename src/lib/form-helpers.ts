export function emptyToNull(v: FormDataEntryValue | null): string | null {
  if (v === null || v === undefined || v === "" || v === "none") return null;
  return String(v);
}

export function parseRecurring(formData: FormData): boolean {
  return (
    formData.get("recurring") === "on" || formData.get("recurring") === "true"
  );
}

/** True when using local/in-memory sample data (no Neon DATABASE_URL). */
export function isDemoMode() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") return true;
  // Neon / production when a database is configured
  if (process.env.DATABASE_URL) return false;
  // Legacy: if only Supabase is configured, treat as non-demo for backwards compat
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return false;
  }
  return true;
}

export function newId() {
  return crypto.randomUUID();
}

export function nowIso() {
  return new Date().toISOString();
}

export const DEMO_USER_ID = "00000000-0000-4000-8000-000000000001";
