/**
 * Debug: score 5 Reddit RSS posts and log SCORE CHECK (+ dry-run upsert intent)
 * Usage: node scripts/debug-scan-score.mjs
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { XMLParser } from "fast-xml-parser";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIN_INTENT_SCORE_TO_INSERT = 15;
const MODEL = "claude-haiku-4-5-20251001";

const env = Object.fromEntries(
  readFileSync(resolve(__dirname, "../.env.local"), "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    })
);

const apiKey = env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error("ANTHROPIC_API_KEY missing");
  process.exit(1);
}

const config = {
  product_description: "outil de prospection B2B automatisé sur Reddit",
  target: "founders, solopreneurs, agences marketing",
};

async function fetchRssPosts(subreddit, keyword, limit = 5) {
  const url = `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/search.rss?q=${encodeURIComponent(keyword)}&sort=new&limit=25`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: "application/rss+xml, application/xml, text/xml, */*",
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Reddit ${res.status}: ${text.slice(0, 200)}`);

  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
  const parsed = parser.parse(text);
  const feed = parsed.feed;
  let entries = feed?.entry ?? [];
  if (!Array.isArray(entries)) entries = [entries];

  return entries.slice(0, limit).map((entry) => {
    const title = String(entry.title ?? "").trim();
    const link =
      typeof entry.link === "object" && entry.link?.["@_href"]
        ? entry.link["@_href"]
        : String(entry.link ?? "");
    const author = String(entry.author?.name ?? "").replace(/^\/u\//, "");
    const raw = String(entry.content?.["#text"] ?? entry.content ?? "");
    const selftext = raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 200);
    return { title, url: link, author, selftext, subreddit };
  });
}

async function scoreWithClaude(post) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
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
    console.error("CLAUDE API ERROR:", response.status, errText.slice(0, 300));
    return null;
  }

  const data = await response.json();
  const text = data.content?.[0]?.text ?? "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  const parsed = JSON.parse(jsonMatch[0]);
  return { score: Number(parsed.score), reason: parsed.reason };
}

const posts = await fetchRssPosts("entrepreneur", "lead generation", 5);
console.log(`\nFetched ${posts.length} posts from Reddit RSS\n`);

for (let i = 0; i < posts.length; i++) {
  const post = posts[i];
  const intent = await scoreWithClaude(post);

  if (!intent) {
    console.log("CLAUDE NO INTENT:", { title: post.title, url: post.url });
    continue;
  }

  const intentScore = intent.score;
  const willInsert = intentScore >= MIN_INTENT_SCORE_TO_INSERT;
  console.log("SCORE CHECK:", { title: post.title, score: intentScore, willInsert });

  if (willInsert) {
    console.log("UPSERT RESULT (dry-run, no DB):", {
      postUrl: post.url,
      title: post.title,
      inserted: null,
      insertError: null,
      note: "Upsert non exécuté — lance POST /api/scan-reddit connecté pour tester Supabase",
    });
  }

  if (i < posts.length - 1) await new Promise((r) => setTimeout(r, 500));
}
