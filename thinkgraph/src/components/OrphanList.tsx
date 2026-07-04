"use client";

import { useState } from "react";
import type { GraphNode } from "@/lib/types";

function postUrl(siteUrl: string, slug: string) {
  if (!siteUrl) return null;
  return `${siteUrl.replace(/\/$/, "")}/${slug}/`;
}

export default function OrphanList({
  orphans,
  siteUrl,
}: {
  orphans: GraphNode[];
  siteUrl: string;
}) {
  const [open, setOpen] = useState(false);
  const count = orphans.length;

  return (
    <div>
      {/* Stat card — clickable when orphans exist */}
      <button
        onClick={() => count > 0 && setOpen((v) => !v)}
        className={`card card-pad animate-fade-up w-full text-left transition ${
          count > 0 ? "hover:border-rose/20 cursor-pointer" : "cursor-default"
        }`}
      >
        <div className="label-muted">Orphan posts</div>
        <div className="mt-2 text-3xl font-semibold tracking-tight text-rose">
          {count.toLocaleString()}
        </div>
        <div className="mt-1 text-xs text-slate-500">
          {count > 0
            ? `${open ? "▲ Hide" : "▼ Show"} ${count} orphan${count === 1 ? "" : "s"}`
            : "No inbound internal links"}
        </div>
      </button>

      {/* Expandable orphan list */}
      {open && count > 0 && (
        <div className="card card-pad mt-2 max-h-72 overflow-y-auto">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Orphan posts — no inbound internal links
          </h4>
          <ul className="space-y-2">
            {orphans.map((n) => {
              const href = postUrl(siteUrl, n.slug);
              return (
                <li key={n.id} className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-accent-soft hover:text-white transition truncate block"
                      >
                        {n.label}
                      </a>
                    ) : (
                      <span className="text-sm text-slate-300 truncate block">{n.label}</span>
                    )}
                  </div>
                  <span className="shrink-0 rounded-full bg-white/[0.04] px-2 py-0.5 text-[10px] text-slate-500">
                    {n.category}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
