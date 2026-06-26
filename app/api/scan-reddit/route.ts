import { NextResponse } from "next/server";
import { canReceiveNewLeads } from "@/lib/access";
import {
  countsTowardFreeTrialLimits,
  FREE_TRIAL_LEADS_LIMIT,
  incrementFreeTrialLeadsUsed,
} from "@/lib/free-trial";
import {
  buildIntentScorePrompt,
  MIN_INTENT_SCORE_TO_INSERT,
} from "@/lib/intent-score-prompt";
import {
  isFrancophoneTargeted,
  pickScanCombinations,
  applyLanguageScoreCap,
  type ScanCombination,
} from "@/lib/scan-locale";
import {
  fetchRedditRss,
  REDDIT_RSS_HEADERS,
  type RedditRssFetchResult,
} from "@/lib/reddit-rss";
import { createAdminClient } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase-server";

const REDDIT_REQUEST_DELAY_MS = 500;
const REDDIT_RATE_LIMIT_RETRY_MS = 2000;
const MAX_COMBINATIONS_PER_SCAN = 20;
const MAX_POSTS_TO_SCORE = 20;
const CLAUDE_DELAY_MS = 500;

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

type RedditFetchDetail = Omit<RedditRssFetchResult, "posts"> & { mappedCount: number };

type InsertionError = {
  title: string;
  url: string;
  message: string;
  code?: string;
  details?: string;
  hint?: string;
};

function buildScoresDistribution(scores: number[]): Record<string, number> {
  const buckets: Record<string, number> = {
    "0-14": 0,
    "15-29": 0,
    "30-49": 0,
    "50-69": 0,
    "70-89": 0,
    "90-100": 0,
    "no_score": 0,
  };

  for (const score of scores) {
    if (score < 0) {
      buckets["no_score"]++;
    } else if (score < 15) buckets["0-14"]++;
    else if (score < 30) buckets["15-29"]++;
    else if (score < 50) buckets["30-49"]++;
    else if (score < 70) buckets["50-69"]++;
    else if (score < 90) buckets["70-89"]++;
    else buckets["90-100"]++;
  }

  return buckets;
}

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

async function searchReddit(subreddit: string, keyword: string): Promise<{
  fetchDetail: RedditFetchDetail;
  posts: RedditPost[];
}> {
  console.log("[REDDIT] headers envoyés:", JSON.stringify(REDDIT_RSS_HEADERS));

  const result = await fetchRedditRss(subreddit, keyword, {
    rateLimitRetryMs: REDDIT_RATE_LIMIT_RETRY_MS,
  });

  console.log(`[REDDIT] GET ${result.url} → HTTP ${result.status}`);

  if (!result.status || result.status >= 400) {
    console.error("[REDDIT] erreur HTTP:", {
      subreddit,
      keyword,
      url: result.url,
      status: result.status,
      bodyPreview: result.errorBodyPreview,
    });
  } else {
    console.log(
      `[REDDIT] r/${subreddit} "${keyword}" → ${result.rawCount} posts RSS (HTTP ${result.status})`
    );
  }

  const fetchDetail: RedditFetchDetail = {
    subreddit: result.subreddit,
    keyword: result.keyword,
    url: result.url,
    status: result.status,
    rawCount: result.rawCount,
    mappedCount: result.posts.length,
    errorBodyPreview: result.errorBodyPreview,
  };

  return { fetchDetail, posts: result.posts };
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
          content: buildIntentScorePrompt({
            productDescription: config.product_description,
            target: config.target,
            title: post.title,
            selftext: post.selftext || "",
            subreddit: post.subreddit,
            keywords: config.keywords,
          }),
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

async function scanSingleCombination(
  subreddit: string,
  keyword: string,
  errors: string[]
): Promise<{
  posts: RedditPost[];
  fetchDetail: RedditFetchDetail;
  succeeded: boolean;
}> {
  console.log(`[SCAN] tentative r/${subreddit} "${keyword}"`);

  try {
    const { posts, fetchDetail } = await searchReddit(subreddit, keyword);

    console.log(
      `[SCAN] r/${subreddit} "${keyword}" → ${fetchDetail.rawCount} bruts, ${posts.length} mappés (HTTP ${fetchDetail.status})`
    );

    if (fetchDetail.status >= 400) {
      errors.push(
        `Reddit HTTP ${fetchDetail.status} pour r/${subreddit} "${keyword}" — ${fetchDetail.url}${fetchDetail.errorBodyPreview ? ` — ${fetchDetail.errorBodyPreview.slice(0, 120)}` : ""}`
      );
    }

    return {
      posts,
      fetchDetail,
      succeeded: fetchDetail.status >= 200 && fetchDetail.status < 400,
    };
  } catch (err) {
    const message = `Erreur r/${subreddit} "${keyword}": ${String(err)}`;
    console.error("[SCAN] erreur:", message);
    errors.push(message);
    return {
      posts: [],
      fetchDetail: {
        subreddit,
        keyword,
        url: `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/search.rss?q=${encodeURIComponent(keyword)}&sort=new&limit=25`,
        status: 500,
        rawCount: 0,
        mappedCount: 0,
      },
      succeeded: false,
    };
  }
}

async function scanWithRateLimit(
  combinations: ScanCombination[],
  errors: string[],
  redditFetches: RedditFetchDetail[]
): Promise<{
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
      const result = await scanSingleCombination(combo.subreddit, combo.keyword, errors);
      redditFetches.push(result.fetchDetail);
      if (result.succeeded) combinationsSucceeded++;
      for (const post of result.posts) {
        if (!postsMap.has(post.url)) postsMap.set(post.url, post);
      }
    } catch (error) {
      const status = (error as { status?: number }).status;
      if (status === 429) {
        await sleep(REDDIT_RATE_LIMIT_RETRY_MS);
        try {
          const retry = await scanSingleCombination(combo.subreddit, combo.keyword, errors);
          redditFetches.push(retry.fetchDetail);
          if (retry.succeeded) combinationsSucceeded++;
          for (const post of retry.posts) {
            if (!postsMap.has(post.url)) postsMap.set(post.url, post);
          }
        } catch (e) {
          const message = `Combinaison abandonnée après retry r/${combo.subreddit} "${combo.keyword}": ${String(e)}`;
          console.error("[SCAN]", message, combo, e);
          errors.push(message);
        }
      } else {
        const message = `Scan combinaison erreur r/${combo.subreddit} "${combo.keyword}": ${String(error)}`;
        console.error("[SCAN]", message, combo, error);
        errors.push(message);
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

export async function POST(req: Request) {
  const debug = new URL(req.url).searchParams.get("debug") === "true";
  const scanErrors: string[] = [];
  const redditFetches: RedditFetchDetail[] = [];
  const insertionErrors: InsertionError[] = [];
  const scoredPostsLog: { title: string; subreddit: string; score: number; aboveThreshold: boolean; url: string }[] = [];
  const allScores: number[] = [];

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

  const { data: trialRow } = await supabase
    .from("user_configs")
    .select("plan, trial_ends_at, is_free_trial, free_trial_leads_used")
    .eq("user_id", userId)
    .maybeSingle();

  const trialAccess = {
    plan: trialRow?.plan ?? "free",
    trial_ends_at: trialRow?.trial_ends_at ?? null,
    is_free_trial: trialRow?.is_free_trial,
    free_trial_leads_used: trialRow?.free_trial_leads_used ?? 0,
  };

  const config = await fetchUserConfig(supabase, userId);
  const { keywords, subreddits } = config;

  console.log("[SCAN START] keywords:", keywords, "subreddits:", subreddits);
  console.log("[SCAN START] seuil minimum score:", MIN_INTENT_SCORE_TO_INSERT);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("[SCAN START] ANTHROPIC_API_KEY manquante — scoring impossible");
    scanErrors.push("ANTHROPIC_API_KEY manquante — scoring impossible");
  }

  const combinations = pickScanCombinations(
    subreddits,
    keywords,
    MAX_COMBINATIONS_PER_SCAN
  );

  console.log("SCAN COMBINATIONS SELECTED:", {
    total: combinations.length,
    max: MAX_COMBINATIONS_PER_SCAN,
    francophoneTargeted: combinations.filter(isFrancophoneTargeted).length,
    pairs: combinations.map((c) => `r/${c.subreddit} + "${c.keyword}"`),
  });

  console.log("[SCAN] combinaisons à scanner:", combinations.length, combinations);

  const { allPosts, combinationsAttempted, combinationsSucceeded } =
    await scanWithRateLimit(combinations, scanErrors, redditFetches);

  console.log(
    `[SCAN] Reddit terminé — ${combinationsAttempted} combinaisons, ${allPosts.length} posts uniques`
  );
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
    } else if (dupError) {
      scanErrors.push(`Erreur dédoublonnage: ${dupError.message}`);
    }
  }

  const newPosts = allPosts.filter((p) => !existingUrls.has(p.url));
  const postsToScore = newPosts.slice(0, MAX_POSTS_TO_SCORE);

  console.log("[SCAN] dédoublonnage:", {
    posts_total: allPosts.length,
    deja_en_base: existingUrls.size,
    nouveaux: newPosts.length,
    a_scorer: postsToScore.length,
  });

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
      console.log("[SCORE] Claude sans score:", { title: post.title, url: post.url });
      scanErrors.push(`Claude sans score: "${post.title?.substring(0, 50)}"`);
      allScores.push(-1);
      scoredPostsLog.push({
        title: post.title,
        subreddit: post.subreddit,
        score: -1,
        aboveThreshold: false,
        url: post.url,
      });
      continue;
    }

    const intentResult = applyLanguageScoreCap(
      intent.score,
      config.keywords,
      post.title,
      post.selftext || ""
    );
    const intentScore = intentResult.score;

    if (intentResult.capped) {
      console.log("[SCORE] plafond langue:", {
        title: post.title?.substring(0, 50),
        original: intent.score,
        capped: intentScore,
        reason: intentResult.reason,
      });
    }

    const aboveThreshold = intentScore >= MIN_INTENT_SCORE_TO_INSERT;
    allScores.push(intentScore);
    scoredPostsLog.push({
      title: post.title,
      subreddit: post.subreddit,
      score: intentScore,
      aboveThreshold,
      url: post.url,
    });

    console.log(
      `[SCORE] "${post.title?.substring(0, 50)}" → ${intentScore} (seuil ${MIN_INTENT_SCORE_TO_INSERT}, retenu: ${aboveThreshold})`
    );

    if (!aboveThreshold) {
      belowThreshold++;
      continue;
    }

    scoredAboveThreshold.push({ ...post, intentScore });
  }

  const minScore = MIN_INTENT_SCORE_TO_INSERT;
  console.log(
    `[FILTER] Seuil minimum: ${minScore}, leads retenus: ${scoredAboveThreshold.length}`
  );

  const postsToInsert = dedupeByTitle(scoredAboveThreshold);
  console.log("TITLE DEDUP:", {
    before: scoredAboveThreshold.length,
    after: postsToInsert.length,
  });

  const applyFreeTrialLimit = countsTowardFreeTrialLimits(trialAccess);
  let trialLeadsUsed = trialAccess.free_trial_leads_used ?? 0;
  const freeTrialLimitReached = applyFreeTrialLimit && !canReceiveNewLeads(trialAccess);

  if (freeTrialLimitReached) {
    scanErrors.push(
      `Limite essai gratuit atteinte (${FREE_TRIAL_LEADS_LIMIT} leads cumulés)`
    );
  }

  let adminClient: ReturnType<typeof createAdminClient> | null = null;

  for (const post of postsToInsert) {
    if (applyFreeTrialLimit && trialLeadsUsed >= FREE_TRIAL_LEADS_LIMIT) {
      break;
    }

    console.log("[INSERT] tentative:", { userId, title: post.title, url: post.url, score: post.intentScore });
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

    console.log("[INSERT] résultat:", {
      postUrl: post.url,
      title: post.title,
      ok: !insertError,
      inserted: inserted ?? null,
      error: insertError ?? null,
    });

    if (insertError) {
      const errDetail: InsertionError = {
        title: post.title,
        url: post.url,
        message: insertError.message,
        code: insertError.code,
        details: insertError.details,
        hint: insertError.hint,
      };
      insertionErrors.push(errDetail);
      const message = `Insert échoué "${post.title?.substring(0, 50)}": ${insertError.message} (code: ${insertError.code})`;
      console.error("[INSERT] erreur Supabase:", errDetail);
      scanErrors.push(message);
    } else {
      insertCount++;
      if (applyFreeTrialLimit) {
        if (!adminClient) adminClient = createAdminClient();
        await incrementFreeTrialLeadsUsed(adminClient, userId);
        trialLeadsUsed++;
      }
    }
  }

  const scanSummary = {
    combinations_attempted: combinationsAttempted,
    combinations_succeeded: combinationsSucceeded,
    combinations_failed: combinationsAttempted - combinationsSucceeded,
    min_score_threshold: MIN_INTENT_SCORE_TO_INSERT,
    posts_found_total: allPosts.length,
    posts_already_in_db: existingUrls.size,
    posts_new: newPosts.length,
    posts_scored: scoredCount,
    posts_above_threshold: scoredAboveThreshold.length,
    leads_found: allPosts.length,
    leads_inserted: insertCount,
    leads_scored: scoredCount,
    leads_below_threshold: belowThreshold,
    free_trial_limit_reached: freeTrialLimitReached,
  };

  const totalPosts = allPosts.length;

  console.log("[SCAN SUMMARY]", scanSummary);

  const responseBody: Record<string, unknown> = {
    success: true,
    leadsFound: insertCount,
    postsScanned: totalPosts,
    message:
      insertCount > 0
        ? `${insertCount} leads trouvés`
        : allPosts.length === 0
          ? "Aucun post Reddit trouvé pour ces mots-clés/subreddits"
          : newPosts.length === 0
            ? "Posts trouvés mais déjà en base"
            : scoredCount === 0
              ? "Posts trouvés mais scoring Claude échoué"
              : "Aucun lead au-dessus du seuil",
    ...scanSummary,
  };

  if (debug) {
    responseBody.debug = {
      keywords,
      subreddits,
      combinations_selected: combinations,
      combinations_attempted: combinationsAttempted,
      combinations_succeeded: combinationsSucceeded,
      min_score_threshold: MIN_INTENT_SCORE_TO_INSERT,
      posts_found_total: allPosts.length,
      posts_already_in_db: existingUrls.size,
      posts_new: newPosts.length,
      posts_scored: scoredCount,
      posts_above_threshold: scoredAboveThreshold.length,
      scores_distribution: buildScoresDistribution(allScores),
      reddit_fetches: redditFetches,
      reddit_endpoint: "search.rss",
      reddit_headers: REDDIT_RSS_HEADERS,
      scored_posts: scoredPostsLog,
      samplePosts: scoredPostsLog.slice(0, 3).map(({ title, subreddit, score, url }) => ({
        title,
        subreddit,
        score,
        url,
      })),
      insertion_errors: insertionErrors,
      errors: scanErrors,
    };
  }

  return NextResponse.json(responseBody);
}
