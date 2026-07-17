import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20 py-16 px-6 text-center animate-in fade-in duration-500",
        className
      )}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-violet-500/10 ring-1 ring-border/50">
        <Icon className="h-8 w-8 text-primary/70" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
