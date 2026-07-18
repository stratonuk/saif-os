"use client";

import { useLayoutEffect, useRef, useState, useTransition } from "react";
import { Lock } from "lucide-react";
import { verifySessionPin } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

const UNLOCK_KEY = "jarvis_session_unlocked";

function isSessionUnlocked(): boolean {
  try {
    return sessionStorage.getItem(UNLOCK_KEY) === "1";
  } catch {
    return false;
  }
}

export function SessionPinLock({
  enabled,
  pinSet = true,
}: {
  enabled: boolean;
  /** From JWT — skip the extra DB round-trip on every open. */
  pinSet?: boolean;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  // Assume locked on first paint when a PIN is required — unlock sync in layout effect
  // so already-unlocked sessions don't flash content before the gate.
  const [locked, setLocked] = useState(() => enabled && pinSet);
  const [readOnly, setReadOnly] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useLayoutEffect(() => {
    if (!enabled) {
      setLocked(false);
      return;
    }
    if (!pinSet) {
      setLocked(false);
      router.replace("/login/setup-pin");
      return;
    }
    if (isSessionUnlocked()) {
      setLocked(false);
      return;
    }
    setLocked(true);
  }, [enabled, pinSet, router]);

  // Open the keyboard as soon as the lock is visible (iOS needs focus in layout).
  useLayoutEffect(() => {
    if (!locked) return;
    const el = inputRef.current;
    if (!el) return;

    // iOS Safari / standalone PWA: start readOnly, then clear + focus so the
    // keyboard opens without requiring a tap.
    el.focus({ preventScroll: true });
    setReadOnly(false);
    requestAnimationFrame(() => {
      el.focus({ preventScroll: true });
      // Some iOS versions need a second tick after removing readOnly.
      try {
        el.click();
      } catch {
        /* ignore */
      }
    });
  }, [locked]);

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await verifySessionPin(formData);
      if (result?.needsSetup) {
        router.replace("/login/setup-pin");
        return;
      }
      if (result?.error) {
        setError(result.error);
        return;
      }
      sessionStorage.setItem(UNLOCK_KEY, "1");
      setLocked(false);
    });
  }

  if (!enabled || !pinSet || !locked) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background p-4"
      suppressHydrationWarning
    >
      <div className="w-full max-w-sm glass-strong rounded-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">Enter PIN</h2>
          <p className="text-sm text-muted-foreground">
            Unlock this session to continue.
          </p>
        </div>
        <form action={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-destructive rounded-lg bg-destructive/10 p-3">
              {error}
            </p>
          )}
          <div>
            <Label htmlFor="session-pin" className="sr-only">
              PIN
            </Label>
            <Input
              ref={inputRef}
              id="session-pin"
              name="pin"
              type="password"
              inputMode="numeric"
              pattern="[0-9]{4,6}"
              minLength={4}
              maxLength={6}
              required
              autoFocus
              readOnly={readOnly}
              autoCapitalizeFirst={false}
              enterKeyHint="done"
              autoComplete="one-time-code"
              className="tracking-[0.4em] text-center text-xl"
              placeholder="••••"
            />
          </div>
          <Button type="submit" className="w-full rounded-xl" disabled={pending}>
            {pending ? "Checking…" : "Unlock"}
          </Button>
        </form>
      </div>
    </div>
  );
}
