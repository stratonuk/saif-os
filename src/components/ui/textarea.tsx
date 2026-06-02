"use client";

import * as React from "react";
import { capitalizeFirstLetter, cn } from "@/lib/utils";

export interface TextareaProps extends React.ComponentProps<"textarea"> {
  autoCapitalizeFirst?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { className, autoCapitalizeFirst = true, onBlur, onChange, ...props },
    ref
  ) => {
    const shouldCap = autoCapitalizeFirst !== false;

    const applyCap = (el: HTMLTextAreaElement) => {
      const next = capitalizeFirstLetter(el.value);
      if (next !== el.value) {
        el.value = next;
        el.dispatchEvent(new Event("input", { bubbles: true }));
      }
    };

    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        autoCapitalize={shouldCap ? "sentences" : undefined}
        onBlur={(e) => {
          if (shouldCap) applyCap(e.currentTarget);
          onBlur?.(e);
        }}
        onChange={(e) => {
          if (shouldCap && e.currentTarget.value.length === 1) {
            applyCap(e.currentTarget);
          }
          onChange?.(e);
        }}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
