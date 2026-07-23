// Lightweight, dependency-free SVG charts — server-renderable.

const PALETTE = [
  "#5E6AD2",
  "#3EDBC2",
  "#F5A623",
  "#F25F7B",
  "#4E9AF1",
  "#A67CFF",
  "#4FD17A",
  "#FF8F5E",
  "#6BE0FF",
  "#D06BD1",
];

export function BarList({
  data,
  valueLabel,
}: {
  data: { label: string; value: number }[];
  valueLabel?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="space-y-3">
      {data.map((d, i) => (
        <div key={d.label} className="group">
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <span className="truncate text-sm text-slate-300 group-hover:text-white transition-colors">{d.label}</span>
            <span className="shrink-0 text-xs tabular-nums text-slate-500 font-mono">
              {d.value.toLocaleString()}
              {valueLabel ? ` ${valueLabel}` : ""}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-surface">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(d.value / max) * 100}%`,
                background: `linear-gradient(90deg, ${PALETTE[i % PALETTE.length]}, ${PALETTE[i % PALETTE.length]}88)`,
                boxShadow: `0 0 12px -4px ${PALETTE[i % PALETTE.length]}66`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function WeeklyTrend({
  data,
}: {
  data: { week: string; count: number }[];
}) {
  const w = 680;
  const h = 140;
  const pad = 8;
  if (data.length === 0) {
    return <div className="py-10 text-center text-sm text-slate-600">No publishing data</div>;
  }
  const max = Math.max(1, ...data.map((d) => d.count));
  const stepX = data.length > 1 ? (w - pad * 2) / (data.length - 1) : 0;
  const x = (i: number) => pad + i * stepX;
  const y = (v: number) => h - pad - (v / max) * (h - pad * 2);

  const line = data.map((d, i) => `${x(i)},${y(d.count)}`).join(" ");
  const area = `${pad},${h - pad} ${line} ${x(data.length - 1)},${h - pad}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5E6AD2" stopOpacity="0.25" />
          <stop offset="1" stopColor="#5E6AD2" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="trendStroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5E6AD2" />
          <stop offset="1" stopColor="#3EDBC2" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#trendFill)" />
      <polyline
        points={line}
        fill="none"
        stroke="url(#trendStroke)"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {data.map((d, i) => (
        <circle key={d.week} cx={x(i)} cy={y(d.count)} r="1.5" fill="#8B94E8" />
      ))}
    </svg>
  );
}

export function Donut({
  data,
}: {
  data: { label: string; value: number }[];
}) {
  const total = data.reduce((a, d) => a + d.value, 0) || 1;
  let acc = 0;
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-5">
      <svg viewBox="0 0 130 130" className="-rotate-90 shrink-0 w-24 h-24 sm:w-[130px] sm:h-[130px]">
        <circle cx="65" cy="65" r={r} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="14" />
        {data.map((d, i) => {
          const frac = d.value / total;
          const dash = frac * c;
          const gap = 2; // Small gap between segments
          const seg = (
            <circle
              key={d.label}
              cx="65"
              cy="65"
              r={r}
              fill="none"
              stroke={PALETTE[i % PALETTE.length]}
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={`${Math.max(0, dash - gap)} ${c - dash + gap}`}
              strokeDashoffset={-acc * c}
              style={{ filter: `drop-shadow(0 0 4px ${PALETTE[i % PALETTE.length]}44)` }}
            />
          );
          acc += frac;
          return seg;
        })}
      </svg>
      <ul className="space-y-2 text-sm">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center gap-2.5">
            <span
              className="h-2.5 w-2.5 rounded-sm"
              style={{ background: PALETTE[i % PALETTE.length], boxShadow: `0 0 6px ${PALETTE[i % PALETTE.length]}44` }}
            />
            <span className="text-slate-300">{d.label}</span>
            <span className="text-slate-600 font-mono text-xs">{d.value.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { PALETTE };
