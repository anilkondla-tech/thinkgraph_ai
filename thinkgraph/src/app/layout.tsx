import type { Metadata } from "next";
import { Suspense } from "react";
import { headers } from "next/headers";
import "./globals.css";
import Shell from "@/components/Shell";
import Providers from "@/components/Providers";
import { listSites } from "@/lib/data";
import { getUserSiteConnections } from "@/lib/userSites";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DEMO_SITE } from "@/lib/seed";

export const metadata: Metadata = {
  title: "ThinkGraph AI — Content Knowledge Graph",
  description:
    "See your content as a living knowledge graph. AI-ranked actions for topical authority, internal linking, and AEO.",
};

// Pages that have their own full-page layout — skip the Shell for these.
const BARE_ROUTES = ["/login", "/onboarding"];

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = headers().get("x-pathname") ?? "";
  const isBare = BARE_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));

  const session = await getServerSession(authOptions);
  const userSites = !isBare && session ? await getUserSiteConnections() : [];
  const sites = !isBare && session ? listSites(userSites) : [DEMO_SITE];

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" href="/icon-192.png" sizes="192x192" type="image/png" />
        <link rel="icon" href="/icon-512.png" sizes="512x512" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          {isBare ? (
            children
          ) : (
            <Suspense fallback={null}>
              <Shell sites={sites} isAuthenticated={!!session}>
                {children}
              </Shell>
            </Suspense>
          )}
        </Providers>
      </body>
    </html>
  );
}
