"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import {
  Logo,
  IconGraph,
  IconLayers,
  IconBolt,
  IconSparkle,
  IconCheck,
} from "@/components/icons";

// ─── Animated knowledge-graph SVG ──────────────────────────────────────────

const NODES = [
  { id: "a", cx: 48,  cy: 80,  r: 10, color: "#7c6cff", glow: true  },
  { id: "b", cx: 200, cy: 42,  r: 7,  color: "#a99bff", glow: false },
  { id: "c", cx: 130, cy: 152, r: 13, color: "#3ad6c5", glow: true  },
  { id: "d", cx: 22,  cy: 218, r: 5,  color: "#a99bff", glow: false },
  { id: "e", cx: 220, cy: 172, r: 8,  color: "#7c6cff", glow: false },
  { id: "f", cx: 78,  cy: 246, r: 6,  color: "#3ad6c5", glow: false },
  { id: "g", cx: 192, cy: 244, r: 11, color: "#ffb454", glow: true  },
  { id: "h", cx: 120, cy: 52,  r: 5,  color: "#a99bff", glow: false },
  { id: "i", cx: 248, cy: 90,  r: 5,  color: "#7c6cff", glow: false },
  { id: "j", cx: 58,  cy: 168, r: 4,  color: "#3ad6c5", glow: false },
] as const;

const NM = Object.fromEntries(NODES.map((n) => [n.id, n]));

const EDGES: [string, string][] = [
  ["a","h"],["a","c"],["a","j"],
  ["h","b"],["h","c"],
  ["b","i"],["b","e"],
  ["c","j"],["c","e"],["c","f"],["c","g"],
  ["e","g"],["e","i"],
  ["f","g"],["d","j"],
];

function LiveGraph() {
  return (
    <svg viewBox="0 0 270 280" className="h-full w-full" aria-hidden>
      <defs>
        <filter id="lg-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Edges */}
      {EDGES.map(([a, b]) => (
        <line
          key={`${a}-${b}`}
          x1={NM[a as keyof typeof NM].cx}
          y1={NM[a as keyof typeof NM].cy}
          x2={NM[b as keyof typeof NM].cx}
          y2={NM[b as keyof typeof NM].cy}
          stroke="rgba(124,108,255,0.22)"
          strokeWidth="1.2"
        />
      ))}
      {/* Nodes */}
      {NODES.map((n) => (
        <g key={n.id} filter={n.glow ? "url(#lg-glow)" : undefined}>
          <circle cx={n.cx} cy={n.cy} r={n.r * 2.4} fill={n.color} opacity={0.07} />
          <circle cx={n.cx} cy={n.cy} r={n.r}       fill={n.color} opacity={0.88} />
        </g>
      ))}
    </svg>
  );
}

// ─── Google Brand Icon ──────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

// ─── Feature data ───────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: IconGraph,
    title: "Content Knowledge Graph",
    desc: "Every post, keyword, and link visualized as a living force-directed graph. Click any node to surface its strategy details.",
    accent: "bg-accent/10 text-accent-soft",
  },
  {
    icon: IconLayers,
    title: "Cluster Gap Detection",
    desc: "Spot thin clusters, orphan pages, and keyword blind-spots before they silently suppress your rankings.",
    accent: "bg-teal/10 text-teal",
  },
  {
    icon: IconBolt,
    title: "AI-Ranked Action Plan",
    desc: "Claude reads your graph and surfaces the single highest-leverage move — write, link, merge, or refresh.",
    accent: "bg-amber/10 text-amber",
  },
] as const;

const BULLETS = [
  "Visual force-directed knowledge graph",
  "AI-ranked content gaps & next steps",
  "AEO + SEO answer-engine readiness",
] as const;

// ─── Page ───────────────────────────────────────────────────────────────────

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-ink-950">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-48 -top-48 h-[650px] w-[650px] rounded-full bg-accent/[0.12] blur-3xl" />
        <div className="absolute -right-24 top-16 h-[550px] w-[550px] rounded-full bg-teal/[0.06] blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-[450px] w-[800px] -translate-x-1/2 rounded-full bg-accent-glow/[0.07] blur-3xl" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* ── Top nav ── */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 lg:px-14">
        <div className="flex items-center gap-2.5">
          <Logo className="h-8 w-8" />
          <div className="leading-tight">
            <div className="text-[15px] font-semibold text-white">ThinkGraph</div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-soft">
              AI
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/?site=demo"
            className="text-sm font-medium text-slate-400 transition-colors hover:text-white"
          >
            Live demo
          </a>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col">
        {/* ── Hero ── */}
        <section className="mx-auto w-full max-w-7xl px-6 pb-16 pt-14 lg:px-14">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            {/* Left: copy */}
            <div className="flex flex-col gap-7 animate-fade-up">
              <span className="pill inline-flex w-fit bg-teal/[0.12] text-teal ring-1 ring-teal/[0.18]">
                <span className="h-1.5 w-1.5 rounded-full bg-teal animate-pulseglow" />
                Content Intelligence Platform · 2026
              </span>

              <h1 className="text-5xl font-bold leading-[1.08] tracking-tight text-white lg:text-[3.6rem]">
                Stop guessing<br />
                <span className="text-gradient">what to write</span><br />
                next.
              </h1>

              <p className="max-w-[480px] text-[1.05rem] leading-relaxed text-slate-400">
                ThinkGraph maps every post, keyword, and internal link into an
                interactive knowledge graph — then tells you exactly what to
                write, fix, or link next for SEO and AI-engine visibility.
              </p>

              <ul className="flex flex-col gap-3">
                {BULLETS.map((b) => (
                  <li key={b} className="flex items-center gap-3 text-[0.9rem] text-slate-300">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-teal/[0.15]">
                      <IconCheck className="h-3 w-3 text-teal" />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  onClick={() => signIn("google", { callbackUrl: "/" })}
                  className="inline-flex items-center gap-3 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-ink-950 shadow-lg transition hover:bg-slate-100 active:scale-[0.98]"
                >
                  <GoogleIcon />
                  Sign in with Google
                </button>
                <a
                  href="/?site=demo"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/[0.1] px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-white/[0.2] hover:text-white"
                >
                  Explore demo
                  <span aria-hidden className="text-slate-500">→</span>
                </a>
              </div>

              <p className="text-xs text-slate-600">
                No credit card required · Demo works without signing in
              </p>
            </div>

            {/* Right: graph card */}
            <div
              className="relative hidden animate-fade-up lg:block"
              style={{ animationDelay: "0.12s" }}
            >
              <div className="relative rounded-3xl border border-white/[0.08] bg-ink-850/50 p-5 shadow-[0_32px_96px_-20px_rgba(124,108,255,0.35)] backdrop-blur-sm animate-float">
                {/* Live badge */}
                <div className="absolute -right-3 -top-4 flex items-center gap-1.5 rounded-full bg-ink-800/90 px-3 py-1.5 text-xs font-semibold text-teal ring-1 ring-teal/[0.25] backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal animate-pulseglow" />
                  Live graph
                </div>

                <div className="h-[320px] w-full">
                  <LiveGraph />
                </div>

                {/* Stat badges */}
                <div className="absolute -bottom-4 left-8 rounded-xl border border-white/[0.08] bg-ink-800/90 px-3.5 py-2.5 shadow-card backdrop-blur-sm">
                  <div className="label-muted">Graph Health</div>
                  <div className="mt-0.5 text-xl font-bold text-teal">87 / 100</div>
                </div>
                <div className="absolute -bottom-4 right-8 rounded-xl border border-white/[0.08] bg-ink-800/90 px-3.5 py-2.5 shadow-card backdrop-blur-sm">
                  <div className="label-muted">Gaps Found</div>
                  <div className="mt-0.5 text-xl font-bold text-amber">12</div>
                </div>
              </div>

              {/* Floating AI badge */}
              <div className="absolute -right-7 top-1/2 -translate-y-1/2 rounded-xl border border-accent/[0.25] bg-ink-800/95 px-3.5 py-3 shadow-glow backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <IconSparkle className="h-4 w-4 text-accent-soft" />
                  <div>
                    <div className="text-xs font-semibold text-white">AI Ready</div>
                    <div className="text-[10px] text-slate-500">Claude-powered</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Feature cards ── */}
        <section className="mx-auto w-full max-w-7xl px-6 pb-20 lg:px-14">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-white">
              The strategy layer your blog is missing
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Built for solo operators and content teams who want leverage, not more manual audits.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, desc, accent }, i) => (
              <div
                key={title}
                className="card card-pad animate-fade-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className={`mb-4 grid h-11 w-11 place-items-center rounded-xl ${accent}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-sm font-semibold text-white">{title}</h3>
                <p className="text-xs leading-relaxed text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </section>


      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.04] px-6 py-4 text-center text-[11px] text-slate-700">
        ThinkGraph AI · MVP · Insights are advisory — validate before publishing.
      </footer>
    </div>
  );
}
