export function DemoBanner() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== "true") return null;

  return (
    <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 text-center text-sm text-primary">
      <strong>Live demo</strong> — sample data for Saif. Edits work during your
      session but may reset after idle time. Add Supabase for permanent storage.
    </div>
  );
}
