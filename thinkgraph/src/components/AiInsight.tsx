"use client";

import { useState } from "react";
import { IconSparkle } from "./icons";
import Paywall from "./Paywall";

export default function AiInsight({
  siteKey,
  aiEnabled,
  initialInsight,
}: {
  siteKey: string;
  aiEnabled: boolean;
  initialInsight: string | null;
}) {
  const [insight, setInsight] = useState<string | null>(initialInsight);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paywallDismissed, setPaywallDismissed] = useState(false);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/analytics?ai=1&fresh=1&site=${encodeURIComponent(siteKey)}`
      );
      const data = await res.json();
      setInsight(data.aiInsight ?? "No insight returned.");
    } catch {
      setError("Could not reach the AI service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card card-pad relative overflow-hidden animate-fade-up">
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/20 blur-3xl"
        aria-hidden
      />
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent/15 text-accent-soft">
          <IconSparkle className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-white">AI Strategy Insight</h3>
          <p className="text-[11px] text-slate-500">
            Claude reads your graph and names the highest-leverage move.
          </p>
        </div>
      </div>

      {insight ? (
        <p className="text-sm leading-relaxed text-slate-300">{insight}</p>
      ) : aiEnabled ? (
        <div className="flex flex-col items-start gap-3">
          <p className="text-sm text-slate-400">
            Generate an AI read of this site&apos;s content graph — gaps, bridges, and
            the single biggest opportunity for SEO + answer-engine visibility.
          </p>
          <button
            onClick={generate}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:bg-accent-glow disabled:opacity-60"
          >
            <IconSparkle className="h-4 w-4" />
            {loading ? "Analyzing…" : "Generate insight"}
          </button>
          {error && <p className="text-xs text-rose">{error}</p>}
        </div>
      ) : (
        /* Paywall: blurred placeholder content + upgrade overlay */
        <div className="relative min-h-[120px]">
          {/* Blurred ghost content */}
          <div className="select-none blur-sm" aria-hidden>
            <p className="text-sm leading-relaxed text-slate-300">
              Your top cluster "Technology" has 24 posts but only 3 internal links pointing
              to your cornerstone piece. Prioritizing 8 targeted internal-link additions
              could raise topical authority by ~18% — the single highest-leverage move
              this week for both Google rankings and ChatGPT citations.
            </p>
          </div>
          {/* Paywall overlay */}
          {!paywallDismissed && (
            <Paywall reason="ai-key" onDismiss={() => setPaywallDismissed(true)} />
          )}
          {paywallDismissed && (
            <p className="mt-2 rounded-lg bg-white/[0.04] px-3 py-2.5 text-xs text-slate-500">
              Add{" "}
              <code className="rounded bg-ink-700 px-1.5 py-0.5 text-accent-soft">
                ANTHROPIC_API_KEY
              </code>{" "}
              to your <code className="rounded bg-ink-700 px-1.5 py-0.5 text-accent-soft">.env.local</code>{" "}
              to unlock AI insights.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
