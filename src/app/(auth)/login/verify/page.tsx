import Link from "next/link";
import { AppLogo } from "@/components/brand/app-logo";
import { VerifyOtpForm } from "@/components/auth/verify-otp-form";
import { APP_NAME } from "@/lib/constants";

export default async function VerifyLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ challengeId?: string; email?: string; devCode?: string }>;
}) {
  const params = await searchParams;
  const challengeId = params.challengeId ?? "";
  const email = params.email ?? "";

  if (!challengeId || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Missing verification details.</p>
          <Link href="/login" className="text-primary hover:underline text-sm">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <AppLogo size={56} className="rounded-2xl mb-4 mx-auto" />
          <h1 className="text-2xl font-semibold">Check your email</h1>
          <p className="text-muted-foreground mt-1">{APP_NAME} two-factor code</p>
        </div>
        <div className="glass-strong rounded-2xl p-8">
          <VerifyOtpForm
            challengeId={challengeId}
            email={email}
            devCode={params.devCode}
          />
          <p className="text-center text-sm text-muted-foreground mt-6">
            <Link href="/login" className="text-primary hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
