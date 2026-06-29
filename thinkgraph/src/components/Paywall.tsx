"use client";

import { useState } from "react";
import { IconSparkle, IconCheck, IconX } from "./icons";

type PaywallReason = "ai-key" | "demo";

const FREE = [
  { label: "Visual content knowledge graph",  ok: true  },
  { label: "Cluster overview & health scores", ok: true  },
  { label: "Rule-based action items",          ok: true  },
  { label: "AI Strategy Insights",             ok: false },
  { label: "Full AI-ranked Action Plan",       ok: false },
  { label: "Gap detection (Claude-powered)",   ok: false },
  { label: "Priority scoring",                 ok: false },
];

const PRO = [
  { label: "Everything in Free",              ok: true },
  { label: "AI Strategy Insights",            ok: true },
  { label: "Full AI-ranked Action Plan",      ok: true },
  { label: "Gap detection (Claude-powered)",  ok: true },
  { label: "Priority scoring",               ok: true },
  { label: "Unlimited connected sites",       ok: true },
];

interface PaywallProps {
  reason?: PaywallReason;
  /** Optional: called when the user clicks "Continue on Free" */
  onDismiss?: () => void;
}

export default function Paywall({ reason = "ai-key", onDismiss }: PaywallProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-ink-950/85 backdrop-blur-md">
      <div className="mx-4 w-full max-w-md animate-fade-up rounded-2xl border border-white/[0.1] bg-ink-850 shadow-[0_32px_80px_-16px_rgba(124,108,255,0.4)]">
        {/* Header */}
        <div className="relative px-7 pb-5 pt-7 text-center">
          <button
            onClick={dismiss}
            aria-label="Close"
            className="absolute right-4 top-4 grid h-7 w-7 place-items-center rounded-lg text-slate-600 transition hover:bg-white/[0.06] hover:text-slate-300"
          >
            <IconX className="h-4 w-4" />
          </button>

          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-accent/[0.12] ring-1 ring-accent/[0.2]">
            <IconSparkle className="h-7 w-7 text-accent-soft" />
          </div>

          <h2 className="text-xl font-bold text-white">Unlock AI-Powered Insights</h2>
          <p className="mt-2 text-sm text-slate-400">
            {reason === "demo"
              ? "Sign in and upgrade to access Claude-powered recommendations for your site."
              : "Add your Anthropic API key or upgrade to Pro to get Claude-powered content strategy."}
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-2 gap-3 px-5 pb-5">
          {/* Free */}
          <div className="rounded-xl border border-white/[0.06] bg-ink-900/60 p-4">
            <div className="mb-3">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Free</div>
              <div className="mt-0.5 text-xl font-bold text-white">$0 <span className="text-sm font-normal text-slate-500">/ mo</span></div>
            </div>
            <ul className="space-y-2">
              {FREE.map(({ label, ok }) => (
                <li key={label} className="flex items-start gap-2 text-[11px]">
                  {ok ? (
                    <IconCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" />
                  ) : (
                    <IconX className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-600" />
                  )}
                  <span className={ok ? "text-slate-300" : "text-slate-600"}>{label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pro */}
          <div className="relative rounded-xl border border-accent/[0.3] bg-gradient-to-br from-accent/[0.12] to-transparent p-4">
            <div className="absolute -top-2.5 right-4 rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-bold text-white">
              RECOMMENDED
            </div>
            <div className="mb-3">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-accent-soft">Pro</div>
              <div className="mt-0.5 text-xl font-bold text-white">$49 <span className="text-sm font-normal text-slate-400">/ mo</span></div>
            </div>
            <ul className="space-y-2">
              {PRO.map(({ label }) => (
                <li key={label} className="flex items-start gap-2 text-[11px]">
                  <IconCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-soft" />
                  <span className="text-slate-300">{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-2.5 px-5 pb-7">
          <button
            onClick={() => {
              // In MVP, this would link to a billing page.
              // For now, show an instruction to set ANTHROPIC_API_KEY.
              alert(
                reason === "demo"
                  ? "Sign in with Google above, then add your Anthropic API key to your .env file to enable AI features."
                  : "To enable AI: add ANTHROPIC_API_KEY=your-key to your .env.local file and restart the dev server.\n\nPro billing coming soon!"
              );
            }}
            className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-accent-glow"
          >
            Upgrade to Pro — $49 / mo
          </button>
          <button
            onClick={dismiss}
            className="w-full rounded-xl py-2.5 text-xs text-slate-500 transition hover:text-slate-300"
          >
            Continue on Free
          </button>
        </div>
      </div>
    </div>
  );
}
