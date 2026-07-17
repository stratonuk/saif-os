"use client";

import { Search, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getGreeting } from "@/lib/utils";
import { useCommandPalette } from "@/components/command-palette/command-palette-provider";
import { logout } from "@/actions/auth";

interface TopBarProps {
  userName: string;
  showLogout?: boolean;
}

export function TopBar({ userName, showLogout = true }: TopBarProps) {
  const { setOpen } = useCommandPalette();

  function handleSignOut() {
    try {
      sessionStorage.removeItem("jarvis_session_unlocked");
    } catch {
      /* ignore */
    }
  }

  return (
    <header className="app-header sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border/50 glass px-4 lg:px-8">
      <div>
        <p className="text-sm text-muted-foreground" suppressHydrationWarning>
          {getGreeting()}
        </p>
        <h2 className="text-xl font-semibold tracking-tight">
          {userName}
          <span className="text-muted-foreground"> 👋</span>
        </h2>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl gap-2"
          onClick={() => setOpen(true)}
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden md:inline text-[10px] opacity-70 bg-muted px-1.5 py-0.5 rounded ml-1">⌘K</kbd>
        </Button>
        {showLogout && (
          <form action={logout} onSubmit={handleSignOut}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="rounded-xl gap-2 text-muted-foreground hover:text-destructive"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </form>
        )}
      </div>
    </header>
  );
}
