import "server-only";
import { query, queryWithConn } from "./db";
import { getSiteConnection, type SiteConnection } from "./sites";

const POST_LIMIT = 600; // cap content-bearing rows to keep the shared DB happy

export type RawPost = {
  id: number;
  title: string;
  slug: string;
  date: string;
  status: string;
  author_id: number;
  content: string;
};

export type RawSite = {
  posts: RawPost[];
  authors: Map<number, string>;
  categoriesByPost: Map<number, string[]>;
  keywordByPost: Map<number, string>;
  statusCounts: { status: string; count: number }[];
  totalPosts: number;
  totalComments: number;
};

export async function fetchRawSite(
  siteKey: string,
  userConn?: SiteConnection
): Promise<RawSite> {
  const p = userConn
    ? userConn.prefix
    : getSiteConnection(siteKey).prefix;

  // Helper: routes to explicit connection or pool-based connection
  const q = userConn
    ? <T = Record<string, unknown>>(sql: string, params?: unknown[]) =>
        queryWithConn<T>(userConn, sql, params)
    : <T = Record<string, unknown>>(sql: string, params?: unknown[]) =>
        query<T>(siteKey, sql, params);
  const posts = await q<{
    ID: number;
    post_title: string;
    post_name: string;
    post_date: Date | string;
    post_status: string;
    post_author: number;
    post_content: string;
  }>(
    `SELECT ID, post_title, post_name, post_date, post_status, post_author, post_content
     FROM ${p}posts
     WHERE post_type = 'post' AND post_status = 'publish'
     ORDER BY post_date DESC
     LIMIT ${POST_LIMIT}`
  );

  const rawPosts: RawPost[] = posts.map((r) => ({
    id: Number(r.ID),
    title: r.post_title || "(untitled)",
    slug: r.post_name || "",
    date: new Date(r.post_date as string).toISOString(),
    status: r.post_status,
    author_id: Number(r.post_author),
    content: r.post_content || "",
  }));

  const authorsRows = await q<{ ID: number; display_name: string }>(
    `SELECT ID, display_name FROM ${p}users`
  );
  const authors = new Map<number, string>();
  authorsRows.forEach((a) => authors.set(Number(a.ID), a.display_name || "Unknown"));

  const catRows = await q<{ post_id: number; category: string }>(
    `SELECT tr.object_id AS post_id, t.name AS category
     FROM ${p}term_relationships tr
     JOIN ${p}term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
     JOIN ${p}terms t ON tt.term_id = t.term_id
     WHERE tt.taxonomy = 'category'`
  );
  const categoriesByPost = new Map<number, string[]>();
  catRows.forEach((r) => {
    const list = categoriesByPost.get(Number(r.post_id)) ?? [];
    list.push(r.category);
    categoriesByPost.set(Number(r.post_id), list);
  });

  const kwRows = await q<{ post_id: number; meta_value: string }>(
    `SELECT post_id, meta_value FROM ${p}postmeta
     WHERE meta_key IN ('rank_math_focus_keyword','_yoast_wpseo_focuskw','_aioseo_keywords','_keyword')
       AND meta_value IS NOT NULL AND meta_value <> ''`
  );
  const keywordByPost = new Map<number, string>();
  kwRows.forEach((r) => {
    if (!keywordByPost.has(Number(r.post_id))) {
      keywordByPost.set(Number(r.post_id), String(r.meta_value).split(",")[0].trim());
    }
  });

  const statusRows = await q<{ status: string; count: number }>(
    `SELECT post_status AS status, COUNT(*) AS count
     FROM ${p}posts WHERE post_type='post' GROUP BY post_status`
  );
  const statusCounts = statusRows.map((r) => ({
    status: r.status,
    count: Number(r.count),
  }));

  const totalPosts = statusCounts.reduce((a, s) => a + s.count, 0);

  const commentRow = await q<{ count: number }>(
    `SELECT COUNT(*) AS count FROM ${p}comments`
  );
  const totalComments = Number(commentRow[0]?.count ?? 0);

  return {
    posts: rawPosts,
    authors,
    categoriesByPost,
    keywordByPost,
    statusCounts,
    totalPosts,
    totalComments,
  };
}
