import type { SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_CONFIG = {
  product_description: "outil de prospection B2B automatisé",
  target: "founders, solopreneurs, agences marketing",
  keywords: [
    "trouver des clients B2B",
    "prospection sans cold email",
    "comment trouver des clients",
    "outil prospection",
    "alternative cold email",
  ],
  subreddits: ["FrenchStartup", "Entrepreneur_Francophone", "SaaS"],
};

const MAX_POSTS_TO_SCORE = 20;
const CLAUDE_DELAY_MS = 500;
const REDDIT_REQUEST_DELAY_MS = 500;
const REDDIT_RATE_LIMIT_RETRY_MS = 2000;
const MAX_COMBINATIONS_PER_SCAN = 20;
const MIN_INTENT_SCORE_TO_INSERT = 25;

type ScanCombination = { subreddit: string; keyword: string };

function shuffleInPlace<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
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
  shuffleInPlace(all);
  return all.slice(0, max);
}

type UserConfig = {
  product_description: string;
  target: string;
  keywords: string[];
  subreddits: string[];
};

type RedditPost = {
  title: string;
  selftext: string;
  score: number;
  permalink: string;
  subreddit: string;
  author: string;
  created_utc: number;
};

type IntentResult = {
  score: number;
  reason: string;
};

type ScanLogs = {
  errorLog: string[];
  debugLog: string[];
};

export type ScanResult = {
  success: boolean;
  mode?: string;
  leads_found?: number;
  leads_inserted?: number;
  leads_scored?: number;
  leads_below_threshold?: number;
  reddit_fetches?: number;
  errors?: string[];
  debug?: string[];
  error?: string;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function logDebug(logs: ScanLogs, message: string) {
  logs.debugLog.push(message);
  console.log(message);
}

function logError(logs: ScanLogs, message: string) {
  logs.errorLog.push(message);
  console.error(message);
}

async function fetchUserConfig(
  supabase: SupabaseClient,
  userId: string,
  logs: ScanLogs
): Promise<UserConfig> {
  try {
    const { data, error } = await supabase
      .from("user_configs")
      .select("product_description, target, keywords, subreddits")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      logError(logs, `Config fetch error: ${error.message}`);
      return DEFAULT_CONFIG;
    }

    if (!data) {
      logDebug(logs, "No user config found — using defaults");
      return DEFAULT_CONFIG;
    }

    return {
      product_description: data.product_description ?? DEFAULT_CONFIG.product_description,
      target: data.target ?? DEFAULT_CONFIG.target,
      keywords: data.keywords?.length ? data.keywords : DEFAULT_CONFIG.keywords,
      subreddits: data.subreddits?.length ? data.subreddits : DEFAULT_CONFIG.subreddits,
    };
  } catch (err) {
    logError(logs, `Config fetch exception: ${String(err)}`);
    return DEFAULT_CONFIG;
  }
}

async function searchReddit(subreddit: string, keyword: string) {
  const url = `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/search.json?q=${encodeURIComponent(keyword)}&restrict_sr=1&sort=new&limit=25&t=week`;

  const fetchOnce = () =>
    fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; LeadHunterAI/1.0)",
      },
      cache: "no-store",
    });

  let response = await fetchOnce();

  if (response.status === 429) {
    await sleep(REDDIT_RATE_LIMIT_RETRY_MS);
    response = await fetchOnce();
  }

  if (!response.ok) return [];

  const data = await response.json();
  return data?.data?.children?.map((child: { data?: Record<string, unknown> }) => child.data) || [];
}

async function fetchRedditPosts(
  subreddit: string,
  keyword: string,
  logs: ScanLogs
): Promise<RedditPost[]> {
  logDebug(logs, `Scanning r/${subreddit} keyword="${keyword}"`);

  try {
    const rawPosts = await searchReddit(subreddit, keyword);

    const posts = rawPosts
      .filter(Boolean)
      .map((postData: Record<string, unknown>) => ({
        title: String(postData.title ?? ""),
        selftext: String(postData.selftext ?? ""),
        score: Number(postData.score ?? 0),
        permalink: String(postData.permalink ?? ""),
        subreddit: String(postData.subreddit ?? subreddit),
        author: String(postData.author ?? ""),
        created_utc: Number(postData.created_utc ?? 0),
      }))
      .filter((p) => p.title && p.permalink);

    logDebug(logs, `Posts found for r/${subreddit} "${keyword}": ${posts.length}`);

    return posts;
  } catch (err) {
    logError(logs, `Reddit fetch failed r/${subreddit}/${keyword}: ${String(err)}`);
    return [];
  }
}

async function scoreWithClaude(
  post: RedditPost,
  config: UserConfig,
  subreddit: string,
  logs: ScanLogs
): Promise<IntentResult | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    logError(logs, "ANTHROPIC_API_KEY manquante");
    return null;
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-20240307",
        max_tokens: 150,
        messages: [
          {
            role: "user",
            content: `Tu es expert en détection d'intention d'achat B2B.

Produit : ${config.product_description}
Cible : ${config.target}

Post Reddit de r/${subreddit} :
Titre : ${post.title}
Contenu : ${post.selftext?.slice(0, 500) || ""}

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
      logError(logs, `Claude API error ${response.status}: ${errText.slice(0, 200)}`);
      return null;
    }

    const data = await response.json();
    const text = data.content?.[0]?.text ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      logError(logs, `Claude response sans JSON: ${text.slice(0, 200)}`);
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]) as IntentResult;
    const score = Math.min(100, Math.max(0, Number(parsed.score)));

    if (Number.isNaN(score)) {
      logError(logs, `Claude score invalide pour: ${post.title}`);
      return null;
    }

    logDebug(logs, `Claude score ${score} — "${post.title.slice(0, 60)}…"`);

    return { score, reason: String(parsed.reason ?? "") };
  } catch (err) {
    logError(logs, `Claude scoring failed: ${String(err)}`);
    return null;
  }
}

export async function scanRedditForUser(
  supabase: SupabaseClient,
  userId: string
): Promise<ScanResult> {
  const errorLog: string[] = [];
  const debugLog: string[] = [];
  const logs: ScanLogs = { errorLog, debugLog };

  try {
    logDebug(logs, `Starting scan for user: ${userId}`);

    const config = await fetchUserConfig(supabase, userId, logs);
    logDebug(
      logs,
      `Config: ${config.subreddits.length} subreddits, ${config.keywords.length} keywords`
    );

    const combinations = pickScanCombinations(
      config.subreddits,
      config.keywords,
      MAX_COMBINATIONS_PER_SCAN
    );
    logDebug(
      logs,
      `Scanning ${combinations.length} combinaisons (max ${MAX_COMBINATIONS_PER_SCAN})`
    );

    const postsMap = new Map<string, RedditPost>();
    let redditFetchCount = 0;
    let redditPostsTotal = 0;

    for (const combo of combinations) {
      redditFetchCount++;
      const posts = await fetchRedditPosts(combo.subreddit, combo.keyword, logs);
      redditPostsTotal += posts.length;

      for (const post of posts) {
        if (!post.permalink) continue;
        if (post.score < 1) continue;
        const postUrl = `https://reddit.com${post.permalink}`;
        if (!postsMap.has(postUrl)) {
          postsMap.set(postUrl, post);
        }
      }

      if (redditFetchCount < combinations.length) {
        await sleep(REDDIT_REQUEST_DELAY_MS);
      }
    }

    logDebug(
      logs,
      `Reddit summary: ${redditFetchCount} fetches, ${redditPostsTotal} raw posts, ${postsMap.size} unique`
    );

    const allPosts = Array.from(postsMap.entries()).map(([url, post]) => ({
      postUrl: url,
      post,
    }));

    const postUrls = allPosts.map((p) => p.postUrl);

    let existingUrls = new Set<string>();
    if (postUrls.length > 0) {
      const { data: existing, error: dupError } = await supabase
        .from("leads")
        .select("post_url")
        .eq("user_id", userId)
        .in("post_url", postUrls);

      if (dupError) {
        logError(logs, `Duplicate check error: ${dupError.message}`);
      }

      existingUrls = new Set(
        (existing ?? []).map((r: { post_url: string }) => r.post_url).filter(Boolean)
      );
    }

    const newPosts = allPosts.filter((p) => !existingUrls.has(p.postUrl));
    const postsToScore = newPosts.slice(0, MAX_POSTS_TO_SCORE);

    let insertCount = 0;
    let scoredCount = 0;
    let belowThreshold = 0;

    for (let i = 0; i < postsToScore.length; i++) {
      const { postUrl, post } = postsToScore[i];

      if (i > 0) {
        await sleep(CLAUDE_DELAY_MS);
      }

      const intent = await scoreWithClaude(post, config, post.subreddit, logs);
      scoredCount++;

      if (!intent) continue;

      if (intent.score < MIN_INTENT_SCORE_TO_INSERT) {
        belowThreshold++;
        continue;
      }

      const leadRow = {
        user_id: userId,
        platform: "reddit",
        post_title: post.title,
        post_body: post.selftext?.slice(0, 1000) || "",
        post_url: postUrl,
        subreddit: post.subreddit,
        author: post.author,
        intent_score: intent.score,
        status: "new",
      };

      console.log("INSERTING LEADS FOR USER:", userId);
      const { data: inserted, error: insertError } = await supabase.from("leads").upsert(leadRow, {
        onConflict: "user_id,post_url",
        ignoreDuplicates: false,
      });
      console.log("INSERT RESULT:", inserted, insertError);

      if (insertError) {
        logError(logs, `Insert failed: ${insertError.message}`);
      } else {
        insertCount++;
        logDebug(logs, `✓ Lead inserted (score ${intent.score}): ${post.title.slice(0, 50)}`);
      }
    }

    logDebug(
      logs,
      `Done — scored: ${scoredCount}, below threshold: ${belowThreshold}, inserted: ${insertCount}`
    );

    return {
      success: true,
      leads_found: allPosts.length,
      leads_inserted: insertCount,
      leads_scored: scoredCount,
      leads_below_threshold: belowThreshold,
      reddit_fetches: redditFetchCount,
      errors: errorLog,
      debug: debugLog,
    };
  } catch (e) {
    errorLog.push(`SCAN ERROR: ${String(e)}`);
    return {
      success: false,
      error: "Erreur lors du scan Reddit",
      errors: errorLog,
      debug: debugLog,
    };
  }
}
