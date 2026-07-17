"use client";

import { useState } from "react";
import { verifyLoginCode } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function VerifyOtpForm({
  challengeId,
  email,
  devCode,
}: {
  challengeId: string;
  email: string;
  devCode?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    formData.set("challengeId", challengeId);
    formData.set("email", email);
    const result = await verifyLoginCode(formData);
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
        Enter the 6-digit code sent to <span className="text-foreground font-medium">{email}</span>.
      </p>
      {devCode && (
        <p className="text-xs rounded-lg bg-amber-500/10 text-amber-200 p-3">
          Dev mode (no Resend key): use code <strong>{devCode}</strong>
        </p>
      )}
      <div>
        <Label htmlFor="code">Verification code</Label>
        <Input
          id="code"
          name="code"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          required
          className="mt-1 tracking-[0.3em] text-center text-lg"
          placeholder="000000"
          autoFocus
          autoComplete="one-time-code"
        />
      </div>
      <Button type="submit" className="w-full rounded-xl" disabled={loading}>
        {loading ? "Verifying…" : "Verify & sign in"}
      </Button>
    </form>
  );
}
