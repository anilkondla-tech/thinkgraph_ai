import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Forward the pathname as a REQUEST header so server components can read
    // it via headers().get("x-pathname"). Setting it on the response headers
    // does NOT work — Next.js server components read request headers only.
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-pathname", req.nextUrl.pathname);
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  },
  {
    callbacks: {
      authorized({ req, token }) {
        const { pathname } = req.nextUrl;
        // Always allow: login page, NextAuth internals
        if (pathname === "/login") return true;
        // Onboarding and workspaces require authentication
        if (pathname.startsWith("/onboarding") || pathname.startsWith("/workspaces")) return !!token;
        // All other routes are publicly accessible — unauthenticated visitors
        // see the demo workspace; layout.tsx handles the data accordingly.
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon\\.ico).*)"],
};
