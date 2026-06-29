import "server-only";
import mysql from "mysql2/promise";
import { getSiteConnection, type SiteConnection } from "./sites";

// One pool per site key, lazily created. Pools are cached on the Node process
// so warm serverless invocations reuse connections.
const pools = new Map<string, mysql.Pool>();

function poolFor(siteKey: string): mysql.Pool {
  const existing = pools.get(siteKey);
  if (existing) return existing;

  const conn = getSiteConnection(siteKey);
  const pool = mysql.createPool({
    host: conn.host,
    port: conn.port,
    user: conn.user,
    password: conn.password,
    database: conn.database,
    charset: "utf8mb4",
    connectionLimit: 3,
    connectTimeout: 8000,
    enableKeepAlive: true,
    waitForConnections: true,
    namedPlaceholders: false,
  });
  pools.set(siteKey, pool);
  return pool;
}

export async function query<T = Record<string, unknown>>(
  siteKey: string,
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const pool = poolFor(siteKey);
  const [rows] = await pool.query(sql, params);
  return rows as T[];
}

/** Run a single query against an explicit SiteConnection (no pooling). */
export async function queryWithConn<T = Record<string, unknown>>(
  conn: SiteConnection,
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const pool = mysql.createPool({
    host: conn.host,
    port: conn.port,
    user: conn.user,
    password: conn.password,
    database: conn.database,
    charset: "utf8mb4",
    connectionLimit: 2,
    connectTimeout: 8000,
  });
  try {
    const [rows] = await pool.query(sql, params);
    return rows as T[];
  } finally {
    await pool.end().catch(() => {/* ignore */});
  }
}

export async function ping(siteKey: string): Promise<boolean> {
  try {
    await query(siteKey, "SELECT 1 AS ok");
    return true;
  } catch {
    return false;
  }
}
