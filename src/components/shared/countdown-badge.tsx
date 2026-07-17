import { cn, daysUntil } from "@/lib/utils";

export function CountdownBadge({ date, label }: { date: string; label?: string }) {
  const days = daysUntil(date);
  const urgency =
    days < 0 ? "overdue" : days <= 7 ? "critical" : days <= 30 ? "warning" : "normal";
  const colors = {
    overdue: "border-red-500/30 bg-red-500/10 text-red-400",
    critical: "border-red-500/20 bg-red-500/5 text-red-400",
    warning: "border-amber-400/30 bg-amber-400/10 text-amber-400",
    normal: "border-border/50 bg-muted/50 text-muted-foreground",
  };

  return (
    <div className={cn("rounded-xl border px-4 py-3 text-center min-w-[80px]", colors[urgency])}>
      {label && <p className="text-[10px] uppercase tracking-wider opacity-80 mb-1">{label}</p>}
      <p className="text-2xl font-bold">{days < 0 ? Math.abs(days) : days}</p>
      <p className="text-[10px] opacity-80">{days < 0 ? "days overdue" : days === 0 ? "today" : "days left"}</p>
    </div>
  );
}
