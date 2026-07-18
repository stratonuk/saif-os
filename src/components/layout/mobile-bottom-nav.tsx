"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { cn } from "@/lib/utils";
import { MOBILE_BOTTOM_NAV, isNavItemActive } from "@/lib/navigation";
import { MobileMoreSheet } from "./mobile-more-sheet";

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Warm the primary tab routes so soft navigations feel instant.
  useEffect(() => {
    for (const item of MOBILE_BOTTOM_NAV) {
      router.prefetch(item.href);
    }
  }, [router]);

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-border/50 bg-card/95 backdrop-blur-md mobile-nav-bar",
        isPending && "opacity-90"
      )}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {MOBILE_BOTTOM_NAV.map((item) => {
          const isActive = isNavItemActive(item, pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              onClick={(e) => {
                if (isActive) {
                  e.preventDefault();
                  return;
                }
                // Keep Link for a11y/middle-click, but drive soft nav through
                // a transition so React can show pending feedback immediately.
                e.preventDefault();
                startTransition(() => {
                  router.push(item.href);
                });
              }}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-[11px] font-medium transition-colors duration-150 min-w-[56px] min-h-[44px] justify-center cursor-pointer active:opacity-70",
                isActive ? "text-primary" : "text-muted-foreground",
                isPending && !isActive && "opacity-60"
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
