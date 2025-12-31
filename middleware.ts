import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decryptSession } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const sessionCookie = req.cookies.get("session")?.value;
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
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // אימות ה-Token
  try {
    await decryptSession(sessionCookie);
    return NextResponse.next();
  } catch (err) {
    // אם ה-Token לא תקין (זויף או פג תוקף), מוחקים אותו ושולחים ל-Login
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.delete("session");
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};
