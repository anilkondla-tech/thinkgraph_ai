"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import type { SiteMeta } from "@/lib/types";
import { Logo, IconGrid, IconGraph, IconLayers, IconBolt, IconChevron, IconSparkle } from "./icons";
import UserMenu from "./UserMenu";

const NAV = [
  { href: "/", label: "Overview", icon: IconGrid },
  { href: "/graph", label: "Content Graph", icon: IconGraph },
  { href: "/clusters", label: "Clusters & Gaps", icon: IconLayers },
  { href: "/plan", label: "Action Plan", icon: IconBolt },
];

export default function Shell({
  sites,
  children,
}: {
  sites: SiteMeta[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const currentSite = params.get("site") ?? sites[0]?.key ?? "";

  const withSite = (href: string) =>
    currentSite ? `${href}?site=${encodeURIComponent(currentSite)}` : href;

  const onSiteChange = (key: string) => {
    const sp = new URLSearchParams(Array.from(params.entries()));
    sp.set("site", key);
    startTransition(() => router.push(`${pathname}?${sp.toString()}`));
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-white/[0.06] bg-ink-900/60 px-4 py-5 backdrop-blur-md md:flex">
        <Link href={withSite("/")} className="mb-8 flex items-center gap-2.5 px-2">
          <Logo className="h-8 w-8" />
          <div className="leading-tight">
            <div className="text-[15px] font-semibold text-white">ThinkGraph</div>
            <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-accent-soft">
              AI
            </div>
          </div>
        </Link>

        <nav className="flex flex-col gap-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={withSite(href)}
                className={`nav-link ${active ? "nav-link-active" : ""}`}
              >
                <Icon className="h-[18px] w-[18px]" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3">
          {/* Upgrade CTA */}
          <div className="rounded-xl border border-accent/[0.2] bg-gradient-to-br from-accent/[0.1] to-transparent p-3.5">
            <div className="mb-1 flex items-center gap-1.5">
              <IconSparkle className="h-3.5 w-3.5 text-accent-soft" />
              <span className="text-[11px] font-semibold text-white">Upgrade to Pro</span>
            </div>
            <p className="text-[10px] leading-relaxed text-slate-500">
              Unlock AI insights, gap detection, and priority scoring.
            </p>
            <Link
              href="/onboarding"
              className="mt-2 block rounded-lg bg-accent/[0.15] py-1.5 text-center text-[11px] font-semibold text-accent-soft transition hover:bg-accent/[0.25]"
            >
              Connect site →
            </Link>
          </div>
          <div className="card card-pad !p-3.5">
            <div className="label-muted mb-1">Workspace</div>
            <p className="text-xs leading-relaxed text-slate-400">
              {sites.length} site{sites.length === 1 ? "" : "s"} connected
            </p>
          </div>
          <p className="px-2 text-[10px] leading-relaxed text-slate-600">
            ThinkGraph AI · MVP. Insights are advisory — validate before publishing.
          </p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-white/[0.06] bg-ink-950/70 px-5 py-3 backdrop-blur-md md:px-8">
          <div className="flex items-center gap-2 md:hidden">
            <Logo className="h-7 w-7" />
            <span className="font-semibold text-white">ThinkGraph</span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            {sites.length > 1 && (
              <div className="relative">
                <select
                  value={currentSite}
                  onChange={(e) => onSiteChange(e.target.value)}
                  className="appearance-none rounded-xl border border-white/[0.08] bg-ink-800 py-2 pl-3.5 pr-9 text-sm font-medium text-slate-100 outline-none transition hover:border-white/20 focus:border-accent"
                  aria-label="Select site"
                >
                  {sites.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <IconChevron className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              </div>
            )}
            <button
              onClick={() => startTransition(() => router.refresh())}
              className="rounded-xl border border-white/[0.08] bg-ink-800 px-3.5 py-2 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:text-white"
            >
              {pending ? "…" : "Refresh"}
            </button>
            <UserMenu />
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1400px] flex-1 px-5 py-6 md:px-8 md:py-8">
          {/* Mobile nav */}
          <nav className="mb-6 flex gap-2 overflow-x-auto md:hidden">
            {NAV.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={withSite(href)}
                  className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm ${
                    active ? "bg-accent/20 text-white" : "bg-ink-800 text-slate-400"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
          {children}
        </main>
      </div>
    </div>
  );
}
