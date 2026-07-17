"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startLogin } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await startLogin(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    if (result?.challengeId && result.email) {
      const params = new URLSearchParams({
        challengeId: result.challengeId,
        email: result.email,
      });
      if (result.devCode) params.set("devCode", result.devCode);
      if (result.emailError) params.set("emailError", result.emailError);
      router.push(`/login/verify?${params.toString()}`);
      return;
    }
    setLoading(false);
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <p className="text-sm text-destructive rounded-lg bg-destructive/10 p-3">
          {error}
        </p>
      )}
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          className="mt-1"
          autoComplete="email"
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          className="mt-1"
          autoComplete="current-password"
        />
      </div>
      <Button type="submit" className="w-full rounded-xl" disabled={loading}>
        {loading ? "Checking…" : "Continue"}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        We’ll email you a 6-digit code to finish signing in.
      </p>
    </form>
  );
}
