import { Banknote, Building2, CreditCard, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  PAYMENT_METHOD_COLORS,
  PAYMENT_METHOD_LABELS,
} from "@/lib/constants";
import { normalizePaymentMethod } from "@/lib/transaction-utils";
import type { PaymentMethod } from "@/lib/types";
import { cn } from "@/lib/utils";

const ICONS: Record<PaymentMethod, typeof Banknote> = {
  cash: Banknote,
  revolut: Wallet,
  amex: CreditCard,
  hsbc: Building2,
  monzo: Wallet,
  tsb: Building2,
  chase: Building2,
};

export function PaymentMethodBadge({
  method,
  className,
}: {
  method: PaymentMethod | string;
  className?: string;
}) {
  const normalized = normalizePaymentMethod(method);
  const Icon = ICONS[normalized];
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs border-0 gap-1",
        PAYMENT_METHOD_COLORS[normalized] ?? "bg-muted text-muted-foreground",
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {PAYMENT_METHOD_LABELS[normalized] ?? normalized}
    </Badge>
  );
}
