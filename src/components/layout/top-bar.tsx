"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getGreeting } from "@/lib/utils";
import { QuickAddDialog } from "@/components/quick-add/quick-add-dialog";

interface TopBarProps {
  userName: string;
}

export function TopBar({ userName }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border/50 glass px-4 lg:px-8">
      <div>
        <p className="text-sm text-muted-foreground">{getGreeting()}</p>
        <h2 className="text-xl font-semibold tracking-tight">
          {userName}
          <span className="text-muted-foreground"> 👋</span>
        </h2>
      </div>
      <QuickAddDialog>
        <Button size="sm" className="rounded-xl gap-1.5 shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Quick Add</span>
        </Button>
      </QuickAddDialog>
    </header>
  );
}
