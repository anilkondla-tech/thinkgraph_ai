"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState, useRef, useEffect } from "react";
import type { SiteMeta } from "@/lib/types";
import { Logo, IconGrid, IconGraph, IconLayers, IconBolt, IconChevron, IconSparkle, IconDatabase, IconCheck } from "./icons";
import UserMenu from "./UserMenu";

const NAV = [
  { href: "/", label: "Overview", icon: IconGrid },
  { href: "/graph", label: "Content Graph", icon: IconGraph },
  { href: "/clusters", label: "Clusters & Gaps", icon: IconLayers },
  { href: "/plan", label: "Action Plan", icon: IconBolt },
  { href: "/workspaces", label: "Workspaces", icon: IconDatabase },
  { href: "/upgrade", label: "Upgrade", icon: IconSparkle },
];

export default function Shell({
  sites,
  isAuthenticated = false,
  children,
}: {
  sites: SiteMeta[];
  isAuthenticated?: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [sitePickerOpen, setSitePickerOpen] = useState(false);
  const sitePickerRef = useRef<HTMLDivElement>(null);

  // Close site picker on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (sitePickerRef.current && !sitePickerRef.current.contains(e.target as Node)) {
        setSitePickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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
          {!isAuthenticated ? (
            /* Demo mode — identical card structure to authenticated */
            <div className="rounded-xl border border-accent/[0.2] bg-gradient-to-br from-accent/[0.1] to-transparent p-3.5">
              <div className="mb-1 flex items-center gap-1.5">
                <IconSparkle className="h-3.5 w-3.5 text-accent-soft" />
                <span className="text-[11px] font-semibold text-white">Workspace</span>
              </div>
              <p className="text-[10px] leading-relaxed text-slate-500 mb-2">
                Demo workspace · sign in to connect your own site.
              </p>
              <a
                href="/login"
                className="block rounded-lg bg-accent/[0.15] py-1.5 text-center text-[11px] font-semibold text-accent-soft transition hover:bg-accent/[0.25]"
              >
                Sign in →
              </a>
            </div>
          ) : (
            /* Authenticated: workspace list + connect CTA */
            <div className="rounded-xl border border-accent/[0.2] bg-gradient-to-br from-accent/[0.1] to-transparent p-3.5">
              <div className="mb-1 flex items-center gap-1.5">
                <IconSparkle className="h-3.5 w-3.5 text-accent-soft" />
                <span className="text-[11px] font-semibold text-white">Workspaces</span>
              </div>
              <p className="text-[10px] leading-relaxed text-slate-500 mb-2">
                {sites.length === 1 && sites[0].key === "demo"
                  ? "No sites connected yet."
                  : `${sites.length} site${sites.length === 1 ? "" : "s"} connected.`}
              </p>
              <Link
                href="/onboarding"
                className="block rounded-lg bg-accent/[0.15] py-1.5 text-center text-[11px] font-semibold text-accent-soft transition hover:bg-accent/[0.25]"
              >
                + Connect WordPress site
              </Link>
            </div>
          )}
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
            {/* Site picker — shown for ALL users (demo or authenticated) */}
            <div className="relative" ref={sitePickerRef}>
              <button
                onClick={() => isAuthenticated && setSitePickerOpen((v) => !v)}
                aria-haspopup={isAuthenticated ? "listbox" : undefined}
                aria-expanded={isAuthenticated ? sitePickerOpen : undefined}
                className={`flex min-w-[180px] max-w-[240px] items-center gap-2.5 rounded-xl border border-white/[0.08] bg-ink-800 py-2 pl-3.5 pr-3 text-sm font-medium text-slate-100 transition ${
                  isAuthenticated ? "hover:border-white/20 cursor-pointer" : "cursor-default"
                }`}
              >
                <IconDatabase className="h-4 w-4 shrink-0 text-slate-500" />
                <span className="flex-1 truncate text-left">
                  {sites.find((s) => s.key === currentSite)?.label ?? currentSite}
                </span>
                {isAuthenticated && (
                  <IconChevron
                    className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${
                      sitePickerOpen ? "rotate-180" : ""
                    }`}
                  />
                )}
              </button>

              {isAuthenticated && sitePickerOpen && (
                <div
                  role="listbox"
                  aria-label="Select workspace"
                  className="absolute right-0 top-full z-50 mt-2 min-w-full w-max overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-800 shadow-card"
                >
                  {sites.map((s) => (
                    <button
                      key={s.key}
                      role="option"
                      aria-selected={s.key === currentSite}
                      onClick={() => {
                        onSiteChange(s.key);
                        setSitePickerOpen(false);
                      }}
                      className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-sm transition hover:bg-white/[0.04] ${
                        s.key === currentSite
                          ? "bg-accent/[0.08] text-white"
                          : "text-slate-400 hover:text-slate-100"
                      }`}
                    >
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                        {s.key === currentSite && (
                          <IconCheck className="h-3.5 w-3.5 text-accent-soft" />
                        )}
                      </span>
                      <span className="truncate">{s.label}</span>
                    </button>
                  ))}
                  <div className="border-t border-white/[0.06] p-1.5">
                    <Link
                      href="/workspaces"
                      onClick={() => setSitePickerOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-slate-500 transition hover:bg-white/[0.04] hover:text-slate-300"
                    >
                      <IconDatabase className="h-3.5 w-3.5 shrink-0" />
                      Manage workspaces
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => startTransition(() => router.refresh())}
              className="rounded-xl border border-white/[0.08] bg-ink-800 px-3.5 py-2 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:text-white"
            >
              {pending ? "…" : "Refresh"}
            </button>
            {!isAuthenticated ? (
              <a
                href="/login"
                className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:bg-accent-glow"
              >
                Sign in
              </a>
            ) : (
              <UserMenu />
            )}
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
