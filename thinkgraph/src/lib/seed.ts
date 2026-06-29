import type { SiteMeta } from "./types";
import type { RawPost, RawSite } from "./queries";

// Deterministic pseudo-random so the demo graph is stable across renders.
function lcg(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

const CATEGORIES: Record<string, string[]> = {
  "How-To & Tutorials": [
    "How to Speed Up Your WordPress Site in 10 Minutes",
    "How to Set Up Google Analytics 4 on WordPress",
    "How to Create a Custom Email with Your Domain",
    "How to Back Up Your WordPress Site for Free",
    "How to Fix the White Screen of Death in WordPress",
    "How to Add a Contact Form Without a Plugin",
    "How to Migrate WordPress to a New Host",
    "How to Enable HTTPS on Any WordPress Site",
  ],
  "Tech Reviews": [
    "Best Budget Laptops for Students in 2026",
    "Apple MacBook Air M3 Review: Is It Worth It?",
    "Top 5 Mechanical Keyboards Under $100",
    "Samsung Galaxy S25 vs iPhone 16: Full Comparison",
    "Best Wireless Earbuds for Remote Workers",
    "The Best Smart Home Devices of 2026",
    "OnePlus 13 Long-Term Review",
  ],
  "WordPress": [
    "Best Free WordPress Themes for Blogs",
    "Rank Math vs Yoast SEO: Which Is Better?",
    "10 Must-Have WordPress Plugins for Bloggers",
    "How to Monetize a WordPress Blog in 2026",
    "WooCommerce vs Shopify: Which Should You Choose?",
    "Best WordPress Hosting for Small Businesses",
  ],
  "SEO & Traffic": [
    "How to Rank on Google in 2026: A Beginner's Guide",
    "What Is Topical Authority and Why It Matters",
    "Internal Linking Strategy That Actually Works",
    "How to Find Low-Competition Keywords for Free",
    "Google's Helpful Content Update: What You Need to Know",
    "How to Get Traffic Without Backlinks",
  ],
  "Artificial Intelligence": [
    "Best AI Writing Tools Compared in 2026",
    "How to Use ChatGPT for Blog Content",
    "AI SEO Tools: Worth It or Hype?",
    "How Google Detects AI-Generated Content",
    "Top 5 AI Image Generators for Bloggers",
  ],
  "Make Money Online": [
    "How to Start a Blog and Make Money in 2026",
    "Best Affiliate Programs for Tech Bloggers",
    "Display Ads vs Affiliate Marketing: Which Pays More?",
    "How to Get Approved for Mediavine",
    "Passive Income Ideas for Content Creators",
  ],
};

const AUTHORS = ["Veena", "Arjun", "Maya", "Dev"];

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const DEMO_SITE: SiteMeta = {
  key: "demo",
  label: "TechsprohHub (demo)",
  url: "https://techsprohub.com",
};

export function buildDemoRawSite(): RawSite {
  const rand = lcg(42);
  const posts: RawPost[] = [];
  const categoriesByPost = new Map<number, string[]>();
  const keywordByPost = new Map<number, string>();

  let id = 100;
  const now = Date.now();

  const entries: { title: string; cat: string }[] = [];
  for (const [cat, titles] of Object.entries(CATEGORIES)) {
    for (const title of titles) entries.push({ title, cat });
  }

  // First pass: create posts (without content links yet)
  const meta = entries.map((e, idx) => {
    const pid = id++;
    const slug = slugify(e.title);
    const daysAgo = Math.floor(rand() * 360);
    const date = new Date(now - daysAgo * 86400000).toISOString();
    categoriesByPost.set(pid, [e.cat]);
    // ~25% of posts have no focus keyword
    if (rand() > 0.25) {
      keywordByPost.set(pid, e.title.split(":")[0].split(" ").slice(0, 3).join(" ").toLowerCase());
    }
    return { pid, slug, title: e.title, cat: e.cat, date, idx };
  });

  // Second pass: build content with internal links to same/adjacent category posts.
  // Intentionally leave a few posts with zero inbound links (orphans).
  meta.forEach((m, i) => {
    const sameCat = meta.filter((o) => o.cat === m.cat && o.pid !== m.pid);
    const linkCount = Math.floor(rand() * 3); // 0..2 links
    const links: string[] = [];
    for (let k = 0; k < linkCount && sameCat.length; k++) {
      const target = sameCat[Math.floor(rand() * sameCat.length)];
      links.push(
        `<a href="${DEMO_SITE.url}/${target.slug}/">${target.title}</a>`
      );
    }
    const content = `<p>${m.title} — an in-depth look at ${m.cat.toLowerCase()}.</p>
      <p>Related reading: ${links.join(" · ") || "(no internal links yet)"}</p>`;
    posts.push({
      id: m.pid,
      title: m.title,
      slug: m.slug,
      date: m.date,
      status: "publish",
      author_id: i % AUTHORS.length,
      content,
    });
  });

  const authors = new Map<number, string>();
  AUTHORS.forEach((name, i) => authors.set(i, name));

  const statusCounts = [
    { status: "publish", count: posts.length },
    { status: "draft", count: 7 },
    { status: "pending", count: 2 },
  ];

  return {
    posts,
    authors,
    categoriesByPost,
    keywordByPost,
    statusCounts,
    totalPosts: posts.length + 9,
    totalComments: 1284,
  };
}
