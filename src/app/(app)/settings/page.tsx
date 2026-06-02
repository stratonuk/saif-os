import { getProfile } from "@/lib/data";
import { SettingsPageClient } from "@/components/settings/settings-page-client";

export default async function SettingsPage() {
  const profile = await getProfile();
  return <SettingsPageClient profile={profile} />;
}
