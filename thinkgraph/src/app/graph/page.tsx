import { getSiteAnalytics } from "@/lib/data";
import { getUserSiteConnections } from "@/lib/userSites";
import GraphCanvas from "@/components/GraphCanvas";
import { PageHeader, SourceBadge, Stat, EmptyHint } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function GraphPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const site = typeof searchParams.site === "string" ? searchParams.site : undefined;
  const userSites = await getUserSiteConnections();
  const a = await getSiteAnalytics(site, { userSites });

  return (
    <div>
      <PageHeader
        title="Content Graph"
        subtitle="Every post is a node; edges are internal links. Red nodes are orphans. Clusters are colored by category — node size reflects inbound links."
        badge={<SourceBadge source={a.source} />}
      />

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Nodes" value={a.graph.nodes.length} />
        <Stat label="Edges" value={a.graph.edges.length} />
        <Stat label="Orphans" value={a.totals.orphans} tone={a.totals.orphans ? "bad" : "good"} />
        <Stat label="Clusters" value={a.totals.categories} />
      </div>

      {a.graph.nodes.length ? (
        <GraphCanvas
          nodes={a.graph.nodes}
          edges={a.graph.edges}
          siteUrl={a.site.url}
        />
      ) : (
        <EmptyHint>No posts found for this site.</EmptyHint>
      )}
    </div>
  );
}
