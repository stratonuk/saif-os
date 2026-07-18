import { Sidebar } from "@/components/layout/sidebar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { FloatingQuickCaptureButton } from "@/components/layout/floating-quick-capture-button";
import { TopBar } from "@/components/layout/top-bar";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { CommandPaletteProvider } from "@/components/command-palette/command-palette-provider";
import { CommandPaletteLazy } from "@/components/command-palette/command-palette-lazy";
import { SessionPinLock } from "@/components/auth/session-pin-lock";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { getSession, isDemoMode } from "@/lib/action-utils";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const demo = isDemoMode();
  // Prefer JWT session over a Neon profile round-trip so the shell paints faster.
  const session = await getSession();
  const userName =
    session?.user?.name?.split(" ")[0] ??
    session?.user?.email?.split("@")[0] ??
    "Saif";
  const pinLockEnabled = !demo;
  const pinSet = demo ? false : Boolean(session?.user?.pinSet);

  return (
    <CommandPaletteProvider>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="app-content-column lg:pl-64 flex flex-col min-h-screen">
          <TopBar userName={userName} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8">{children}</main>
        </div>
        <MobileBottomNav />
        <FloatingQuickCaptureButton />
        <CommandPaletteLazy />
        <InstallPrompt />
        <ServiceWorkerRegister />
        <SessionPinLock enabled={pinLockEnabled} pinSet={pinSet} />
      </div>
    </CommandPaletteProvider>
  );
}
