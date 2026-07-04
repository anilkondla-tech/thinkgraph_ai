"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo, IconDatabase, IconCheck, IconSparkle } from "@/components/icons";

type FormState = {
  label: string;
  host: string;
  port: string;
  user: string;
  password: string;
  database: string;
  prefix: string;
};

type Status = "idle" | "testing" | "success" | "error";

const FIELD_ROWS: {
  id: keyof FormState;
  label: string;
  type?: string;
  placeholder: string;
  hint?: string;
}[] = [
  { id: "label",    label: "Site name",      placeholder: "My WordPress Blog",       hint: "A friendly name shown in the site switcher" },
  { id: "host",     label: "Database host",  placeholder: "db.yourhost.com",         hint: "MySQL hostname — usually localhost or a remote DB host" },
  { id: "port",     label: "Port",           placeholder: "3306" },
  { id: "user",     label: "Database user",  placeholder: "wp_user" },
  { id: "password", label: "Password",       placeholder: "••••••••", type: "password" },
  { id: "database", label: "Database name",  placeholder: "wordpress_db" },
  { id: "prefix",   label: "Table prefix",   placeholder: "wp_",                     hint: "Usually wp_ — check wp-config.php if unsure" },
];

export default function OnboardingPage() {

  const [form, setForm] = useState<FormState>({
    label: "",
    host: "",
    port: "3306",
    user: "",
    password: "",
    database: "",
    prefix: "wp_",
  });
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const set = (field: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("testing");
    setErrorMsg("");

    try {
      const res = await fetch("/api/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Connection failed");
      setStatus("success");
      // Use full page navigation (not router.push) so the server re-renders
      // the root layout with the Shell — onboarding is a bare page.
      setTimeout(() => { window.location.href = `/?site=${encodeURIComponent(data.site.key)}`; }, 1400);
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ink-950 px-4 py-16">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-accent/[0.1] blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-[400px] w-[400px] rounded-full bg-teal/[0.06] blur-3xl" />
      </div>

      {/* Back link */}
      <Link
        href="/"
        className="absolute left-6 top-6 flex items-center gap-2 text-xs text-slate-500 transition hover:text-slate-300"
      >
        ← Back to dashboard
      </Link>

      <div className="relative z-10 w-full max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2.5">
            <Logo className="h-9 w-9" />
            <div className="leading-tight text-left">
              <div className="text-[16px] font-semibold text-white">ThinkGraph</div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-soft">AI</div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">Connect your WordPress site</h1>
          <p className="mt-2 text-sm text-slate-400">
            Enter your MySQL database credentials. ThinkGraph reads your posts,
            categories, keywords, and internal links — never writes or modifies data.
          </p>
        </div>

        {/* Security notice */}
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-teal/[0.15] bg-teal/[0.06] px-4 py-3.5 text-xs text-slate-300">
          <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
          <span>
            Credentials are <strong className="text-white">AES-256-GCM encrypted</strong> and stored in a
            server-only HttpOnly cookie — never exposed to the browser or third parties.
          </span>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="card card-pad space-y-4"
          autoComplete="off"
        >
          {FIELD_ROWS.map(({ id, label, type = "text", placeholder, hint }) => (
            <div key={id}>
              <label
                htmlFor={id}
                className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-400"
              >
                {label}
              </label>
              <input
                id={id}
                type={type}
                value={form[id]}
                onChange={(e) => set(id, e.target.value)}
                placeholder={placeholder}
                autoComplete={type === "password" ? "new-password" : "off"}
                className="w-full rounded-xl border border-white/[0.08] bg-ink-800 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent/30"
              />
              {hint && (
                <p className="mt-1 text-[11px] text-slate-600">{hint}</p>
              )}
            </div>
          ))}

          {status === "error" && (
            <div className="rounded-xl border border-rose/20 bg-rose/[0.08] px-4 py-3 text-xs text-rose">
              {errorMsg}
            </div>
          )}

          {status === "success" && (
            <div className="flex items-center gap-2 rounded-xl border border-teal/20 bg-teal/[0.08] px-4 py-3 text-xs text-teal">
              <IconCheck className="h-4 w-4 shrink-0" />
              Connected! Redirecting to your dashboard…
            </div>
          )}

          <button
            type="submit"
            disabled={status === "testing" || status === "success"}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-accent-glow disabled:cursor-not-allowed disabled:opacity-60"
          >
            <IconDatabase className="h-4 w-4" />
            {status === "testing" ? "Testing connection…" : "Connect & open dashboard"}
          </button>
        </form>

        {/* Pro tip */}
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-white/[0.05] bg-ink-850/50 px-4 py-3.5 text-xs text-slate-500">
          <IconSparkle className="mt-0.5 h-4 w-4 shrink-0 text-accent-soft" />
          <span>
            <strong className="text-slate-400">Tip:</strong> Find your credentials in{" "}
            <code className="rounded bg-ink-700 px-1.5 py-0.5 text-accent-soft">wp-config.php</code>{" "}
            (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME). Use{" "}
            <code className="rounded bg-ink-700 px-1.5 py-0.5 text-accent-soft">127.0.0.1</code>{" "}
            instead of <code className="rounded bg-ink-700 px-1.5 py-0.5 text-accent-soft">localhost</code>{" "}
            if connecting remotely.
          </span>
        </div>
      </div>
    </div>
  );
}
