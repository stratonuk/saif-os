"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarItem } from "./sidebar-item";
import type { NavGroup } from "@/lib/navigation";

interface SidebarGroupProps {
  group: NavGroup;
  pathname: string;
  onNavigate?: () => void;
}

export function SidebarGroup({ group, pathname, onNavigate }: SidebarGroupProps) {
  const [open, setOpen] = useState(group.defaultOpen ?? true);
  const showItems = group.collapsible ? open : true;

  return (
    <div className="space-y-1">
      {group.heading &&
        (group.collapsible ? (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex w-full items-center justify-between px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 transition-colors hover:text-muted-foreground"
          >
            {group.heading}
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
          </button>
        ) : (
          <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 select-none">
            {group.heading}
          </p>
        ))}
      {showItems && (
        <div className="space-y-0.5">
          {group.items.map((item) => (
            <SidebarItem key={item.href} item={item} pathname={pathname} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </div>
  );
}
