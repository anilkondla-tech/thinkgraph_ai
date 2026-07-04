import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getUserSiteConnections } from "@/lib/userSites";
import { DEMO_SITE } from "@/lib/seed";
import WorkspacesClient from "./WorkspacesClient";

export const dynamic = "force-dynamic";

export default async function WorkspacesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const raw = getUserSiteConnections();
  // Strip passwords before passing to the client component
  const safeSites = raw.map(({ password: _pw, ...rest }) => rest);

  return <WorkspacesClient demoSite={DEMO_SITE} userSites={safeSites} />;
}
