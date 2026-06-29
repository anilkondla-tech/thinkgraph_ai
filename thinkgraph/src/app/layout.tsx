import type { Metadata } from "next";
import { Suspense } from "react";
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  // Unauthenticated visitors only see the demo site.
  // Authenticated users see their connected site(s).
  const userSites = session ? getUserSiteConnections() : [];
  const sites = session ? listSites(userSites) : [DEMO_SITE];
  return (
    <html lang="en">
      <body>
        <Providers>
          <Suspense fallback={null}>
            <Shell sites={sites} isAuthenticated={!!session}>{children}</Shell>
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
