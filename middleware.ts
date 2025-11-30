import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const session = req.cookies.get("session")?.value;
  const url = req.nextUrl.pathname;

  // מסכים שמותר להיכנס בלי התחברות
  if (
    url.startsWith("/login") ||
    url.startsWith("/reset-password") ||
    url.startsWith("/api/auth/login") ||
    url.startsWith("/api/auth/reset-password") ||
    url.startsWith("/api/auth/forgot-password")
  ) {
    return NextResponse.next();
  }

  // אם אין session – שולחים לדף login
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};
