import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/lib/auth.config";
import { getSql, hasDatabase } from "@/lib/db";
import { verifyTwoFactorToken } from "@/lib/security";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        twoFactorToken: { label: "2FA Token", type: "text" },
      },
      async authorize(credentials) {
        if (!hasDatabase()) return null;
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const twoFactorToken = String(credentials?.twoFactorToken ?? "");
        if (!email || !twoFactorToken) return null;

        const verified = verifyTwoFactorToken(twoFactorToken);
        if (!verified || verified.email !== email) return null;

        const db = getSql();
        const rows = await db`
          SELECT id, email, full_name, pin_hash
          FROM users
          WHERE id = ${verified.userId} AND email = ${email}
          LIMIT 1
        `;
        const user = rows[0] as
          | { id: string; email: string; full_name: string; pin_hash: string | null }
          | undefined;
        if (!user) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.full_name || user.email.split("@")[0],
          pinSet: Boolean(user.pin_hash),
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
        token.pinSet = Boolean((user as { pinSet?: boolean }).pinSet);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.email = (token.email as string) ?? session.user.email;
        session.user.name = (token.name as string) ?? session.user.name;
        (session.user as { pinSet?: boolean }).pinSet = Boolean(token.pinSet);
      }
      return session;
    },
  },
});
