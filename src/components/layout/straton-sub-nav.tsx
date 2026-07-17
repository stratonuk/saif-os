"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { STRATON_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function StratonSubNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-6 -mx-4 px-4 overflow-x-auto scrollbar-none">
      <div className="flex gap-1 min-w-max rounded-xl border border-border/50 bg-muted/30 p-1 backdrop-blur-sm">
        {STRATON_NAV.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/straton" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                isActive
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">{item.label}</span>
              <span className="sm:hidden">{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
