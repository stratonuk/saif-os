import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { AppLogo } from "@/components/brand/app-logo";
import { APP_NAME } from "@/lib/constants";
import { isDemoMode } from "@/lib/form-helpers";

export default function LoginPage() {
  const demo = isDemoMode();
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <AppLogo size={56} className="rounded-2xl mb-4 mx-auto" />
          <h1 className="text-2xl font-semibold">{APP_NAME}</h1>
          <p className="text-muted-foreground mt-1">Sign in to your life OS</p>
        </div>
        <div className="glass-strong rounded-2xl p-8">
          <LoginForm />
          <p className="text-center text-sm text-muted-foreground mt-6">
            No account?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
          <p className="text-center text-xs text-muted-foreground mt-4">
            {demo
              ? "Demo mode: sign in with any email to explore sample data."
              : "Use the account you created on the sign-up page."}
          </p>
        </div>
      </div>
    </div>
  );
}
