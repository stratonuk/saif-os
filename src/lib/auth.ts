import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { authConfig } from "@/lib/auth.config";
import { getSql, hasDatabase } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!hasDatabase()) return null;
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        const db = getSql();
        const rows = await db`
          SELECT id, email, full_name, password_hash
          FROM users
          WHERE email = ${email}
          LIMIT 1
        `;
        const user = rows[0] as
          | { id: string; email: string; full_name: string; password_hash: string }
          | undefined;
        if (!user) return null;

        const ok = await compare(password, user.password_hash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.full_name || user.email.split("@")[0],
        };
      },
    }),
  ],
});
