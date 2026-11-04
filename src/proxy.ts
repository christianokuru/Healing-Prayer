import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/config";

// A cheap first check only (prd.md section 5): no session cookie means straight to login.
// The real checks are the server guards in the layouts and the backend itself.
export function proxy(request: NextRequest) {
  if (request.cookies.has(SESSION_COOKIE)) return NextResponse.next();
  const { pathname, search } = request.nextUrl;
  const login = new URL("/login", request.url);
  login.searchParams.set("next", pathname + search);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
