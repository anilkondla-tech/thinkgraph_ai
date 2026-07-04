import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { decrypt } from "./crypto";
import { authOptions } from "./auth";
import type { SiteConnection } from "./sites";

/**
 * Derives a per-user cookie name from the user's email so that
 * different users on the same browser never see each other's workspaces.
 * Uses base64url encoding (A-Za-z0-9_-) which is safe in cookie names.
 */
export function computeUserCookieKey(email: string): string {
  const suffix = Buffer.from(email)
    .toString("base64url")
    .replace(/-/g, "_")
    .slice(0, 24);
  return `tg_sites_${suffix}`;
}

/**
 * Returns the authenticated user's WordPress site connections from their
 * personal encrypted HttpOnly cookie.
 * Returns [] when the user is not signed in.
 * Uses React cache() so the session + cookie are read at most once per request.
 */
export const getUserSiteConnections = cache(async (): Promise<SiteConnection[]> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return [];
    const cookieStore = cookies();
    const raw = cookieStore.get(computeUserCookieKey(session.user.email))?.value;
    if (!raw) return [];
    return JSON.parse(decrypt(raw)) as SiteConnection[];
  } catch {
    return [];
  }
});
