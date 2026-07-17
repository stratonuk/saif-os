"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal, X } from "lucide-react";
import { MOBILE_MORE_GROUPS, isNavItemActive } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function MobileMoreSheet() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const allItems = MOBILE_MORE_GROUPS.flatMap((g) => g.items);
  const isMoreActive = allItems.some((item) => isNavItemActive(item, pathname));

  const sheet =
    open && mounted
      ? createPortal(
          <div className="fixed inset-0 z-[60] lg:hidden">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in"
              onClick={() => setOpen(false)}
            />
            <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-2xl border-t border-border bg-background p-4 pb-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">More</h3>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-5">
                {MOBILE_MORE_GROUPS.map((group) => (
                  <div key={group.id}>
                    {group.heading && (
                      <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                        {group.heading}
                      </p>
                    )}
                    <div className="grid grid-cols-3 gap-2">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = isNavItemActive(item, pathname);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className={cn(
                              "flex flex-col items-center gap-2 rounded-xl p-4 text-[11px] font-medium transition-colors active:scale-95 text-center",
                              isActive
                                ? "bg-primary/10 text-primary ring-1 ring-inset ring-primary/20"
                                : "bg-muted/50 text-muted-foreground hover:bg-muted"
                            )}
                          >
                            <Icon className="h-5 w-5" />
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-[11px] font-medium transition-colors min-w-[56px] active:scale-95",
          isMoreActive ? "text-primary" : "text-muted-foreground"
        )}
      >
        <MoreHorizontal className="h-5 w-5" />
        More
      </button>
      {sheet}
    </>
  );
}
