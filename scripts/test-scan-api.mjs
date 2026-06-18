/**
 * Test POST /api/scan-reddit avec session Supabase authentifiée
 * Usage: node scripts/test-scan-api.mjs [port]
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const port = process.argv[2] || "3000";
const baseUrl = `http://localhost:${port}`;

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
const projectRef = new URL(url).hostname.split(".")[0];
const cookieName = `sb-${projectRef}-auth-token`;

const supabase = createClient(url, anonKey);

const email = `scan-api-${Date.now()}@leadhunter-test.local`;
const password = "ScanApiTest123!";

await supabase.auth.signUp({ email, password });
const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
  email,
  password,
});

if (signInError || !authData.session) {
  console.error("Auth failed:", signInError?.message ?? "no session");
  process.exit(1);
}

const sessionPayload = JSON.stringify({
  access_token: authData.session.access_token,
  refresh_token: authData.session.refresh_token,
  expires_at: authData.session.expires_at,
  expires_in: authData.session.expires_in,
  token_type: authData.session.token_type,
  user: authData.session.user,
});

const cookieValue = `base64-${Buffer.from(sessionPayload).toString("base64url")}`;
const cookieHeader = `${cookieName}=${encodeURIComponent(cookieValue)}`;

console.log("Calling POST", `${baseUrl}/api/scan-reddit`);
console.log("User:", authData.user.id);

const started = Date.now();
const res = await fetch(`${baseUrl}/api/scan-reddit`, {
  method: "POST",
  headers: {
    Cookie: cookieHeader,
    "Content-Type": "application/json",
  },
});

const body = await res.json();
const elapsed = ((Date.now() - started) / 1000).toFixed(1);

console.log("\n=== API RESPONSE ===");
console.log("Status:", res.status);
console.log("Elapsed:", elapsed + "s");
console.log(JSON.stringify(body, null, 2));

if (!res.ok) {
  process.exit(1);
}
