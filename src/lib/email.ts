import "server-only";

import { Resend } from "resend";
import { APP_NAME } from "@/lib/constants";

export type SendEmailResult =
  | { ok: true; devLogged: boolean }
  | { ok: false; error: string; code?: string };

export async function sendLoginCodeEmail(to: string, code: string): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim() || "JARVIS <onboarding@resend.dev>";

  if (!apiKey) {
    console.info(`[auth] Login code for ${to}: ${code}`);
    return { ok: true, devLogged: true };
  }

  try {
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
      const message =
        typeof error === "object" && error && "message" in error
          ? String((error as { message: string }).message)
          : String(error);
      console.error("[auth] Resend error", error);
      console.info(`[auth] Fallback login code for ${to}: ${code}`);
      // Don't block sign-in — show code on verify screen when email delivery fails
      return {
        ok: false,
        error: message,
        code,
      };
    }

    return { ok: true, devLogged: false };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Email send failed";
    console.error("[auth] Resend exception", e);
    console.info(`[auth] Fallback login code for ${to}: ${code}`);
    return { ok: false, error: message, code };
  }
}
