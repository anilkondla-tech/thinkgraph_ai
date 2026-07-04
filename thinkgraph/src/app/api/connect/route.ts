import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import mysql from "mysql2/promise";
import { encrypt, decrypt } from "@/lib/crypto";
import { authOptions } from "@/lib/auth";
import type { SiteConnection } from "@/lib/sites";

const COOKIE = "tg_user_sites";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Authentication required. Please sign in first." }, { status: 401 });
  }

  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { label, host, port, user, password, database, prefix = "wp_", keepPassword } = body;

  if (!host || !user || !database) {
    return Response.json(
      { error: "host, user, and database are required" },
      { status: 400 }
    );
  }

  // Read existing user sites from the cookie early so we can resolve the stored password
  const cookieStore = cookies();
  let existing: SiteConnection[] = [];
  try {
    const raw = cookieStore.get(COOKIE)?.value;
    if (raw) existing = JSON.parse(decrypt(raw));
  } catch {
    /* start fresh on corrupt cookie */
  }

  // Derive key to find any existing entry
  const key = `user_${host.replace(/[^a-z0-9]/gi, "_")}_${database.replace(/[^a-z0-9]/gi, "_")}`;

  // If keepPassword is "true" and this site already exists, reuse its stored password
  const resolvedPassword =
    keepPassword === "true" && !password
      ? (existing.find((s) => s.key === key)?.password ?? "")
      : (password ?? "");

  // Test the MySQL connection
  let connection: mysql.Connection | null = null;
  try {
    connection = await mysql.createConnection({
      host,
      port: Number(port ?? 3306),
      user,
      password: resolvedPassword,
      database,
      connectTimeout: 8_000,
    });
    await connection.query("SELECT 1 AS ok");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return Response.json(
      { error: `Connection failed: ${msg}` },
      { status: 422 }
    );
  } finally {
    try {
      await connection?.end();
    } catch {
      /* ignore */
    }
  }

  // Upsert: replace any site with the same key, or append
  const newSite: SiteConnection = {
    key,
    label: (label || host).slice(0, 80),
    url: "",
    host,
    port: Number(port ?? 3306),
    user,
    password: resolvedPassword,
    database,
    prefix,
  };
  const updated = [
    ...existing.filter((s) => s.key !== key),
    newSite,
  ];

  // Store encrypted in HttpOnly cookie
  cookieStore.set(COOKIE, encrypt(JSON.stringify(updated)), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });

  return Response.json({
    success: true,
    site: { key, label: newSite.label, url: "" },
  });
}

/** Remove a user-defined site by key. */
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }

  const { key } = await req.json();
  if (!key) return Response.json({ error: "key required" }, { status: 400 });

  const cookieStore = cookies();
  let existing: SiteConnection[] = [];
  try {
    const raw = cookieStore.get(COOKIE)?.value;
    if (raw) existing = JSON.parse(decrypt(raw));
  } catch {
    /* noop */
  }

  const updated = existing.filter((s) => s.key !== key);
  cookieStore.set(COOKIE, encrypt(JSON.stringify(updated)), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });

  return Response.json({ success: true });
}
