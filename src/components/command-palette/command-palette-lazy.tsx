"use client";

import dynamic from "next/dynamic";

const CommandPalette = dynamic(
  () =>
    import("@/components/command-palette/command-palette").then((m) => m.CommandPalette),
  { ssr: false, loading: () => null }
);

export function CommandPaletteLazy() {
  return <CommandPalette />;
}
