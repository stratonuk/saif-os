"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { isNavItemActive, type NavItem } from "@/lib/navigation";

interface SidebarItemProps {
  item: NavItem;
  pathname: string;
  onNavigate?: () => void;
  compact?: boolean;
}

export function SidebarItem({ item, pathname, onNavigate, compact }: SidebarItemProps) {
  const isActive = isNavItemActive(item, pathname);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all duration-150",
        compact ? "py-1.5" : "py-2",
        isActive
          ? "bg-primary/10 text-primary ring-1 ring-inset ring-primary/20 shadow-[0_0_0_1px_rgba(59,130,246,0.05)]"
          : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
      )}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 h-4 -translate-y-1/2 w-0.5 rounded-full bg-primary" />
      )}
      <Icon className={cn("h-4 w-4 shrink-0 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}
