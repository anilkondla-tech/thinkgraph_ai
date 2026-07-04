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
