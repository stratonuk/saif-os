"use client";

import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCommandPalette } from "@/components/command-palette/command-palette-provider";

/**
 * Floating quick-capture trigger.
 * - Mobile: large FAB sitting above the bottom nav.
 * - Desktop: smaller pill anchored bottom-right.
 */
export function FloatingQuickCaptureButton() {
  const { openCapture } = useCommandPalette();

  return (
    <button
      type="button"
      onClick={() => openCapture()}
      aria-label="Quick capture"
      className={cn(
        "fixed z-40 flex items-center justify-center rounded-full cursor-pointer",
        "bg-primary text-primary-foreground shadow-lg shadow-black/30",
        "transition-transform active:scale-95 hover:scale-105",
        // mobile FAB
        "h-14 w-14 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-4",
        // desktop: smaller, lower-right
        "lg:h-12 lg:w-12 lg:bottom-6 lg:right-6"
      )}
    >
      <Plus className="h-6 w-6 lg:h-5 lg:w-5" />
    </button>
  );
}
