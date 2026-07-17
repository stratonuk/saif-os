import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      pinSet?: boolean;
    };
  }

  interface User {
    pinSet?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    pinSet?: boolean;
  }
}
