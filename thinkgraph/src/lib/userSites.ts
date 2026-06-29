import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { decrypt } from "./crypto";
import type { SiteConnection } from "./sites";

const COOKIE = "tg_user_sites";

/**
 * Returns the user's custom WordPress site connections stored in the encrypted
 * HttpOnly cookie. Uses React cache() so it runs once per server request.
 */
export const getUserSiteConnections = cache((): SiteConnection[] => {
  try {
    const cookieStore = cookies();
    const raw = cookieStore.get(COOKIE)?.value;
    if (!raw) return [];
    return JSON.parse(decrypt(raw)) as SiteConnection[];
  } catch {
    return [];
  }
});
