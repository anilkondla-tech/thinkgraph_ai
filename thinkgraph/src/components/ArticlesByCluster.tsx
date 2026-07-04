"use client";

import { useState } from "react";
import type { GraphNode } from "@/lib/types";

export type ClusterGroup = {
  category: string;
  nodes: GraphNode[];
};

function postUrl(siteUrl: string, slug: string) {
  if (!siteUrl) return null;
  return `${siteUrl.replace(/\/$/, "")}/${slug}/`;
}

export default function ArticlesByCluster({
  groups,
  siteUrl,
}: {
  groups: ClusterGroup[];
  siteUrl: string;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (cat: string) =>
    setExpanded((prev) => (prev === cat ? null : cat));

  return (
    <div className="card card-pad">
      <h3 className="mb-4 text-sm font-semibold text-white">Articles by Cluster / Category</h3>
      <div className="space-y-1">
        {groups.map(({ category, nodes }) => {
          const isOpen = expanded === category;
          const orphanCount = nodes.filter((n) => n.orphan).length;
          return (
            <div key={category}>
              {/* Cluster header row */}
              <button
                onClick={() => toggle(category)}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition hover:bg-white/[0.04]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full transition-transform ${
                      isOpen ? "bg-accent scale-125" : "bg-slate-600"
                    }`}
                  />
                  <span className="text-sm font-medium text-slate-200 truncate">
                    {category}
                  </span>
                  <span className="shrink-0 rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] text-slate-400">
                    {nodes.length}
                  </span>
                  {orphanCount > 0 && (
                    <span className="shrink-0 rounded-full bg-rose/[0.12] px-2 py-0.5 text-[10px] text-rose">
                      {orphanCount} orphan{orphanCount === 1 ? "" : "s"}
                    </span>
                  )}
                </div>
                <svg
                  viewBox="0 0 16 16"
                  className={`h-3.5 w-3.5 shrink-0 text-slate-600 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path d="m4 6 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Article list */}
              {isOpen && (
                <ul className="mb-2 ml-4 space-y-1 border-l border-white/[0.06] pl-3">
                  {nodes.map((n) => {
                    const href = postUrl(siteUrl, n.slug);
                    return (
                      <li key={n.id} className="flex items-center gap-2 py-0.5">
                        {n.orphan && (
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-rose" title="Orphan — no inbound links" />
                        )}
                        {href ? (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="min-w-0 truncate text-xs text-slate-400 hover:text-accent-soft transition"
                          >
                            {n.label}
                          </a>
                        ) : (
                          <span className="min-w-0 truncate text-xs text-slate-400">
                            {n.label}
                          </span>
                        )}
                        {n.keyword && (
                          <span className="shrink-0 hidden md:inline rounded bg-white/[0.04] px-1.5 py-px text-[10px] text-slate-600">
                            {n.keyword}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
      {!siteUrl && (
        <p className="mt-3 text-[11px] text-slate-600">
          Add a site URL in workspace settings to enable article hyperlinks.
        </p>
      )}
    </div>
  );
}
