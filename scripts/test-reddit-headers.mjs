/**
 * Test Reddit access with different User-Agent / endpoint combinations.
 * Usage: node scripts/test-reddit-headers.mjs
 */

const subreddit = "SaaS";
const keyword = "find customers";

const UA_GENERIC = "Mozilla/5.0 (compatible; LeadHunterAI/1.0)";
const UA_CHROME =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const jsonUrl = `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/search.json?q=${encodeURIComponent(keyword)}&restrict_sr=1&sort=new&limit=25&t=week`;
const rssUrl = `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/search.rss?q=${encodeURIComponent(keyword)}&sort=new&limit=25`;

const tests = [
  {
    name: "JSON — UA actuel (LeadHunterAI compatible)",
    url: jsonUrl,
    headers: { "User-Agent": UA_GENERIC },
  },
  {
    name: "JSON — UA Chrome réaliste seul",
    url: jsonUrl,
    headers: { "User-Agent": UA_CHROME },
  },
  {
    name: "JSON — UA Chrome + Accept navigateur",
    url: jsonUrl,
    headers: {
      "User-Agent": UA_CHROME,
      Accept: "application/json, text/plain, */*",
      "Accept-Language": "en-US,en;q=0.9,fr;q=0.8",
    },
  },
  {
    name: "RSS — UA actuel (LeadHunterAI compatible)",
    url: rssUrl,
    headers: { "User-Agent": UA_GENERIC },
  },
  {
    name: "RSS — UA Chrome réaliste",
    url: rssUrl,
    headers: {
      "User-Agent": UA_CHROME,
      Accept: "application/rss+xml, application/xml, text/xml, */*",
    },
  },
  {
    name: "RSS — UA Chrome + headers complets (comme debug-scan-score.mjs)",
    url: rssUrl,
    headers: {
      "User-Agent": UA_CHROME,
      Accept: "application/rss+xml, application/xml, text/xml, */*",
      "Accept-Language": "en-US,en;q=0.9",
    },
  },
];

async function runTest(test) {
  console.log("\n" + "=".repeat(70));
  console.log("TEST:", test.name);
  console.log("URL:", test.url);
  console.log("HEADERS ENVOYÉS:", JSON.stringify(test.headers, null, 2));

  try {
    const res = await fetch(test.url, { headers: test.headers, cache: "no-store" });
    const text = await res.text();

    console.log("STATUS:", res.status, res.statusText);
    console.log(
      "RESPONSE HEADERS:",
      JSON.stringify(Object.fromEntries(res.headers.entries()), null, 2)
    );

    let itemCount = null;
    if (res.ok && test.url.includes(".json")) {
      try {
        const data = JSON.parse(text);
        itemCount = data?.data?.children?.length ?? 0;
      } catch {
        itemCount = "parse error";
      }
    } else if (res.ok && test.url.includes(".rss")) {
      itemCount = (text.match(/<entry>/g) || []).length;
      if (itemCount === 0) itemCount = (text.match(/<item>/g) || []).length;
    }

    console.log("BODY PREVIEW (500 chars):", text.slice(0, 500));
    if (itemCount !== null) console.log("ITEMS FOUND:", itemCount);

    return { ...test, status: res.status, ok: res.ok, itemCount, bodyPreview: text.slice(0, 200) };
  } catch (err) {
    console.error("FETCH ERROR:", err.message);
    return { ...test, status: 0, ok: false, error: err.message };
  }
}

console.log("Reddit header diagnostic —", new Date().toISOString());
const results = [];
for (const test of tests) {
  results.push(await runTest(test));
  await new Promise((r) => setTimeout(r, 1500));
}

console.log("\n" + "=".repeat(70));
console.log("RÉSUMÉ");
for (const r of results) {
  console.log(
    `${r.ok ? "✓" : "✗"} [${r.status}] ${r.name}${r.itemCount != null ? ` → ${r.itemCount} items` : ""}`
  );
}
