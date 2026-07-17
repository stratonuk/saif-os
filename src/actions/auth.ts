"use server";

import { hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { compare } from "bcryptjs";
import { signIn, signOut, auth } from "@/lib/auth";
import { getSql, hasDatabase } from "@/lib/db";
import { sendLoginCodeEmail } from "@/lib/email";
import { isDemoMode } from "@/lib/form-helpers";
import {
  createTwoFactorToken,
  generateOtpCode,
  hashSecret,
  verifySecret,
} from "@/lib/security";
import { loginSchema, signupSchema } from "@/lib/validations";

export async function startLogin(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Invalid email or password" };
  }

  if (isDemoMode()) {
    redirect("/dashboard");
  }

  if (!hasDatabase()) {
    return { error: "Database is not configured" };
  }

  const email = parsed.data.email.trim().toLowerCase();
  const db = getSql();
  const rows = await db`
    SELECT id, email, password_hash
    FROM users
    WHERE email = ${email}
    LIMIT 1
  `;
  const user = rows[0] as
    | { id: string; email: string; password_hash: string }
    | undefined;

  if (!user || !(await compare(parsed.data.password, user.password_hash))) {
    return { error: "Invalid email or password" };
  }

  const code = generateOtpCode();
  const code_hash = await hashSecret(code);
  const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const inserted = await db`
    INSERT INTO login_challenges (user_id, email, code_hash, expires_at)
    VALUES (${user.id}, ${email}, ${code_hash}, ${expires_at})
    RETURNING id
  `;
  const challengeId = (inserted[0] as { id: string }).id;

  const sent = await sendLoginCodeEmail(email, code);
  if (!sent.ok) {
    return { error: "Could not send verification email. Check RESEND_API_KEY." };
  }

  return {
    success: true,
    challengeId,
    email,
    devCode: sent.devLogged ? code : undefined,
  };
}

export async function verifyLoginCode(formData: FormData) {
  const challengeId = String(formData.get("challengeId") ?? "");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const code = String(formData.get("code") ?? "").trim();

  if (!challengeId || !email || code.length !== 6) {
    return { error: "Enter the 6-digit code from your email" };
  }

  if (isDemoMode()) {
    redirect("/dashboard");
  }

  const db = getSql();
  const rows = await db`
    SELECT id, user_id, email, code_hash, expires_at, consumed_at
    FROM login_challenges
    WHERE id = ${challengeId} AND email = ${email}
    LIMIT 1
  `;
  const challenge = rows[0] as
    | {
        id: string;
        user_id: string;
        email: string;
        code_hash: string;
        expires_at: string;
        consumed_at: string | null;
      }
    | undefined;

  if (!challenge || challenge.consumed_at) {
    return { error: "This code is invalid or already used" };
  }
  if (new Date(challenge.expires_at).getTime() < Date.now()) {
    return { error: "This code has expired — sign in again" };
  }
  if (!(await verifySecret(code, challenge.code_hash))) {
    return { error: "Incorrect code" };
  }

  await db`
    UPDATE login_challenges
    SET consumed_at = now()
    WHERE id = ${challenge.id}
  `;

  const twoFactorToken = createTwoFactorToken(email, challenge.user_id);

  const pinRows = await db`
    SELECT pin_hash FROM users WHERE id = ${challenge.user_id} LIMIT 1
  `;
  const pinSet = Boolean((pinRows[0] as { pin_hash: string | null } | undefined)?.pin_hash);
  const redirectTo = pinSet ? "/dashboard" : "/login/setup-pin";

  try {
    await signIn("credentials", {
      email,
      twoFactorToken,
      redirectTo,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Could not complete sign-in" };
    }
    throw error;
  }
}

export async function signup(formData: FormData) {
  const parsed = signupSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Please check your details" };
  }

  if (isDemoMode()) {
    redirect("/dashboard");
  }

  if (!hasDatabase()) {
    return { error: "Database is not configured" };
  }

  const email = parsed.data.email.trim().toLowerCase();
  const db = getSql();

  const existing = await db`
    SELECT id FROM users WHERE email = ${email} LIMIT 1
  `;
  if (existing.length > 0) {
    return { error: "An account with this email already exists" };
  }

  const password_hash = await hash(parsed.data.password, 12);
  const full_name = parsed.data.full_name.trim();

  const inserted = await db`
    INSERT INTO users (email, password_hash, full_name)
    VALUES (${email}, ${password_hash}, ${full_name})
    RETURNING id
  `;
  const userId = (inserted[0] as { id: string }).id;

  await db`
    INSERT INTO profiles (id, email, full_name)
    VALUES (${userId}, ${email}, ${full_name})
  `;

  // After signup, send a one-time code then complete login (same 2FA path)
  const code = generateOtpCode();
  const code_hash = await hashSecret(code);
  const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  const challenge = await db`
    INSERT INTO login_challenges (user_id, email, code_hash, expires_at)
    VALUES (${userId}, ${email}, ${code_hash}, ${expires_at})
    RETURNING id
  `;
  const challengeId = (challenge[0] as { id: string }).id;
  const sent = await sendLoginCodeEmail(email, code);
  if (!sent.ok) {
    return { error: "Account created, but email failed. Try signing in." };
  }

  return {
    success: true,
    challengeId,
    email,
    needsVerification: true,
    devCode: sent.devLogged ? code : undefined,
  };
}

export async function setupPin(formData: FormData) {
  const pin = String(formData.get("pin") ?? "").trim();
  const confirm = String(formData.get("confirm") ?? "").trim();

  if (!/^\d{4,6}$/.test(pin)) {
    return { error: "PIN must be 4–6 digits" };
  }
  if (pin !== confirm) {
    return { error: "PINs do not match" };
  }

  if (isDemoMode()) {
    redirect("/dashboard");
  }

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: "Not authenticated" };

  const pin_hash = await hashSecret(pin);
  const db = getSql();
  await db`UPDATE users SET pin_hash = ${pin_hash}, updated_at = now() WHERE id = ${userId}`;

  redirect("/dashboard");
}

export async function changePin(formData: FormData) {
  const current = String(formData.get("current") ?? "").trim();
  const pin = String(formData.get("pin") ?? "").trim();
  const confirm = String(formData.get("confirm") ?? "").trim();

  if (!/^\d{4,6}$/.test(pin)) {
    return { error: "PIN must be 4–6 digits" };
  }
  if (pin !== confirm) {
    return { error: "PINs do not match" };
  }

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: "Not authenticated" };

  const db = getSql();
  const rows = await db`SELECT pin_hash FROM users WHERE id = ${userId} LIMIT 1`;
  const pinHash = (rows[0] as { pin_hash: string | null } | undefined)?.pin_hash;
  if (pinHash && !(await verifySecret(current, pinHash))) {
    return { error: "Current PIN is incorrect" };
  }

  const pin_hash = await hashSecret(pin);
  await db`UPDATE users SET pin_hash = ${pin_hash}, updated_at = now() WHERE id = ${userId}`;
  revalidatePath("/settings");
  return { success: true };
}

export async function verifySessionPin(formData: FormData) {
  const pin = String(formData.get("pin") ?? "").trim();
  if (!/^\d{4,6}$/.test(pin)) {
    return { error: "Enter your PIN" };
  }

  if (isDemoMode()) {
    return { success: true };
  }

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: "Not authenticated" };

  const db = getSql();
  const rows = await db`SELECT pin_hash FROM users WHERE id = ${userId} LIMIT 1`;
  const pinHash = (rows[0] as { pin_hash: string | null } | undefined)?.pin_hash;
  if (!pinHash) {
    return { needsSetup: true };
  }
  if (!(await verifySecret(pin, pinHash))) {
    return { error: "Incorrect PIN" };
  }
  return { success: true };
}

export async function getPinStatus() {
  if (isDemoMode()) return { pinSet: false, demo: true };
  const session = await auth();
  if (!session?.user?.id) return { pinSet: false, demo: false };
  const db = getSql();
  const rows = await db`SELECT pin_hash FROM users WHERE id = ${session.user.id} LIMIT 1`;
  return {
    pinSet: Boolean((rows[0] as { pin_hash: string | null } | undefined)?.pin_hash),
    demo: false,
  };
}

/** @deprecated use startLogin — kept for any old imports */
export async function login(formData: FormData) {
  return startLogin(formData);
}

export async function logout() {
  if (!isDemoMode()) {
    await signOut({ redirect: false });
  }
  redirect("/login");
}
