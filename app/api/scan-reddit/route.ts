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
const REDDIT_USER_AGENT = "LeadHunterAI/1.0";

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

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchUserConfig(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<UserConfig> {
  try {
    const { data, error } = await supabase
      .from("user_configs")
      .select("product_description, target, keywords, subreddits")
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) {
      return DEFAULT_CONFIG;
    }

    return {
      product_description: data.product_description ?? DEFAULT_CONFIG.product_description,
      target: data.target ?? DEFAULT_CONFIG.target,
      keywords: data.keywords?.length ? data.keywords : DEFAULT_CONFIG.keywords,
      subreddits: data.subreddits?.length ? data.subreddits : DEFAULT_CONFIG.subreddits,
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

async function fetchRedditPosts(
  subreddit: string,
  keyword: string
): Promise<RedditPost[]> {
  try {
    const url = `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/search.json?q=${encodeURIComponent(keyword)}&sort=new&limit=10&t=week`;

    const res = await fetch(url, {
      headers: { "User-Agent": REDDIT_USER_AGENT },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      console.error(`Reddit API error ${subreddit}/${keyword}: ${res.status}`);
      return [];
    }

    const json = await res.json();
    const children = json?.data?.children ?? [];

    return children
      .map((child: { data?: Record<string, unknown> }) => child.data)
      .filter(Boolean)
      .map((data: Record<string, unknown>) => ({
        title: String(data.title ?? ""),
        selftext: String(data.selftext ?? ""),
        score: Number(data.score ?? 0),
        permalink: String(data.permalink ?? ""),
        subreddit: String(data.subreddit ?? subreddit),
        author: String(data.author ?? ""),
        created_utc: Number(data.created_utc ?? 0),
      }));
  } catch (err) {
    console.error(`Reddit fetch failed ${subreddit}/${keyword}:`, err);
    return [];
  }
}

async function scoreWithClaude(
  post: RedditPost,
  config: UserConfig,
  subreddit: string
): Promise<IntentResult | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY manquante");
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
      console.error("Claude API error:", response.status, await response.text());
      return null;
    }

    const data = await response.json();
    const text = data.content?.[0]?.text ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.error("Claude response sans JSON:", text);
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]) as IntentResult;
    const score = Math.min(100, Math.max(0, Number(parsed.score)));

    if (Number.isNaN(score)) return null;

    return { score, reason: String(parsed.reason ?? "") };
  } catch (err) {
    console.error("Claude scoring failed:", err);
    return null;
  }
}

export async function POST() {
  try {
    const supabase = createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const config = await fetchUserConfig(supabase, user.id);

    const postsMap = new Map<string, RedditPost>();

    for (const subreddit of config.subreddits) {
      for (const keyword of config.keywords) {
        const posts = await fetchRedditPosts(subreddit, keyword);
        for (const post of posts) {
          if (!post.permalink || post.score < 1) continue;
          const postUrl = `https://reddit.com${post.permalink}`;
          if (!postsMap.has(postUrl)) {
            postsMap.set(postUrl, post);
          }
        }
      }
    }

    const allPosts = Array.from(postsMap.entries()).map(([url, post]) => ({
      postUrl: url,
      post,
    }));

    const postUrls = allPosts.map((p) => p.postUrl);

    let existingUrls = new Set<string>();
    if (postUrls.length > 0) {
      try {
        const { data: existing } = await supabase
          .from("leads")
          .select("post_url")
          .eq("user_id", user.id)
          .in("post_url", postUrls);

        existingUrls = new Set(
          (existing ?? []).map((r: { post_url: string }) => r.post_url).filter(Boolean)
        );
      } catch (err) {
        console.error("Erreur check doublons:", err);
      }
    }

    const newPosts = allPosts.filter((p) => !existingUrls.has(p.postUrl));
    const postsToScore = newPosts.slice(0, MAX_POSTS_TO_SCORE);

    let insertCount = 0;

    for (let i = 0; i < postsToScore.length; i++) {
      const { postUrl, post } = postsToScore[i];

      if (i > 0) {
        await sleep(CLAUDE_DELAY_MS);
      }

      const intent = await scoreWithClaude(post, config, post.subreddit);
      if (!intent || intent.score < 30) continue;

      try {
        const leadRow = {
          user_id: user.id,
          platform: "reddit",
          title: post.title,
          post_body: post.selftext?.slice(0, 1000) ?? null,
          post_url: postUrl,
          subreddit: post.subreddit,
          username: post.author,
          intent_score: intent.score,
          status: "new",
          post_created_at: new Date(post.created_utc * 1000).toISOString(),
        };

        const { error: upsertError } = await supabase
          .from("leads")
          .upsert(leadRow, { onConflict: "user_id,post_url", ignoreDuplicates: true });

        if (!upsertError) {
          insertCount++;
        } else {
          console.error("Upsert lead error:", upsertError.message);
        }
      } catch (err) {
        console.error("Insert lead failed:", err);
      }
    }

    return NextResponse.json({
      success: true,
      leads_found: allPosts.length,
      leads_inserted: insertCount,
    });
  } catch (err) {
    console.error("Scan Reddit error:", err);
    return NextResponse.json(
      { error: "Erreur lors du scan Reddit" },
      { status: 500 }
    );
  }
}
