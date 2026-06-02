import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";
import { APP_NAME } from "@/lib/constants";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-2xl font-bold text-white mb-4">
            S
          </div>
          <h1 className="text-2xl font-semibold">Join {APP_NAME}</h1>
          <p className="text-muted-foreground mt-1">Create your personal dashboard</p>
        </div>
        <div className="glass-strong rounded-2xl p-8">
          <SignupForm />
          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
