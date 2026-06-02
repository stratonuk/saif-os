export const dynamic = "force-dynamic";

import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { TopBar } from "@/components/layout/top-bar";
import { DemoBanner } from "@/components/layout/demo-banner";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { getProfile } from "@/lib/data";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();
  const userName = profile?.full_name?.split(" ")[0] ?? "Saif";

  return (
    <div className="min-h-screen bg-background">
      <DemoBanner />
      <Sidebar />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <TopBar userName={userName} />
        <main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8">{children}</main>
      </div>
      <MobileNav />
      <InstallPrompt />
    </div>
  );
}
