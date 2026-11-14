import { NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Cookie-based check: a logged-in user stays on private routes after reload.
export function middleware(req) {
  if (!getSessionCookie(req)) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
export const config = { matcher: ["/create", "/manage", "/joined", "/profile"] };
