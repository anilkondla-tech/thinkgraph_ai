import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { IconBolt, IconCheck, IconSparkle, IconX } from "@/components/icons";

// ─── Plan definitions ────────────────────────────────────────────────────────

const PLANS = [
  {
    key: "free",
    name: "Free",
    badge: null,
    price: "$0",
    period: "forever",
    description: "Explore the demo workspace and understand your content structure.",
    color: "border-white/[0.08]",
    highlight: false,
    posts: "50 posts",
    workspaces: "Demo only",
    aiInsights: "—",
    apiCostNote: null,
    features: [
      { label: "Demo content graph",              ok: true  },
      { label: "Cluster health overview",          ok: true  },
      { label: "Orphan & keyword detection",       ok: true  },
      { label: "Connect your WordPress site",      ok: false },
      { label: "AI Strategy Insights",             ok: false },
      { label: "Action Plan (AI-ranked)",          ok: false },
      { label: "Multiple workspaces",              ok: false },
    ],
    cta: "Current plan",
    ctaStyle: "border border-white/[0.08] text-slate-500 cursor-default",
    ctaDisabled: true,
  },
  {
    key: "starter",
    name: "Starter",
    badge: null,
    price: "$19",
    period: "/ month",
    description: "For solo bloggers with one site up to 250 published posts.",
    color: "border-accent/[0.3]",
    highlight: false,
    posts: "250 posts / workspace",
    workspaces: "1 workspace",
    aiInsights: "10 AI insights / mo",
    apiCostNote: "~$0.10 / mo in API costs",
    features: [
      { label: "Everything in Free",              ok: true  },
      { label: "Connect your WordPress site",     ok: true  },
      { label: "Live content graph",              ok: true  },
      { label: "AI Strategy Insights (10/mo)",    ok: true  },
      { label: "AI Action Plan",                  ok: true  },
      { label: "Multiple workspaces",             ok: false },
      { label: "Priority support",                ok: false },
    ],
    cta: "Upgrade to Starter",
    ctaStyle: "bg-accent/[0.15] border border-accent/30 text-accent-soft hover:bg-accent/[0.25]",
    ctaDisabled: false,
  },
  {
    key: "operator",
    name: "Operator",
    badge: "Most popular",
    price: "$49",
    period: "/ month",
    description: "For content operators running multiple sites up to 1,000 posts each.",
    color: "border-accent shadow-glow",
    highlight: true,
    posts: "1,000 posts / workspace",
    workspaces: "5 workspaces",
    aiInsights: "50 AI insights / mo",
    apiCostNote: "~$0.60 / mo in API costs",
    features: [
      { label: "Everything in Starter",           ok: true  },
      { label: "5 connected workspaces",          ok: true  },
      { label: "AI Strategy Insights (50/mo)",    ok: true  },
      { label: "Gap detection (Claude-powered)",  ok: true  },
      { label: "Priority scoring",                ok: true  },
      { label: "Priority support",                ok: true  },
      { label: "CSV / PDF export",                ok: false },
    ],
    cta: "Upgrade to Operator",
    ctaStyle: "bg-accent text-white shadow-glow hover:bg-accent-glow",
    ctaDisabled: false,
  },
  {
    key: "agency",
    name: "Agency",
    badge: null,
    price: "$149",
    period: "/ month",
    description: "For agencies and power users managing 20+ sites at scale.",
    color: "border-teal/[0.3]",
    highlight: false,
    posts: "Unlimited posts",
    workspaces: "20 workspaces",
    aiInsights: "Unlimited (fair use)",
    apiCostNote: "~$3 / mo in API costs",
    features: [
      { label: "Everything in Operator",          ok: true  },
      { label: "20 connected workspaces",         ok: true  },
      { label: "Unlimited AI insights",           ok: true  },
      { label: "CSV / PDF export",                ok: true  },
      { label: "White-label reports",             ok: true  },
      { label: "Dedicated support",               ok: true  },
      { label: "Custom integrations",             ok: true  },
    ],
    cta: "Upgrade to Agency",
    ctaStyle: "bg-teal/[0.15] border border-teal/30 text-teal hover:bg-teal/[0.25]",
    ctaDisabled: false,
  },
] as const;

// ─── API cost breakdown ───────────────────────────────────────────────────────

const COST_ROWS = [
  { label: "Claude model",           value: "Sonnet 4.5" },
  { label: "Input tokens ($/MTok)",  value: "$3.00" },
  { label: "Output tokens ($/MTok)", value: "$15.00" },
  { label: "Avg. input per call",    value: "~500 tokens" },
  { label: "Avg. output per call",   value: "~600 tokens" },
  { label: "Cost per AI insight",    value: "≈ $0.011" },
  { label: "Starter (10/mo)",        value: "≈ $0.11 / mo" },
  { label: "Operator (50/mo)",       value: "≈ $0.55 / mo" },
  { label: "Agency (fair use)",      value: "≈ $3–5 / mo" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function UpgradePage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-10 text-center animate-fade-up">
        <span className="pill mb-4 inline-flex bg-accent/[0.12] text-accent-soft ring-1 ring-accent/[0.25]">
          <IconSparkle className="h-3.5 w-3.5" />
          ThinkGraph AI — Plans
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-white lg:text-4xl">
          Choose your plan
        </h1>
        <p className="mt-3 text-slate-400 max-w-xl mx-auto">
          Pricing tiers are sized by blog post count. AI insight costs are
          billed at cost — we show you exactly what the Claude API charges.
        </p>
        {!session && (
          <p className="mt-2 text-xs text-amber">
            Sign in with Google first to connect a workspace and start a paid plan.
          </p>
        )}
      </div>

      {/* Plan cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => (
          <div
            key={plan.key}
            className={`card card-pad flex flex-col border ${plan.color} ${
              plan.highlight ? "ring-1 ring-accent/40" : ""
            }`}
          >
            {/* Badge */}
            <div className="mb-3 h-5">
              {plan.badge && (
                <span className="pill bg-accent/[0.14] text-accent-soft ring-1 ring-accent/20 text-[10px]">
                  {plan.badge}
                </span>
              )}
            </div>

            {/* Price */}
            <div className="mb-1">
              <span className="text-3xl font-bold text-white">{plan.price}</span>
              <span className="ml-1 text-sm text-slate-500">{plan.period}</span>
            </div>
            <h3 className="text-base font-semibold text-white">{plan.name}</h3>
            <p className="mt-1 mb-4 text-xs leading-relaxed text-slate-500 flex-shrink-0">
              {plan.description}
            </p>

            {/* Key limits */}
            <div className="mb-4 space-y-1.5 rounded-xl bg-white/[0.03] px-3 py-2.5">
              {[
                { icon: "📄", label: plan.posts },
                { icon: "🗂", label: plan.workspaces },
                { icon: "✨", label: plan.aiInsights },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-2 text-xs text-slate-400">
                  <span>{row.icon}</span>
                  <span>{row.label}</span>
                </div>
              ))}
              {plan.apiCostNote && (
                <div className="flex items-center gap-2 text-[10px] text-slate-600 pt-1 border-t border-white/[0.04]">
                  <span>💰</span>
                  <span>{plan.apiCostNote}</span>
                </div>
              )}
            </div>

            {/* Features */}
            <ul className="mb-6 flex-1 space-y-2">
              {plan.features.map((f) => (
                <li key={f.label} className="flex items-start gap-2">
                  {f.ok ? (
                    <IconCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" />
                  ) : (
                    <IconX className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-700" />
                  )}
                  <span className={`text-xs ${f.ok ? "text-slate-300" : "text-slate-600"}`}>
                    {f.label}
                  </span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <button
              disabled={plan.ctaDisabled}
              className={`mt-auto w-full rounded-xl py-2.5 text-sm font-semibold transition ${plan.ctaStyle}`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      {/* API Cost Transparency */}
      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        <div className="card card-pad">
          <div className="mb-4 flex items-center gap-2">
            <IconSparkle className="h-5 w-5 text-accent-soft" />
            <h2 className="text-sm font-semibold text-white">API Cost Transparency</h2>
          </div>
          <p className="mb-4 text-xs leading-relaxed text-slate-400">
            Every AI insight is generated by Claude Sonnet 4.5. We show our exact
            cost so you understand what you're paying for. The subscription price
            covers platform development, hosting, and support — not just API calls.
          </p>
          <div className="space-y-2">
            {COST_ROWS.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between text-xs"
              >
                <span className="text-slate-500">{row.label}</span>
                <span className="font-mono text-slate-300">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card card-pad">
          <div className="mb-4 flex items-center gap-2">
            <IconBolt className="h-5 w-5 text-amber" />
            <h2 className="text-sm font-semibold text-white">How post limits work</h2>
          </div>
          <div className="space-y-3 text-xs text-slate-400 leading-relaxed">
            <p>
              Limits apply to <strong className="text-slate-200">published posts</strong> per
              connected workspace. Drafts, pending, and private posts don't count.
            </p>
            <p>
              A typical blog post is ~1,500 words ≈ 2,000 tokens. The AI analysis
              reads post titles, focus keywords, and cluster structure — not the
              full content — keeping API costs low.
            </p>
            <p>
              If your blog grows past a plan's limit, you'll be notified and given
              30 days to upgrade before AI features are paused.
            </p>
            <div className="mt-4 rounded-xl bg-white/[0.03] p-3.5">
              <div className="label-muted mb-2">Cost per post (AI analysis)</div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {[
                  ["250 posts", "≈ $0.011/insight"],
                  ["1,000 posts", "≈ $0.013/insight"],
                  ["5,000 posts", "≈ $0.018/insight"],
                  ["10,000 posts", "≈ $0.025/insight"],
                ].map(([size, cost]) => (
                  <div key={size} className="flex justify-between text-slate-500">
                    <span>{size}</span>
                    <span className="font-mono text-slate-400">{cost}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MVP notice */}
      <div className="mt-6 rounded-2xl border border-amber/[0.18] bg-amber/[0.06] px-5 py-4 text-center">
        <p className="text-sm text-amber">
          <strong>MVP notice:</strong> Billing is not yet active. All features are currently
          available during the early-access period. Paid plans will launch with Stripe
          integration — early users get a founding-member discount.
        </p>
      </div>
    </div>
  );
}
