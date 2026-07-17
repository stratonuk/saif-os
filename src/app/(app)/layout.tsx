export const dynamic = "force-dynamic";

import { Sidebar } from "@/components/layout/sidebar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { FloatingQuickCaptureButton } from "@/components/layout/floating-quick-capture-button";
import { TopBar } from "@/components/layout/top-bar";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { CommandPaletteProvider } from "@/components/command-palette/command-palette-provider";
import { CommandPalette } from "@/components/command-palette/command-palette";
import { getProfile } from "@/lib/data";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();
  const userName = profile?.full_name?.split(" ")[0] ?? "Saif";

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
        <CommandPalette />
        <InstallPrompt />
      </div>
    </CommandPaletteProvider>
  );
}
