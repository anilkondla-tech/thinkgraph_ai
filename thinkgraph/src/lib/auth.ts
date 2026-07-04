import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

if (!process.env.NEXTAUTH_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("NEXTAUTH_SECRET environment variable is not set. Add it in your Vercel dashboard.");
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.email) token.email = user.email;
      // Mark first-time sign-ins so the redirect callback can forward to onboarding
      if (user) token.isNewSignIn = true;
      return token;
    },
    async session({ session }) {
      return session;
    },
    async redirect({ url, baseUrl }) {
      // After sign-in, send users to /workspaces to see and manage their workspaces.
      // If a specific internal callbackUrl was requested (not just root), honour it.
      if (url === baseUrl || url === `${baseUrl}/`) {
        return `${baseUrl}/workspaces`;
      }
      // Allow relative redirects within the same origin
      if (url.startsWith(baseUrl)) return url;
      return `${baseUrl}/workspaces`;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
