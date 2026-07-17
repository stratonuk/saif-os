"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MOBILE_BOTTOM_NAV, isNavItemActive } from "@/lib/navigation";
import { MobileMoreSheet } from "./mobile-more-sheet";

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-border/50 glass-strong mobile-nav-bar">
      <div className="flex items-center justify-around px-2 py-2">
        {MOBILE_BOTTOM_NAV.map((item) => {
          const isActive = isNavItemActive(item, pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-[11px] font-medium transition-colors min-w-[56px] active:scale-95",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
        <MobileMoreSheet />
      </div>
    </nav>
  );
}
