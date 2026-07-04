import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ req, token }) {
        const { pathname } = req.nextUrl;
        // Always allow: login page, NextAuth internals
        if (pathname === "/login") return true;
        // Onboarding requires authentication (connecting a real site)
        if (pathname.startsWith("/onboarding")) return !!token;
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
