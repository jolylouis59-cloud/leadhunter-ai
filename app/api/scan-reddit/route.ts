import { NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";
import { createClient } from "@/lib/supabase-server";

const REDDIT_HEADERS = {
  "User-Agent": "LeadHunterAI/1.0 (by /u/leadhunterai)",
  Accept: "application/rss+xml, application/xml, text/xml, */*",
};
const REDDIT_REQUEST_DELAY_MS = 500;
const REDDIT_RATE_LIMIT_RETRY_MS = 2000;
const MAX_COMBINATIONS_PER_SCAN = 20;
const MAX_POSTS_TO_SCORE = 20;
const CLAUDE_DELAY_MS = 500;
const MIN_INTENT_SCORE_TO_INSERT = 25;

const DEFAULT_KEYWORDS = [
  "trouver des clients B2B",
  "prospection sans cold email",
  "comment trouver des clients",
  "outil prospection",
  "alternative cold email",
];
const DEFAULT_SUBREDDITS = ["FrenchStartup", "Entrepreneur_Francophone", "SaaS"];

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

type ScoredPost = RedditPost & { intentScore: number };

function dedupeByTitle(posts: ScoredPost[]): ScoredPost[] {
  const byTitle = new Map<string, ScoredPost>();

  for (const post of posts) {
    const key = post.title.toLowerCase().trim();
    if (!key) continue;

    const existing = byTitle.get(key);
    if (!existing || post.intentScore > existing.intentScore) {
      byTitle.set(key, post);
    }
  }

  return Array.from(byTitle.values());
}

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

function shuffleInPlace<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function isFrancophoneTargeted(c: ScanCombination): boolean {
  return isFrancophoneSubreddit(c.subreddit) || isFrenchKeyword(c.keyword);
}

function pickScanCombinations(
  subreddits: string[],
  keywords: string[],
  max: number
): ScanCombination[] {
  const all: ScanCombination[] = keywords.flatMap((keyword) =>
    subreddits.map((subreddit) => ({ subreddit, keyword }))
  );

  if (all.length <= max) return all;

  const francophone = all.filter(isFrancophoneTargeted);
  const others = all.filter((c) => !isFrancophoneTargeted(c));
  shuffleInPlace(francophone);
  shuffleInPlace(others);

  const picked = [...francophone, ...others].slice(0, max);
  shuffleInPlace(picked);
  return picked;
}

async function fetchRedditRssText(
  url: string,
  ctx: { subreddit: string; keyword: string }
): Promise<{ text: string | null; status: number }> {
  const res = await fetch(url, {
    headers: REDDIT_HEADERS,
    cache: "no-store",
  });
  const text = await res.text();

  if (!res.ok) {
    console.error("REDDIT RSS ERROR:", {
      ...ctx,
      url,
      status: res.status,
      bodyPreview: text.slice(0, 500),
    });
  }

  return { text: res.ok ? text : null, status: res.status };
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

Règles de scoring :
- Score > 70 uniquement si intention d'achat explicite : cherche un outil, compare des solutions, demande des recommandations.
- Score < 40 si partage d'expérience, storytelling ou article de blog sans demande claire.
- Si le post est un article de blog, un témoignage ou un partage d'expérience sans demande explicite d'outil, donne un score inférieur à 30.

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

async function scanSingleCombination(
  subreddit: string,
  keyword: string
): Promise<{ posts: RedditPost[]; succeeded: boolean; status: number }> {
  const ctx = { subreddit, keyword };
  const url = `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/search.rss?q=${encodeURIComponent(
    keyword
  )}&sort=new&limit=25`;

  console.log("REDDIT RSS URL CALLED:", { ...ctx, url });

  let { text, status } = await fetchRedditRssText(url, ctx);

  if (status === 429) {
    console.log("REDDIT 429 — retry dans 2s:", { ...ctx, url });
    await sleep(REDDIT_RATE_LIMIT_RETRY_MS);
    ({ text, status } = await fetchRedditRssText(url, ctx));
  }

  if (status === 429 || !text) {
    if (status === 429) {
      console.error("REDDIT 429 après retry — combinaison abandonnée:", { ...ctx, url });
    }
    return { posts: [], succeeded: false, status };
  }

  if (!text.includes("<") || (!text.includes("<feed") && !text.includes("<rss"))) {
    console.log("REDDIT RETURNED NON-XML:", {
      ...ctx,
      url,
      status,
      bodyPreview: text.slice(0, 500),
    });
    return { posts: [], succeeded: false, status };
  }

  try {
    const posts = parseRssFeed(text, subreddit);
    console.log("REDDIT POSTS COUNT:", { ...ctx, url, postsReturned: posts.length });
    return { posts, succeeded: true, status };
  } catch (err) {
    console.error("REDDIT RSS PARSE ERROR:", {
      ...ctx,
      url,
      error: String(err),
      bodyPreview: text.slice(0, 500),
    });
    return { posts: [], succeeded: false, status };
  }
}

async function scanWithRateLimit(combinations: ScanCombination[]): Promise<{
  allPosts: RedditPost[];
  combinationsAttempted: number;
  combinationsSucceeded: number;
}> {
  const postsMap = new Map<string, RedditPost>();
  let combinationsAttempted = 0;
  let combinationsSucceeded = 0;

  for (const combo of combinations) {
    combinationsAttempted++;

    try {
      const result = await scanSingleCombination(combo.subreddit, combo.keyword);
      if (result.succeeded) combinationsSucceeded++;
      for (const post of result.posts) {
        if (!postsMap.has(post.url)) postsMap.set(post.url, post);
      }
    } catch (error) {
      const status = (error as { status?: number }).status;
      if (status === 429) {
        await sleep(REDDIT_RATE_LIMIT_RETRY_MS);
        try {
          const retry = await scanSingleCombination(combo.subreddit, combo.keyword);
          if (retry.succeeded) combinationsSucceeded++;
          for (const post of retry.posts) {
            if (!postsMap.has(post.url)) postsMap.set(post.url, post);
          }
        } catch (e) {
          console.error("Combinaison abandonnée après retry:", combo, e);
        }
      } else {
        console.error("Scan combinaison erreur:", combo, error);
      }
    }

    if (combinationsAttempted < combinations.length) {
      await sleep(REDDIT_REQUEST_DELAY_MS);
    }
  }

  return {
    allPosts: Array.from(postsMap.values()),
    combinationsAttempted,
    combinationsSucceeded,
  };
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

  const combinations = pickScanCombinations(
    config.subreddits,
    config.keywords,
    MAX_COMBINATIONS_PER_SCAN
  );

  console.log("SCAN COMBINATIONS SELECTED:", {
    total: combinations.length,
    max: MAX_COMBINATIONS_PER_SCAN,
    francophoneTargeted: combinations.filter(isFrancophoneTargeted).length,
    pairs: combinations.map((c) => `r/${c.subreddit} + "${c.keyword}"`),
  });

  const { allPosts, combinationsAttempted, combinationsSucceeded } =
    await scanWithRateLimit(combinations);
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
  const scoredAboveThreshold: ScoredPost[] = [];

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

    scoredAboveThreshold.push({ ...post, intentScore });
  }

  const postsToInsert = dedupeByTitle(scoredAboveThreshold);
  console.log("TITLE DEDUP:", {
    before: scoredAboveThreshold.length,
    after: postsToInsert.length,
  });

  for (const post of postsToInsert) {
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
        intent_score: post.intentScore,
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
