import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { ActionItem, SiteAnalytics } from "./types";

const MODEL = process.env.THINKGRAPH_AI_MODEL?.trim() || "claude-opus-4-8";

type AiResult = { insight: string; actions: ActionItem[] };

/**
 * Ask Claude for a strategic insight + extra "content gap" actions.
 * Returns null on any failure (missing key, network, parse) so callers
 * fall back to the deterministic analysis.
 */
export async function generateAiInsight(
  a: SiteAnalytics
): Promise<AiResult | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) return null;

  const client = new Anthropic({ apiKey });

  const clusterLines = a.clusters
    .slice(0, 12)
    .map(
      (c) =>
        `- ${c.category}: ${c.postCount} posts, ${c.internalLinks} internal links (density ${c.linkDensity}), ${c.orphanCount} orphans, ${c.missingKeywordCount} missing keywords [${c.health}]`
    )
    .join("\n");

  const ruleLines = a.actions
    .slice(0, 8)
    .map((x) => `- (${x.impact}) ${x.title}`)
    .join("\n");

  const prompt = `You are a senior content strategist analyzing a content site's knowledge graph.

SITE: ${a.site.label} (${a.site.url})
Health score: ${a.healthScore}/100
Published posts: ${a.totals.publishedPosts} | Internal links: ${a.totals.internalLinks} | Orphans: ${a.totals.orphans} | Missing keywords: ${a.totals.missingKeywords} | Categories: ${a.totals.categories}

CONTENT QUALITY:
Avg word count: ${a.contentQuality.avgWordCount} | Thin content (<300 words): ${a.contentQuality.thinContent} | Missing featured images: ${a.contentQuality.missingFeaturedImages} | Missing meta descriptions: ${a.contentQuality.missingMetaDescriptions}

FRESHNESS:
Stale (>12mo): ${a.freshness.staleCount} | Evergreen ratio: ${Math.round(a.freshness.evergreenRatio * 100)}%

LINK INSIGHTS:
Dead-end posts: ${a.linkInsights.deadEnds} | Cross-cluster links: ${a.linkInsights.crossClusterLinks} | Bi-directional: ${a.linkInsights.biDirectionalLinks} | Reciprocity: ${Math.round(a.linkInsights.linkReciprocityRate * 100)}%

ENGAGEMENT:
Avg comments/post: ${a.engagement.avgCommentsPerPost} | Approved: ${a.engagement.commentBreakdown.approved} | Pending: ${a.engagement.commentBreakdown.pending} | Spam: ${a.engagement.commentBreakdown.spam}

CLUSTERS:
${clusterLines}

EXISTING RULE-BASED RECOMMENDATIONS:
${ruleLines}

Return STRICT JSON (no markdown fences) with this shape:
{
  "insight": "2-3 sentence strategic narrative about the single biggest opportunity, framed for both SEO and answer-engine (AEO) visibility. Be specific and reference actual clusters.",
  "actions": [
    { "type": "write|link|keyword|cannibalization|refresh", "title": "short imperative", "rationale": "1-2 sentences", "impact": "high|medium|low", "cluster": "category name or empty" }
  ]
}
Provide 3-4 NEW actions that the rule-based list above does NOT already cover (focus on content gaps, topical-authority bridges, content freshness, and engagement opportunities). Keep titles under 70 chars.`;

  try {
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });
    const text = msg.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("")
      .trim();

    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1) return null;
    const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));

    const actions: ActionItem[] = Array.isArray(parsed.actions)
      ? parsed.actions.slice(0, 4).map((x: Record<string, unknown>, i: number) => ({
          id: `ai-${i}`,
          type: (["write", "link", "keyword", "cannibalization", "refresh"].includes(
            String(x.type)
          )
            ? String(x.type)
            : "write") as ActionItem["type"],
          title: String(x.title ?? "AI recommendation").slice(0, 90),
          rationale: String(x.rationale ?? ""),
          impact: (["high", "medium", "low"].includes(String(x.impact))
            ? String(x.impact)
            : "medium") as ActionItem["impact"],
          cluster: x.cluster ? String(x.cluster) : undefined,
          source: "ai" as const,
        }))
      : [];

    return {
      insight: String(parsed.insight ?? "").trim(),
      actions,
    };
  } catch {
    return null;
  }
}
