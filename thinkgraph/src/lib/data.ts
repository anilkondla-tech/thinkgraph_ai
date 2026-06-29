import "server-only";
import { analyzeSite } from "./analyze";
import { generateAiInsight } from "./ai";
import { fetchRawSite } from "./queries";
import { buildDemoRawSite, DEMO_SITE } from "./seed";
import {
  getAvailableSites,
  getDefaultSiteKey,
  getSiteConnection,
  isAiEnabled,
  isDemoMode,
  type SiteConnection,
} from "./sites";
import type { SiteAnalytics, SiteMeta } from "./types";

type CacheEntry = { value: SiteAnalytics; expires: number };
const CACHE = new Map<string, CacheEntry>();
const TTL_MS = 1000 * 60 * 10; // 10 minutes

function metaFor(siteKey: string, userSites: SiteConnection[] = []): SiteMeta {
  const user = userSites.find((s) => s.key === siteKey);
  if (user) return { key: user.key, label: user.label, url: user.url };
  const c = getSiteConnection(siteKey);
  return { key: c.key, label: c.label, url: c.url };
}

/** Returns all sites: env-configured + user-added. */
export function listSites(userSites: SiteConnection[] = []): SiteMeta[] {
  if (isDemoMode()) return [DEMO_SITE];
  const envSites = getAvailableSites();
  const userMeta = userSites.map((s) => ({ key: s.key, label: s.label, url: s.url }));
  const all = [
    ...envSites,
    ...userMeta.filter((u) => !envSites.some((e) => e.key === u.key)),
  ];
  return all.length ? all : [DEMO_SITE];
}

export function resolveSiteKey(
  requested?: string | null,
  userSites: SiteConnection[] = []
): string {
  if (isDemoMode()) return "demo";
  const envKeys = getAvailableSites().map((s) => s.key);
  const userKeys = userSites.map((s) => s.key);
  const allKeys = [...envKeys, ...userKeys];
  if (requested && allKeys.includes(requested)) return requested;
  return getDefaultSiteKey();
}

export async function getSiteAnalytics(
  requestedKey?: string | null,
  opts: { withAi?: boolean; fresh?: boolean; userSites?: SiteConnection[] } = {}
): Promise<SiteAnalytics> {
  const withAi = opts.withAi ?? false;
  const userSites = opts.userSites ?? [];
  const siteKey = resolveSiteKey(requestedKey, userSites);
  const cacheKey = `${siteKey}:${withAi ? "ai" : "base"}`;

  if (!opts.fresh) {
    const hit = CACHE.get(cacheKey);
    if (hit && hit.expires > Date.now()) return hit.value;
  }

  let analytics: SiteAnalytics;

  // Check if this is a user-defined site
  const userConn = userSites.find((s) => s.key === siteKey);

  const demo = isDemoMode();
  if (demo) {
    analytics = analyzeSite(DEMO_SITE, buildDemoRawSite(), "demo", isAiEnabled());
  } else {
    try {
      const raw = await fetchRawSite(siteKey, userConn);
      analytics = analyzeSite(metaFor(siteKey, userSites), raw, "live", isAiEnabled());
    } catch (err) {
      // DB unreachable (common: Hostinger blocks Vercel IPs) → graceful demo fallback.
      console.error(`[thinkgraph] DB fetch failed for "${siteKey}", using demo data:`, err);
      analytics = analyzeSite(
        { ...DEMO_SITE, label: `${metaFor(siteKey, userSites).label} (demo fallback)` },
        buildDemoRawSite(),
        "demo",
        isAiEnabled()
      );
    }
  }

  if (withAi && analytics.aiEnabled) {
    const ai = await generateAiInsight(analytics);
    if (ai) {
      analytics = {
        ...analytics,
        aiInsight: ai.insight || null,
        actions: mergeActions(analytics.actions, ai.actions),
      };
    }
  }

  CACHE.set(cacheKey, { value: analytics, expires: Date.now() + TTL_MS });
  return analytics;
}

function mergeActions(
  ruleActions: SiteAnalytics["actions"],
  aiActions: SiteAnalytics["actions"]
): SiteAnalytics["actions"] {
  const rank = { high: 0, medium: 1, low: 2 };
  return [...aiActions, ...ruleActions].sort(
    (a, b) => rank[a.impact] - rank[b.impact]
  );
}
