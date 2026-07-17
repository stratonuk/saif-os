"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor, LogOut, Share, Smartphone } from "lucide-react";
import { isStandalonePwa } from "@/lib/pwa";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { logout } from "@/actions/auth";
import { updateProfile } from "@/actions/profile";
import { useRefreshAction } from "@/hooks/use-refresh-action";
import type { Profile } from "@/lib/types";

export function SettingsPageClient({ profile }: { profile: Profile | null }) {
  const { theme, setTheme } = useTheme();
  const { run, isPending } = useRefreshAction();
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    setInstalled(isStandalonePwa());
  }, []);

  async function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = await run(() => updateProfile(new FormData(e.currentTarget)));
    if (result?.error) {
      toast.error("Could not update profile");
      return;
    }
    toast.success("Profile saved");
  }

  return (
    <>
      <PageHeader title="Settings" description="Profile and appearance preferences." />

      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Install on iPhone
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            {installed ? (
              <p className="text-emerald-400 font-medium">
                You&apos;re using JARVIS as an installed app.
              </p>
            ) : (
              <>
                <p>In Safari, tap the Share button <Share className="inline h-4 w-4" /> then choose <strong className="text-foreground">Add to Home Screen</strong>.</p>
                <p>Opens fullscreen without the browser bar, like a native app.</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Profile</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <Label htmlFor="full_name">Full name</Label>
                <Input id="full_name" name="full_name" defaultValue={profile?.full_name ?? "Saif"} required className="mt-1" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={profile?.email ?? ""} required className="mt-1" />
              </div>
              <Button type="submit" className="rounded-xl" disabled={isPending}>
                {isPending ? "Saving..." : "Save profile"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Appearance</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Sun className="h-4 w-4" /><Label>Light mode</Label></div>
              <Switch checked={theme === "light"} onCheckedChange={(c) => setTheme(c ? "light" : "dark")} />
            </div>
            <div className="flex gap-2">
              <Button variant={theme === "dark" ? "default" : "outline"} size="sm" className="rounded-xl" onClick={() => setTheme("dark")}><Moon className="h-4 w-4 mr-1" /> Dark</Button>
              <Button variant={theme === "light" ? "default" : "outline"} size="sm" className="rounded-xl" onClick={() => setTheme("light")}><Sun className="h-4 w-4 mr-1" /> Light</Button>
              <Button variant={theme === "system" ? "default" : "outline"} size="sm" className="rounded-xl" onClick={() => setTheme("system")}><Monitor className="h-4 w-4 mr-1" /> System</Button>
            </div>
          </CardContent>
        </Card>

        <form action={logout}>
          <Button variant="outline" className="rounded-xl text-destructive" type="submit">
            <LogOut className="h-4 w-4 mr-2" /> Sign out
          </Button>
        </form>
      </div>
    </>
  );
}
