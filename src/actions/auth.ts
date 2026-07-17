"use server";

import { hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/lib/auth";
import { getSql, hasDatabase } from "@/lib/db";
import { isDemoMode } from "@/lib/form-helpers";
import { loginSchema, signupSchema } from "@/lib/validations";

export async function login(formData: FormData) {
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

  try {
    await signIn("credentials", {
      email: parsed.data.email.trim().toLowerCase(),
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password" };
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

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Account created — please sign in" };
    }
    throw error;
  }
}

export async function logout() {
  if (!isDemoMode()) {
    await signOut({ redirect: false });
  }
  redirect("/login");
}

export async function revalidateAfterAuth() {
  revalidatePath("/", "layout");
}
