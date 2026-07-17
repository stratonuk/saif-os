import { AppLogo } from "@/components/brand/app-logo";
import { SetupPinForm } from "@/components/auth/setup-pin-form";
import { APP_NAME } from "@/lib/constants";

export default function SetupPinPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <AppLogo size={56} className="rounded-2xl mb-4 mx-auto" />
          <h1 className="text-2xl font-semibold">Set your session PIN</h1>
          <p className="text-muted-foreground mt-1">Required for {APP_NAME} unlock</p>
        </div>
        <div className="glass-strong rounded-2xl p-8">
          <SetupPinForm />
        </div>
      </div>
    </div>
  );
}
