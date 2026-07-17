"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown } from "lucide-react";
import { AppLogo } from "@/components/brand/app-logo";
import { StratonLogo } from "@/components/brand/straton-logo";
import { cn } from "@/lib/utils";
import { WORKSPACES, type WorkspaceId } from "@/lib/navigation";

interface WorkspaceSwitcherProps {
  workspace: WorkspaceId;
}

function WorkspaceIcon({
  id,
  size,
  className,
}: {
  id: WorkspaceId;
  size: number;
  className?: string;
}) {
  if (id === "personal") {
    return <AppLogo size={size} className={cn("rounded-lg", className)} />;
  }

  return <StratonLogo size={size} className={cn("rounded-lg", className)} />;
}

export function WorkspaceSwitcher({ workspace }: WorkspaceSwitcherProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = WORKSPACES[workspace];

  function selectWorkspace(id: WorkspaceId) {
    setOpen(false);
    if (id !== workspace) router.push(WORKSPACES[id].homeHref);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-xl border border-border/50 bg-muted/30 px-2.5 py-2 text-left transition-colors hover:bg-muted/60",
          open && "bg-muted/60 ring-1 ring-inset ring-border"
        )}
      >
        <WorkspaceIcon id={workspace} size={32} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold leading-tight">{current.name}</span>
          <span className="block truncate text-[11px] text-muted-foreground leading-tight">{current.description}</span>
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 rounded-xl border border-border/50 glass-strong p-1 shadow-xl animate-in fade-in slide-in-from-top-1 duration-150">
          {Object.values(WORKSPACES).map((ws) => {
            const isActive = ws.id === workspace;
            return (
              <button
                key={ws.id}
                type="button"
                onClick={() => selectWorkspace(ws.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors",
                  isActive ? "bg-primary/10 text-primary" : "hover:bg-accent/60"
                )}
              >
                <WorkspaceIcon id={ws.id} size={28} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium leading-tight">{ws.name}</span>
                  <span className="block truncate text-[11px] text-muted-foreground leading-tight">{ws.description}</span>
                </span>
                {isActive && <Check className="h-4 w-4 shrink-0 text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
