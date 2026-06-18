import { NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";
import { createClient } from "@/lib/supabase-server";

const REDDIT_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  Accept: "application/rss+xml, application/xml, text/xml, */*",
};
const REDDIT_REQUEST_DELAY_MS = 3000;
const REDDIT_RATE_LIMIT_RETRY_MS = 5000;
const MAX_SCAN_COMBINATIONS = 8;
const MAX_POSTS_TO_SCORE = 20;
const CLAUDE_DELAY_MS = 500;
const MIN_INTENT_SCORE_TO_INSERT = 15;

const DEFAULT_KEYWORDS = ["B2B", "prospecting", "lead generation"];
const DEFAULT_SUBREDDITS = ["entrepreneur", "SaaS", "smallbusiness"];

type UserConfig = {
  product_description: string;
  target: string;
  keywords: string[];
  subreddits: string[];
};

type RedditPost = {
  title: string;
  author: string;
  url: string;
  subreddit: string;
  selftext: string; // extrait
};

type IntentResult = {
  score: number;
  reason: string;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type ScanCombination = { subreddit: string; keyword: string };

const KNOWN_FRANCOPHONE_SUBREDDITS = new Set([
  "frenchstartup",
  "entrepreneur_fr",
  "startupsfr",
  "france",
  "quebec",
  "frenchtech",
  "sideproject_fr",
  "freelance_fr",
  "entrepreneurs",
]);

function isFrancophoneSubreddit(subreddit: string): boolean {
  const name = subreddit.replace(/^r\//i, "").trim().toLowerCase();
  if (!name) return false;
  if (KNOWN_FRANCOPHONE_SUBREDDITS.has(name)) return true;
  if (/french/i.test(name)) return true;
  if (/francophone|francais|français/i.test(name)) return true;
  if (/quebec|belgique|suisse|montreal|paris/i.test(name)) return true;
  if (/(^|_)fr($|_)/i.test(name) || /fr$/i.test(name)) return true;
  return false;
}

function isFrenchKeyword(keyword: string): boolean {
  const k = keyword.trim();
  if (!k) return false;
  if (/[àâäéèêëïîôùûüÿçœæ]/i.test(k)) return true;
  if (/\(fr\)|\[fr\]/i.test(k)) return true;
  if (/\bde\s+(leads?|prospects?|clients?)\b/i.test(k)) return true;
  if (/\b(recherche|prospection|logiciel|automatisation|commercialisation)\b/i.test(k)) {
    return true;
  }
  if (/\b(comment|pourquoi|quel|quelle|cherche|chercher|besoin)\b/i.test(k)) return true;
  return false;
}

function combinationKey(c: ScanCombination): string {
  return `${c.subreddit.toLowerCase()}::${c.keyword.toLowerCase()}`;
}

function shuffleInPlace<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function combinationWeight(c: ScanCombination): number {
  let weight = 1;
  if (isFrancophoneSubreddit(c.subreddit)) weight *= 2;
  if (isFrenchKeyword(c.keyword)) weight *= 2;
  return weight;
}

function isFrancophoneTargeted(c: ScanCombination): boolean {
  return isFrancophoneSubreddit(c.subreddit) || isFrenchKeyword(c.keyword);
}

function weightedPickOne(
  items: ScanCombination[],
  weightFn: (c: ScanCombination) => number
): ScanCombination {
  const total = items.reduce((sum, item) => sum + weightFn(item), 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= weightFn(item);
    if (r <= 0) return item;
  }
  return items[items.length - 1];
}

function pickRandomCombinations(
  subreddits: string[],
  keywords: string[],
  max: number
): ScanCombination[] {
  const all: ScanCombination[] = [];
  for (const subreddit of subreddits) {
    for (const keyword of keywords) {
      all.push({ subreddit, keyword });
    }
  }

  if (all.length <= max) return all;

  const frFrancophone = all.filter(
    (c) => isFrancophoneSubreddit(c.subreddit) && isFrenchKeyword(c.keyword)
  );
  const frPartial = all.filter(
    (c) =>
      isFrancophoneTargeted(c) &&
      !(isFrancophoneSubreddit(c.subreddit) && isFrenchKeyword(c.keyword))
  );
  const selected: ScanCombination[] = [];
  const used = new Set<string>();

  const francophoneTarget = Math.min(max, Math.max(4, Math.ceil(max * 0.625)));

  const takeFrom = (pool: ScanCombination[]) => {
    shuffleInPlace(pool);
    for (const combo of pool) {
      if (selected.length >= francophoneTarget) break;
      const key = combinationKey(combo);
      if (used.has(key)) continue;
      selected.push(combo);
      used.add(key);
    }
  };

  takeFrom(frFrancophone);
  takeFrom(frPartial);

  const remaining = all.filter((c) => !used.has(combinationKey(c)));
  while (selected.length < max && remaining.length > 0) {
    const picked = weightedPickOne(remaining, combinationWeight);
    const key = combinationKey(picked);
    selected.push(picked);
    used.add(key);
    const idx = remaining.findIndex((c) => combinationKey(c) === key);
    if (idx >= 0) remaining.splice(idx, 1);
  }

  return selected;
}

async function fetchRedditRssText(
  url: string,
  ctx: { subreddit: string; keyword: string }
): Promise<{ text: string | null; status: number }> {
  const attempt = async (): Promise<{ text: string; status: number }> => {
    const res = await fetch(url, {
      headers: REDDIT_HEADERS,
      cache: "no-store",
    });
    const text = await res.text();
    return { text, status: res.status };
  };

  let { text, status } = await attempt();

  if (status === 429) {
    console.log("REDDIT 429 — retry dans 5s:", { ...ctx, url });
    await sleep(REDDIT_RATE_LIMIT_RETRY_MS);
    ({ text, status } = await attempt());
  }

  if (status === 429) {
    console.error("REDDIT 429 après retry — combinaison abandonnée:", {
      ...ctx,
      url,
    });
    return { text: null, status };
  }

  if (!status || status < 200 || status >= 300) {
    console.error("REDDIT RSS ERROR:", {
      ...ctx,
      url,
      status,
      bodyPreview: text.slice(0, 1000),
    });
    return { text: null, status };
  }

  return { text, status };
}

async function fetchUserConfig(supabase: ReturnType<typeof createClient>, userId: string) {
  const { data, error } = await supabase
    .from("user_configs")
    .select("product_description, target, keywords, subreddits")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return {
      product_description: "outil de prospection B2B automatisé",
      target: "founders, solopreneurs, agences marketing",
      keywords: DEFAULT_KEYWORDS,
      subreddits: DEFAULT_SUBREDDITS,
    } satisfies UserConfig;
  }

  return {
    product_description: data.product_description ?? "outil de prospection B2B automatisé",
    target: data.target ?? "founders, solopreneurs, agences marketing",
    keywords: data.keywords?.length ? data.keywords : DEFAULT_KEYWORDS,
    subreddits: data.subreddits?.length ? data.subreddits : DEFAULT_SUBREDDITS,
  } satisfies UserConfig;
}

async function scoreWithClaude(
  post: RedditPost,
  config: UserConfig
): Promise<IntentResult | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 150,
      messages: [
        {
          role: "user",
          content: `Tu es expert en détection d'intention d'achat B2B.

Produit : ${config.product_description}
Cible : ${config.target}

Post Reddit :
Titre : ${post.title}
Contenu : ${post.selftext || ""}

Donne un Intent Score de 0 à 100 (100 = cherche activement une solution).
Réponds UNIQUEMENT avec ce JSON sans texte autour :
{"score": 75, "reason": "L'auteur cherche activement un outil de prospection"}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("CLAUDE API ERROR:", {
      status: response.status,
      bodyPreview: errText.slice(0, 300),
    });
    return null;
  }

  const data = await response.json();
  const text = data.content?.[0]?.text ?? "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  const parsed = JSON.parse(jsonMatch[0]) as IntentResult;
  const score = Math.min(100, Math.max(0, Number(parsed.score)));
  if (Number.isNaN(score)) return null;

  return { score, reason: String(parsed.reason ?? "") };
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

function parseRssFeed(xml: string, subreddit: string): RedditPost[] {
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
      } satisfies RedditPost;
    })
    .filter((p) => p.title && p.url);
}

async function fetchPublicRedditPosts(
  subreddit: string,
  keyword: string
): Promise<{ posts: RedditPost[]; succeeded: boolean }> {
  const ctx = { subreddit, keyword };
  const url = `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/search.rss?q=${encodeURIComponent(
    keyword
  )}&sort=new&limit=25`;

  console.log("REDDIT RSS URL CALLED:", { ...ctx, url });

  const { text, status } = await fetchRedditRssText(url, ctx);

  if (!text) {
    return { posts: [], succeeded: false };
  }

  if (!text.includes("<") || (!text.includes("<feed") && !text.includes("<rss"))) {
    console.log("REDDIT RETURNED NON-XML:", {
      ...ctx,
      url,
      status,
      bodyPreview: text.slice(0, 500),
    });
    return { posts: [], succeeded: false };
  }

  try {
    const posts = parseRssFeed(text, subreddit);

    console.log("REDDIT POSTS COUNT:", {
      ...ctx,
      url,
      postsReturned: posts.length,
    });

    if (posts.length === 0) {
      console.error("REDDIT EMPTY RSS:", {
        ...ctx,
        responsePreview: text.slice(0, 1000),
      });
    }

    return { posts, succeeded: true };
  } catch (err) {
    console.error("REDDIT RSS PARSE ERROR:", {
      ...ctx,
      url,
      error: String(err),
      bodyPreview: text.slice(0, 500),
    });
    return { posts: [], succeeded: false };
  }
}

export async function POST() {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { success: false, error: "Non autorisé" },
      { status: 401 }
    );
  }

  const userId = user.id;

  const config = await fetchUserConfig(supabase, userId);

  const postsMap = new Map<string, RedditPost>();
  const combinations = pickRandomCombinations(
    config.subreddits,
    config.keywords,
    MAX_SCAN_COMBINATIONS
  );

  let combinationsAttempted = 0;
  let combinationsSucceeded = 0;

  console.log("SCAN COMBINATIONS SELECTED:", {
    total: combinations.length,
    max: MAX_SCAN_COMBINATIONS,
    francophoneTargeted: combinations.filter(isFrancophoneTargeted).length,
    frSubredditAndFrKeyword: combinations.filter(
      (c) => isFrancophoneSubreddit(c.subreddit) && isFrenchKeyword(c.keyword)
    ).length,
    pairs: combinations.map((c) => {
      const frSub = isFrancophoneSubreddit(c.subreddit);
      const frKw = isFrenchKeyword(c.keyword);
      const tag = frSub && frKw ? "FR×FR" : frSub || frKw ? "FR" : "EN";
      return `[${tag}] r/${c.subreddit} + "${c.keyword}"`;
    }),
  });

  for (const { subreddit, keyword } of combinations) {
    combinationsAttempted++;
    const { posts, succeeded } = await fetchPublicRedditPosts(subreddit, keyword);
    if (succeeded) combinationsSucceeded++;

    for (const post of posts) {
      if (!postsMap.has(post.url)) postsMap.set(post.url, post);
    }

    if (combinationsAttempted < combinations.length) {
      await sleep(REDDIT_REQUEST_DELAY_MS);
    }
  }

  const allPosts = Array.from(postsMap.values());
  const postUrls = allPosts.map((p) => p.url);

  let existingUrls = new Set<string>();
  if (postUrls.length > 0) {
    const { data: existing, error: dupError } = await supabase
      .from("leads")
      .select("post_url")
      .eq("user_id", userId)
      .in("post_url", postUrls);

    if (!dupError && existing) {
      existingUrls = new Set(existing.map((r: any) => r.post_url).filter(Boolean));
    }
  }

  const newPosts = allPosts.filter((p) => !existingUrls.has(p.url));
  const postsToScore = newPosts.slice(0, MAX_POSTS_TO_SCORE);

  let insertCount = 0;
  let scoredCount = 0;
  let belowThreshold = 0;

  for (let i = 0; i < postsToScore.length; i++) {
    const post = postsToScore[i];

    if (i > 0) await sleep(CLAUDE_DELAY_MS);

    const intent = await scoreWithClaude(post, config);
    scoredCount++;

    if (!intent) {
      console.log("CLAUDE NO INTENT:", { title: post.title, url: post.url });
      continue;
    }

    const intentScore = intent.score;
    const willInsert = intentScore >= MIN_INTENT_SCORE_TO_INSERT;
    console.log("SCORE CHECK:", {
      title: post.title,
      score: intentScore,
      willInsert,
    });

    if (!willInsert) {
      belowThreshold++;
      continue;
    }

    console.log("INSERTING LEADS FOR USER:", userId);
    const { data: inserted, error: insertError } = await supabase.from("leads").upsert(
      {
        user_id: userId,
        platform: "reddit",
        post_title: post.title,
        post_body: post.selftext,
        post_url: post.url,
        subreddit: post.subreddit,
        author: post.author,
        intent_score: intentScore,
        status: "new",
      },
      {
        onConflict: "user_id,post_url",
        ignoreDuplicates: false,
      }
    );

    console.log("UPSERT RESULT:", {
      postUrl: post.url,
      title: post.title,
      inserted: inserted ?? null,
      insertError: insertError ?? null,
    });

    if (insertError) {
      console.error("INSERT ERROR:", {
        postUrl: post.url,
        title: post.title,
        message: insertError.message,
        code: insertError.code,
        details: insertError.details,
        hint: insertError.hint,
      });
    } else {
      insertCount++;
    }
  }

  const scanSummary = {
    combinations_attempted: combinationsAttempted,
    combinations_succeeded: combinationsSucceeded,
    combinations_failed: combinationsAttempted - combinationsSucceeded,
    leads_found: allPosts.length,
    leads_inserted: insertCount,
    leads_scored: scoredCount,
    leads_below_threshold: belowThreshold,
  };

  console.log("SCAN SUMMARY:", scanSummary);

  return NextResponse.json({
    success: true,
    ...scanSummary,
  });
}
