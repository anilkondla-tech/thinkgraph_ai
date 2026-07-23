import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 270 280" className={`${className ?? ""} animate-spin-slow`} aria-hidden="true">
      <defs>
        <filter id="lg-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <line x1="48" y1="80" x2="120" y2="52" stroke="rgba(94,106,210,0.22)" strokeWidth="1.2" />
      <line x1="48" y1="80" x2="130" y2="152" stroke="rgba(94,106,210,0.22)" strokeWidth="1.2" />
      <line x1="48" y1="80" x2="58" y2="168" stroke="rgba(94,106,210,0.22)" strokeWidth="1.2" />
      <line x1="120" y1="52" x2="200" y2="42" stroke="rgba(94,106,210,0.22)" strokeWidth="1.2" />
      <line x1="120" y1="52" x2="130" y2="152" stroke="rgba(94,106,210,0.22)" strokeWidth="1.2" />
      <line x1="200" y1="42" x2="248" y2="90" stroke="rgba(94,106,210,0.22)" strokeWidth="1.2" />
      <line x1="200" y1="42" x2="220" y2="172" stroke="rgba(94,106,210,0.22)" strokeWidth="1.2" />
      <line x1="130" y1="152" x2="58" y2="168" stroke="rgba(94,106,210,0.22)" strokeWidth="1.2" />
      <line x1="130" y1="152" x2="220" y2="172" stroke="rgba(94,106,210,0.22)" strokeWidth="1.2" />
      <line x1="130" y1="152" x2="78" y2="246" stroke="rgba(94,106,210,0.22)" strokeWidth="1.2" />
      <line x1="130" y1="152" x2="192" y2="244" stroke="rgba(94,106,210,0.22)" strokeWidth="1.2" />
      <line x1="220" y1="172" x2="192" y2="244" stroke="rgba(94,106,210,0.22)" strokeWidth="1.2" />
      <line x1="220" y1="172" x2="248" y2="90" stroke="rgba(94,106,210,0.22)" strokeWidth="1.2" />
      <line x1="78" y1="246" x2="192" y2="244" stroke="rgba(94,106,210,0.22)" strokeWidth="1.2" />
      <line x1="22" y1="218" x2="58" y2="168" stroke="rgba(94,106,210,0.22)" strokeWidth="1.2" />
      <g filter="url(#lg-glow)">
        <circle cx="48" cy="80" r="24" fill="#5E6AD2" opacity="0.07" />
        <circle cx="48" cy="80" r="10" fill="#5E6AD2" opacity="0.88" />
      </g>
      <g>
        <circle cx="200" cy="42" r="16.8" fill="#8B94E8" opacity="0.07" />
        <circle cx="200" cy="42" r="7" fill="#8B94E8" opacity="0.88" />
      </g>
      <g filter="url(#lg-glow)">
        <circle cx="130" cy="152" r="31.2" fill="#3EDBC2" opacity="0.07" />
        <circle cx="130" cy="152" r="13" fill="#3EDBC2" opacity="0.88" />
      </g>
      <g>
        <circle cx="22" cy="218" r="12" fill="#8B94E8" opacity="0.07" />
        <circle cx="22" cy="218" r="5" fill="#8B94E8" opacity="0.88" />
      </g>
      <g>
        <circle cx="220" cy="172" r="19.2" fill="#5E6AD2" opacity="0.07" />
        <circle cx="220" cy="172" r="8" fill="#5E6AD2" opacity="0.88" />
      </g>
      <g>
        <circle cx="78" cy="246" r="14.4" fill="#3EDBC2" opacity="0.07" />
        <circle cx="78" cy="246" r="6" fill="#3EDBC2" opacity="0.88" />
      </g>
      <g filter="url(#lg-glow)">
        <circle cx="192" cy="244" r="26.4" fill="#F5A623" opacity="0.07" />
        <circle cx="192" cy="244" r="11" fill="#F5A623" opacity="0.88" />
      </g>
      <g>
        <circle cx="120" cy="52" r="12" fill="#8B94E8" opacity="0.07" />
        <circle cx="120" cy="52" r="5" fill="#8B94E8" opacity="0.88" />
      </g>
      <g>
        <circle cx="248" cy="90" r="12" fill="#5E6AD2" opacity="0.07" />
        <circle cx="248" cy="90" r="5" fill="#5E6AD2" opacity="0.88" />
      </g>
      <g>
        <circle cx="58" cy="168" r="9.6" fill="#3EDBC2" opacity="0.07" />
        <circle cx="58" cy="168" r="4" fill="#3EDBC2" opacity="0.88" />
      </g>
    </svg>
  );
}

export const IconGrid = (p: P) => (
  <svg {...base} {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

export const IconGraph = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="5" cy="6" r="2.5" />
    <circle cx="18" cy="5" r="2" />
    <circle cx="19" cy="17" r="2.5" />
    <circle cx="8" cy="18" r="2" />
    <line x1="7" y1="7" x2="16" y2="6" />
    <line x1="7" y1="16" x2="17" y2="16" />
    <line x1="6" y1="8" x2="8" y2="16" />
    <line x1="18" y1="7" x2="19" y2="15" />
  </svg>
);

export const IconLayers = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 3 21 8 12 13 3 8z" />
    <path d="M3 13 12 18 21 13" />
  </svg>
);

export const IconBolt = (p: P) => (
  <svg {...base} {...p}>
    <path d="M13 2 4 14h6l-1 8 9-12h-6z" />
  </svg>
);

export const IconChevron = (p: P) => (
  <svg {...base} {...p}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const IconCheck = (p: P) => (
  <svg {...base} {...p}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const IconX = (p: P) => (
  <svg {...base} {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export const IconDatabase = (p: P) => (
  <svg {...base} {...p}>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);

export const IconLink = (p: P) => (
  <svg {...base} {...p}>
    <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
    <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
  </svg>
);

export const IconKey = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="7.5" cy="15.5" r="4.5" />
    <path d="m10.5 12.5 8-8" />
    <path d="m16 5 3 3" />
    <path d="m13 8 2 2" />
  </svg>
);

export const IconWrite = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
  </svg>
);

export const IconRefresh = (p: P) => (
  <svg {...base} {...p}>
    <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
    <path d="M21 3v5h-5" />
  </svg>
);

export const IconSplit = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 3v6" />
    <path d="M12 9 7 14v7" />
    <path d="m12 9 5 5v7" />
  </svg>
);

export const IconSparkle = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
    <path d="M12 8a4 4 0 0 0 4 4 4 4 0 0 0-4 4 4 4 0 0 0-4-4 4 4 0 0 0 4-4z" />
  </svg>
);

export const IconAlert = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 9v4M12 17h.01" />
    <path d="M10.3 3.9 2 18a2 2 0 0 0 1.7 3h16.6A2 2 0 0 0 22 18L13.7 3.9a2 2 0 0 0-3.4 0z" />
  </svg>
);

export const IconExternal = (p: P) => (
  <svg {...base} {...p}>
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </svg>
);

export const IconEdit = (p: P) => (
  <svg {...base} {...p}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

export const IconTrash = (p: P) => (
  <svg {...base} {...p}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

export const IconPlus = (p: P) => (
  <svg {...base} {...p}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
