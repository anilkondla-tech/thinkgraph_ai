"use client";

import { useMemo, useRef, useState } from "react";
import type { GraphEdge, GraphNode } from "@/lib/types";
import { PALETTE } from "./charts";
import { IconExternal } from "./icons";

type Pos = { x: number; y: number };

const W = 1000;
const H = 700;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const MAX_EDGES = 1600;

export default function GraphCanvas({
  nodes,
  edges,
  siteUrl,
}: {
  nodes: GraphNode[];
  edges: GraphEdge[];
  siteUrl: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [activeCluster, setActiveCluster] = useState<string | null>(null);
  const [view, setView] = useState({ tx: 0, ty: 0, scale: 1 });
  const drag = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);

  const { positions, clusters, colorOf } = useMemo(() => {
    const byCat = new Map<string, GraphNode[]>();
    nodes.forEach((n) => {
      const l = byCat.get(n.category) ?? [];
      l.push(n);
      byCat.set(n.category, l);
    });
    const clusterList = Array.from(byCat.entries()).sort(
      (a, b) => b[1].length - a[1].length
    );
    const colorOf = new Map<string, string>();
    clusterList.forEach(([cat], i) => colorOf.set(cat, PALETTE[i % PALETTE.length]));

    const cx = W / 2;
    const cy = H / 2;
    const K = clusterList.length;
    const ringR = K <= 1 ? 0 : Math.min(W, H) * 0.32;
    const positions = new Map<string, Pos>();

    clusterList.forEach(([cat, group], k) => {
      const ang = (k / Math.max(1, K)) * Math.PI * 2 - Math.PI / 2;
      const ccx = cx + ringR * Math.cos(ang);
      const ccy = cy + ringR * Math.sin(ang);
      const spread = 9 + Math.sqrt(group.length) * 4;
      group.forEach((n, j) => {
        const a = j * GOLDEN;
        const rad = spread * Math.sqrt(j);
        positions.set(n.id, {
          x: ccx + rad * Math.cos(a),
          y: ccy + rad * Math.sin(a),
        });
      });
    });

    return {
      positions,
      clusters: clusterList.map(([cat, g]) => ({ cat, count: g.length })),
      colorOf,
    };
  }, [nodes]);

  const nodeById = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  const neighborIds = useMemo(() => {
    if (!selected) return new Set<string>();
    const set = new Set<string>();
    edges.forEach((e) => {
      if (e.source === selected) set.add(e.target);
      if (e.target === selected) set.add(e.source);
    });
    return set;
  }, [selected, edges]);

  const shownEdges = edges.slice(0, MAX_EDGES);
  const selectedNode = selected ? nodeById.get(selected) : null;

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.12 : 0.89;
    setView((v) => ({ ...v, scale: Math.max(0.4, Math.min(4, v.scale * factor)) }));
  };
  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, tx: view.tx, ty: view.ty };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    // Capture values immediately — drag.current may be null by the time
    // React flushes the setView updater (e.g. if onPointerUp fires first).
    const { tx: baseTx, ty: baseTy, x: startX, y: startY } = drag.current;
    setView((v) => ({
      ...v,
      tx: baseTx + (e.clientX - startX),
      ty: baseTy + (e.clientY - startY),
    }));
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  const isDim = (n: GraphNode) =>
    (activeCluster && n.category !== activeCluster) ||
    (selected && n.id !== selected && !neighborIds.has(n.id));

  return (
    <div className="relative">
      {/* Legend */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {clusters.map((c) => {
          const active = activeCluster === c.cat;
          return (
            <button
              key={c.cat}
              onClick={() => setActiveCluster(active ? null : c.cat)}
              className={`pill border transition ${
                active
                  ? "border-white/30 bg-white/10 text-white"
                  : "border-transparent bg-white/[0.04] text-slate-400 hover:text-slate-200"
              }`}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: colorOf.get(c.cat) }}
              />
              {c.cat}
              <span className="text-slate-500">{c.count}</span>
            </button>
          );
        })}
      </div>

      <div className="card relative overflow-hidden">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-[560px] w-full cursor-grab touch-none select-none active:cursor-grabbing"
          onWheel={onWheel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          <g transform={`translate(${view.tx} ${view.ty}) scale(${view.scale})`}>
            {/* edges */}
            <g>
              {shownEdges.map((e, i) => {
                const s = positions.get(e.source);
                const t = positions.get(e.target);
                if (!s || !t) return null;
                const hot =
                  selected && (e.source === selected || e.target === selected);
                return (
                  <line
                    key={i}
                    x1={s.x}
                    y1={s.y}
                    x2={t.x}
                    y2={t.y}
                    stroke={hot ? "#a99bff" : "rgba(255,255,255,0.06)"}
                    strokeWidth={hot ? 1.4 : 0.7}
                  />
                );
              })}
            </g>
            {/* nodes */}
            <g>
              {nodes.map((n) => {
                const p = positions.get(n.id);
                if (!p) return null;
                const r = 3 + Math.min(9, n.inDegree * 1.3);
                const dim = isDim(n);
                const color = n.orphan ? "#ff6b8b" : colorOf.get(n.category) ?? "#7c6cff";
                return (
                  <circle
                    key={n.id}
                    cx={p.x}
                    cy={p.y}
                    r={r}
                    fill={color}
                    opacity={dim ? 0.12 : selected === n.id ? 1 : 0.92}
                    stroke={selected === n.id ? "#fff" : "rgba(0,0,0,0.35)"}
                    strokeWidth={selected === n.id ? 2 : 0.6}
                    className="cursor-pointer transition-opacity"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      setSelected(selected === n.id ? null : n.id);
                    }}
                  >
                    <title>{n.label}</title>
                  </circle>
                );
              })}
            </g>
          </g>
        </svg>

        {/* overlay hint */}
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-ink-950/70 px-2.5 py-1 text-[11px] text-slate-500">
          scroll to zoom · drag to pan · click a node
        </div>

        {/* selected node panel */}
        {selectedNode && (
          <div className="absolute right-3 top-3 w-72 animate-fade-up rounded-xl border border-white/10 bg-ink-900/95 p-4 shadow-glow backdrop-blur">
            <div className="mb-2 flex items-start justify-between gap-2">
              <span
                className="pill"
                style={{
                  background: `${colorOf.get(selectedNode.category)}22`,
                  color: colorOf.get(selectedNode.category),
                }}
              >
                {selectedNode.category}
              </span>
              <button
                onClick={() => setSelected(null)}
                className="text-slate-500 hover:text-white"
              >
                ✕
              </button>
            </div>
            <h4 className="text-sm font-semibold leading-snug text-white">
              {selectedNode.label}
            </h4>
            <dl className="mt-3 space-y-1.5 text-xs text-slate-400">
              <Row k="Inbound links" v={String(selectedNode.inDegree)} warn={selectedNode.orphan} />
              <Row k="Outbound links" v={String(selectedNode.outDegree)} />
              <Row k="Focus keyword" v={selectedNode.keyword ?? "— none —"} warn={!selectedNode.keyword} />
              <Row k="Author" v={selectedNode.author} />
              <Row k="Published" v={selectedNode.date.slice(0, 10)} />
            </dl>
            {selectedNode.orphan && (
              <p className="mt-3 rounded-lg bg-rose/10 px-2.5 py-2 text-[11px] text-rose">
                Orphan — no inbound internal links. Link to it from related posts.
              </p>
            )}
            {siteUrl && selectedNode.slug && (
              <a
                href={`${siteUrl.replace(/\/$/, "")}/${selectedNode.slug}/`}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-accent-soft hover:text-white"
              >
                Open article <IconExternal className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ k, v, warn }: { k: string; v: string; warn?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt>{k}</dt>
      <dd className={warn ? "font-medium text-rose" : "text-slate-200"}>{v}</dd>
    </div>
  );
}
