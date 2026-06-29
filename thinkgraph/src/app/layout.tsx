import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import Shell from "@/components/Shell";
import Providers from "@/components/Providers";
import { listSites } from "@/lib/data";
import { getUserSiteConnections } from "@/lib/userSites";

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
  const userSites = getUserSiteConnections();
  const sites = listSites(userSites);
  return (
    <html lang="en">
      <body>
        <Providers>
          <Suspense fallback={null}>
            <Shell sites={sites}>{children}</Shell>
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
