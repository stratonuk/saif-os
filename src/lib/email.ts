import "server-only";

import { Resend } from "resend";
import { APP_NAME } from "@/lib/constants";

export async function sendLoginCodeEmail(to: string, code: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "JARVIS <onboarding@resend.dev>";

  if (!apiKey) {
    // Local/dev fallback — code is logged so you can still test without Resend
    console.info(`[auth] Login code for ${to}: ${code}`);
    return { ok: true as const, devLogged: true };
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to,
    subject: `${APP_NAME} sign-in code: ${code}`,
    text: `Your ${APP_NAME} sign-in code is ${code}.\n\nIt expires in 10 minutes. If you didn't request this, ignore this email.`,
    html: `
      <p>Your <strong>${APP_NAME}</strong> sign-in code is:</p>
      <p style="font-size:28px;font-weight:700;letter-spacing:4px">${code}</p>
      <p>It expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
    `,
  });

  if (error) {
    console.error("[auth] Resend error", error);
    return { ok: false as const, error: error.message };
  }

  return { ok: true as const, devLogged: false };
}
