"use client";

import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { getNavGroups, getWorkspaceForPath } from "@/lib/navigation";
import { useCommandPalette } from "@/components/command-palette/command-palette-provider";
import { AppLogo } from "@/components/brand/app-logo";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { SidebarGroup } from "./sidebar-group";

export function Sidebar() {
  const pathname = usePathname();
  const { setOpen } = useCommandPalette();
  const workspace = getWorkspaceForPath(pathname);
  const groups = getNavGroups(workspace);

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:z-40 border-r border-border/50 glass-strong">
      {/* Top: brand */}
      <div className="flex h-16 items-center gap-2.5 px-5 border-b border-border/50">
        <AppLogo size={32} className="rounded-lg" />
        <span className="text-base font-semibold tracking-tight">{APP_NAME}</span>
      </div>

      {/* Workspace switcher + search */}
      <div className="space-y-2 p-3 border-b border-border/50">
        <WorkspaceSwitcher workspace={workspace} />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center gap-2.5 rounded-xl border border-border/50 bg-muted/30 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
        >
          <Search className="h-4 w-4" />
          <span>Search</span>
          <kbd className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">⌘K</kbd>
        </button>
      </div>

      {/* Grouped navigation */}
      <nav className="flex-1 space-y-5 overflow-y-auto p-3">
        {groups.map((group) => (
          <SidebarGroup key={group.id} group={group} pathname={pathname} />
        ))}
      </nav>

      <div className="border-t border-border/50 p-3">
        <p className="text-center text-[11px] text-muted-foreground/70">Personal assistant</p>
      </div>
    </aside>
  );
}
