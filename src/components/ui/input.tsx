"use client";

import * as React from "react";
import {
  capitalizeFirstLetter,
  cn,
  shouldAutoCapitalizeFirst,
} from "@/lib/utils";

export interface InputProps extends React.ComponentProps<"input"> {
  /** Set false to disable first-letter capitalization (default: on for text-like fields) */
  autoCapitalizeFirst?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      autoCapitalizeFirst,
      onBlur,
      onChange,
      autoCapitalize,
      ...props
    },
    ref
  ) => {
    const shouldCap = shouldAutoCapitalizeFirst(type, autoCapitalizeFirst);

    const applyCap = (el: HTMLInputElement) => {
      const next = capitalizeFirstLetter(el.value);
      if (next !== el.value) {
        el.value = next;
        el.dispatchEvent(new Event("input", { bubbles: true }));
      }
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        autoCapitalize={
          autoCapitalize ?? (shouldCap ? "sentences" : undefined)
        }
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
Input.displayName = "Input";

export { Input };
