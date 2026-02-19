import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const protectedPrefixes = ["/chat", "/categories", "/home"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSessionCookie = Boolean(getSessionCookie(request));

  if (protectedPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    if (!hasSessionCookie) {
      const url = new URL("/signin", request.url);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/chat/:path*", "/categories/:path*", "/home/:path*"],
};
