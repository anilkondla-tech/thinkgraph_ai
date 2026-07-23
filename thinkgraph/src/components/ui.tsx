import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  badge,
  actions,
}: {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 animate-fade-up">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
          {badge}
        </div>
        {subtitle && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function SourceBadge({ source }: { source: "live" | "demo" }) {
  if (source === "live") {
    return (
      <span className="pill bg-teal/[0.12] text-teal border border-teal/20">
        <span className="h-1.5 w-1.5 rounded-full bg-teal animate-pulseglow" />
        Live
      </span>
    );
  }
  return (
    <span className="pill bg-amber/[0.12] text-amber border border-amber/20">
      <span className="h-1.5 w-1.5 rounded-full bg-amber" />
      Demo
    </span>
  );
}

export function Stat({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "good" | "warn" | "bad";
}) {
  const toneClass =
    tone === "good"
      ? "text-teal"
      : tone === "warn"
        ? "text-amber"
        : tone === "bad"
          ? "text-rose"
          : "text-white";
  return (
    <div className="card card-compact group animate-fade-up">
      <div className="label-muted">{label}</div>
      <div className={`mt-2 text-2xl font-semibold tracking-tight data-value ${toneClass}`}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      {hint && <div className="mt-1.5 text-[11px] text-slate-600 font-mono">{hint}</div>}
    </div>
  );
}

export function ScoreRing({ score }: { score: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const dash = c * pct;
  const color = score >= 75 ? "#3EDBC2" : score >= 50 ? "#F5A623" : "#F25F7B";
  const glowColor = score >= 75 ? "rgba(62,219,194,0.3)" : score >= 50 ? "rgba(245,166,35,0.3)" : "rgba(242,95,123,0.3)";
  return (
    <div className="relative grid place-items-center">
      <svg width="148" height="148" viewBox="0 0 148 148" className="-rotate-90">
        <circle cx="74" cy="74" r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="10" />
        <circle
          cx="74"
          cy="74"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          style={{ filter: `drop-shadow(0 0 8px ${glowColor})`, transition: "stroke-dasharray 0.8s cubic-bezier(0.16, 1, 0.3, 1)" }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-3xl font-bold text-white data-value">{score}</div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 font-mono">
          / 100
        </div>
      </div>
    </div>
  );
}

const HEALTH_STYLE: Record<string, string> = {
  thin: "bg-rose/[0.1] text-rose border border-rose/20",
  healthy: "bg-teal/[0.1] text-teal border border-teal/20",
  crowded: "bg-amber/[0.1] text-amber border border-amber/20",
};

export function HealthPill({ health }: { health: string }) {
  return (
    <span className={`pill ${HEALTH_STYLE[health] ?? "bg-surface text-slate-300 border border-surface-border"}`}>
      {health}
    </span>
  );
}

const IMPACT_STYLE: Record<string, string> = {
  high: "bg-rose/[0.1] text-rose border border-rose/20",
  medium: "bg-amber/[0.1] text-amber border border-amber/20",
  low: "bg-surface text-slate-400 border border-surface-border",
};

export function ImpactPill({ impact }: { impact: string }) {
  return <span className={`pill ${IMPACT_STYLE[impact]}`}>{impact}</span>;
}

export function EmptyHint({ children }: { children: ReactNode }) {
  return (
    <div className="card card-pad grid place-items-center py-14 text-center text-sm text-slate-500">
      {children}
    </div>
  );
}
