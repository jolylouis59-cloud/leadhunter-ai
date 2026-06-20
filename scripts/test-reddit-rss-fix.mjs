/**
 * Valide le fix RSS (lib/reddit-rss) sur les subreddits/keywords par défaut.
 * Usage: node scripts/test-reddit-rss-fix.mjs
 */
import { XMLParser } from "fast-xml-parser";

const REDDIT_RSS_HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; LeadHunterAI/1.0)",
  Accept: "application/rss+xml, application/xml, text/xml, */*",
};

const combos = [
  { subreddit: "SaaS", keyword: "find customers" },
  { subreddit: "FrenchStartup", keyword: "trouver des clients B2B" },
  { subreddit: "Entrepreneur_Francophone", keyword: "prospection" },
];

async function fetchRss(subreddit, keyword) {
  const url = `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/search.rss?q=${encodeURIComponent(keyword)}&sort=new&limit=25`;
  const res = await fetch(url, { headers: REDDIT_RSS_HEADERS });
  const text = await res.text();
  let count = 0;
  if (res.ok) {
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
    const parsed = parser.parse(text);
    let entries = parsed.feed?.entry ?? [];
    if (!Array.isArray(entries)) entries = entries ? [entries] : [];
    count = entries.length;
  }
  return { url, status: res.status, count, preview: text.slice(0, 120) };
}

console.log("=== Fix RSS — validation ===\n");
console.log("Headers:", JSON.stringify(REDDIT_RSS_HEADERS, null, 2));

for (const c of combos) {
  const r = await fetchRss(c.subreddit, c.keyword);
  console.log(`\nr/${c.subreddit} + "${c.keyword}"`);
  console.log(`  URL: ${r.url}`);
  console.log(`  Status: ${r.status}`);
  console.log(`  Posts: ${r.count}`);
  if (r.status !== 200) console.log(`  Preview: ${r.preview}`);
  await new Promise((x) => setTimeout(x, 2000));
}

console.log("\n=== Comparaison JSON (doit échouer 403) ===");
const jsonUrl =
  "https://www.reddit.com/r/SaaS/search.json?q=find%20customers&restrict_sr=1&sort=new&limit=25&t=week";
const jsonRes = await fetch(jsonUrl, {
  headers: { "User-Agent": REDDIT_RSS_HEADERS["User-Agent"] },
});
console.log(`JSON status: ${jsonRes.status} (attendu: 403)`);
