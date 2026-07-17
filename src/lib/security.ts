import "server-only";

import { createHmac, randomInt, timingSafeEqual } from "crypto";
import { hash, compare } from "bcryptjs";

export function generateOtpCode() {
  return String(randomInt(100000, 999999));
}

export async function hashSecret(value: string) {
  return hash(value, 12);
}

export async function verifySecret(value: string, valueHash: string) {
  return compare(value, valueHash);
}

/** Short-lived token proving email 2FA passed — used by Auth.js authorize. */
export function createTwoFactorToken(email: string, userId: string) {
  const secret = process.env.AUTH_SECRET ?? "dev-only-auth-secret";
  const exp = Date.now() + 5 * 60 * 1000;
  const payload = `${email}:${userId}:${exp}`;
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  return Buffer.from(`${payload}:${sig}`).toString("base64url");
}

export function verifyTwoFactorToken(token: string): { email: string; userId: string } | null {
  try {
    const secret = process.env.AUTH_SECRET ?? "dev-only-auth-secret";
    const raw = Buffer.from(token, "base64url").toString("utf8");
    const [email, userId, expStr, sig] = raw.split(":");
    if (!email || !userId || !expStr || !sig) return null;
    if (Date.now() > Number(expStr)) return null;
    const payload = `${email}:${userId}:${expStr}`;
    const expected = createHmac("sha256", secret).update(payload).digest("hex");
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    return { email, userId };
  } catch {
    return null;
  }
}
