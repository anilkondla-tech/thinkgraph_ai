import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSiteAnalytics } from "@/lib/data";
import { getUserSiteConnections } from "@/lib/userSites";
import { BarList, Donut, WeeklyTrend } from "@/components/charts";
import AiInsight from "@/components/AiInsight";
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

  return (
    <div>
      <PageHeader
        title="Overview"
        subtitle={`Content-graph health for ${a.site.label}. ${t.publishedPosts} published posts mapped into ${t.categories} clusters.`}
        badge={<SourceBadge source={a.source} />}
      />

      {/* Top row: score + key stats */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="card card-pad flex items-center gap-5 lg:col-span-1">
          <ScoreRing score={a.healthScore} />
          <div>
            <div className="label-muted">Graph health</div>
            <p className="mt-1 text-sm text-slate-400">
              Weighted by orphans, keyword coverage, and internal-link density.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:col-span-3 lg:grid-cols-3">
          <Stat label="Published posts" value={t.publishedPosts} />
          <Stat
            label="Internal links"
            value={t.internalLinks}
            hint={`${(t.publishedPosts ? t.internalLinks / t.publishedPosts : 0).toFixed(2)} per post`}
          />
          <Stat
            label="Orphan posts"
            value={t.orphans}
            tone={t.orphans > 0 ? "bad" : "good"}
            hint="No inbound internal links"
          />
          <Stat
            label="Missing keywords"
            value={t.missingKeywords}
            tone={t.missingKeywords > 0 ? "warn" : "good"}
          />
          <Stat label="Clusters" value={t.categories} />
          <Stat label="Comments" value={t.comments} />
        </div>
      </div>

      {/* AI insight */}
      <div className="mt-4">
        <AiInsight
          siteKey={a.site.key}
          aiEnabled={a.aiEnabled}
          initialInsight={a.aiInsight}
        />
      </div>

      {/* Charts */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
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
            data={a.statusBreakdown.map((s) => ({ label: s.status, value: s.count }))}
          />
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
            <Link href={`/plan?site=${a.site.key}`} className="text-xs text-accent-soft hover:text-white">
              View all →
            </Link>
          </div>
          <ul className="flex-1 space-y-2.5">
            {a.actions.slice(0, 4).map((x) => (
              <li key={x.id} className="flex items-start gap-2.5">
                <span
                  className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                    x.impact === "high" ? "bg-rose" : x.impact === "medium" ? "bg-amber" : "bg-slate-500"
                  }`}
                />
                <span className="text-sm text-slate-300">{x.title}</span>
              </li>
            ))}
            {a.actions.length === 0 && (
              <li className="text-sm text-slate-500">No issues detected — nice.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
