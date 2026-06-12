import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

const DEFAULT_CONFIG = {
  product_description: "outil de prospection B2B automatisé",
  target: "founders, solopreneurs, agences marketing",
  keywords: [
    "prospection B2B",
    "trouver clients",
    "lead generation",
    "growth hacking",
    "cold outreach",
  ],
  subreddits: ["SaaS", "entrepreneur", "startups", "marketing", "Entrepreneur_Ride_Along"],
};

const MAX_POSTS_TO_SCORE = 20;
const CLAUDE_DELAY_MS = 500;

const REDDIT_REQUEST_DELAY_MS = 1000;
const REDDIT_USER_AGENT = "LeadHunterAI/1.0 by Beginning_Brain_8050";

const TEST_LEADS = [
  {
    post_title: "Looking for B2B prospecting tool",
    subreddit: "SaaS",
    author: "test_user1",
    intent_score: 85,
    post_url: "https://reddit.com/test1",
  },
  {
    post_title: "Alternatives to Octolens?",
    subreddit: "entrepreneur",
    author: "test_user2",
    intent_score: 92,
    post_url: "https://reddit.com/test2",
  },
  {
    post_title: "How to find B2B clients on Reddit",
    subreddit: "startups",
    author: "test_user3",
    intent_score: 78,
    post_url: "https://reddit.com/test3",
  },
  {
    post_title: "Best cold outreach tools for SaaS?",
    subreddit: "marketing",
    author: "test_user4",
    intent_score: 81,
    post_url: "https://reddit.com/test4",
  },
  {
    post_title: "Need help with lead generation",
    subreddit: "Entrepreneur_Ride_Along",
    author: "test_user5",
    intent_score: 74,
    post_url: "https://reddit.com/test5",
  },
];

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
  supabase: ReturnType<typeof createClient>,
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

async function getRedditAccessToken(logs: ScanLogs): Promise<string | null> {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  const username = process.env.REDDIT_USERNAME;
  const password = process.env.REDDIT_PASSWORD;

  if (!clientId || !clientSecret || !username || !password) {
    logError(logs, "Reddit OAuth credentials incomplets");
    return null;
  }

  try {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const tokenRes = await fetch("https://www.reddit.com/api/v1/access_token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": REDDIT_USER_AGENT,
      },
      body:
        "grant_type=password&username=" +
        encodeURIComponent(username) +
        "&password=" +
        encodeURIComponent(password),
    });

    const tokenText = await tokenRes.text();
    console.log("Reddit token status:", tokenRes.status);
    logDebug(logs, `Reddit token status: ${tokenRes.status}`);

    if (!tokenRes.ok) {
      logError(logs, `Reddit token error: ${tokenRes.status} ${tokenText.slice(0, 200)}`);
      return null;
    }

    const { access_token } = JSON.parse(tokenText) as { access_token?: string };
    if (!access_token) {
      logError(logs, "Reddit token response sans access_token");
      return null;
    }

    logDebug(logs, "Reddit OAuth token obtenu");
    return access_token;
  } catch (err) {
    logError(logs, `Reddit token exception: ${String(err)}`);
    return null;
  }
}

async function insertTestLeads(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  logs: ScanLogs
): Promise<number> {
  let insertCount = 0;

  logDebug(logs, "Mode test — insertion de 5 leads fictifs");

  for (const lead of TEST_LEADS) {
    const { error: insertError } = await supabase.from("leads").upsert(
      {
        user_id: userId,
        platform: "reddit",
        post_title: lead.post_title,
        post_body: "",
        post_url: lead.post_url,
        subreddit: lead.subreddit,
        author: lead.author,
        intent_score: lead.intent_score,
        status: "new",
      },
      {
        onConflict: "user_id,post_url",
        ignoreDuplicates: false,
      }
    );

    if (insertError) {
      console.error("INSERT ERROR (test):", insertError);
      logError(logs, `Test insert failed: ${insertError.message}`);
    } else {
      insertCount++;
      logDebug(logs, `Test lead inserted: ${lead.post_title}`);
    }
  }

  return insertCount;
}

async function fetchRedditPosts(
  subreddit: string,
  keyword: string,
  accessToken: string,
  logs: ScanLogs
): Promise<RedditPost[]> {
  console.log("3. Scanning r/" + subreddit + " with keyword:", keyword);
  logDebug(logs, `Scanning r/${subreddit} keyword="${keyword}"`);

  try {
    const url = `https://oauth.reddit.com/r/${encodeURIComponent(subreddit)}/search?q=${encodeURIComponent(keyword)}&sort=new&limit=25&t=month&restrict_sr=1`;

    console.log("Reddit URL:", url);
    logDebug(logs, `Reddit URL: ${url}`);

    const searchRes = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": REDDIT_USER_AGENT,
      },
      cache: "no-store",
    });

    console.log("Reddit status:", searchRes.status);
    console.log("4. Reddit response status:", searchRes.status);
    logDebug(logs, `Reddit r/${subreddit} "${keyword}" → status ${searchRes.status}`);

    const text = await searchRes.text();
    console.log("Reddit response preview:", text.slice(0, 200));
    logDebug(logs, `Reddit response preview: ${text.slice(0, 200)}`);

    if (!searchRes.ok) {
      const msg = `Reddit API error r/${subreddit}/${keyword}: ${searchRes.status} ${text.slice(0, 200)}`;
      logError(logs, msg);
      return [];
    }

    const data = JSON.parse(text);
    const children = data?.data?.children ?? [];

    const posts = children
      .map((child: { data?: Record<string, unknown> }) => child.data)
      .filter(Boolean)
      .map((postData: Record<string, unknown>) => ({
        title: String(postData.title ?? ""),
        selftext: String(postData.selftext ?? ""),
        score: Number(postData.score ?? 0),
        permalink: String(postData.permalink ?? ""),
        subreddit: String(postData.subreddit ?? subreddit),
        author: String(postData.author ?? ""),
        created_utc: Number(postData.created_utc ?? 0),
      }));

    console.log("5. Posts found:", posts.length);
    logDebug(logs, `Posts found for r/${subreddit} "${keyword}": ${posts.length}`);

    return posts;
  } catch (err) {
    const msg = `Reddit fetch failed r/${subreddit}/${keyword}: ${String(err)}`;
    logError(logs, msg);
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

    console.log("6. Claude score:", score, "for post:", post.title);
    logDebug(logs, `Claude score ${score} — "${post.title.slice(0, 60)}…"`);

    return { score, reason: String(parsed.reason ?? "") };
  } catch (err) {
    logError(logs, `Claude scoring failed: ${String(err)}`);
    return null;
  }
}

export async function POST() {
  const errorLog: string[] = [];
  const debugLog: string[] = [];
  const logs: ScanLogs = { errorLog, debugLog };

  try {
    const supabase = createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log("1. Auth user:", user?.id);
    logDebug(logs, `Auth user: ${user?.id ?? "none"}`);

    if (authError || !user) {
      logError(logs, `Auth failed: ${authError?.message ?? "no user"}`);
      return NextResponse.json(
        { success: false, error: "Non autorisé", errors: errorLog, debug: debugLog },
        { status: 401 }
      );
    }

    const config = await fetchUserConfig(supabase, user.id, logs);
    console.log("2. Config loaded:", config);
    logDebug(
      logs,
      `Config: ${config.subreddits.length} subreddits, ${config.keywords.length} keywords`
    );

    if (!process.env.REDDIT_CLIENT_ID?.trim()) {
      logDebug(logs, "REDDIT_CLIENT_ID vide — mode test");
      const insertCount = await insertTestLeads(supabase, user.id, logs);

      return NextResponse.json({
        success: true,
        mode: "test",
        leads_found: TEST_LEADS.length,
        leads_inserted: insertCount,
        leads_scored: 0,
        leads_below_threshold: 0,
        reddit_fetches: 0,
        errors: errorLog,
        debug: debugLog,
      });
    }

    const accessToken = await getRedditAccessToken(logs);
    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Impossible d'obtenir le token Reddit OAuth",
          errors: errorLog,
          debug: debugLog,
        },
        { status: 500 }
      );
    }

    const postsMap = new Map<string, RedditPost>();
    let redditFetchCount = 0;
    let redditPostsTotal = 0;

    for (const subreddit of config.subreddits) {
      for (const keyword of config.keywords) {
        redditFetchCount++;
        const posts = await fetchRedditPosts(subreddit, keyword, accessToken, logs);
        redditPostsTotal += posts.length;

        for (const post of posts) {
          if (!post.permalink) {
            logDebug(logs, `Skipped post (no permalink): ${post.title}`);
            continue;
          }
          if (post.score < 1) {
            logDebug(logs, `Skipped low score (${post.score}): ${post.title}`);
            continue;
          }
          const postUrl = `https://reddit.com${post.permalink}`;
          if (!postsMap.has(postUrl)) {
            postsMap.set(postUrl, post);
          }
        }

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
      try {
        const { data: existing, error: dupError } = await supabase
          .from("leads")
          .select("post_url")
          .eq("user_id", user.id)
          .in("post_url", postUrls);

        if (dupError) {
          logError(logs, `Duplicate check error: ${dupError.message}`);
        }

        existingUrls = new Set(
          (existing ?? []).map((r: { post_url: string }) => r.post_url).filter(Boolean)
        );
        logDebug(logs, `Existing leads in DB: ${existingUrls.size}`);
      } catch (err) {
        logError(logs, `Duplicate check exception: ${String(err)}`);
      }
    }

    const newPosts = allPosts.filter((p) => !existingUrls.has(p.postUrl));
    const postsToScore = newPosts.slice(0, MAX_POSTS_TO_SCORE);

    logDebug(
      logs,
      `To score: ${postsToScore.length} (new: ${newPosts.length}, max: ${MAX_POSTS_TO_SCORE})`
    );

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

      if (!intent) {
        logDebug(logs, `No intent result for: ${post.title}`);
        continue;
      }

      if (intent.score < 20) {
        belowThreshold++;
        logDebug(logs, `Below threshold (${intent.score}): ${post.title}`);
        continue;
      }

      try {
        const score = intent.score;
        const { data: insertData, error: insertError } = await supabase
          .from("leads")
          .upsert(
            {
              user_id: user.id,
              platform: "reddit",
              post_title: post.title,
              post_body: post.selftext?.slice(0, 1000) || "",
              post_url: "https://reddit.com" + post.permalink,
              subreddit: post.subreddit,
              author: post.author,
              intent_score: score,
              status: "new",
            },
            {
              onConflict: "user_id,post_url",
              ignoreDuplicates: false,
            }
          );

        console.log("7. Inserted lead:", { insertData, insertError });

        if (insertError) {
          console.error("INSERT ERROR:", insertError);
          debugLog.push("Insert failed: " + insertError.message);
          logError(logs, `Insert failed: ${insertError.message}`);
        } else {
          debugLog.push("Inserted: " + post.title);
          insertCount++;
          logDebug(logs, `✓ Lead inserted (score ${score}): ${post.title.slice(0, 50)}`);
        }
      } catch (err) {
        logError(logs, `Insert lead exception: ${String(err)}`);
      }
    }

    logDebug(
      logs,
      `Done — scored: ${scoredCount}, below threshold: ${belowThreshold}, inserted: ${insertCount}`
    );

    return NextResponse.json({
      success: true,
      leads_found: allPosts.length,
      leads_inserted: insertCount,
      leads_scored: scoredCount,
      leads_below_threshold: belowThreshold,
      reddit_fetches: redditFetchCount,
      errors: errorLog,
      debug: debugLog,
    });
  } catch (e) {
    console.error("SCAN ERROR:", e);
    errorLog.push(`SCAN ERROR: ${String(e)}`);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors du scan Reddit",
        errors: errorLog,
        debug: debugLog,
      },
      { status: 500 }
    );
  }
}
