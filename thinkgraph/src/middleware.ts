import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ req, token }) {
        const { pathname, searchParams } = req.nextUrl;
        // Always allow: login page, NextAuth internals
        if (pathname === "/login") return true;
        // Allow demo mode without sign-in
        if (searchParams.get("demo") === "true") return true;
        // Require a valid JWT session for everything else
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon\\.ico).*)"],
};
