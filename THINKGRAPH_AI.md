# ThinkGraph AI — Product Research & Strategy

> **Status:** Living document · **Owner:** Product (akondla@planhub.com) · **Last updated:** 2026-06-12
> **Author role:** Senior Product Owner / PM · UI-UX direction by Senior UX Engineer
> **Source inputs:** `ideation.md` (AI-monetization thesis), preliminary Gemini research, the existing `bloganalytics` Flask dashboard + 4 live WordPress properties.

---

## 1. One-line definition

**ThinkGraph AI is a content knowledge-graph + AI content-strategy SaaS.** It ingests a blog/site's existing content, maps every post into a graph of **topics → entities → keywords → internal links**, and then uses AI to surface what a human strategist would: *content gaps, weak/over-crowded clusters, orphan pages, internal-linking opportunities, and a prioritized "what to write next" plan.*

It is **not** another "type a keyword, get a 2,000-word article" generator. The thesis from `ideation.md` is explicit: generic AI output has collapsed to zero marginal value. The defensible wedge is **the final 10% — curation, domain context, and structural validation that AI alone cannot produce.** ThinkGraph sells *strategy and structure*, not raw text.

---

## 2. The problem

Content teams and solo operators running content sites face three compounding pains in 2026:

1. **They are flying blind on structure.** They have hundreds of posts but no map of how those posts relate. Topic cannibalization, thin clusters, and orphan pages (no internal links in) accumulate invisibly and silently suppress rankings.
2. **"What should I write next?" is answered by gut, not data.** Existing keyword tools answer *"is this keyword popular?"* but not *"given everything I've already published, where is my single highest-leverage gap?"*
3. **The ground is shifting from SEO → AEO/GEO.** Google AI Overviews now appear in ~55% of searches and Gartner projects a ~25% drop in traditional search volume by 2026 ([HubSpot](https://blog.hubspot.com/marketing/answer-engine-optimization-trends), [ALM Corp](https://almcorp.com/blog/aeo-vs-seo-2026-complete-strategy-guide/)). Winning citations in ChatGPT/Perplexity/AI Mode rewards **entity consistency, topical authority, and clean internal-link architecture** — exactly the things a content graph makes visible.

The existing `bloganalytics` dashboard already proves the data is reachable (posts, categories, authors, comments, SEO focus-keywords from Rank Math / Yoast / AIOSEO). ThinkGraph turns that raw data into *decisions*.

---

## 3. Market & competitive landscape

| Tool | Core job | Entry price (2026) | Where it stops |
|---|---|---|---|
| **MarketMuse** | Topic modeling, topical authority, cluster gap analysis; blends LLMs + knowledge graphs | ~$149/mo | Enterprise-priced, heavy, planning-centric; weak on *your existing* site graph |
| **Clearscope** | Single-page optimization depth (term coverage vs. SERP) | $129/mo | Page-level, not site-graph level |
| **Frase** | SERP research → outline → draft; AEO guides | $45–49/mo | Generation-first; thin on structural/internal-link strategy |
| **Surfer SEO** | On-page content scoring | ~$99/mo | Page-level optimization |
| **InLinks** | Entity/knowledge-graph content audits, internal links | mid-market | Closest conceptually; UX is dense, agency-oriented |
| **Screaming Frog** | Crawl + embeddings content-cluster diagram | one-off license | Auditor, not a strategy/workflow layer |
| **RankMath / Yoast** | In-WordPress on-page + internal-link suggestions | free–$ | Per-post, no cross-site strategy graph |

**Sources:** [Radara comparison](https://radara.net/best-ai-seo-tools-2026-surfer-seo-vs-frase-vs-clearscope-vs-marketmuse-comparison/) · [GrowthMarketingPro](https://www.growthmarketingpro.com/clearscope-vs-frase-vs-marketmuse-vs-surfer-seo/) · [MarketBetter](https://www.marketbetter.ai/blog/best-content-optimization-tools/) · [Slate — topic cluster tools](https://slatehq.com/blog/best-ai-tools-for-topic-clusters) · [InLinks knowledge-graph audits](https://inlinks.com/insight/knowledge-graph-content-audits/) · [Screaming Frog content clusters](https://www.screamingfrog.co.uk/seo-spider/tutorials/how-to-identify-semantically-similar-pages-outliers/).

### The gap we exploit
The incumbents are either **(a) page-level optimizers** (Clearscope, Surfer), **(b) enterprise planning suites** (MarketMuse), or **(c) dense agency auditors** (InLinks, Screaming Frog). Nobody offers a **fast, beautiful, opinionated "connect your blog → see your living content graph → get a ranked action list"** experience aimed at the solo operator / small content team. That is ThinkGraph's positioning: **the Linear/Vercel-grade UX of content strategy.**

---

## 4. Positioning & wedge

> **"Stop guessing what to write. See your content as a living graph and let AI tell you the one move that matters most this week."**

- **Wedge:** zero-config ingestion of an existing WordPress site → instant visual content graph. Time-to-value measured in seconds, not an onboarding call.
- **Moat over time:** the graph + AI recommendations + the user's accept/reject feedback become a proprietary, per-site strategy model. Switching cost grows with graph history.
- **AEO-native:** every recommendation is framed for both classic SEO *and* answer-engine citation (entity coverage, FAQ/answer-block gaps, topical-authority completeness).

---

## 5. Target users (ICP)

1. **The one-person content business / "AI-leveraged operator"** (the `ideation.md` persona) — runs 1–N niche sites (exactly like tech360d / techinfobeez / fashionsgalaxy / techsprohub), needs leverage, not more manual audits. **Primary ICP for MVP.**
2. **Small in-house content teams (2–8 people)** at SaaS/DTC companies who own a content blog and need a shared map + backlog.
3. **Boutique SEO/content agencies** managing multiple client sites who want a per-client graph to justify retainers.

---

## 6. MVP scope (what we build now)

The existing 4 WordPress DBs are the seed dataset. MVP = **"Connect → Graph → Insights → Action plan,"** multi-site aware from day one (the data layer already is).

### 6.1 Core surfaces
1. **Dashboard / Overview** — health score, post/cluster/orphan counts, top categories, publishing cadence, "AI insight of the week" hero card. *(Modernized successor to the current Flask dashboard.)*
2. **Content Graph** — interactive force-directed graph. Nodes = posts (sized by inbound links / recency), grouped/colored by category cluster; orphan nodes highlighted. Click a node → side panel with title, category, keyword, permalink, and suggested links.
3. **Clusters & Gaps** — each category as a cluster card: depth, internal-link density, thin/over-crowded flag, and **AI-generated gap topics** ("you cover X and Y but not the bridging topic Z").
4. **Action Plan (the money screen)** — a prioritized, AI-ranked backlog: *Write new post*, *Add internal link A→B*, *Set missing focus keyword*, *Merge cannibalizing posts*. Each item shows rationale + estimated impact. Accept/dismiss feedback loop.
5. **Site switcher** — multi-tenant across the connected properties.

### 6.2 AI layer
- **Recommendations engine:** combines deterministic graph signals (orphan detection, link density, cluster size, missing-keyword from `no-keywords` query) with an LLM pass (Claude) that turns signals + titles/keywords into human-readable, prioritized actions and gap topics.
- **AEO framing:** prompts explicitly ask for entity-coverage gaps and answer-block opportunities, not just keywords.
- **Graceful degradation:** if no AI key is configured, deterministic insights still render (the graph + signals are valuable on their own).

### 6.3 Explicitly out of scope for MVP
Article generation, billing/Stripe, live SERP/keyword-volume APIs (Ahrefs/Semrush), user-generated multi-account auth. (See roadmap §9.)

---

## 7. Data model & signals (reuse what exists)

From the WordPress schema already queried by the Flask app:

| Signal | Source | Derived insight |
|---|---|---|
| Posts, status, dates | `wp_posts` | cadence, drafts, freshness decay |
| Categories / taxonomy | `wp_terms` + `wp_term_taxonomy` + `wp_term_relationships` | cluster definition |
| Authors | `wp_users` | author/cluster coverage |
| Focus keywords | `wp_postmeta` (Rank Math / Yoast / AIOSEO / `_keyword`) | keyword coverage + missing-keyword gaps |
| Internal links | parse `post_content` for on-domain `<a href>` | **link graph edges, orphan detection, link density** *(new)* |
| Semantic similarity | embeddings over title+keyword (roadmap) | cannibalization & bridge-gap detection |

The **internal-link edge extraction** (parsing `post_content`) is the new primitive that turns the existing flat analytics into a true graph. ([Force-directed link graphs](https://www.crawlspider.com/internal-link-structure-visualization-deep-dive-force-directed-graph-layout/) are the proven visualization pattern.)

---

## 8. Technical architecture (Vercel + GitHub)

- **Framework:** Next.js (App Router) + TypeScript + Tailwind — first-class Vercel one-click GitHub deploys, SSR, and Route Handlers for the API.
- **Data access:** server-only MySQL access to the Hostinger WordPress DBs via `mysql2`. **All credentials live in Vercel Environment Variables**, never in the client bundle, never in git.
- **AI:** Anthropic Claude (`claude-opus-4-8` for synthesis, `claude-haiku-4-5` for cheap batch labeling) via server route handlers. Optional — app degrades gracefully without it.
- **Graph rendering:** lightweight client-side force-directed graph (e.g. `react-force-graph` / canvas) fed by a server-computed edge list.
- **Caching:** route-level caching mirroring the current Flask timeouts (summary ~10 min, graph/heatmap ~15 min) to protect the shared Hostinger DB.

### ⚠️ Critical deployment risk — Hostinger remote MySQL vs. Vercel IPs
Hostinger shared MySQL frequently **restricts remote connections to whitelisted IPs**, and Vercel serverless functions use **dynamic, non-static IPs**. This can block production DB access from Vercel. **Mitigations, in order of preference:**
1. Add `%` / Vercel ranges to Hostinger **Remote MySQL** allowlist (simplest if the plan allows wildcard remote access).
2. Front the DB with a thin read-only API or a connection proxy/tunnel with a static egress IP.
3. **MVP fallback (recommended for first deploy):** ship with a **seed/snapshot dataset** baked in so the public Vercel deploy renders fully, and connect live DBs only from an allowlisted environment. This de-risks the demo and keeps confidential creds out of the public path.

### 🔐 Security issues found in the current repo (must fix before any GitHub push)
1. **`.gitignore` does not ignore `.env`** — the "Environment variables" section is empty. Any push would commit live DB passwords. **Fix:** add `.env`, `.env.*`, `!.env.example`.
2. **`config.py` hardcodes real DB passwords as defaults** (e.g. `Tech360d@123`). These are committable secrets sitting in source. **Fix:** remove hardcoded fallbacks; require env vars.
3. **Recommendation:** treat the credentials in `.env` / `.env.local` as **already-exposed locally** and rotate the Hostinger DB passwords once the new app is wired, since they have been sitting in plaintext defaults.

---

## 9. Roadmap

- **v0 (MVP — this build):** Connect → Graph → Clusters/Gaps → Action Plan, multi-site, AI insights with graceful degradation, secure deploy.
- **v0.5:** Embeddings-based cannibalization detection; accept/dismiss feedback persisted; CSV/PDF export.
- **v1:** Auth + multi-account (NextAuth), per-user site connections, Stripe billing.
- **v1.5:** Live keyword/volume enrichment (Ahrefs/DataForSEO), AEO citation tracking (does ChatGPT/Perplexity cite you?).
- **v2:** One-click "apply" — write internal links / set focus keywords back into WordPress via REST API; brief generation.

---

## 10. Pricing hypothesis (validate later)

Anchored below MarketMuse/Clearscope, above Frase's floor, since we sell *strategy + structure*, not generation:

- **Solo** — $29/mo, 1 site, weekly action plan.
- **Operator** — $79/mo, up to 5 sites (the exact `ideation.md` persona), embeddings + export.
- **Agency** — $199/mo, 20 sites, multi-client workspaces.

---

## 11. Success metrics

- **Activation:** % of connected sites that reach the Action Plan within first session (target > 70%).
- **Value proof:** # of recommendations accepted per site / week.
- **Retention proxy:** graph re-visits per week; orphan-count trend ↓ over time.
- **North star:** *Accepted recommendations that ship* (write/link actions completed).

---

## Appendix — full source list
- [Slate — 12 Best AI Topic Cluster Tools 2026](https://slatehq.com/blog/best-ai-tools-for-topic-clusters)
- [Radara — Best AI SEO Tools 2026](https://radara.net/best-ai-seo-tools-2026-surfer-seo-vs-frase-vs-clearscope-vs-marketmuse-comparison/)
- [GrowthMarketingPro — Clearscope vs Frase vs MarketMuse vs Surfer](https://www.growthmarketingpro.com/clearscope-vs-frase-vs-marketmuse-vs-surfer-seo/)
- [MarketBetter — content optimization tools](https://www.marketbetter.ai/blog/best-content-optimization-tools/)
- [InLinks — knowledge-graph content audits](https://inlinks.com/insight/knowledge-graph-content-audits/)
- [Screaming Frog — semantically similar pages / content clusters](https://www.screamingfrog.co.uk/seo-spider/tutorials/how-to-identify-semantically-similar-pages-outliers/)
- [CrawlSpider — force-directed internal link visualization](https://www.crawlspider.com/internal-link-structure-visualization-deep-dive-force-directed-graph-layout/)
- [HubSpot — AEO trends 2026](https://blog.hubspot.com/marketing/answer-engine-optimization-trends)
- [ALM Corp — AEO vs SEO 2026](https://almcorp.com/blog/aeo-vs-seo-2026-complete-strategy-guide/)
- [Frase — AEO complete guide](https://www.frase.io/blog/what-is-answer-engine-optimization-the-complete-guide-to-getting-cited-by-ai)
- [Jasper — GEO vs AEO vs SEO](https://www.jasper.ai/blog/geo-aeo)
