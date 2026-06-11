import type {
  ActionItem,
  Cluster,
  GraphEdge,
  GraphNode,
  SiteAnalytics,
  SiteMeta,
} from "./types";
import type { RawSite } from "./queries";

const HREF_RE = /href=["']([^"']+)["']/gi;
const PERMALINK_ID_RE = /[?&]p=(\d+)/;

function lastSegment(pathname: string): string {
  return pathname.split("/").filter(Boolean).pop() ?? "";
}

/** Extract on-site internal links between known posts from post_content. */
function buildEdges(
  posts: RawSite["posts"],
  siteUrl: string
): GraphEdge[] {
  const slugToId = new Map<string, number>();
  const ids = new Set<number>();
  posts.forEach((p) => {
    ids.add(p.id);
    if (p.slug) slugToId.set(p.slug.toLowerCase(), p.id);
  });

  let host = "";
  try {
    host = new URL(siteUrl).host.replace(/^www\./, "");
  } catch {
    host = "";
  }

  const seen = new Set<string>();
  const edges: GraphEdge[] = [];

  for (const post of posts) {
    if (!post.content) continue;
    let m: RegExpExecArray | null;
    HREF_RE.lastIndex = 0;
    while ((m = HREF_RE.exec(post.content)) !== null) {
      const raw = m[1].trim();
      if (!raw || raw.startsWith("#") || raw.startsWith("mailto:")) continue;

      let targetId: number | undefined;
      const idMatch = raw.match(PERMALINK_ID_RE);
      if (idMatch) {
        const id = Number(idMatch[1]);
        if (ids.has(id)) targetId = id;
      }

      if (targetId === undefined) {
        let pathname = raw;
        const isAbsolute = raw.includes("://");
        if (isAbsolute) {
          try {
            const u = new URL(raw);
            if (host && u.host.replace(/^www\./, "") !== host) continue;
            pathname = u.pathname;
          } catch {
            continue;
          }
        } else if (!raw.startsWith("/")) {
          continue; // not relative, not absolute-on-site
        }
        const slug = lastSegment(pathname).toLowerCase();
        if (slug) targetId = slugToId.get(slug);
      }

      if (targetId !== undefined && targetId !== post.id) {
        const key = `${post.id}->${targetId}`;
        if (!seen.has(key)) {
          seen.add(key);
          edges.push({ source: String(post.id), target: String(targetId) });
        }
      }
    }
  }
  return edges;
}

function isoWeekStart(dateIso: string): string {
  const d = new Date(dateIso);
  const day = (d.getUTCDay() + 6) % 7; // Monday=0
  d.setUTCDate(d.getUTCDate() - day);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export function analyzeSite(
  site: SiteMeta,
  raw: RawSite,
  source: "live" | "demo",
  aiEnabled: boolean
): SiteAnalytics {
  const { posts, authors, categoriesByPost, keywordByPost } = raw;

  const edges = buildEdges(posts, site.url);

  const inDeg = new Map<string, number>();
  const outDeg = new Map<string, number>();
  edges.forEach((e) => {
    outDeg.set(e.source, (outDeg.get(e.source) ?? 0) + 1);
    inDeg.set(e.target, (inDeg.get(e.target) ?? 0) + 1);
  });

  const nodes: GraphNode[] = posts.map((p) => {
    const cats = categoriesByPost.get(p.id) ?? [];
    const id = String(p.id);
    const inb = inDeg.get(id) ?? 0;
    return {
      id,
      label: p.title,
      slug: p.slug,
      category: cats[0] ?? "Uncategorized",
      keyword: keywordByPost.get(p.id) ?? null,
      author: authors.get(p.author_id) ?? "Unknown",
      status: p.status,
      date: p.date,
      inDegree: inb,
      outDegree: outDeg.get(id) ?? 0,
      orphan: inb === 0,
    };
  });

  // Clusters by primary category
  const byCat = new Map<string, GraphNode[]>();
  nodes.forEach((n) => {
    const list = byCat.get(n.category) ?? [];
    list.push(n);
    byCat.set(n.category, list);
  });

  const clusters: Cluster[] = Array.from(byCat.entries())
    .map(([category, group]) => {
      const ids = new Set(group.map((n) => n.id));
      const internalLinks = edges.filter(
        (e) => ids.has(e.source) && ids.has(e.target)
      ).length;
      const orphanCount = group.filter((n) => n.orphan).length;
      const missingKeywordCount = group.filter((n) => !n.keyword).length;
      const postCount = group.length;
      const linkDensity = postCount ? +(internalLinks / postCount).toFixed(2) : 0;
      const health: Cluster["health"] =
        postCount < 5 ? "thin" : postCount > 45 && linkDensity < 1 ? "crowded" : "healthy";
      return {
        category,
        postCount,
        internalLinks,
        linkDensity,
        orphanCount,
        missingKeywordCount,
        health,
      };
    })
    .sort((a, b) => b.postCount - a.postCount);

  // Totals & health score
  const publishedPosts = nodes.length;
  const orphans = nodes.filter((n) => n.orphan).length;
  const missingKeywords = nodes.filter((n) => !n.keyword).length;
  const orphanRatio = publishedPosts ? orphans / publishedPosts : 0;
  const kwRatio = publishedPosts ? missingKeywords / publishedPosts : 0;
  const avgDensity = publishedPosts ? edges.length / publishedPosts : 0;
  const linkPenalty = Math.max(0, 1 - avgDensity) * 20;
  const healthScore = Math.max(
    0,
    Math.min(100, Math.round(100 - orphanRatio * 40 - kwRatio * 30 - linkPenalty))
  );

  // Posts by week (last 52)
  const weekMap = new Map<string, number>();
  nodes.forEach((n) => {
    const w = isoWeekStart(n.date);
    weekMap.set(w, (weekMap.get(w) ?? 0) + 1);
  });
  const postsByWeek = Array.from(weekMap.entries())
    .map(([week, count]) => ({ week, count }))
    .sort((a, b) => a.week.localeCompare(b.week))
    .slice(-52);

  const topCategories = clusters
    .slice(0, 10)
    .map((c) => ({ category: c.category, count: c.postCount }));

  const actions = buildRuleActions(nodes, clusters, site);

  return {
    site,
    source,
    generatedAt: new Date().toISOString(),
    totals: {
      posts: raw.totalPosts,
      publishedPosts,
      comments: raw.totalComments,
      categories: clusters.length,
      authors: new Set(nodes.map((n) => n.author)).size,
      orphans,
      missingKeywords,
      internalLinks: edges.length,
    },
    healthScore,
    statusBreakdown: raw.statusCounts,
    postsByWeek,
    clusters,
    graph: { nodes, edges },
    topCategories,
    actions,
    aiInsight: null,
    aiEnabled,
  };
}

function articleUrl(site: SiteMeta, slug: string, id: string): string {
  const base = site.url?.replace(/\/$/, "");
  if (base && slug) return `${base}/${slug}/`;
  if (base) return `${base}/?p=${id}`;
  return `#${id}`;
}

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "for", "to", "of", "in", "on", "with",
  "your", "you", "how", "what", "why", "is", "are", "be", "best", "top",
  "guide", "vs", "from", "by", "this", "that", "it", "as", "at",
]);

/** Significant lowercase word tokens from a post's title + focus keyword. */
function topicTokens(node: GraphNode): Set<string> {
  const text = `${node.label} ${node.keyword ?? ""}`.toLowerCase();
  const words = text.replace(/[^a-z0-9\s]/g, " ").split(/\s+/);
  return new Set(words.filter((w) => w.length > 2 && !STOP_WORDS.has(w)));
}

function tokenOverlap(a: Set<string>, b: Set<string>): number {
  let n = 0;
  a.forEach((w) => {
    if (b.has(w)) n += 1;
  });
  return n;
}

/**
 * For an orphan, rank the best existing posts to add an inbound link *from*.
 * Relevance = same category + title/keyword overlap; tie-break toward
 * well-connected, non-orphan hubs (their link equity actually reaches the orphan).
 */
function suggestLinkSources(
  orphan: GraphNode,
  nodes: GraphNode[],
  tokensById: Map<string, Set<string>>,
  limit = 3
): GraphNode[] {
  const orphanTokens = tokensById.get(orphan.id) ?? new Set<string>();
  return nodes
    .filter((n) => n.id !== orphan.id)
    .map((n) => {
      const sameCategory = n.category === orphan.category ? 2 : 0;
      const overlap = tokenOverlap(orphanTokens, tokensById.get(n.id) ?? new Set());
      // Hubs that already have inbound links pass equity on; orphans don't.
      const authority = (n.orphan ? 0 : 0.5) + Math.min(n.inDegree, 4) * 0.25;
      return { node: n, score: sameCategory + overlap + authority };
    })
    .filter((c) => c.score > 0)
    .sort((a, b) =>
      b.score - a.score || b.node.date.localeCompare(a.node.date)
    )
    .slice(0, limit)
    .map((c) => c.node);
}

/** Deterministic, explainable recommendations from graph signals. */
function buildRuleActions(
  nodes: GraphNode[],
  clusters: Cluster[],
  site: SiteMeta
): ActionItem[] {
  const actions: ActionItem[] = [];
  const byDateDesc = (a: GraphNode, b: GraphNode) => b.date.localeCompare(a.date);

  const tokensById = new Map<string, Set<string>>(
    nodes.map((n) => [n.id, topicTokens(n)])
  );

  // 1. Orphan posts → suggest the specific posts to add inbound links *from*
  nodes
    .filter((n) => n.orphan)
    .sort(byDateDesc)
    .slice(0, 6)
    .forEach((n) => {
      const sources = suggestLinkSources(n, nodes, tokensById);
      const rationale = sources.length
        ? `This post is an orphan — no other post links to it, so it's invisible to crawlers and readers navigating your site. Add a contextual link to it from these related ${n.category} posts:`
        : `This post is an orphan — no other post links to it, so it's invisible to crawlers and readers navigating your site. Link to it from related ${n.category} posts.`;
      actions.push({
        id: `link-${n.id}`,
        type: "link",
        title: `Add internal links to “${n.label}”`,
        rationale,
        impact: "high",
        cluster: n.category,
        targets: sources.length
          ? sources.map((s) => ({
              label: s.label,
              url: articleUrl(site, s.slug, s.id),
            }))
          : [{ label: n.label, url: articleUrl(site, n.slug, n.id) }],
        source: "rule",
      });
    });

  // 2. Missing focus keyword
  nodes
    .filter((n) => !n.keyword)
    .sort(byDateDesc)
    .slice(0, 6)
    .forEach((n) => {
      actions.push({
        id: `kw-${n.id}`,
        type: "keyword",
        title: `Set a focus keyword for “${n.label}”`,
        rationale: `No SEO focus keyword is configured (Rank Math / Yoast / AIOSEO). It can't be tracked for topical authority or AEO entity coverage.`,
        impact: "medium",
        cluster: n.category,
        targets: [{ label: n.label, url: articleUrl(site, n.slug, n.id) }],
        source: "rule",
      });
    });

  // 3. Thin clusters → write more
  clusters
    .filter((c) => c.health === "thin" && c.category !== "Uncategorized")
    .slice(0, 4)
    .forEach((c) => {
      actions.push({
        id: `write-${c.category}`,
        type: "write",
        title: `Deepen the “${c.category}” cluster`,
        rationale: `Only ${c.postCount} post(s) here. Thin clusters rarely earn topical authority. Add pillar + supporting posts to bridge gaps and win the topic.`,
        impact: "high",
        cluster: c.category,
        source: "rule",
      });
    });

  // 4. Cannibalization — multiple posts sharing the same focus keyword
  const kwGroups = new Map<string, GraphNode[]>();
  nodes.forEach((n) => {
    if (!n.keyword) return;
    const k = n.keyword.toLowerCase();
    const list = kwGroups.get(k) ?? [];
    list.push(n);
    kwGroups.set(k, list);
  });
  Array.from(kwGroups.entries())
    .filter(([, group]) => group.length > 1)
    .slice(0, 4)
    .forEach(([kw, group]) => {
      actions.push({
        id: `cann-${kw}`,
        type: "cannibalization",
        title: `Resolve keyword overlap on “${kw}”`,
        rationale: `${group.length} posts target the same focus keyword and compete with each other in search. Consolidate, differentiate, or canonicalize them.`,
        impact: "medium",
        cluster: group[0].category,
        targets: group
          .slice(0, 4)
          .map((n) => ({ label: n.label, url: articleUrl(site, n.slug, n.id) })),
        source: "rule",
      });
    });

  const rank = { high: 0, medium: 1, low: 2 };
  return actions.sort((a, b) => rank[a.impact] - rank[b.impact]);
}
