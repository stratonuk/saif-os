"use client";

import { useState } from "react";
import { setupPin } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SetupPinForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await setupPin(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <p className="text-sm text-destructive rounded-lg bg-destructive/10 p-3">
          {error}
        </p>
      )}
      <p className="text-sm text-muted-foreground">
        Create a 4–6 digit PIN. You’ll enter it every time you open a new browser session.
      </p>
      <div>
        <Label htmlFor="pin">PIN</Label>
        <Input
          id="pin"
          name="pin"
          type="password"
          inputMode="numeric"
          pattern="[0-9]{4,6}"
          minLength={4}
          maxLength={6}
          required
          autoFocus
          autoCapitalizeFirst={false}
          className="mt-1 tracking-[0.3em] text-center text-lg"
          autoComplete="new-password"
        />
      </div>
      <div>
        <Label htmlFor="confirm">Confirm PIN</Label>
        <Input
          id="confirm"
          name="confirm"
          type="password"
          inputMode="numeric"
          pattern="[0-9]{4,6}"
          minLength={4}
          maxLength={6}
          required
          className="mt-1 tracking-[0.3em] text-center text-lg"
          autoComplete="new-password"
        />
      </div>
      <Button type="submit" className="w-full rounded-xl" disabled={loading}>
        {loading ? "Saving…" : "Save PIN"}
      </Button>
    </form>
  );
}
