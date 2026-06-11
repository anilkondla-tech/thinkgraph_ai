import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import Shell from "@/components/Shell";
import { listSites } from "@/lib/data";

export const metadata: Metadata = {
  title: "ThinkGraph AI — Content Knowledge Graph",
  description:
    "See your content as a living knowledge graph. AI-ranked actions for topical authority, internal linking, and AEO.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sites = listSites();
  return (
    <html lang="en">
      <body>
        <Suspense fallback={null}>
          <Shell sites={sites}>{children}</Shell>
        </Suspense>
      </body>
    </html>
  );
}
