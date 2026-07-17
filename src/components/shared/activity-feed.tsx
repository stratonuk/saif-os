import { formatDate } from "@/lib/utils";
import type { StratonActivity } from "@/lib/types";

export function ActivityFeed({ activities }: { activities: StratonActivity[] }) {
  if (activities.length === 0) {
    return <p className="text-sm text-muted-foreground py-4 text-center">No activity yet</p>;
  }

  return (
    <div className="space-y-0">
      {activities.map((a, i) => (
        <div key={a.id} className="relative flex gap-4 pb-6">
          {i < activities.length - 1 && (
            <div className="absolute left-[7px] top-4 bottom-0 w-px bg-border/50" />
          )}
          <div className="h-4 w-4 rounded-full bg-primary/20 border-2 border-primary shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{a.title}</p>
            {a.description && <p className="text-xs text-muted-foreground mt-0.5">{a.description}</p>}
            <p className="text-[10px] text-muted-foreground mt-1">{formatDate(a.created_at)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
