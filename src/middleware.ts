import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";
import { isDemoMode } from "@/lib/form-helpers";

const { auth } = NextAuth(authConfig);

const AUTH_PAGES = ["/login", "/signup"];

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/inbox",
  "/calendar",
  "/tasks",
  "/reminders",
  "/waiting-on",
  "/money",
  "/projects",
  "/ideas",
  "/goals",
  "/contacts",
  "/notes",
  "/documents",
  "/car",
  "/subscriptions",
  "/monthly-reset",
  "/straton",
  "/settings",
];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (isDemoMode()) {
    if (pathname === "/" || AUTH_PAGES.some((p) => pathname.startsWith(p))) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const isLoggedIn = Boolean(req.auth?.user?.id);
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));
  const isProtected =
    pathname === "/" ||
    PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (!isLoggedIn && isProtected) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname === "/" ? "/dashboard" : pathname);
    return NextResponse.redirect(url);
  }

  if (isLoggedIn && (isAuthPage || pathname === "/")) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
