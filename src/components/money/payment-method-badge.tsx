import { Building2, Banknote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PAYMENT_METHOD_LABELS } from "@/lib/constants";
import type { PaymentMethod } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PaymentMethodBadge({
  method,
  className,
}: {
  method: PaymentMethod;
  className?: string;
}) {
  const Icon = method === "bank" ? Building2 : Banknote;
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs border-0 gap-1 capitalize",
        method === "bank"
          ? "bg-teal-400/10 text-teal-400"
          : "bg-amber-400/10 text-amber-400",
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {PAYMENT_METHOD_LABELS[method]}
    </Badge>
  );
}
