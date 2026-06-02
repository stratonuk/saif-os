import { Badge } from "@/components/ui/badge";
import { PRIORITY_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("border-0 capitalize", PRIORITY_COLORS[priority])}
    >
      {priority}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const label = status.replace("_", " ");
  return (
    <Badge variant="outline" className="border-0 capitalize">
      {label}
    </Badge>
  );
}
