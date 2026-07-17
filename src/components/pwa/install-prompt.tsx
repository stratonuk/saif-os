"use client";

import { useEffect, useState } from "react";
import { Share, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLogo } from "@/components/brand/app-logo";
import { canInstallPwa, isStandalonePwa } from "@/lib/pwa";

const DISMISS_KEY = "jarvis-install-dismissed";

export function InstallPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isStandalonePwa()) return;
    if (!canInstallPwa()) return;
    if (localStorage.getItem(DISMISS_KEY)) return;
    const t = setTimeout(() => setShow(true), 2000);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setShow(false);
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[60] lg:hidden">
      <div className="glass-strong rounded-2xl p-4 shadow-2xl border border-primary/20">
        <div className="flex items-start gap-3">
          <AppLogo size={40} className="rounded-xl shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">Add JARVIS to Home Screen</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Tap <Share className="inline h-3.5 w-3.5 mx-0.5" /> Share, then{" "}
              <strong>Add to Home Screen</strong> to use it like an app.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 h-8 w-8"
            onClick={dismiss}
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="w-full mt-3 rounded-xl"
          onClick={dismiss}
        >
          Got it
        </Button>
      </div>
    </div>
  );
}
