"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getGreeting } from "@/lib/utils";
import { useCommandPalette } from "@/components/command-palette/command-palette-provider";

interface TopBarProps {
  userName: string;
}

export function TopBar({ userName }: TopBarProps) {
  const { setOpen } = useCommandPalette();

  return (
    <header className="app-header sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border/50 glass px-4 lg:px-8">
      <div>
        <p className="text-sm text-muted-foreground">{getGreeting()}</p>
        <h2 className="text-xl font-semibold tracking-tight">
          {userName}
          <span className="text-muted-foreground"> 👋</span>
        </h2>
      </div>
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
    </header>
  );
}
