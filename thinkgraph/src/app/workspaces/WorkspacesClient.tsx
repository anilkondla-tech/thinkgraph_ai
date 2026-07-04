"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { SiteMeta } from "@/lib/types";
import {
  IconDatabase,
  IconCheck,
  IconEdit,
  IconTrash,
  IconPlus,
  IconX,
} from "@/components/icons";

// Site connection without the password (safe to pass to client)
type SafeSite = {
  key: string;
  label: string;
  url: string;
  host: string;
  port: number;
  user: string;
  database: string;
  prefix: string;
};

type EditState = {
  label: string;
  host: string;
  port: string;
  user: string;
  password: string;
  database: string;
  prefix: string;
};

type EditStatus = "idle" | "saving" | "success" | "error";

const FIELD_ROWS: {
  id: keyof EditState;
  label: string;
  type?: string;
  placeholder: string;
  hint?: string;
}[] = [
  { id: "label",    label: "Site name",     placeholder: "My WordPress Blog" },
  { id: "host",     label: "Database host", placeholder: "db.yourhost.com",  hint: "MySQL hostname" },
  { id: "port",     label: "Port",          placeholder: "3306" },
  { id: "user",     label: "Database user", placeholder: "wp_user" },
  {
    id: "password",
    label: "Password",
    type: "password",
    placeholder: "Leave blank to keep existing",
    hint: "Only fill this if you want to change the password",
  },
  { id: "database", label: "Database name", placeholder: "wordpress_db" },
  { id: "prefix",   label: "Table prefix",  placeholder: "wp_", hint: "Check wp-config.php if unsure" },
];

export default function WorkspacesClient({
  demoSite,
  userSites,
}: {
  demoSite: SiteMeta;
  userSites: SafeSite[];
}) {
  const router = useRouter();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditState | null>(null);
  const [editStatus, setEditStatus] = useState<EditStatus>("idle");
  const [editError, setEditError] = useState("");

  const [deleteKey, setDeleteKey] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  function openEdit(site: SafeSite) {
    setEditingKey(site.key);
    setEditForm({
      label: site.label,
      host: site.host,
      port: String(site.port),
      user: site.user,
      password: "",
      database: site.database,
      prefix: site.prefix,
    });
    setEditStatus("idle");
    setEditError("");
  }

  function closeEdit() {
    setEditingKey(null);
    setEditForm(null);
    setEditStatus("idle");
    setEditError("");
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editForm) return;
    setEditStatus("saving");
    setEditError("");

    try {
      const res = await fetch("/api/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          // Tell the API to keep the existing password if the field is blank
          keepPassword: editForm.password === "" ? "true" : "false",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setEditStatus("success");
      setTimeout(() => {
        closeEdit();
        router.refresh();
      }, 900);
    } catch (err: unknown) {
      setEditStatus("error");
      setEditError(err instanceof Error ? err.message : "Unknown error");
    }
  }

  function confirmDelete(key: string) {
    setDeleteKey(key);
  }

  function handleDelete() {
    if (!deleteKey) return;
    startDeleteTransition(async () => {
      try {
        const res = await fetch("/api/connect", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: deleteKey }),
        });
        if (!res.ok) throw new Error("Delete failed");
        setDeleteKey(null);
        router.refresh();
      } catch (err) {
        console.error(err);
      }
    });
  }

  return (
    <div>
      {/* Page header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Workspaces</h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage your connected WordPress sites. The demo workspace is always available.
          </p>
        </div>
        <Link
          href="/onboarding"
          className="inline-flex w-fit items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:bg-accent-glow"
        >
          <IconPlus className="h-4 w-4" />
          Connect new site
        </Link>
      </div>

      {/* Workspace grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* ── Demo card ── */}
        <div className="card card-pad flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="pill mb-2 bg-amber/[0.12] text-amber ring-1 ring-amber/[0.2] text-[10px]">
                <span className="h-1.5 w-1.5 rounded-full bg-amber" />
                Demo
              </span>
              <h3 className="mt-1 font-semibold text-white">{demoSite.label}</h3>
              <p className="mt-0.5 text-xs text-slate-500 truncate">{demoSite.url}</p>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-slate-500">
            Read-only demo with synthetic data. No credentials required — always available.
          </p>
          <div className="mt-auto">
            <Link
              href={`/?site=${encodeURIComponent(demoSite.key)}`}
              className="flex w-full items-center justify-center rounded-xl border border-white/[0.08] bg-ink-800 py-2 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:text-white"
            >
              Open workspace
            </Link>
          </div>
        </div>

        {/* ── User workspace cards ── */}
        {userSites.map((site) => (
          <div key={site.key} className="card card-pad flex flex-col gap-4">
            <div>
              <span className="pill mb-2 bg-teal/[0.12] text-teal ring-1 ring-teal/[0.18] text-[10px]">
                <span className="h-1.5 w-1.5 rounded-full bg-teal" />
                Connected
              </span>
              <h3 className="mt-1 font-semibold text-white truncate">{site.label}</h3>
              <p className="mt-0.5 text-xs text-slate-500 truncate">{site.host}</p>
            </div>

            {/* Connection details */}
            <dl className="space-y-1.5 text-[11px]">
              {[
                { label: "Host",     value: site.host },
                { label: "Database", value: site.database },
                { label: "User",     value: site.user },
                { label: "Prefix",   value: site.prefix },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between gap-2">
                  <dt className="text-slate-500 shrink-0">{label}</dt>
                  <dd className="text-slate-400 truncate">{value}</dd>
                </div>
              ))}
            </dl>

            {/* Actions */}
            <div className="mt-auto flex gap-2">
              <Link
                href={`/?site=${encodeURIComponent(site.key)}`}
                className="flex flex-1 items-center justify-center rounded-xl border border-white/[0.08] bg-ink-800 py-2 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:text-white"
              >
                Open
              </Link>
              <button
                onClick={() => openEdit(site)}
                title="Edit connection"
                className="flex items-center justify-center rounded-xl border border-white/[0.08] bg-ink-800 px-3 py-2 text-slate-400 transition hover:border-accent/30 hover:text-accent-soft"
              >
                <IconEdit className="h-4 w-4" />
              </button>
              <button
                onClick={() => confirmDelete(site.key)}
                title="Delete workspace"
                className="flex items-center justify-center rounded-xl border border-white/[0.08] bg-ink-800 px-3 py-2 text-slate-400 transition hover:border-rose/30 hover:text-rose"
              >
                <IconTrash className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {/* ── Empty state ── */}
        {userSites.length === 0 && (
          <div className="card card-pad col-span-full sm:col-span-1 lg:col-span-2 flex flex-col items-center justify-center gap-3 py-12 text-center">
            <IconDatabase className="h-8 w-8 text-slate-600" />
            <div>
              <p className="text-sm font-medium text-slate-400">No sites connected yet</p>
              <p className="mt-1 text-xs text-slate-600">
                Click <span className="text-slate-400">"Connect new site"</span> to link your WordPress database.
              </p>
            </div>
            <Link
              href="/onboarding"
              className="mt-1 inline-flex items-center gap-1.5 rounded-xl border border-accent/20 bg-accent/[0.08] px-4 py-2 text-xs font-semibold text-accent-soft transition hover:bg-accent/[0.15]"
            >
              <IconPlus className="h-3.5 w-3.5" />
              Connect your first site
            </Link>
          </div>
        )}
      </div>

      {/* ── Edit modal ── */}
      {editingKey !== null && editForm !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(7,8,17,0.75)", backdropFilter: "blur(6px)" }}
        >
          <div className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-ink-900 shadow-card">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
              <h2 className="font-semibold text-white">Edit connection</h2>
              <button
                onClick={closeEdit}
                className="rounded-lg p-1 text-slate-500 transition hover:bg-white/[0.04] hover:text-white"
              >
                <IconX className="h-5 w-5" />
              </button>
            </div>

            {/* Edit form */}
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto" autoComplete="off">
              {FIELD_ROWS.map(({ id, label, type = "text", placeholder, hint }) => (
                <div key={id}>
                  <label
                    htmlFor={`edit-${id}`}
                    className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-400"
                  >
                    {label}
                  </label>
                  <input
                    id={`edit-${id}`}
                    type={type}
                    value={editForm[id]}
                    onChange={(e) =>
                      setEditForm((prev) => prev ? { ...prev, [id]: e.target.value } : prev)
                    }
                    placeholder={placeholder}
                    autoComplete={type === "password" ? "new-password" : "off"}
                    className="w-full rounded-xl border border-white/[0.08] bg-ink-800 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent/30"
                  />
                  {hint && <p className="mt-1 text-[11px] text-slate-600">{hint}</p>}
                </div>
              ))}

              {editStatus === "error" && (
                <div className="rounded-xl border border-rose/20 bg-rose/[0.08] px-4 py-3 text-xs text-rose">
                  {editError}
                </div>
              )}
              {editStatus === "success" && (
                <div className="flex items-center gap-2 rounded-xl border border-teal/20 bg-teal/[0.08] px-4 py-3 text-xs text-teal">
                  <IconCheck className="h-4 w-4 shrink-0" />
                  Connection saved!
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="flex-1 rounded-xl border border-white/[0.08] py-2.5 text-sm text-slate-400 transition hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editStatus === "saving" || editStatus === "success"}
                  className="flex-1 rounded-xl bg-accent py-2.5 text-sm font-semibold text-white shadow-glow transition hover:bg-accent-glow disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {editStatus === "saving" ? "Saving…" : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete confirm dialog ── */}
      {deleteKey !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(7,8,17,0.75)", backdropFilter: "blur(6px)" }}
        >
          <div className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-ink-900 shadow-card p-6 text-center">
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-rose/10">
              <IconTrash className="h-5 w-5 text-rose" />
            </div>
            <h2 className="font-semibold text-white">Delete workspace?</h2>
            <p className="mt-2 mb-6 text-sm text-slate-400">
              This removes the connection from ThinkGraph. Your WordPress site and data are unaffected.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteKey(null)}
                className="flex-1 rounded-xl border border-white/[0.08] py-2.5 text-sm text-slate-400 transition hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 rounded-xl border border-rose/20 bg-rose/[0.12] py-2.5 text-sm font-semibold text-rose transition hover:bg-rose/20 disabled:opacity-60"
              >
                {isDeleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
