import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSiteAnalytics } from "@/lib/data";
import { getUserSiteConnections } from "@/lib/userSites";
import { BarList, Donut, WeeklyTrend } from "@/components/charts";
import OrphanList from "@/components/OrphanList";
import ArticlesByCluster from "@/components/ArticlesByCluster";
import { PageHeader, ScoreRing, SourceBadge, Stat } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await getServerSession(authOptions);
  const site = typeof searchParams.site === "string" ? searchParams.site : undefined;

  // Unauthenticated visitors with no explicit site selected → show the landing page.
  // Passing ?site=demo (via the "Live demo" button) bypasses this redirect.
  if (!session && !site) {
    redirect("/login");
  }

  const userSites = await getUserSiteConnections();
  const a = await getSiteAnalytics(site, { userSites });
  const t = a.totals;

  // Group published nodes by category for the articles section
  const publishedNodes = a.graph.nodes.filter((n) => n.status === "publish");
  const clusterMap = new Map<string, typeof publishedNodes>();
  publishedNodes.forEach((n) => {
    const arr = clusterMap.get(n.category) ?? [];
    arr.push(n);
    clusterMap.set(n.category, arr);
  });
  const clusterGroups = Array.from(clusterMap.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .map(([category, nodes]) => ({ category, nodes }));

  const orphanNodes = a.graph.nodes.filter((n) => n.orphan && n.status === "publish");

  return (
    <div>
      <PageHeader
        title="Overview"
        subtitle={`Content-graph health for ${a.site.label}. ${t.publishedPosts} published posts mapped into ${t.categories} clusters.`}
        badge={<SourceBadge source={a.source} />}
      />

      {/* Top row: score + key stats */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="card card-pad flex flex-col items-center gap-4 sm:flex-row sm:gap-5 lg:col-span-1">
          <ScoreRing score={a.healthScore} />
          <div>
            <div className="label-muted">Graph Health</div>
            <p className="mt-1.5 text-[12px] leading-relaxed text-slate-500">
              Weighted by orphans, keyword coverage, and link density.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-3 lg:grid-cols-3 stagger">
          <Stat label="Published posts" value={t.publishedPosts} />
          <Stat
            label="Internal links"
            value={t.internalLinks}
            hint={`${(t.publishedPosts ? t.internalLinks / t.publishedPosts : 0).toFixed(2)} per post`}
          />
          <OrphanList orphans={orphanNodes} siteUrl={a.site.url} />
          <Stat
            label="Missing keywords"
            value={t.missingKeywords}
            tone={t.missingKeywords > 0 ? "warn" : "good"}
          />
          <Stat label="Clusters" value={t.categories} />
          <Stat label="Comments" value={t.comments} />
        </div>
      </div>

      {/* Charts */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card card-pad lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Publishing cadence</h3>
            <span className="label-muted">last 52 weeks</span>
          </div>
          <WeeklyTrend data={a.postsByWeek} />
        </div>
        <div className="card card-pad">
          <h3 className="mb-3 text-sm font-semibold text-white">Posts by status</h3>
          <Donut
            data={a.statusBreakdown
              .filter((s) => s.status !== "publish")
              .map((s) => ({ label: s.status, value: s.count }))}
          />
        </div>
      </div>

      {/* Content Quality */}
      <div className="section-header mt-10">
        <h2>Content Quality</h2>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 stagger">
        <Stat label="Avg word count" value={a.contentQuality.avgWordCount} hint={`Median: ${a.contentQuality.medianWordCount}`} />
        <Stat label="Thin content" value={a.contentQuality.thinContent} hint="< 300 words" tone={a.contentQuality.thinContent > 0 ? "warn" : "good"} />
        <Stat label="Missing featured images" value={a.contentQuality.missingFeaturedImages} tone={a.contentQuality.missingFeaturedImages > 0 ? "warn" : "good"} />
        <Stat label="Missing meta descriptions" value={a.contentQuality.missingMetaDescriptions} tone={a.contentQuality.missingMetaDescriptions > 0 ? "warn" : "good"} />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 stagger">
        <Stat label="Avg images / post" value={a.contentQuality.avgImages} />
        <Stat label="Stale content" value={a.freshness.staleCount} hint="> 12 months since update" tone={a.freshness.staleCount > 0 ? "warn" : "good"} />
        <Stat label="Evergreen ratio" value={`${Math.round(a.freshness.evergreenRatio * 100)}%`} hint="Updated within 6 months" tone={a.freshness.evergreenRatio >= 0.5 ? "good" : "warn"} />
      </div>

      {/* Engagement */}
      <div className="section-header mt-10">
        <h2>Engagement</h2>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 stagger">
        <Stat label="Avg comments / post" value={a.engagement.avgCommentsPerPost} />
        <Stat label="Approved comments" value={a.engagement.commentBreakdown.approved} tone="good" />
        <Stat label="Pending comments" value={a.engagement.commentBreakdown.pending} tone={a.engagement.commentBreakdown.pending > 0 ? "warn" : "default"} />
        <Stat label="Spam comments" value={a.engagement.commentBreakdown.spam} tone={a.engagement.commentBreakdown.spam > 10 ? "bad" : "default"} />
      </div>
      {a.engagement.topCommentedPosts.length > 0 && (
        <div className="mt-3 card card-pad">
          <h3 className="mb-4 text-sm font-semibold text-white">Most commented posts</h3>
          <BarList
            data={a.engagement.topCommentedPosts.map((p) => ({ label: p.label, value: p.count }))}
            valueLabel="comments"
          />
        </div>
      )}

      {/* Link Insights */}
      <div className="section-header mt-10">
        <h2>Link Insights</h2>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 stagger">
        <Stat label="Dead-end posts" value={a.linkInsights.deadEnds} hint="No outbound links" tone={a.linkInsights.deadEnds > 0 ? "warn" : "good"} />
        <Stat label="Cross-cluster links" value={a.linkInsights.crossClusterLinks} hint="Topical bridges" />
        <Stat label="Bi-directional links" value={a.linkInsights.biDirectionalLinks} hint="A↔B pairs" />
        <Stat label="Link reciprocity" value={`${Math.round(a.linkInsights.linkReciprocityRate * 100)}%`} />
      </div>

      {/* Author & Tag Analytics */}
      <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card card-pad">
          <h3 className="mb-4 text-sm font-semibold text-white">Author contributions</h3>
          <BarList
            data={a.authorStats.map((au) => ({ label: `${au.name} (${au.categories.length} topics)`, value: au.postCount }))}
            valueLabel="posts"
          />
        </div>
        <div className="card card-pad">
          <h3 className="mb-4 text-sm font-semibold text-white">Tag coverage</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="label-muted">Unique tags</div>
              <div className="mt-2 text-2xl font-semibold text-white data-value">{a.tagCoverage.totalTags}</div>
            </div>
            <div>
              <div className="label-muted">Untagged posts</div>
              <div className={`mt-2 text-2xl font-semibold data-value ${a.tagCoverage.postsWithoutTags > 0 ? "text-amber" : "text-white"}`}>
                {a.tagCoverage.postsWithoutTags}
              </div>
            </div>
            <div>
              <div className="label-muted">Over-tagged</div>
              <div className={`mt-2 text-2xl font-semibold data-value ${a.tagCoverage.overTaggedPosts > 0 ? "text-rose" : "text-white"}`}>
                {a.tagCoverage.overTaggedPosts}
              </div>
              <div className="mt-1 text-[11px] text-slate-600 font-mono">&gt; 10 tags</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card card-pad">
          <h3 className="mb-4 text-sm font-semibold text-white">Top clusters</h3>
          <BarList
            data={a.topCategories.map((c) => ({ label: c.category, value: c.count }))}
            valueLabel="posts"
          />
        </div>
        <div className="card card-pad flex flex-col">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Top recommendations</h3>
            <Link href={`/plan?site=${a.site.key}`} className="text-xs font-medium text-accent-soft hover:text-white transition">
              View all →
            </Link>
          </div>
          <ul className="flex-1 space-y-3">
            {a.actions.slice(0, 4).map((x) => (
              <li key={x.id} className="flex items-start gap-2.5">
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                    x.impact === "high" ? "bg-rose shadow-[0_0_6px_rgba(242,95,123,0.4)]" : x.impact === "medium" ? "bg-amber shadow-[0_0_6px_rgba(245,166,35,0.3)]" : "bg-slate-600"
                  }`}
                />
                <span className="text-sm text-slate-300">{x.title}</span>
              </li>
            ))}
            {a.actions.length === 0 && (
              <li className="text-sm text-slate-600">No issues detected — nice.</li>
            )}
          </ul>
        </div>
      </div>

      {/* Articles by Cluster */}
      <div className="mt-6">
        <ArticlesByCluster groups={clusterGroups} siteUrl={a.site.url} />
      </div>
    </div>
  );
}
