"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

interface CommandPaletteContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  openCapture: (type?: string) => void;
  captureType: string | null;
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null);

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [captureType, setCaptureType] = useState<string | null>(null);

  const openCapture = useCallback((type?: string) => {
    setCaptureType(type ?? null);
    setOpen(true);
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCaptureType(null);
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <CommandPaletteContext.Provider value={{ open, setOpen, openCapture, captureType }}>
      {children}
    </CommandPaletteContext.Provider>
  );
}

export function useCommandPalette() {
  const ctx = useContext(CommandPaletteContext);
  if (!ctx) throw new Error("useCommandPalette must be used within CommandPaletteProvider");
  return ctx;
}
