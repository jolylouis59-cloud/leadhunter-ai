/**
 * Test upsert Supabase après scoring (1 post)
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  readFileSync(resolve(__dirname, "../.env.local"), "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    })
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const apiKey = env.ANTHROPIC_API_KEY;

const supabase = createClient(url, anonKey);

const email = `scan-upsert-${Date.now()}@leadhunter-test.local`;
const password = "ScanTestPass123!";

const { error: signUpError } = await supabase.auth.signUp({ email, password });
if (signUpError) console.log("SignUp:", signUpError.message);

const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
  email,
  password,
});

if (signInError || !authData.user) {
  console.error("Cannot sign in:", signInError?.message ?? "no user");
  process.exit(1);
}

const userId = authData.user.id;
console.log("Authenticated user:", userId);

const post = {
  title: "Looking for B2B lead generation tool",
  url: `https://www.reddit.com/r/entrepreneur/test-${Date.now()}`,
  author: "debug_user",
  selftext: "Need help finding clients for my SaaS",
  subreddit: "entrepreneur",
};

const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
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
        content: `Score 0-100 intent to buy B2B prospecting tool. Post: ${post.title}. JSON only: {"score":N}`,
      },
    ],
  }),
});

const claudeData = await claudeRes.json();
const text = claudeData.content?.[0]?.text ?? "";
const score = Number(text.match(/"score"\s*:\s*(\d+)/)?.[1] ?? 75);
const intentScore = score;
const willInsert = intentScore >= 5;

console.log("SCORE CHECK:", { title: post.title, score: intentScore, willInsert });

if (!willInsert) process.exit(0);

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
  { onConflict: "user_id,post_url", ignoreDuplicates: false }
);

console.log("UPSERT RESULT:", {
  postUrl: post.url,
  title: post.title,
  inserted: inserted ?? null,
  insertError: insertError ?? null,
});

if (insertError) {
  console.error("INSERT ERROR:", {
    message: insertError.message,
    code: insertError.code,
    details: insertError.details,
    hint: insertError.hint,
  });
}
