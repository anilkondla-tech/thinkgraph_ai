"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { IconDatabase, IconBolt } from "./icons";

export default function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (status === "loading") {
    return (
      <div className="h-8 w-32 animate-pulse rounded-xl bg-ink-700" />
    );
  }

  if (!session) return null;

  const name = session.user?.name ?? "User";
  const email = session.user?.email ?? "";
  const image = session.user?.image ?? null;
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-ink-800 px-2.5 py-1.5 text-sm transition hover:border-white/[0.15]"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {image ? (
          <Image
            src={image}
            alt={name}
            width={24}
            height={24}
            className="h-6 w-6 rounded-full object-cover"
          />
        ) : (
          <div className="grid h-6 w-6 place-items-center rounded-full bg-accent/20 text-[10px] font-bold text-accent-soft">
            {initials}
          </div>
        )}
        <span className="hidden max-w-[120px] truncate text-xs font-medium text-slate-300 md:block">
          {name}
        </span>
        <svg
          viewBox="0 0 16 16"
          className={`h-3.5 w-3.5 shrink-0 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <path d="m4 6 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-800 shadow-card"
        >
          {/* Profile */}
          <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3.5">
            {image ? (
              <Image
                src={image}
                alt={name}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="grid h-8 w-8 place-items-center rounded-full bg-accent/20 text-xs font-bold text-accent-soft">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white">{name}</p>
              <p className="truncate text-[11px] text-slate-500">{email}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="p-1.5">
            <Link
              href="/onboarding"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
            >
              <IconDatabase className="h-4 w-4 shrink-0" />
              Connect WordPress site
            </Link>
            <Link
              href="/upgrade"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs text-accent-soft transition hover:bg-accent/[0.08] hover:text-white"
            >
              <IconBolt className="h-4 w-4 shrink-0" />
              Upgrade to Pro
            </Link>
          </div>

          <div className="border-t border-white/[0.06] p-1.5">
            <button
              role="menuitem"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs text-slate-500 transition hover:bg-white/[0.04] hover:text-rose"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
