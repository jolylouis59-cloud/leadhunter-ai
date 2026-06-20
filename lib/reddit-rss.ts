import { XMLParser } from "fast-xml-parser";

/** Headers qui fonctionnent en prod — search.json renvoie 403, search.rss → 200 */
export const REDDIT_RSS_HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; LeadHunterAI/1.0)",
  Accept: "application/rss+xml, application/xml, text/xml, */*",
};

export type RedditRssPost = {
  title: string;
  author: string;
  url: string;
  subreddit: string;
  selftext: string;
};

export type RedditRssFetchResult = {
  subreddit: string;
  keyword: string;
  url: string;
  status: number;
  rawCount: number;
  mappedCount: number;
  posts: RedditRssPost[];
  errorBodyPreview?: string;
};

export function buildRedditRssUrl(subreddit: string, keyword: string): string {
  return `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/search.rss?q=${encodeURIComponent(keyword)}&sort=new&limit=25`;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function excerptContent(content: string, max = 200): string {
  const text = stripHtml(content);
  if (text.length <= max) return text;
  return text.slice(0, max).trim() + "…";
}

function normalizeAuthor(raw: unknown): string {
  const value = String(raw ?? "").trim();
  return value.replace(/^\/u\//i, "").replace(/^u\//i, "");
}

function extractLink(entry: Record<string, unknown>): string {
  const link = entry.link;

  if (typeof link === "string") return link;

  if (Array.isArray(link)) {
    for (const item of link) {
      if (typeof item === "string" && item) return item;
      if (item && typeof item === "object" && "@_href" in item) {
        return String((item as Record<string, unknown>)["@_href"] ?? "");
      }
    }
    return "";
  }

  if (link && typeof link === "object") {
    const obj = link as Record<string, unknown>;
    if ("@_href" in obj) return String(obj["@_href"] ?? "");
    if ("href" in obj) return String(obj.href ?? "");
  }

  return "";
}

function extractContent(entry: Record<string, unknown>): string {
  const content = entry.content;
  if (typeof content === "string") return content;
  if (content && typeof content === "object") {
    const obj = content as Record<string, unknown>;
    if ("#text" in obj) return String(obj["#text"] ?? "");
    if ("__cdata" in obj) return String(obj.__cdata ?? "");
  }
  if (typeof entry.summary === "string") return entry.summary;
  if (typeof entry.description === "string") return entry.description;
  return "";
}

export function parseRedditRssFeed(xml: string, subreddit: string): RedditRssPost[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    cdataPropName: "__cdata",
  });

  const parsed = parser.parse(xml) as Record<string, unknown>;
  const feed = (parsed.feed ?? (parsed.rss as Record<string, unknown>)?.channel) as
    | Record<string, unknown>
    | undefined;

  if (!feed) return [];

  let entries = feed.entry ?? feed.item;
  if (!entries) return [];
  if (!Array.isArray(entries)) entries = [entries];

  return (entries as Record<string, unknown>[])
    .map((entry) => {
      const title = String(entry.title ?? "").replace(/\s+/g, " ").trim();
      const url = extractLink(entry);
      const authorObj = entry.author as Record<string, unknown> | undefined;
      const author = normalizeAuthor(
        authorObj?.name ?? entry["dc:creator"] ?? entry.creator
      );
      const selftext = excerptContent(extractContent(entry));

      return {
        title,
        author,
        url,
        subreddit,
        selftext,
      } satisfies RedditRssPost;
    })
    .filter((p) => p.title && p.url);
}

export async function fetchRedditRss(
  subreddit: string,
  keyword: string,
  options?: { rateLimitRetryMs?: number }
): Promise<RedditRssFetchResult> {
  const url = buildRedditRssUrl(subreddit, keyword);
  const retryMs = options?.rateLimitRetryMs ?? 2000;

  const fetchOnce = () =>
    fetch(url, {
      headers: REDDIT_RSS_HEADERS,
      cache: "no-store",
    });

  let response = await fetchOnce();
  let status = response.status;

  if (status === 429) {
    await new Promise((resolve) => setTimeout(resolve, retryMs));
    response = await fetchOnce();
    status = response.status;
  }

  const text = await response.text();

  if (!response.ok) {
    return {
      subreddit,
      keyword,
      url,
      status,
      rawCount: 0,
      mappedCount: 0,
      posts: [],
      errorBodyPreview: text.slice(0, 500),
    };
  }

  if (!text.includes("<") || (!text.includes("<feed") && !text.includes("<rss"))) {
    return {
      subreddit,
      keyword,
      url,
      status,
      rawCount: 0,
      mappedCount: 0,
      posts: [],
      errorBodyPreview: text.slice(0, 500),
    };
  }

  const posts = parseRedditRssFeed(text, subreddit);

  return {
    subreddit,
    keyword,
    url,
    status,
    rawCount: posts.length,
    mappedCount: posts.length,
    posts,
  };
}
