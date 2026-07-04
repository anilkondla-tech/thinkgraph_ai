import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const res = NextResponse.next();
    // Let the root layout know the current pathname so it can skip the
    // Shell for pages that have their own full-page layout (login, onboarding).
    res.headers.set("x-pathname", req.nextUrl.pathname);
    return res;
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
