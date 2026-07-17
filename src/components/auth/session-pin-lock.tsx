"use client";

import { useEffect, useState, useTransition } from "react";
import { Lock } from "lucide-react";
import { getPinStatus, verifySessionPin } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

const UNLOCK_KEY = "jarvis_session_unlocked";

export function SessionPinLock({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [locked, setLocked] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!enabled) {
      setChecking(false);
      setLocked(false);
      return;
    }

    let cancelled = false;
    (async () => {
      const status = await getPinStatus();
      if (cancelled) return;
      if (status.demo || !status.pinSet) {
        setLocked(false);
        setChecking(false);
        if (!status.demo && !status.pinSet) {
          router.replace("/login/setup-pin");
        }
        return;
      }
      const unlocked = sessionStorage.getItem(UNLOCK_KEY) === "1";
      setLocked(!unlocked);
      setChecking(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, router]);

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

  if (!enabled || checking || !locked) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-md p-4">
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
            <Label htmlFor="session-pin" className="sr-only">PIN</Label>
            <Input
              id="session-pin"
              name="pin"
              type="password"
              inputMode="numeric"
              pattern="[0-9]{4,6}"
              minLength={4}
              maxLength={6}
              required
              autoFocus
              className="tracking-[0.4em] text-center text-xl"
              placeholder="••••"
              autoComplete="off"
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
