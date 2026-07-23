import { getSiteAnalytics } from "@/lib/data";
import { getUserSiteConnections } from "@/lib/userSites";
import { PageHeader, SourceBadge, HealthPill, EmptyHint } from "@/components/ui";

export const dynamic = "force-dynamic";

function metric(label: string, value: string | number, warn?: boolean) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 font-mono">
        {label}
      </div>
      <div className={`text-lg font-semibold data-value ${warn ? "text-rose" : "text-white"}`}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
    </div>
  );
}

export default async function ClustersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const site = typeof searchParams.site === "string" ? searchParams.site : undefined;
  const userSites = await getUserSiteConnections();
  const a = await getSiteAnalytics(site, { userSites });
  const thin = a.clusters.filter((c) => c.health === "thin").length;

  return (
    <div>
      <PageHeader
        title="Clusters & Gaps"
        subtitle={`${a.clusters.length} topic clusters. ${thin} are thin and likely losing topical authority. Density = internal links ÷ posts within the cluster.`}
        badge={<SourceBadge source={a.source} />}
      />

      {a.clusters.length === 0 ? (
        <EmptyHint>No categories found for this site.</EmptyHint>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 stagger">
          {a.clusters.map((c) => (
            <div key={c.category} className="card card-pad">
              <div className="mb-4 flex items-start justify-between gap-2">
                <h3 className="text-base font-semibold leading-snug text-white">
                  {c.category}
                </h3>
                <HealthPill health={c.health} />
              </div>

              <div className="grid grid-cols-2 gap-y-4">
                {metric("Posts", c.postCount)}
                {metric("Internal links", c.internalLinks)}
                {metric("Link density", c.linkDensity, c.linkDensity < 0.5)}
                {metric("Orphans", c.orphanCount, c.orphanCount > 0)}
                {metric("Dead ends", c.deadEndCount, c.deadEndCount > 0)}
                {metric("Missing keywords", c.missingKeywordCount, c.missingKeywordCount > 0)}
              </div>

              {/* density bar */}
              <div className="mt-4">
                <div className="h-1 overflow-hidden rounded-full bg-surface">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, c.linkDensity * 50)}%`,
                      background: "linear-gradient(90deg, #5E6AD2, #3EDBC2)",
                      boxShadow: "0 0 8px rgba(94, 106, 210, 0.3)",
                    }}
                  />
                </div>
              </div>

              {c.health === "thin" && (
                <p className="mt-3 rounded-xl bg-rose/[0.06] border border-rose/10 px-3 py-2 text-xs text-rose">
                  Thin cluster — add pillar + supporting posts to build authority.
                </p>
              )}
              {c.health === "crowded" && (
                <p className="mt-3 rounded-xl bg-amber/[0.06] border border-amber/10 px-3 py-2 text-xs text-amber">
                  Large but loosely linked — add internal links to consolidate authority.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
